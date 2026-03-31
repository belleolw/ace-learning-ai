# ============================================================
# ACE LEARNING – LIGHTWEIGHT ANALYTICS LAYER
# ------------------------------------------------------------
# This module prepares dashboard-ready analytics from the bundled
# CSV dataset without training models at runtime. It keeps cold
# starts predictable for serverless deployment.
# ============================================================

import numpy as np
import pandas as pd
from pathlib import Path


# ------------------------------------------------------------
# DATA LOADING
# Reads the synthetic student dataset used for model training
# ------------------------------------------------------------
def load_data():
    data_path = Path(__file__).resolve().parent.parent / "data" / "student_learning_data.csv"
    return pd.read_csv(data_path)


# ------------------------------------------------------------
# FEATURE ENGINEERING
# Creates additional learning behaviour indicators:
#   time_efficiency        → score achieved per unit time
#   attempt_efficiency     → score achieved per attempt
#   avg_quiz_score_per_topic → cohort performance benchmark
#   topic_mastery          → weighted mastery score per topic
#   overall_performance_score → combined learning performance metric
# ------------------------------------------------------------
def engineer_features(df):
    df = df.copy()

    df["time_taken"] = df["time_taken"].replace(0, 1)
    df["attempt_count"] = df["attempt_count"].replace(0, 1)

    df["time_efficiency"] = df["quiz_score"] / df["time_taken"]
    df["attempt_efficiency"] = df["quiz_score"] / df["attempt_count"]

    df["avg_quiz_score_per_topic"] = df.groupby("topic")["quiz_score"].transform("mean")

    df["time_efficiency_scaled"] = (df["time_efficiency"] / df["time_efficiency"].max()) * 100

    # Topic mastery score combines:
    # 50% quiz performance
    # 30% previous test performance
    # 20% time efficiency
    df["topic_mastery"] = (
        0.5 * df["quiz_score"]
        + 0.3 * df["past_test_score"]
        + 0.2 * df["time_efficiency_scaled"]
    )

    df["topic_mastery"] = df["topic_mastery"].clip(0, 100)

    # Weak topic flag: topics where mastery < 60
    df["is_weak_topic"] = df["topic_mastery"] < 60

    df["overall_performance_score"] = (
        0.4 * df["quiz_score"]
        + 0.3 * df["past_test_score"]
        + 0.2 * df["topic_mastery"]
        + 0.1 * df["attempt_efficiency"]
    )

    return df


def load_model_bundle():
    """Load lightweight analytics assets for a warm serverless instance."""
    df = engineer_features(load_data())

    topic_baselines = (
        df.groupby("topic", as_index=False)
        .agg(
            topic_exam_baseline=("final_exam_score", "mean"),
            topic_mastery_baseline=("topic_mastery", "mean"),
        )
    )

    return {
        "df": df,
        "topic_baselines": topic_baselines.set_index("topic").to_dict("index"),
    }


def predict_exam_score(student_df, model_bundle):
    latest_student_df = get_latest_topic_snapshot(student_df)

    if latest_student_df.empty:
        return 0.0

    topic_baselines = model_bundle.get("topic_baselines", {})
    predicted_scores = []

    for _, row in latest_student_df.iterrows():
        topic_stats = topic_baselines.get(row["topic"], {})
        topic_exam_baseline = float(
            topic_stats.get("topic_exam_baseline", row.get("final_exam_score", row["topic_mastery"]))
        )

        predicted_score = (
            0.55 * float(row["topic_mastery"])
            + 0.25 * float(row["past_test_score"])
            + 0.20 * topic_exam_baseline
        )
        predicted_scores.append(predicted_score)

    return float(np.clip(np.mean(predicted_scores), 0, 100))


def classify_risk_level(predicted_exam_score, weak_topic_count):
    if predicted_exam_score < 60 or weak_topic_count >= 3:
        return "At Risk"
    if predicted_exam_score < 80 or weak_topic_count >= 1:
        return "Stable"
    return "High Performer"


# ------------------------------------------------------------
# HELPER: GET LATEST SNAPSHOT PER TOPIC
# Used for trend-aware analytics (latest vs previous)
# ------------------------------------------------------------
def get_latest_topic_snapshot(student_df):
    """Return the latest assessment row for each topic for one student."""
    if "assessment_round" not in student_df.columns:
        return student_df.copy()

    latest_snapshot = (
        student_df.sort_values(["topic", "assessment_round"])
        .drop_duplicates(subset=["topic"], keep="last")
        .copy()
    )
    return latest_snapshot

# ------------------------------------------------------------
# WEAK TOPIC DETECTION MODEL
# Aggregates topic mastery scores for a student and classifies
# each topic into mastery levels.
# ------------------------------------------------------------
def detect_weak_topics(student_df):

    # If no assessment rounds, fallback to old logic
    if "assessment_round" not in student_df.columns:
        topic_summary = (
            student_df.groupby("topic", as_index=False)["topic_mastery"]
            .mean()
            .sort_values(by="topic_mastery")
        )

        topic_summary["previous_score"] = topic_summary["topic_mastery"]
        topic_summary["trend_delta"] = 0

    else:
        # Get latest and previous attempts per topic
        sorted_df = student_df.sort_values(["topic", "assessment_round"])

        latest = (
            sorted_df.groupby("topic").tail(1)
            [["topic", "topic_mastery"]]
            .rename(columns={"topic_mastery": "score"})
        )

        previous = (
            sorted_df.groupby("topic").nth(-2)
            [["topic", "topic_mastery"]]
            .rename(columns={"topic_mastery": "previous_score"})
        )

        topic_summary = latest.merge(previous, on="topic", how="left")

        topic_summary["previous_score"] = topic_summary["previous_score"].fillna(topic_summary["score"])
        topic_summary["trend_delta"] = topic_summary["score"] - topic_summary["previous_score"]

        topic_summary = topic_summary.sort_values(by="score")

    def classify_mastery(score):
        if score < 60:
            return "Weak"
        elif score < 75:
            return "Moderate"
        return "Strong"

    topic_summary["mastery_level"] = topic_summary["score"].apply(classify_mastery)

    weak_topics = topic_summary[topic_summary["mastery_level"] == "Weak"].copy()

    return topic_summary, weak_topics

# ------------------------------------------------------------
# TOPIC ANALYTICS FOR TEACHER DASHBOARD
# Produces class-level topic insights:
#   - class_topic_performance
#   - students_struggling_per_topic
#   - topic_difficulty_index
# ------------------------------------------------------------
def calculate_topic_analytics(df):

    topic_perf = (
        df.groupby("topic", as_index=False)
        .agg(
            class_topic_performance=("topic_mastery", "mean"),
            total_students=("student_id", "nunique"),
        )
    )

    struggling_students = (
        df[df["is_weak_topic"]]
        .groupby("topic")["student_id"]
        .nunique()
        .reset_index(name="students_struggling_per_topic")
    )

    topic_perf = topic_perf.merge(struggling_students, on="topic", how="left")
    topic_perf["students_struggling_per_topic"] = (
        topic_perf["students_struggling_per_topic"].fillna(0).astype(int)
    )

    struggle_ratio = (
        topic_perf["students_struggling_per_topic"] / topic_perf["total_students"]
    ) * 100

    print("\n[Debug] Unique students struggling per topic")
    print("------------------------------------------")
    print(topic_perf[["topic", "total_students", "students_struggling_per_topic"]])

    # Difficulty index combines:
    # 60% inverse class performance
    # 40% proportion of students struggling
    topic_perf["topic_difficulty_index"] = (
        0.6 * (100 - topic_perf["class_topic_performance"]) + 0.4 * struggle_ratio
    )

    def classify_difficulty(score):
        if score >= 60:
            return "High"
        elif score >= 40:
            return "Moderate"
        return "Low"

    topic_perf["difficulty_level"] = topic_perf["topic_difficulty_index"].apply(classify_difficulty)

    topic_perf = topic_perf.sort_values(by="topic_difficulty_index", ascending=False)

    return topic_perf

# ------------------------------------------------------------
# TEACHER PRIORITISATION LAYER
# Builds a teacher-facing intervention list by combining:
#   - predicted exam score
#   - risk classification
#   - weak topics per student
# This is rule-based prioritisation, not a separate ML model.
# ------------------------------------------------------------
def generate_teacher_focus_list(df, model_bundle):

    focus_list = []

    for student_id in df["student_id"].unique():
        student_df = df[df["student_id"] == student_id].copy()

        _, weak_topics_df = detect_weak_topics(student_df)
        weak_topics = weak_topics_df["topic"].tolist()
        weak_topic_count = len(weak_topics)
        predicted_exam_score = predict_exam_score(student_df, model_bundle)
        risk_level = classify_risk_level(predicted_exam_score, weak_topic_count)

        focus_score = 0

        if risk_level == "At Risk":
            focus_score += 3
        elif risk_level == "Stable":
            focus_score += 1

        if predicted_exam_score < 60:
            focus_score += 2
        elif predicted_exam_score < 70:
            focus_score += 1

        focus_score += weak_topic_count

        if focus_score >= 5:
            focus_priority = "High"
        elif focus_score >= 3:
            focus_priority = "Medium"
        else:
            focus_priority = "Low"

        focus_list.append(
            {
                "student_id": student_id,
                "predicted_exam_score": round(predicted_exam_score, 2),
                "risk_level": risk_level,
                "weak_topics": weak_topics,
                "weak_topic_count": weak_topic_count,
                "focus_priority": focus_priority,
                "focus_score": focus_score,
            }
        )

    focus_df = pd.DataFrame(focus_list).sort_values(
        by=["focus_score", "predicted_exam_score"], ascending=[False, True]
    )

    return focus_df

# ------------------------------------------------------------
# STUDENT / PARENT SCREEN HELPERS
# These are rule-based analytics outputs used to populate
# progress, recommendation, and study plan screens.
# ------------------------------------------------------------
def build_recent_assessments(student_df):
    recent_df = (
        student_df[["topic", "quiz_score", "past_test_score"]]
        .reset_index(drop=True)
        .head(4)
        .copy()
    )

    assessments = []
    for idx, row in recent_df.iterrows():
        assessments.append(
            {
                "label": f"Quiz {idx + 1}",
                "topic": row["topic"],
                "score": round(float(row["quiz_score"]), 2),
                "past_test_score": round(float(row["past_test_score"]), 2),
            }
        )

    return assessments

# Note:
# improvement_rate is a proxy for student progress because this dataset
# does not include timestamps. It currently compares the first and last
# rows for a student based on dataset order. In a real system, this
# should be calculated using chronologically sorted assessment records.
def build_student_progress_summary(student_df, predicted_exam_score):
    recent_average_score = float(student_df["quiz_score"].mean())
    best_score = float(student_df["quiz_score"].max())
    earliest_score = float(student_df["quiz_score"].iloc[0])
    latest_score = float(student_df["quiz_score"].iloc[-1])

    if earliest_score == 0:
        improvement_rate = 0.0
    else:
        improvement_rate = ((latest_score - earliest_score) / earliest_score) * 100

    next_milestone = (
        "Reach 80% readiness" if predicted_exam_score < 80 else "Maintain high performance"
    )

    return {
        "recent_average_score": round(recent_average_score, 2),
        "best_score": round(best_score, 2),
        "improvement_rate": round(improvement_rate, 2),
        "next_milestone": next_milestone,
    }


def build_recommended_actions(risk_level, weak_topics_df):
    actions = []

    weak_topics = weak_topics_df["topic"].tolist()

    if weak_topics:
        primary_topic = weak_topics[0]
        actions.append(
            {
                "title": f"Prioritise {primary_topic} Revision",
                "priority": "High",
                "estimated_time_mins": 20,
                "target": "Student",
            }
        )

    if len(weak_topics) >= 2:
        actions.append(
            {
                "title": "Complete Mini Diagnostic Quiz",
                "priority": "High",
                "estimated_time_mins": 15,
                "target": "Teacher",
            }
        )

    if risk_level == "At Risk":
        actions.append(
            {
                "title": "Provide Guided Parent Support",
                "priority": "High",
                "estimated_time_mins": 15,
                "target": "Parent",
            }
        )
    elif risk_level == "Stable":
        actions.append(
            {
                "title": "Maintain Weekly Practice Momentum",
                "priority": "Medium",
                "estimated_time_mins": 10,
                "target": "Student",
            }
        )

    if not actions:
        actions.append(
            {
                "title": "Maintain Current Study Routine",
                "priority": "Low",
                "estimated_time_mins": 10,
                "target": "Student",
            }
        )

    return actions


def build_study_plan(topic_summary_df):
    # Sort all topics by mastery (lowest = weakest)
    sorted_topics = topic_summary_df.sort_values(by="topic_mastery")
    topics = sorted_topics["topic"].tolist()

    plan = []

    if len(topics) >= 1:
        plan.append(
            {
                "day": "Monday",
                "title": f"{topics[0]} Revision",
                "meta": "20 mins · High priority",
            }
        )

    if len(topics) >= 2:
        plan.append(
            {
                "day": "Wednesday",
                "title": f"{topics[1]} Practice",
                "meta": "15 mins · Medium priority",
            }
        )

    if len(topics) >= 3:
        plan.append(
            {
                "day": "Friday",
                "title": f"{topics[2]} Review",
                "meta": "15 mins · Medium priority",
            }
        )

    return plan

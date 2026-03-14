# ============================================================
# ACE LEARNING – LEARNING ANALYTICS MODEL
# ------------------------------------------------------------
# This script builds a simple learning analytics pipeline that:
# 1. Loads student performance data
# 2. Engineers additional learning behaviour features
# 3. Trains two ML models:
#       - Linear Regression → Predict exam score
#       - Logistic Regression → Classify risk level
# 4. Identifies weak topics
# 5. Produces dashboard‑ready JSON output for the frontend
# ============================================================

import json
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_squared_error, accuracy_score, f1_score, classification_report
from sklearn.preprocessing import LabelEncoder, StandardScaler


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


# ------------------------------------------------------------
# MODEL TRAINING
# Two models are trained:
#   1. Linear Regression  → Predicts final exam score
#   2. Logistic Regression → Classifies student risk level
# ------------------------------------------------------------
def train_models(df):

    # Feature set used for both regression and classification
    features = [
        "quiz_score",
        "time_taken",
        "attempt_count",
        "past_test_score",
        "time_efficiency",
        "attempt_efficiency",
        "avg_quiz_score_per_topic",
        "topic_mastery",
        "overall_performance_score",
    ]

    X = df[features]

    y_reg = df["final_exam_score"]
    y_cls = df["risk_level"]

    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X, y_reg, test_size=0.2, random_state=42
    )

    # Convert textual risk labels ("At Risk", "Stable", "High Performer")
    # into numeric classes required by scikit‑learn
    label_encoder = LabelEncoder()
    y_cls_encoded = label_encoder.fit_transform(y_cls)

    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
        X, y_cls_encoded, test_size=0.2, random_state=42, stratify=y_cls_encoded
    )

    reg_model = LinearRegression()
    reg_model.fit(X_train_r, y_train_r)

    y_pred_r = reg_model.predict(X_test_r)
    rmse = np.sqrt(mean_squared_error(y_test_r, y_pred_r))

    # Standardize feature values for Logistic Regression
    scaler = StandardScaler()

    X_train_c_scaled = scaler.fit_transform(X_train_c)
    X_test_c_scaled = scaler.transform(X_test_c)

    clf_model = LogisticRegression(max_iter=1000)
    clf_model.fit(X_train_c_scaled, y_train_c)

    y_pred_c = clf_model.predict(X_test_c_scaled)

    accuracy = accuracy_score(y_test_c, y_pred_c)
    f1 = f1_score(y_test_c, y_pred_c, average="weighted")

    print("\n=== Regression Model Evaluation ===")
    print("RMSE:", rmse)

    print("\n=== Classification Model Evaluation ===")
    print("Accuracy:", accuracy)
    print("F1 Score:", f1)

    print("\nClassification Precision / Recall Table")
    print("---------------------------------------")
    print(classification_report(y_test_c, y_pred_c, target_names=label_encoder.classes_))

    # --------------------------------------------------
    # MODEL INTERPRETABILITY
    # Print feature importance from Linear Regression
    # --------------------------------------------------
    print("\nFeature Importance (Regression Coefficients)")
    print("---------------------------------------------")

    coef_df = pd.DataFrame({
        "feature": features,
        "coefficient": reg_model.coef_
    }).sort_values(by="coefficient", ascending=False)

    print(coef_df)

    return reg_model, clf_model, scaler, label_encoder, features


# ------------------------------------------------------------
# WEAK TOPIC DETECTION MODEL
# Aggregates topic mastery scores for a student and classifies
# each topic into mastery levels.
# ------------------------------------------------------------
def detect_weak_topics(student_df):

    topic_summary = (
        student_df.groupby("topic", as_index=False)["topic_mastery"]
        .mean()
        .sort_values(by="topic_mastery")
    )

    def classify_mastery(score):
        if score < 60:
            return "Weak"
        elif score < 75:
            return "Moderate"
        return "Strong"

    topic_summary["mastery_level"] = topic_summary["topic_mastery"].apply(classify_mastery)

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
def generate_teacher_focus_list(df, reg_model, clf_model, scaler, label_encoder, features):

    focus_list = []

    for student_id in df["student_id"].unique():
        student_df = df[df["student_id"] == student_id].copy()

        student_df["predicted_exam_score"] = reg_model.predict(student_df[features])
        predicted_exam_score = student_df["predicted_exam_score"].mean()

        avg_features = pd.DataFrame([student_df[features].mean()])
        avg_features_scaled = scaler.transform(avg_features)
        risk_encoded = clf_model.predict(avg_features_scaled)[0]
        risk_level = label_encoder.inverse_transform([risk_encoded])[0]

        _, weak_topics_df = detect_weak_topics(student_df)
        weak_topics = weak_topics_df["topic"].tolist()
        weak_topic_count = len(weak_topics)

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


def build_study_plan(weak_topics_df):
    weak_topics = weak_topics_df["topic"].tolist()

    plan = []

    if weak_topics:
        plan.append(
            {
                "day": "Monday",
                "title": f"{weak_topics[0]} Revision",
                "meta": "20 mins · High priority",
            }
        )

    if len(weak_topics) >= 2:
        plan.append(
            {
                "day": "Wednesday",
                "title": f"{weak_topics[1]} Practice",
                "meta": "15 mins · Medium priority",
            }
        )

    if len(weak_topics) >= 3:
        plan.append(
            {
                "day": "Friday",
                "title": f"{weak_topics[2]} Review",
                "meta": "15 mins · Medium priority",
            }
        )

    if not plan:
        plan = [
            {
                "day": "Monday",
                "title": "Mixed Practice Set",
                "meta": "15 mins · Low priority",
            },
            {
                "day": "Wednesday",
                "title": "Progress Review",
                "meta": "10 mins · Low priority",
            },
            {
                "day": "Friday",
                "title": "Mini Mock Check-in",
                "meta": "15 mins · Low priority",
            },
        ]

    return plan


import pandas as pd
import numpy as np

def generate_student_learning_data(
    num_students=80,
    topics=None,
    random_state=42,
    save_path="student_learning_data.csv"
):
    np.random.seed(random_state)

    if topics is None:
        topics = [
            "Percentage",
            "Algebra",
            "Inequalities",
            "Matrices",
            "Geometry",
            "Angles",
            "Trigonometry",
            "Vectors",
            "Statistics"
        ]

    # Topic difficulty: higher means harder
    # This dataset is designed for Secondary 4 Mathematics students.
    # Every student attempts all Sec 4 Math topics once so topic analytics
    # are easier to compare across the class.
    topic_difficulty = {
        "Percentage": 0.22,
        "Algebra": 0.32,
        "Inequalities": 0.45,
        "Matrices": 0.50,
        "Geometry": 0.38,
        "Angles": 0.24,
        "Trigonometry": 0.52,
        "Vectors": 0.58,
        "Statistics": 0.40
    }

    rows = []

    for student_num in range(1, num_students + 1):
        student_id = f"S{str(student_num).zfill(3)}"

        # Hidden student ability level
        # Slightly above average so the dataset produces a realistic mix of
        # At Risk, Stable, and High Performer students.
        ability = np.clip(np.random.normal(0.68, 0.15), 0.25, 0.97)

        # Past test score reflects the student's overall prior math strength
        base_past_test_score = np.clip(
            40 + ability * 55 + np.random.normal(0, 5),
            35,
            98
        )

        # Each Secondary 4 student attempts all syllabus topics twice
        # so the platform can show a real before-vs-after learning trend.
        for topic in topics:
            for assessment_round in [1, 2]:
                difficulty = topic_difficulty[topic]

                # Topic-specific performance influenced by ability and difficulty
                topic_understanding = np.clip(
                    ability - difficulty + np.random.normal(0.22, 0.08),
                    0.10,
                    0.99
                )

                # Quiz score
                quiz_score = np.clip(
                    38 + topic_understanding * 62 + np.random.normal(0, 6),
                    25,
                    100
                )

                # The second assessment round should generally show some improvement
                # while still keeping variation realistic across students.
                if assessment_round == 2:
                    quiz_score = np.clip(
                        quiz_score + np.random.normal(4, 2),
                        25,
                        100
                    )

                # More difficult / weaker topics -> more time taken
                expected_time = 35 + (1 - topic_understanding) * 85 + difficulty * 20
                time_taken = np.clip(
                    np.random.normal(expected_time, 12),
                    20,
                    180
                )

                # Weaker understanding -> more attempts
                if topic_understanding >= 0.75:
                    attempt_count = np.random.choice([1, 2], p=[0.8, 0.2])
                elif topic_understanding >= 0.5:
                    attempt_count = np.random.choice([1, 2, 3], p=[0.35, 0.45, 0.20])
                else:
                    attempt_count = np.random.choice([2, 3, 4, 5], p=[0.15, 0.35, 0.30, 0.20])

                # Efficiency measures
                time_efficiency = quiz_score / time_taken
                attempt_efficiency = quiz_score / attempt_count

                # Topic mastery score
                # Time efficiency is scaled so it contributes meaningfully
                time_efficiency_scaled = np.clip(time_efficiency * 100, 0, 100)

                topic_mastery = (
                    0.5 * quiz_score +
                    0.3 * base_past_test_score +
                    0.2 * time_efficiency_scaled
                )
                topic_mastery = np.clip(topic_mastery, 0, 100)

                # Final exam score
                # Strongly related to quiz + past + mastery, with small noise
                final_exam_score = (
                    0.40 * quiz_score +
                    0.35 * base_past_test_score +
                    0.15 * topic_mastery +
                    0.10 * (100 - (attempt_count - 1) * 10) +
                    np.random.normal(0, 3)
                )
                final_exam_score = np.clip(final_exam_score, 0, 100)

                # Risk label
                if final_exam_score < 60:
                    risk_level = "At Risk"
                elif final_exam_score <= 80:
                    risk_level = "Stable"
                else:
                    risk_level = "High Performer"

                rows.append({
                    "student_id": student_id,
                    "assessment_round": assessment_round,
                    "topic": topic,
                    "quiz_score": round(quiz_score, 2),
                    "time_taken": round(time_taken, 2),
                    "attempt_count": int(attempt_count),
                    "past_test_score": round(base_past_test_score, 2),
                    "time_efficiency": round(time_efficiency, 4),
                    "attempt_efficiency": round(attempt_efficiency, 2),
                    "topic_mastery": round(topic_mastery, 2),
                    "final_exam_score": round(final_exam_score, 2),
                    "risk_level": risk_level
                })

    df = pd.DataFrame(rows)

    # Add topic average quiz score
    df["avg_quiz_score_per_topic"] = df.groupby("topic")["quiz_score"].transform("mean").round(2)

    # Add overall performance score
    df["overall_performance_score"] = (
        0.4 * df["quiz_score"] +
        0.3 * df["past_test_score"] +
        0.2 * df["topic_mastery"] +
        0.1 * df["attempt_efficiency"]
    ).round(2)

    # Reorder columns
    df = df[
        [
            "student_id",
            "assessment_round",
            "topic",
            "quiz_score",
            "time_taken",
            "attempt_count",
            "past_test_score",
            "time_efficiency",
            "attempt_efficiency",
            "avg_quiz_score_per_topic",
            "topic_mastery",
            "overall_performance_score",
            "final_exam_score",
            "risk_level"
        ]
    ]

    df.to_csv(save_path, index=False)
    return df


if __name__ == "__main__":
    df = generate_student_learning_data(
        num_students=100,
        random_state=42,
        save_path="student_learning_data.csv"
    )

    print("Secondary 4 Mathematics dataset generated successfully.")
    print(df.head())
    print("\nShape:", df.shape)
    print("\nTopics included:")
    print(sorted(df["topic"].unique()))

    print("\nStudents per topic:")
    print(df.groupby("topic")["student_id"].nunique())

    print("\nAssessment rounds included:")
    print(sorted(df["assessment_round"].unique()))

    print("\nRisk level distribution:")
    print(df["risk_level"].value_counts())
import pandas as pd
import numpy as np

def generate_student_learning_data(
    num_students=80,
    topics=None,
    min_records_per_student=4,
    max_records_per_student=8,
    random_state=42,
    save_path="student_learning_data.csv"
):
    np.random.seed(random_state)

    if topics is None:
        topics = ["Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics"]

    # Topic difficulty: higher means harder
    topic_difficulty = {
        "Algebra": 0.30,
        "Geometry": 0.38,
        "Trigonometry": 0.48,
        "Calculus": 0.62,
        "Statistics": 0.42
    }

    rows = []

    for student_num in range(1, num_students + 1):
        student_id = f"S{str(student_num).zfill(3)}"

        # Slightly higher average ability so the dataset does not overproduce
        # failing students and extreme intervention cases.
        ability = np.clip(np.random.normal(0.68, 0.15), 0.25, 0.97)

        # Past test score reflects overall historical strength
        base_past_test_score = np.clip(
            40 + ability * 55 + np.random.normal(0, 5),
            35,
            98
        )

        # Each student attempts a random number of topic records
        n_records = np.random.randint(min_records_per_student, max_records_per_student + 1)

        chosen_topics = np.random.choice(topics, size=n_records, replace=True)

        for topic in chosen_topics:
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
        min_records_per_student=5,
        max_records_per_student=8,
        random_state=42,
        save_path="student_learning_data.csv"
    )

    print("Dataset generated successfully.")
    print(df.head())
    print("\nShape:", df.shape)
    print("\nRisk level distribution:")
    print(df["risk_level"].value_counts())
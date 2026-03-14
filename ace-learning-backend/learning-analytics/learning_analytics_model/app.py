from flask import Flask
from flask_restx import Api, Resource
from flask_cors import CORS
from learning_analytics_model import (
    load_data,
    engineer_features,
    train_models,
    detect_weak_topics,
    calculate_topic_analytics,
    generate_teacher_focus_list,
    build_recent_assessments,
    build_student_progress_summary,
    build_recommended_actions,
    build_study_plan,
)
import pandas as pd

app = Flask(__name__)
CORS(app)

api = Api(
    app,
    title="Ace Learning Analytics API",
    version="1.0",
    description="APIs for the Ace Learning student, topic, and teacher dashboards",
    doc="/swagger"
)

# --------------------------------------------------
# MODEL INITIALIZATION
# Load data, engineer features, and train models once
# when the Flask server starts.
# --------------------------------------------------
def initialize_model_bundle():
    df = load_data()
    df = engineer_features(df)
    reg_model, clf_model, scaler, label_encoder, features = train_models(df)

    return {
        "df": df,
        "reg_model": reg_model,
        "clf_model": clf_model,
        "scaler": scaler,
        "label_encoder": label_encoder,
        "features": features,
    }


MODEL_BUNDLE = initialize_model_bundle()


@api.route("/api/health")
class HealthResource(Resource):
    def get(self):
        return {
            "status": "ok",
            "model_loaded": True,
            "records": len(MODEL_BUNDLE["df"]),
        }


@api.route("/api/student/<string:student_id>")
class StudentDashboardResource(Resource):
    def get(self, student_id):
        df = MODEL_BUNDLE["df"]
        reg_model = MODEL_BUNDLE["reg_model"]
        clf_model = MODEL_BUNDLE["clf_model"]
        scaler = MODEL_BUNDLE["scaler"]
        label_encoder = MODEL_BUNDLE["label_encoder"]
        features = MODEL_BUNDLE["features"]

        student_id = student_id.upper()

        student_df = df[df["student_id"] == student_id].copy()

        if student_df.empty:
            return {"error": f"Student {student_id} not found"}, 404

        student_df["predicted_exam_score"] = reg_model.predict(student_df[features])
        predicted_exam_score = float(student_df["predicted_exam_score"].mean())

        avg_features = pd.DataFrame([student_df[features].mean()])
        avg_features_scaled = scaler.transform(avg_features)
        risk_encoded = clf_model.predict(avg_features_scaled)[0]
        risk_level = label_encoder.inverse_transform([risk_encoded])[0]

        topic_mastery_summary, weak_topics = detect_weak_topics(student_df)

        recent_assessments = build_recent_assessments(student_df)
        student_progress_summary = build_student_progress_summary(student_df, predicted_exam_score)
        recommended_actions = build_recommended_actions(risk_level, weak_topics)
        study_plan = build_study_plan(weak_topics)

        response = {
            "student_id": student_id,
            "predicted_exam_score": round(predicted_exam_score, 2),
            "risk_level": risk_level,
            "topic_mastery": [
                {
                    "topic": row["topic"],
                    "score": round(row["topic_mastery"], 2),
                    "mastery_level": row["mastery_level"],
                }
                for _, row in topic_mastery_summary.iterrows()
            ],
            "weak_topics": [
                {
                    "topic": row["topic"],
                    "mastery": round(row["topic_mastery"], 2),
                    "mastery_level": row["mastery_level"],
                }
                for _, row in weak_topics.iterrows()
            ],
            "student_progress_summary": student_progress_summary,
            "recent_assessments": recent_assessments,
            "recommended_actions": recommended_actions,
            "study_plan": study_plan,
        }

        return response


@api.route("/api/topic-analytics")
class TopicAnalyticsResource(Resource):
    def get(self):
        df = MODEL_BUNDLE["df"]
        topic_analytics = calculate_topic_analytics(df)

        response = [
            {
                "topic": row["topic"],
                "class_topic_performance": round(row["class_topic_performance"], 2),
                "students_struggling_per_topic": int(row["students_struggling_per_topic"]),
                "topic_difficulty_index": round(row["topic_difficulty_index"], 2),
                "difficulty_level": row["difficulty_level"],
            }
            for _, row in topic_analytics.iterrows()
        ]

        return response


@api.route("/api/teacher/focus-list")
class TeacherFocusListResource(Resource):
    def get(self):
        df = MODEL_BUNDLE["df"]
        reg_model = MODEL_BUNDLE["reg_model"]
        clf_model = MODEL_BUNDLE["clf_model"]
        scaler = MODEL_BUNDLE["scaler"]
        label_encoder = MODEL_BUNDLE["label_encoder"]
        features = MODEL_BUNDLE["features"]

        focus_df = generate_teacher_focus_list(
            df, reg_model, clf_model, scaler, label_encoder, features
        )

        response = [
            {
                "student_id": row["student_id"],
                "predicted_exam_score": round(row["predicted_exam_score"], 2),
                "risk_level": row["risk_level"],
                "weak_topics": row["weak_topics"],
                "weak_topic_count": int(row["weak_topic_count"]),
                "focus_priority": row["focus_priority"],
                "focus_score": int(row["focus_score"]),
            }
            for _, row in focus_df.iterrows()
        ]

        return response


if __name__ == "__main__":
    app.run(debug=True, port=5001)
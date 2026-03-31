import os
from functools import lru_cache

from flask import Flask
from flask_cors import CORS
from flask_restx import Api, Resource

from .learning_analytics_model import (
    build_recent_assessments,
    build_recommended_actions,
    build_student_progress_summary,
    build_study_plan,
    calculate_topic_analytics,
    classify_risk_level,
    detect_weak_topics,
    generate_teacher_focus_list,
    load_model_bundle,
    predict_exam_score,
)


def _get_allowed_origins():
    frontend_url = os.getenv("FRONTEND_URL", "*")
    if frontend_url == "*":
        return "*"
    return [origin.strip() for origin in frontend_url.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_model_bundle():
    return load_model_bundle()


def create_app():
    app = Flask(__name__)
    app.config["DEBUG"] = os.getenv("DEBUG", "false").lower() == "true"

    CORS(app, origins=_get_allowed_origins())

    api = Api(
        app,
        title="Ace Learning Analytics API",
        version="1.0",
        description="APIs for the Ace Learning student, topic, and teacher dashboards",
        doc="/swagger",
    )

    @api.route("/api/health")
    class HealthResource(Resource):
        def get(self):
            model_bundle = get_model_bundle()
            return {
                "status": "ok",
                "model_loaded": True,
                "records": len(model_bundle["df"]),
            }

    @api.route("/api/student/<string:student_id>")
    class StudentDashboardResource(Resource):
        def get(self, student_id):
            model_bundle = get_model_bundle()
            df = model_bundle["df"]

            student_id = student_id.upper()
            student_df = df[df["student_id"] == student_id].copy()

            if student_df.empty:
                return {"error": f"Student {student_id} not found"}, 404

            topic_mastery_summary, weak_topics = detect_weak_topics(student_df)
            weak_topic_count = len(weak_topics)
            predicted_exam_score = predict_exam_score(student_df, model_bundle)
            risk_level = classify_risk_level(predicted_exam_score, weak_topic_count)

            recent_assessments = build_recent_assessments(student_df)
            student_progress_summary = build_student_progress_summary(student_df, predicted_exam_score)
            recommended_actions = build_recommended_actions(risk_level, weak_topics)
            study_plan_input = topic_mastery_summary.rename(columns={"score": "topic_mastery"}).copy()
            study_plan = build_study_plan(study_plan_input)

            response = {
                "student_id": student_id,
                "predicted_exam_score": round(predicted_exam_score, 2),
                "risk_level": risk_level,
                "topic_mastery": [
                    {
                        "topic": row["topic"],
                        "score": round(row["score"], 2),
                        "previous_score": round(row["previous_score"], 2),
                        "trend_delta": round(row["trend_delta"], 2),
                        "mastery_level": row["mastery_level"],
                    }
                    for _, row in topic_mastery_summary.iterrows()
                ],
                "weak_topics": [
                    {
                        "topic": row["topic"],
                        "mastery": round(row["score"], 2),
                        "previous_score": round(row["previous_score"], 2),
                        "trend_delta": round(row["trend_delta"], 2),
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
            model_bundle = get_model_bundle()
            topic_analytics = calculate_topic_analytics(model_bundle["df"])

            return [
                {
                    "topic": row["topic"],
                    "class_topic_performance": round(row["class_topic_performance"], 2),
                    "students_struggling_per_topic": int(row["students_struggling_per_topic"]),
                    "topic_difficulty_index": round(row["topic_difficulty_index"], 2),
                    "difficulty_level": row["difficulty_level"],
                }
                for _, row in topic_analytics.iterrows()
            ]

    @api.route("/api/teacher/focus-list")
    class TeacherFocusListResource(Resource):
        def get(self):
            model_bundle = get_model_bundle()
            focus_df = generate_teacher_focus_list(model_bundle["df"], model_bundle)

            return [
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

    return app


app = create_app()

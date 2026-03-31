import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";

function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`;
}

function getTopicAccent(index) {
  const accents = [
    "from-blue-500 to-cyan-400",
    "from-violet-500 to-fuchsia-400",
    "from-emerald-500 to-teal-400",
    "from-amber-400 to-orange-400",
    "from-sky-500 to-indigo-400",
  ];

  return accents[index % accents.length];
}

export default function StudentProgress() {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();

  const studentIdFromQuery = searchParams.get("studentId");
  const studentIdFromStorage = localStorage.getItem("studentId");
  const studentId = studentIdFromQuery || studentIdFromStorage || "";

  const navItems = [
    {
      label: "Dashboard",
      to: studentId
        ? `/student/overview?studentId=${studentId}`
        : "/student/overview",
    },
    {
      label: "Practice",
      to: studentId
        ? `/student/practice?studentId=${studentId}`
        : "/student/practice",
    },
    {
      label: "Study Plan",
      to: studentId
        ? `/student/study-plan?studentId=${studentId}`
        : "/student/study-plan",
    },
    {
      label: "Progress",
      to: studentId
        ? `/student/progress?studentId=${studentId}`
        : "/student/progress",
    },
    {
      label: "Wellness",
      to: studentId
        ? `/student/wellness?studentId=${studentId}`
        : "/student/wellness",
    },
  ];

  useEffect(() => {
    let isMounted = true;

    async function fetchStudentProgress() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/student/${studentId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load student progress data.");
        }

        const data = await response.json();

        if (isMounted) {
          setStudentData(data);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError.message ||
              "Something went wrong while loading progress.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchStudentProgress();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const recentAssessments = studentData?.recent_assessments || [];
  const topicMastery = studentData?.topic_mastery || [];
  const progressSummary = studentData?.student_progress_summary;

  const weeklyScores = useMemo(() => {
    if (!recentAssessments.length) return [];

    return recentAssessments.map((item, index) => ({
      label: item.label || `Assessment ${index + 1}`,
      value: Math.round(Number(item.score || 0)),
    }));
  }, [recentAssessments]);

  const topicProgress = useMemo(() => {
    if (!topicMastery.length) return [];

    return topicMastery.map((item, index) => {
      const currentScore = Math.round(Number(item.score || 0));
      const previousScore = Math.round(
        Number(item.previous_score || currentScore),
      );
      const improvement = Math.round(Number(item.trend_delta || 0));

      let meta = "Stable performance";
      if (improvement >= 10) {
        meta = "Strongest improvement";
      } else if (improvement >= 5) {
        meta = "Steady progress";
      } else if (currentScore < 60) {
        meta = "Needs more revision";
      }

      return {
        label: item.topic,
        title: `${previousScore}% → ${currentScore}%`,
        meta,
        accent: getTopicAccent(index),
      };
    });
  }, [topicMastery]);

  const strongestGrowthTopic = useMemo(() => {
    if (!topicMastery.length) return "N/A";

    const strongest = [...topicMastery].sort(
      (a, b) => Number(b.trend_delta || 0) - Number(a.trend_delta || 0)
    )[0];

    return strongest?.topic || "N/A";
  }, [topicMastery]);

  const weakestTopic = useMemo(() => {
    if (!topicMastery.length) return "N/A";

    return (
      [...topicMastery].sort(
        (a, b) => Number(a.score || 0) - Number(b.score || 0),
      )[0]?.topic || "N/A"
    );
  }, [topicMastery]);

  const bestAssessment = useMemo(() => {
    if (!recentAssessments.length) return null;

    return [...recentAssessments].sort(
      (a, b) => Number(b.score || 0) - Number(a.score || 0),
    )[0];
  }, [recentAssessments]);

  const predictedScore = Math.round(
    Number(studentData?.predicted_exam_score || 0),
  );
  const recentAverageScore = Math.round(
    Number(progressSummary?.recent_average_score || 0),
  );
  const bestScore = Math.round(Number(progressSummary?.best_score || 0));
  const improvementRate = Math.round(
    Number(progressSummary?.improvement_rate || 0),
  );

  return (
    <DashboardLayout
      profileName="Alicia Tan"
      profileSubtitle={`Sec 4 Student · ${studentId}`}
      navItems={navItems}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading progress data...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-600 shadow-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && studentData && (
          <>
            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Current Predicted Score
                    </p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {formatPercent(predictedScore)}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>{improvementRate >= 0 ? "↗" : "↘"}</span>
                      <span>{`${improvementRate >= 0 ? "+" : ""}${improvementRate}% recent trend`}</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {(weeklyScores.length
                      ? weeklyScores
                      : [{ label: "Current", value: predictedScore }]
                    ).map((item, i) => (
                      <div
                        key={`${item.label}-${i}`}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{
                          height: `${Math.max(24, Math.min(100, item.value))}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                  AI Progress Insight
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                  Biggest Improvement
                </h3>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                  {strongestGrowthTopic}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Mock Test Average
                </p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {formatPercent(recentAverageScore)}
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${recentAverageScore}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">
                  Based on recent assessments
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Performance Trend
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Recent scores across quizzes and mock tests
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex h-64 items-end justify-between gap-4">
                    {(weeklyScores.length
                      ? weeklyScores
                      : [{ label: "Current", value: predictedScore }]
                    ).map((item, index) => (
                      <div
                        key={item.label}
                        className="flex flex-1 flex-col items-center gap-3"
                      >
                        <div className="text-sm font-semibold text-slate-700">
                          {item.value}%
                        </div>
                        <div className="flex h-44 w-full items-end justify-center">
                          <div
                            className={`w-full rounded-t-2xl bg-gradient-to-t ${
                              index % 3 === 0
                                ? "from-blue-500 to-cyan-300"
                                : index % 3 === 1
                                  ? "from-violet-500 to-fuchsia-300"
                                  : "from-emerald-500 to-teal-300"
                            }`}
                            style={{
                              height: `${Math.max(18, Math.min(100, item.value))}%`,
                            }}
                          />
                        </div>
                        <div className="text-center text-xs font-medium text-slate-500">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Overall improvement
                      </div>
                      <div
                        className={`mt-1 font-semibold ${improvementRate >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {`${improvementRate >= 0 ? "+" : ""}${improvementRate}%`}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Strongest growth
                      </div>
                      <div className="mt-1 font-semibold">
                        {strongestGrowthTopic}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Needs more work
                      </div>
                      <div className="mt-1 font-semibold">{weakestTopic}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">
                    Progress Snapshot
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Best score
                      </div>
                      <div className="mt-1 font-semibold">
                        {bestAssessment
                          ? `${formatPercent(bestAssessment.score)} on ${bestAssessment.label}`
                          : formatPercent(bestScore)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Next milestone
                      </div>
                      <div className="mt-1 font-semibold">
                        {progressSummary?.next_milestone ||
                          "Keep improving weekly"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">
                    Recent Assessments
                  </h3>
                  <div className="mt-4 space-y-3">
                    {recentAssessments.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-600">
                            {item.label}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.topic}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {formatPercent(item.score)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Topic Progress Breakdown
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    See how each topic is improving over time
                  </p>
                </div>
                <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                  Recent mastery
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topicProgress.map((item) => (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`}
                    />
                    <div className="text-sm font-semibold text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {item.meta}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

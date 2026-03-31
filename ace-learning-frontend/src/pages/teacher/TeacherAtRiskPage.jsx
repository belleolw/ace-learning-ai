import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";

function getRiskBadgeClass(riskLevel) {
  if (riskLevel === "At Risk") {
    return "bg-rose-50 text-rose-600";
  }

  if (riskLevel === "Stable") {
    return "bg-amber-50 text-amber-600";
  }

  return "bg-blue-50 text-blue-600";
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

export default function TeacherAtRiskPage() {
  const [focusList, setFocusList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const navItems = [
    { label: "Dashboard", to: "/teacher/overview" },
    { label: "At-Risk Students", to: "/teacher/at-risk" },
    { label: "Topic Analytics", to: "/teacher/topic-analytics" },
    { label: "Intervention", to: "/teacher/intervention" },
  ];

  useEffect(() => {
    let isMounted = true;

    async function fetchFocusList() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/teacher/focus-list`);

        if (!response.ok) {
          throw new Error("Failed to load at-risk student data.");
        }

        const data = await response.json();

        if (isMounted) {
          setFocusList(data);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError.message ||
              "Something went wrong while loading the page.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchFocusList();

    return () => {
      isMounted = false;
    };
  }, []);

  const atRiskStudents = useMemo(() => {
    return focusList
      .filter((student) => student.risk_level === "At Risk")
      .slice(0, 8)
      .map((student) => ({
        name: student.student_id,
        predictedScore: formatPercent(student.predicted_exam_score),
        risk: student.risk_level,
        weakTopic: student.weak_topics?.[0] || "No weak topic",
        attendance: `${student.weak_topic_count} weak topic${student.weak_topic_count === 1 ? "" : "s"}`,
        riskClass: getRiskBadgeClass(student.risk_level),
      }));
  }, [focusList]);

  const urgentStudents = useMemo(() => {
    return focusList
      .filter((student) => student.risk_level === "At Risk")
      .map((student) => ({
        name: student.student_id,
        predictedScore: formatPercent(student.predicted_exam_score),
        risk: student.risk_level,
        weakTopic: student.weak_topics?.[0] || "No weak topic",
        weakTopicCount: student.weak_topic_count || 0,
        focusScore: student.focus_score || 0,
      }));
  }, [focusList]);

  const highestRiskStudent = urgentStudents[0] || atRiskStudents[0];
  const averagePredictedScore = atRiskStudents.length
    ? Math.round(
        atRiskStudents.reduce(
          (total, student) =>
            total + Number.parseInt(student.predictedScore, 10),
          0,
        ) / atRiskStudents.length,
      )
    : 0;

  const mostCommonWeakTopic = useMemo(() => {
    const counts = {};

    focusList.forEach((student) => {
      student.weak_topics?.forEach((topic) => {
        counts[topic] = (counts[topic] || 0) + 1;
      });
    });

    const sortedTopics = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sortedTopics[0]?.[0] || "Algebra";
  }, [focusList]);

  const interventionPlan = [
    {
      day: "Monday",
      title: `${mostCommonWeakTopic} Support Group`,
      meta: "Focus on highest-risk students",
      accent: "from-blue-500 to-cyan-400",
    },
    {
      day: "Wednesday",
      title: "Statistics Review Check-In",
      meta: "Short targeted follow-up",
      accent: "from-violet-500 to-fuchsia-400",
    },
    {
      day: "Friday",
      title: "Mini Diagnostic Quiz",
      meta: "Reassess weak-topic progress",
      accent: "from-emerald-500 to-teal-400",
    },
  ];

  const riskReasons = [
    "low topic mastery",
    "inconsistent homework completion",
    "falling quiz scores",
    "lower attendance",
  ];

  return (
    <DashboardLayout
      profileName="Ms Lim"
      profileSubtitle="Math Teacher"
      navItems={navItems}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading at-risk student data...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-600 shadow-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      At-Risk Students
                    </p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {urgentStudents.length} Students
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>!</span>
                      <span>Need close monitoring</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {(urgentStudents.slice(0, 7).length
                      ? urgentStudents.slice(0, 7)
                      : atRiskStudents.slice(0, 7)
                    ).map((student, i) => (
                      <div
                        key={`${student.name}-${i}`}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{
                          height: `${Math.max(
                            24,
                            Math.min(
                              100,
                              Number.parseInt(student.predictedScore, 10),
                            ),
                          )}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Highest Risk Level
                    </p>
                    <div className="mt-4 text-2xl font-semibold tracking-tight">
                      {urgentStudents.length > 0 ? "Very High" : "High"}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Immediate intervention needed
                    </p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#ef4444 0 ${urgentStudents.length > 0 ? 88 : 70}%, #e2e8f0 ${
                          urgentStudents.length > 0 ? 88 : 70
                        }% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900">
                      {urgentStudents.length > 0 ? "Urgent" : "Watch"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Average Predicted Score
                </p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {averagePredictedScore}%
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${averagePredictedScore}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">
                  Across focus group
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Student Risk Overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Ranked by predicted academic risk and recent performance
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {atRiskStudents.map((student) => (
                    <div
                      key={student.name}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="text-lg font-semibold tracking-tight text-slate-900">
                            {student.name}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              Predicted score: {student.predictedScore}
                            </div>
                            <div
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${student.riskClass}`}
                            >
                              {student.risk}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[280px] xl:grid-cols-2">
                          <div className="rounded-2xl bg-white p-4">
                            <div className="text-sm font-medium text-slate-500">
                              Weak topic
                            </div>
                            <div className="mt-1 font-semibold">
                              {student.weakTopic}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-white p-4">
                            <div className="text-sm font-medium text-slate-500">
                              Focus area
                            </div>
                            <div className="mt-1 font-semibold">
                              {student.attendance}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                    AI Risk Insight
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Most Urgent Case
                  </h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                    {highestRiskStudent?.name || "No urgent case"}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {highestRiskStudent
                      ? `${highestRiskStudent.name} shows one of the lowest predicted scores, with ${highestRiskStudent.weakTopic} as the main weak topic and ${highestRiskStudent.weakTopicCount || 0} weak areas requiring support.`
                      : "Students with low mastery across multiple topics are the most likely to need early intervention."}
                  </p>

                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm text-slate-600">
                      Students with low predicted scores and several weak topics
                      are the most likely to benefit from early intervention.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">
                    Risk Snapshot
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Most common weak topic
                      </div>
                      <div className="mt-1 font-semibold">
                        {mostCommonWeakTopic}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Priority action
                      </div>
                      <div className="mt-1 font-semibold">
                        Small-group intervention
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

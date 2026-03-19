import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

const API_BASE_URL = "http://127.0.0.1:5001";

function getPriorityStyles(priority = "") {
  const value = String(priority).toLowerCase();

  if (value.includes("high")) {
    return {
      priorityClass: "bg-rose-50 text-rose-600",
      blockClass: "bg-rose-400",
      light: "bg-rose-50",
    };
  }

  if (value.includes("medium")) {
    return {
      priorityClass: "bg-amber-50 text-amber-600",
      blockClass: "bg-amber-400",
      light: "bg-amber-50",
    };
  }

  return {
    priorityClass: "bg-emerald-50 text-emerald-600",
    blockClass: "bg-emerald-400",
    light: "bg-emerald-50",
  };
}

function getAccent(index) {
  const accents = [
    "from-blue-500 to-cyan-400",
    "from-violet-500 to-fuchsia-400",
    "from-emerald-500 to-teal-400",
    "from-amber-400 to-orange-400",
  ];

  return accents[index % accents.length];
}

export default function ParentRecommendationsPage() {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  const studentIdFromQuery = searchParams.get("studentId");
  const studentIdFromStorage =
    localStorage.getItem("ace-student-id") ||
    localStorage.getItem("parentStudentId") ||
    localStorage.getItem("studentId");
  const studentId = studentIdFromQuery || studentIdFromStorage || "";

  const navItems = [
    {
      label: "Dashboard",
      to: studentId
        ? `/parent/overview?studentId=${studentId}`
        : "/parent/overview",
    },
    {
      label: "Child Progress",
      to: studentId
        ? `/parent/child-progress?studentId=${studentId}`
        : "/parent/child-progress",
    },
    {
      label: "Weak Topics",
      to: studentId
        ? `/parent/weak-topics?studentId=${studentId}`
        : "/parent/weak-topics",
    },
    {
      label: "Recommendations",
      to: studentId
        ? `/parent/recommendations?studentId=${studentId}`
        : "/parent/recommendations",
    },
  ];

  useEffect(() => {
    let isMounted = true;

    async function fetchRecommendationData() {
      try {
        setIsLoading(true);
        setError("");

        if (!studentId) {
          throw new Error(
            "No student selected. Please open this page after selecting a student.",
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/student/${studentId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load recommendation data.");
        }

        const data = await response.json();

        if (isMounted) {
          setStudentData(data);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError.message ||
              "Something went wrong while loading recommendations.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRecommendationData();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const recommendedActions = studentData?.recommended_actions || [];
  const studyPlan = studentData?.study_plan || [];
  const weakTopics = studentData?.weak_topics || [];

  const supportPlan = useMemo(() => {
    return studyPlan.slice(0, 3).map((item, index) => ({
      day: item.day,
      title: item.title,
      meta: item.meta,
      accent: getAccent(index),
    }));
  }, [studyPlan]);

  const recommendationTimeline = useMemo(() => {
    return supportPlan.map((item, index) => ({
      label: item.day,
      title: item.title,
      meta: item.meta,
      accent: getAccent(index),
    }));
  }, [supportPlan]);

  const topPriorityRecommendation = recommendedActions[0];
  const topWeakTopic =
    weakTopics[0]?.topic ||
    studentData?.topic_mastery?.[0]?.topic ||
    "Weak topic";
  const totalRecommendedMinutes = recommendedActions.reduce(
    (sum, item) => sum + Number(item.estimated_time_mins || 0),
    0,
  );
  const supportNeedLevel = recommendedActions.some(
    (item) => item.priority === "High",
  )
    ? "High"
    : recommendedActions.some((item) => item.priority === "Medium")
      ? "Medium"
      : "Low";
  const highPriorityCount = recommendedActions.filter(
    (item) => item.priority === "High",
  ).length;
  const bestStartDay = supportPlan[0]?.day || "Monday";

  const whyThisMatters = [
    `${topWeakTopic} affects performance across multiple question types`,
    `${topPriorityRecommendation?.title || "Early support"} can improve readiness before the next assessment`,
    "Timely guided revision reduces repeated mistakes and helps maintain momentum",
  ];

  return (
    <DashboardLayout
      profileName="Grace Tan"
      profileSubtitle={`Parent Account · ${studentId}`}
      navItems={navItems}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading recommendations...
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
                      Top Priority
                    </p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {topPriorityRecommendation?.title || "No recommendation"}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>✦</span>
                      <span>Most urgent this week</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {(recommendationTimeline.length
                      ? recommendationTimeline
                      : [{}, {}, {}]
                    ).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{
                          height: `${[28, 42, 36, 54, 62, 72, 80][i % 7]}%`,
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
                      Recommended Study Time
                    </p>
                    <div className="mt-4 text-2xl font-semibold tracking-tight">
                      {totalRecommendedMinutes} mins
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Spread across this week
                    </p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#8b5cf6 0 ${Math.min(100, Math.max(20, totalRecommendedMinutes))}%, #e2e8f0 ${Math.min(100, Math.max(20, totalRecommendedMinutes))}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {totalRecommendedMinutes}m
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Parent Support Need
                </p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {supportNeedLevel}
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{
                      width: `${supportNeedLevel === "High" ? 82 : supportNeedLevel === "Medium" ? 58 : 34}%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">
                  {supportNeedLevel === "High"
                    ? "Supervision recommended"
                    : supportNeedLevel === "Medium"
                      ? "Regular check-ins recommended"
                      : "Light support needed"}
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Weekly Study Schedule
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      A balanced distribution of tasks across the week
                    </p>
                  </div>
                  <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                    This week
                  </div>
                </div>

                <div className="relative mt-6">
                  <div className="absolute left-[1.1rem] top-0 bottom-0 w-px bg-slate-200" />

                  <div className="space-y-4">
                    {recommendationTimeline.map((item) => (
                      <div
                        key={`${item.label}-${item.title}`}
                        className="relative pl-12"
                      >
                        <div
                          className={`absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r text-xs font-bold text-white shadow-sm ${item.accent}`}
                        >
                          {item.label.slice(0, 3)}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="text-sm font-semibold text-slate-500">
                                {item.label}
                              </div>
                              <div className="mt-1 text-base font-semibold tracking-tight text-slate-900">
                                {item.title}
                              </div>
                              <div className="mt-1 text-xs text-slate-600">
                                {item.meta}
                              </div>
                            </div>

                            <button className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 sm:self-center">
                              View task
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                    AI Support Insight
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Best Parent Action
                  </h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                    Supervise {topWeakTopic} Practice
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Your support is most valuable when your child is revising{" "}
                    {topWeakTopic} this week, as it is currently the weakest and
                    most urgent topic.
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm text-slate-600">
                      Students with guided revision on weak topics tend to
                      improve readiness faster.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">
                    Why this matters
                  </h3>
                  <div className="mt-4 space-y-3">
                    {whyThisMatters.map((item) => (
                      <div key={item} className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm font-medium text-slate-700">
                          {item}
                        </div>
                      </div>
                    ))}
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

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";

function getTopicStyles(difficultyLevel) {
  if (difficultyLevel === "High") {
    return {
      color: "bg-rose-500",
      light: "bg-rose-100",
      text: "text-rose-600",
      label: "High Difficulty",
    };
  }

  if (difficultyLevel === "Moderate") {
    return {
      color: "bg-amber-400",
      light: "bg-amber-100",
      text: "text-amber-600",
      label: "Moderate Difficulty",
    };
  }

  return {
    color: "bg-emerald-500",
    light: "bg-emerald-100",
    text: "text-emerald-600",
    label: "Low Difficulty",
  };
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

export default function TeacherTopicAnalyticsPage() {
  const [topicAnalytics, setTopicAnalytics] = useState([]);
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

    async function fetchTopicAnalytics() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/topic-analytics`);

        if (!response.ok) {
          throw new Error("Failed to load topic analytics data.");
        }

        const data = await response.json();

        if (isMounted) {
          setTopicAnalytics(data);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError.message ||
              "Something went wrong while loading topic analytics.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTopicAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const topics = useMemo(() => {
    return topicAnalytics.map((item) => ({
      topic: item.topic,
      value: item.class_topic_performance,
      studentsStruggling: item.students_struggling_per_topic,
      difficultyIndex: item.topic_difficulty_index,
      difficultyLevel: item.difficulty_level,
      ...getTopicStyles(item.difficulty_level),
    }));
  }, [topicAnalytics]);

  const weakestTopic = useMemo(() => {
    if (!topics.length) return null;
    return [...topics].sort((a, b) => a.value - b.value)[0];
  }, [topics]);

  const strongestTopic = useMemo(() => {
    if (!topics.length) return null;
    return [...topics].sort((a, b) => b.value - a.value)[0];
  }, [topics]);

  const classMasteryAverage = useMemo(() => {
    if (!topics.length) return 0;
    const total = topics.reduce((sum, topic) => sum + topic.value, 0);
    return Math.round(total / topics.length);
  }, [topics]);

  const topicsBelow60 = useMemo(() => {
    return topics.filter((topic) => topic.value < 60);
  }, [topics]);

  const topicSignals = useMemo(() => {
    if (!topics.length) {
      return [
        "Loading topic trend signals...",
        "Waiting for analytics data...",
        "Insights will appear here once loaded.",
      ];
    }

    const signals = [];

    if (weakestTopic) {
      signals.push(
        `${weakestTopic.topic} has the lowest class performance at ${formatPercent(weakestTopic.value)}`,
      );
    }

    const mostStruggling = [...topics].sort(
      (a, b) => b.studentsStruggling - a.studentsStruggling,
    )[0];
    if (mostStruggling) {
      signals.push(
        `${mostStruggling.studentsStruggling} students are struggling most with ${mostStruggling.topic}`,
      );
    }

    if (strongestTopic) {
      signals.push(
        `${strongestTopic.topic} remains the strongest topic at ${formatPercent(strongestTopic.value)}`,
      );
    }

    return signals;
  }, [topics, weakestTopic, strongestTopic]);

  const reteachingPlan = [
    {
      day: "Monday",
      title: `${weakestTopic?.topic || "Algebra"} Reteaching`,
      meta: "Whole-class review of core errors",
      accent: "from-blue-500 to-cyan-400",
    },
    {
      day: "Wednesday",
      title: `${topicsBelow60[1]?.topic || "Statistics"} Reinforcement`,
      meta: "Targeted concept review + examples",
      accent: "from-violet-500 to-fuchsia-400",
    },
    {
      day: "Friday",
      title: "Mini Topic Diagnostic",
      meta: "Short checkpoint after reteaching",
      accent: "from-emerald-500 to-teal-400",
    },
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
            Loading topic analytics...
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
                      Weakest Topic
                    </p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {weakestTopic?.topic || "N/A"}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>!</span>
                      <span>Lowest class mastery</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {(topics.length
                      ? [...topics]
                          .sort((a, b) => a.value - b.value)
                          .slice(0, 7)
                      : []
                    ).map((item, i) => (
                      <div
                        key={`${item.topic}-${i}`}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{
                          height: `${Math.max(24, Math.min(100, item.value))}%`,
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
                      Class Mastery Average
                    </p>
                    <div className="mt-4 text-2xl font-semibold tracking-tight">
                      {classMasteryAverage}%
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Across key topics
                    </p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#8b5cf6 0 ${classMasteryAverage}%, #e2e8f0 ${classMasteryAverage}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {classMasteryAverage}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Topics Below 60%
                </p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {topicsBelow60.length} Topics
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{
                      width: `${topics.length ? Math.round((topicsBelow60.length / topics.length) * 100) : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">
                  Require reteaching
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Class Topic Analytics
                    </h2>
                    
                    <p className="mt-1 text-sm text-slate-500">
                      Topic-level mastery based on recent quizzes, practice, and
                      mock assessments
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      High Difficulty
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      Moderate Difficulty
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Low Difficulty
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {topics.map((item) => (
                    <div
                      key={item.topic}
                      className={`rounded-2xl border border-slate-200 p-4 ${item.light}`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {item.topic}
                          </div>
                          <div
                            className={`mt-1 text-xs font-semibold ${item.text}`}
                          >
                            {item.label}
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${item.text}`}>
                          {formatPercent(item.value)}
                        </div>
                      </div>

                      <div className="grid grid-cols-10 gap-1.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-10 rounded-lg ${i < Math.round(item.value / 10) ? item.color : "bg-white/80"}`}
                          />
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
                        <span>{item.studentsStruggling} struggling</span>
                        <span>
                          Difficulty {formatPercent(item.difficultyIndex)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                    AI Topic Insight
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Most Urgent Topic
                  </h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                    {weakestTopic?.topic || "N/A"}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {weakestTopic
                      ? `${weakestTopic.topic} currently has the lowest class mastery at ${formatPercent(weakestTopic.value)} and appears to be affecting performance across multiple students.`
                      : "Topic insights will appear once analytics data is loaded."}
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm text-slate-600">
                      Topics with low mastery across many students usually need
                      whole-class reteaching before individual intervention.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">
                    Analytics Snapshot
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Strongest topic
                      </div>
                      <div className="mt-1 font-semibold">
                        {strongestTopic?.topic || "N/A"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Priority focus
                      </div>
                      <div className="mt-1 font-semibold">
                        {weakestTopic?.topic || "Algebra"} reteaching
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">
                    Topic signals
                  </h3>
                  <div className="mt-4 space-y-3">
                    {topicSignals.map((signal) => (
                      <div key={signal} className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm font-medium text-slate-700">
                          {signal}
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
                  <h2 className="text-xl font-semibold tracking-tight">Recommended Reteaching Plan</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Suggested teaching priorities based on topic mastery trends
                  </p>
                </div>
                <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                  This week
                </div>
              </div>

              <div className="relative mt-6">
                <div className="absolute left-[1.1rem] top-0 bottom-0 w-px bg-slate-200" />

                <div className="space-y-4">
                  {reteachingPlan.map((item) => (
                    <div key={item.day} className="relative pl-12">
                      <div className={`absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r text-xs font-bold text-white shadow-sm ${item.accent}`}>
                        {item.day.slice(0, 3)}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-500">{item.day}</div>
                            <div className="mt-1 text-base font-semibold tracking-tight text-slate-900">
                              {item.title}
                            </div>
                            <div className="mt-1 text-xs text-slate-600">{item.meta}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

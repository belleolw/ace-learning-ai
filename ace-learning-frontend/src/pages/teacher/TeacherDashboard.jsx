import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "../../layouts/DashboardLayout"

const API_BASE_URL = "http://127.0.0.1:5001"

function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`
}

function getTopicStyle(topic) {
  const difficulty = String(topic?.difficulty_level || "").toLowerCase()

  if (difficulty === "high") {
    return {
      color: "bg-rose-500",
      light: "bg-rose-100",
      text: "text-rose-600",
      label: "Weak",
    }
  }

  if (difficulty === "moderate") {
    return {
      color: "bg-amber-400",
      light: "bg-amber-100",
      text: "text-amber-600",
      label: "Moderate",
    }
  }

  if (difficulty === "low") {
    return {
      color: "bg-emerald-500",
      light: "bg-emerald-100",
      text: "text-emerald-600",
      label: "Strong",
    }
  }

  return {
    color: "bg-slate-400",
    light: "bg-slate-100",
    text: "text-slate-600",
    label: "Unknown",
  }
}

function getAccent(index) {
  const accents = [
    "from-blue-500 to-cyan-400",
    "from-violet-500 to-fuchsia-400",
    "from-emerald-500 to-teal-400",
    "from-amber-400 to-orange-400",
  ]

  return accents[index % accents.length]
}

export default function TeacherDashboard() {
  const [focusList, setFocusList] = useState([])
  const [topicAnalytics, setTopicAnalytics] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const navItems = [
    { label: "Dashboard", to: "/teacher/overview" },
    { label: "At-Risk Students", to: "/teacher/at-risk" },
    { label: "Topic Analytics", to: "/teacher/topic-analytics" },
    { label: "Intervention", to: "/teacher/intervention" },
  ]

  useEffect(() => {
    let isMounted = true

    async function fetchTeacherDashboardData() {
      try {
        setIsLoading(true)
        setError("")

        const [focusResponse, topicResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/teacher/focus-list`),
          fetch(`${API_BASE_URL}/api/topic-analytics`),
        ])

        if (!focusResponse.ok || !topicResponse.ok) {
          throw new Error("Failed to load teacher dashboard data.")
        }

        const [focusData, topicData] = await Promise.all([
          focusResponse.json(),
          topicResponse.json(),
        ])

        if (isMounted) {
          setFocusList(Array.isArray(focusData) ? focusData : [])
          setTopicAnalytics(Array.isArray(topicData) ? topicData : [])
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Something went wrong while loading teacher dashboard data.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTeacherDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  const highPriorityStudents = useMemo(() => {
    return focusList.filter((student) => student.focus_priority === "High")
  }, [focusList])

  const atRiskStudents = useMemo(() => {
    return focusList.filter((student) => student.risk_level === "At Risk")
  }, [focusList])

  const mastery = useMemo(() => {
    return topicAnalytics.map((topic) => {
      const style = getTopicStyle(topic)
      return {
        topic: topic.topic,
        value: Math.round(Number(topic.class_topic_performance || 0)),
        ...style,
      }
    })
  }, [topicAnalytics])

  const classAverageScore = useMemo(() => {
    if (!focusList.length) return 0
    const total = focusList.reduce((sum, student) => sum + Number(student.predicted_exam_score || 0), 0)
    return total / focusList.length
  }, [focusList])

  const homeworkCompletionProxy = useMemo(() => {
    if (!focusList.length) return 0
    const totalWeakTopics = focusList.reduce((sum, student) => sum + Number(student.weak_topic_count || 0), 0)
    const maxPossibleWeakTopics = focusList.length * 5
    const completion = 100 - (totalWeakTopics / maxPossibleWeakTopics) * 100
    return Math.max(0, Math.min(100, completion))
  }, [focusList])

  const mostProblematicTopic = useMemo(() => {
    if (!topicAnalytics.length) return null
    return [...topicAnalytics].sort(
      (a, b) => Number(a.class_topic_performance || 0) - Number(b.class_topic_performance || 0)
    )[0]
  }, [topicAnalytics])

  const topWeakTopics = useMemo(() => {
    const counts = {}

    focusList.forEach((student) => {
      ;(student.weak_topics || []).forEach((topic) => {
        counts[topic] = (counts[topic] || 0) + 1
      })
    })

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count }))
  }, [focusList])

  const focusTopic = mostProblematicTopic?.topic || topWeakTopics[0]?.topic || "No topic data"

  const interventionPlan = useMemo(() => {
    const secondTopic = topWeakTopics[1]?.topic || topicAnalytics[1]?.topic || "Statistics"

    return [
      {
        day: "Monday",
        title: `${focusTopic} Concept Review`,
        meta: `Focus on students struggling with ${focusTopic.toLowerCase()}`,
        accent: getAccent(0),
      },
      {
        day: "Wednesday",
        title: `${secondTopic} Reinforcement`,
        meta: "Short targeted recap + guided practice",
        accent: getAccent(1),
      },
      {
        day: "Friday",
        title: "Mini Class Diagnostic",
        meta: "Checkpoint after intervention and reteaching",
        accent: getAccent(2),
      },
    ]
  }, [focusTopic, topWeakTopics, topicAnalytics])

  const trendBars = useMemo(() => {
    if (!focusList.length) {
      return [28, 35, 40, 52, 58, 66, 74]
    }

    const sorted = [...focusList]
      .sort((a, b) => Number(a.predicted_exam_score || 0) - Number(b.predicted_exam_score || 0))
      .slice(-7)

    return sorted.map((student) => Math.max(20, Math.round(Number(student.predicted_exam_score || 0))))
  }, [focusList])

  return (
    <DashboardLayout profileName="Ms Lim" profileSubtitle="Math Teacher" navItems={navItems}>
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading teacher dashboard...
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
                    <p className="text-sm font-medium text-slate-500">Class Average Score</p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {formatPercent(classAverageScore)}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>↗</span>
                      <span>{highPriorityStudents.length} high-focus students</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {trendBars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">At-Risk Students</p>
                    <div className="mt-4 text-2xl font-semibold tracking-tight">{atRiskStudents.length} Students</div>
                    <p className="mt-2 text-sm text-slate-500">Require immediate support</p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#8b5cf6 0 ${Math.min(100, Math.max(8, atRiskStudents.length))}%, #e2e8f0 ${Math.min(100, Math.max(8, atRiskStudents.length))}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {atRiskStudents.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Homework Completion</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">{formatPercent(homeworkCompletionProxy)}</div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${homeworkCompletionProxy}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">Estimated class completion this week</p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Class Topic Analytics</h2>
                    <p className="mt-1 text-sm text-slate-500">Based on recent quizzes and practice performance</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Weak</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Moderate</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Strong</div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {mastery.map((item) => (
                    <div key={item.topic} className={`rounded-2xl border border-slate-200 p-4 ${item.light}`}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-800">{item.topic}</div>
                        <div className={`text-sm font-semibold ${item.text}`}>{item.value}%</div>
                      </div>
                      <div className="grid grid-cols-10 gap-1.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-10 rounded-lg ${i < Math.round(item.value / 10) ? item.color : "bg-white/80"}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                    AI Class Insight
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">Most Problematic Topic</h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">{focusTopic}</div>
                  <div className="mt-2 text-sm font-medium text-slate-600">
                    {mostProblematicTopic
                      ? `${formatPercent(mostProblematicTopic.class_topic_performance)} class mastery`
                      : "No topic analytics available"}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {mostProblematicTopic
                      ? `${focusTopic} is currently the weakest class topic and should be prioritised before the next assessment.`
                      : "Topic analytics will appear here once the backend returns class topic data."}
                  </p>
                  <button className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                    View Student Breakdown
                  </button>
                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm text-slate-600">
                      {mostProblematicTopic
                        ? `${mostProblematicTopic.students_struggling_per_topic} students are struggling with ${focusTopic}.`
                        : "Student topic breakdown unavailable."}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">Today’s Teaching Focus</h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Suggested intervention</div>
                      <div className="mt-1 font-semibold">Revise {focusTopic.toLowerCase()} problem types</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Recommended duration</div>
                      <div className="mt-1 font-semibold">25 minutes</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">AI Recommended Intervention Plan</h2>
                  <p className="mt-1 text-sm text-slate-500">Suggested teaching priorities based on current class performance</p>
                </div>
                <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                  This week’s plan
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {interventionPlan.map((item) => (
                  <div key={item.day} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`} />
                    <div className="text-sm font-semibold text-slate-500">{item.day}</div>
                    <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">{item.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{item.meta}</div>
                    <button className="mt-5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100">
                      View task
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

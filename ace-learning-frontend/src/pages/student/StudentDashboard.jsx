import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"

const STORAGE_KEY = "ace-student-id"
const API_BASE_URL = "http://127.0.0.1:5001"

function getMasteryStyles(level) {
  if (level === "Weak") {
    return {
      color: "bg-rose-400",
      light: "bg-rose-100",
      text: "text-rose-600",
    }
  }

  if (level === "Strong") {
    return {
      color: "bg-emerald-500",
      light: "bg-emerald-100",
      text: "text-emerald-600",
    }
  }

  return {
    color: "bg-amber-400",
    light: "bg-amber-100",
    text: "text-amber-600",
  }
}

function formatPercent(value) {
  return `${Math.round(value)}%`
}

export default function AceStudentDashboard() {
  const [studentData, setStudentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [searchParams] = useSearchParams()

  const studentIdFromQuery = searchParams.get("studentId")
  const studentIdFromStorage = localStorage.getItem(STORAGE_KEY)
  const studentId = studentIdFromQuery || studentIdFromStorage || ""

  useEffect(() => {
    let isMounted = true

    async function fetchStudentDashboard() {
      try {
        setIsLoading(true)
        setError("")

        if (!studentId) {
          throw new Error("No student ID found. Please log in again.")
        }

        const response = await fetch(`${API_BASE_URL}/api/student/${studentId}`)

        if (!response.ok) {
          throw new Error("Failed to load student dashboard data.")
        }

        const data = await response.json()

        if (isMounted) {
          setStudentData(data)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Something went wrong while loading the dashboard.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchStudentDashboard()

    return () => {
      isMounted = false
    }
  }, [studentId])

  const navItems = [
    { label: "Dashboard", to: studentId ? `/student/overview?studentId=${studentId}` : "/student/overview" },
    { label: "Practice", to: studentId ? `/student/practice?studentId=${studentId}` : "/student/practice" },
    { label: "Study Plan", to: studentId ? `/student/study-plan?studentId=${studentId}` : "/student/study-plan" },
    { label: "Progress", to: studentId ? `/student/progress?studentId=${studentId}` : "/student/progress" },
    { label: "Wellness", to: studentId ? `/student/wellness?studentId=${studentId}` : "/student/wellness" },
  ]

  const mastery = useMemo(() => {
    if (!studentData?.topic_mastery) {
      return []
    }

    return studentData.topic_mastery.map((item) => ({
      topic: item.topic,
      value: item.score,
      masteryLevel: item.mastery_level,
      ...getMasteryStyles(item.mastery_level),
    }))
  }, [studentData])

  const weakTopic = useMemo(() => {
  if (studentData?.weak_topics?.length) {
    return [...studentData.weak_topics].sort((a, b) => a.mastery - b.mastery)[0]
  }

  if (studentData?.topic_mastery?.length) {
    const weakestOverall = [...studentData.topic_mastery].sort((a, b) => a.score - b.score)[0]

    return {
      topic: weakestOverall.topic,
      mastery: weakestOverall.score,
      mastery_level: weakestOverall.mastery_level,
    }
  }

  return null
}, [studentData])
  const studyPlan = studentData?.study_plan || []
  const progressSummary = studentData?.student_progress_summary
  const recommendedActions = studentData?.recommended_actions || []
  const primaryAction = recommendedActions[0]
  const secondaryAction = recommendedActions[1] || recommendedActions[0]

  const predictedScore = studentData?.predicted_exam_score ?? 0
  const completionValue = Math.min(
    100,
    Math.max(0, progressSummary ? progressSummary.best_score : 0)
  )
  const improvementRate = progressSummary?.improvement_rate ?? 0
  const improvementBadgeClass = improvementRate >= 0
    ? "bg-emerald-50 text-emerald-600"
    : "bg-rose-50 text-rose-600"

  return (
    <DashboardLayout
      profileName="Alicia Tan"
      profileSubtitle={studentId ? `${studentId} · Sec 4 Student` : "Sec 4 Student"}
      navItems={navItems}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading student dashboard...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-600 shadow-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && studentData && (
          <>
            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Predicted Exam Score</p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {formatPercent(predictedScore)}
                    </div>
                    <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${improvementBadgeClass}`}>
                      <span>{improvementRate >= 0 ? "↗" : "↘"}</span>
                      <span>{`${improvementRate >= 0 ? "+" : ""}${improvementRate.toFixed(2)}% improvement rate`}</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {mastery.slice(0, 3).map((item) => (
                      <div
                        key={item.topic}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{ height: `${Math.max(20, Math.min(100, item.value))}%` }}
                      />
                    ))}
                    {mastery.length === 0 &&
                      [35, 50, 65].map((height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                  </div>
                </div>
              </div>


              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Recent Average Score</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {formatPercent(progressSummary?.recent_average_score ?? 0)}
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${completionValue}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">
                  Best score: {formatPercent(progressSummary?.best_score ?? 0)}
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Topic Performance Breakdown</h2>
                    <p className="mt-1 text-sm text-slate-500">Based on recent practice performance</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" />Weak</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Moderate</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Strong</div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {mastery.map((item) => (
                    <div key={item.topic} className={`rounded-2xl border border-slate-200 p-4 ${item.light}`}>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{item.topic}</div>
                          <div className={`mt-1 text-xs font-medium ${item.text}`}>{item.masteryLevel}</div>
                        </div>
                        <div className={`text-sm font-semibold ${item.text}`}>{formatPercent(item.value)}</div>
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
                    AI Learning Insight
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-rose-600">Lowest-Scoring Topic</h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                    {weakTopic?.topic || "No weak topic"}
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-600">
                    Performance: {weakTopic ? formatPercent(weakTopic.mastery) : "N/A"}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {primaryAction
                      ? `${primaryAction.title} — estimated ${primaryAction.estimated_time_mins} mins.`
                      : "Keep practicing consistently to improve mastery and raise your predicted score."}
                  </p>
                  <button className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                    Start Practice
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">Today’s Focus</h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Next best action</div>
                      <div className="mt-1 font-semibold">
                        {primaryAction?.title || "Continue your study plan"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Estimated study time</div>
                      <div className="mt-1 font-semibold">
                        {secondaryAction?.estimated_time_mins || primaryAction?.estimated_time_mins || 15} minutes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">AI Recommended Study Plan</h2>
                  <p className="mt-1 text-sm text-slate-500">Optimized based on your weak topics and recent performance</p>
                </div>
                <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                  Adaptive this week
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {studyPlan.map((item, index) => (
                  <div key={`${item.day}-${item.title}`} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div
                      className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${
                        index % 3 === 0
                          ? "from-blue-500 to-cyan-400"
                          : index % 3 === 1
                          ? "from-violet-500 to-fuchsia-400"
                          : "from-emerald-500 to-teal-400"
                      }`}
                    />
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

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"
import { API_BASE_URL } from "../../config/api"

function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`
}

function getTopicStyle(masteryLevel = "") {
  const level = masteryLevel.toLowerCase()

  if (level === "weak") {
    return {
      color: "bg-rose-400",
      light: "bg-rose-100",
      text: "text-rose-600",
      label: "Weak",
    }
  }

  if (level === "moderate") {
    return {
      color: "bg-amber-400",
      light: "bg-amber-100",
      text: "text-amber-600",
      label: "Moderate",
    }
  }

  return {
    color: "bg-emerald-500",
    light: "bg-emerald-100",
    text: "text-emerald-600",
    label: "Strong",
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

export default function ParentWeakTopicsPage() {
  const [studentData, setStudentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [searchParams] = useSearchParams()

  const studentIdFromQuery = searchParams.get("studentId")
  const studentIdFromStorage =
    localStorage.getItem("ace-student-id") ||
    localStorage.getItem("parentStudentId") ||
    localStorage.getItem("studentId")
  const studentId = studentIdFromQuery || studentIdFromStorage || ""

  const navItems = [
    {
      label: "Dashboard",
      to: studentId ? `/parent/overview?studentId=${studentId}` : "/parent/overview",
    },
    {
      label: "Child Progress",
      to: studentId ? `/parent/child-progress?studentId=${studentId}` : "/parent/child-progress",
    },
    {
      label: "Weak Topics",
      to: studentId ? `/parent/weak-topics?studentId=${studentId}` : "/parent/weak-topics",
    },
    {
      label: "Recommendations",
      to: studentId ? `/parent/recommendations?studentId=${studentId}` : "/parent/recommendations",
    },
    {
      label: "Wellness",
      to: studentId ? `/parent/wellness?studentId=${studentId}` : "/parent/wellness",
    },
  ]

  useEffect(() => {
    let isMounted = true

    async function fetchWeakTopicData() {
      try {
        setIsLoading(true)
        setError("")

        if (!studentId) {
          throw new Error("No student selected. Please open this page after selecting a student.")
        }

        const response = await fetch(`${API_BASE_URL}/api/student/${studentId}`)

        if (!response.ok) {
          throw new Error("Failed to load weak topic data.")
        }

        const data = await response.json()

        if (isMounted) {
          setStudentData(data)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Something went wrong while loading weak topic data.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchWeakTopicData()

    return () => {
      isMounted = false
    }
  }, [studentId])

  const topicMastery = studentData?.topic_mastery || []
  const weakTopicData = studentData?.weak_topics || []
  const recommendedActions = studentData?.recommended_actions || []
  const studyPlan = studentData?.study_plan || []
  const recentAssessments = studentData?.recent_assessments || []

  const weakTopics = useMemo(() => {
    const source = topicMastery.length ? topicMastery : weakTopicData

    return source.map((item) => {
      const score = item.score ?? item.mastery ?? 0
      const masteryLevel = item.mastery_level || (Number(score) < 60 ? "Weak" : Number(score) < 75 ? "Moderate" : "Strong")
      const style = getTopicStyle(masteryLevel)

      return {
        topic: item.topic,
        value: Math.round(Number(score || 0)),
        ...style,
      }
    })
  }, [topicMastery, weakTopicData])

  const weakestTopic = useMemo(() => {
    if (!weakTopics.length) return null
    return [...weakTopics].sort((a, b) => a.value - b.value)[0]
  }, [weakTopics])

  const topicsBelowSixty = useMemo(() => {
    return weakTopics.filter((topic) => topic.value < 60).length
  }, [weakTopics])

  const supportPlan = useMemo(() => {
    if (!studyPlan.length) return []

    return studyPlan.slice(0, 3).map((item, index) => ({
      day: item.day,
      title: item.title,
      meta: item.meta,
      accent: getAccent(index),
    }))
  }, [studyPlan])

  const immediateAction = recommendedActions[0]?.title || `${weakestTopic?.topic || "Weak topic"} revision`
  const suggestedTime = recommendedActions[0]?.estimated_time_mins
    ? `${recommendedActions[0].estimated_time_mins} mins today`
    : "20 mins today"

  const weaknessSignals = useMemo(() => {
    const signals = []

    if (weakestTopic) {
      signals.push(`${weakestTopic.topic} is currently the lowest mastery topic at ${weakestTopic.value}%`)
    }

    recentAssessments.slice(0, 2).forEach((assessment) => {
      signals.push(`${assessment.label} in ${assessment.topic}: ${formatPercent(assessment.score)}`)
    })

    if (!signals.length) {
      signals.push("No recent weakness signals available yet")
    }

    return signals.slice(0, 3)
  }, [weakestTopic, recentAssessments])

  return (
    <DashboardLayout
      profileName="Grace Tan"
      profileSubtitle={`Parent Account · ${studentId}`}
      navItems={navItems}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading weak topic data...
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
                    <p className="text-sm font-medium text-slate-500">Weakest Topic</p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {weakestTopic?.topic || "N/A"}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>!</span>
                      <span>Lowest mastery detected</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {(weakTopics.length ? weakTopics : [{ value: 45 }, { value: 55 }, { value: 70 }]).map((item, i) => (
                      <div
                        key={`${item.topic || "topic"}-${i}`}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{ height: `${Math.max(24, Math.min(100, item.value || 0))}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Current Mastery</p>
                    <div className="mt-4 text-2xl font-semibold tracking-tight">{formatPercent(weakestTopic?.value || 0)}</div>
                    <p className="mt-2 text-sm text-slate-500">Needs urgent support</p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#ef4444 0 ${weakestTopic?.value || 0}%, #e2e8f0 ${weakestTopic?.value || 0}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {formatPercent(weakestTopic?.value || 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Topics Below 60%</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">{topicsBelowSixty} Topics</div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${Math.min(100, weakTopics.length ? (topicsBelowSixty / weakTopics.length) * 100 : 0)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">Require revision this week</p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Topic Performance Breakdown</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Based on recent quizzes, practice sets, and mock test performance
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      Weak
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      Moderate
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Strong
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {weakTopics.map((item) => (
                    <div key={item.topic} className={`rounded-2xl border border-slate-200 p-4 ${item.light}`}>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{item.topic}</div>
                          <div className={`mt-1 text-xs font-medium ${item.text}`}>{item.label}</div>
                        </div>
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
                    AI Weak Topic Insight
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Most Critical Topic
                  </h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">{weakestTopic?.topic || "N/A"}</div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Your child is showing the weakest performance in {weakestTopic?.topic || "this topic"}, and it should be prioritised for early support this week.
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm text-slate-600">
                      Students who strengthen their weakest topic early often improve overall exam performance faster.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">Priority Snapshot</h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Immediate focus</div>
                      <div className="mt-1 font-semibold">{immediateAction}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Suggested time</div>
                      <div className="mt-1 font-semibold">{suggestedTime}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">Recent Weakness Signals</h3>
                  <div className="mt-4 space-y-3">
                    {weaknessSignals.map((signal) => (
                      <div key={signal} className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm font-medium text-slate-700">{signal}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Recommended Topic Support Plan</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Suggested actions to improve weak-topic mastery this week
                  </p>
                </div>
                <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                  This week’s focus
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {supportPlan.map((item) => (
                  <div
                    key={item.day}
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`} />
                    <div className="text-sm font-semibold text-slate-500">{item.day}</div>
                    <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{item.meta}</div>
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

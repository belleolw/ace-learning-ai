import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "../../layouts/DashboardLayout"

const API_BASE_URL = "http://127.0.0.1:5001"

function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`
}

function getPriorityStyles(priority = "") {
  const value = String(priority).toLowerCase()

  if (value.includes("high")) {
    return {
      priorityClass: "bg-rose-50 text-rose-600",
      blockClass: "bg-rose-400",
      light: "bg-rose-50",
    }
  }

  if (value.includes("medium")) {
    return {
      priorityClass: "bg-amber-50 text-amber-600",
      blockClass: "bg-amber-400",
      light: "bg-amber-50",
    }
  }

  return {
    priorityClass: "bg-emerald-50 text-emerald-600",
    blockClass: "bg-emerald-400",
    light: "bg-emerald-50",
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

export default function TeacherInterventionPage() {
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

    async function fetchInterventionData() {
      try {
        setIsLoading(true)
        setError("")

        const [focusResponse, topicResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/teacher/focus-list`),
          fetch(`${API_BASE_URL}/api/topic-analytics`),
        ])

        if (!focusResponse.ok || !topicResponse.ok) {
          throw new Error("Failed to load teacher intervention data.")
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
          setError(fetchError.message || "Something went wrong while loading intervention data.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchInterventionData()

    return () => {
      isMounted = false
    }
  }, [])

  const highPriorityStudents = useMemo(() => {
    return focusList.filter((student) => student.focus_priority === "High")
  }, [focusList])

  const priorityStudents = useMemo(() => {
    return highPriorityStudents.slice(0, 3)
  }, [highPriorityStudents])

  const uniqueWeakTopics = useMemo(() => {
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

  const topWeakTopic = uniqueWeakTopics[0]?.topic || topicAnalytics[0]?.topic || "Algebra"
  const secondWeakTopic = uniqueWeakTopics[1]?.topic || topicAnalytics[1]?.topic || "Statistics"

  const lowestPerformingTopic = useMemo(() => {
    if (!topicAnalytics.length) return null
    return [...topicAnalytics].sort(
      (a, b) => Number(a.class_topic_performance || 0) - Number(b.class_topic_performance || 0)
    )[0]
  }, [topicAnalytics])

  const topPriorityStudentNames = priorityStudents.map((student) => student.student_id)
  const highAndVeryHighCount = highPriorityStudents.length

  const interventions = useMemo(() => {
    const items = []

    items.push({
      title: `Run ${topWeakTopic} Support Group`,
      meta: `Small-group reteaching for students with the highest focus scores in ${topWeakTopic}`,
      priority: "High",
      target: topPriorityStudentNames.length ? topPriorityStudentNames.join(", ") : "Top focus students",
    })

    items.push({
      title: `Review ${secondWeakTopic} Errors`,
      meta: `Whole-class correction and worked examples for recurring ${secondWeakTopic.toLowerCase()} mistakes`,
      priority: "Medium",
      target: "Entire class",
    })

    items.push({
      title: "Assign Mini Diagnostic Quiz",
      meta: `Reassess topic understanding after ${topWeakTopic.toLowerCase()} intervention`,
      priority: "High",
      target: highAndVeryHighCount ? `${highAndVeryHighCount} focus students` : "Focus students",
    })

    items.push({
      title: "Follow Up on Multi-Topic Struggles",
      meta: "Check in with students showing several weak topics and declining predicted performance",
      priority: "Medium",
      target: focusList.slice(0, 2).map((student) => student.student_id).join(", ") || "Selected students",
    })

    return items.map((item) => ({
      ...item,
      ...getPriorityStyles(item.priority),
    }))
  }, [topWeakTopic, secondWeakTopic, topPriorityStudentNames, highAndVeryHighCount, focusList])

  const weeklyPlan = useMemo(() => {
    return [
      {
        day: "Monday",
        title: `${topWeakTopic} Support Group`,
        meta: `25 mins with highest-focus students`,
        accent: getAccent(0),
      },
      {
        day: "Wednesday",
        title: `${secondWeakTopic} Error Review`,
        meta: "Whole-class concept correction",
        accent: getAccent(1),
      },
      {
        day: "Friday",
        title: "Mini Diagnostic Quiz",
        meta: "Measure progress after intervention",
        accent: getAccent(2),
      },
    ]
  }, [topWeakTopic, secondWeakTopic])

  const whyItMatters = useMemo(() => {
    return [
      `Most focus students share ${topWeakTopic} as a weak topic`,
      "Whole-class reteaching alone may not be enough for multi-topic strugglers",
      "Early intervention helps reduce further predicted score decline",
    ]
  }, [topWeakTopic])

  const averageFocusScore = useMemo(() => {
    if (!highPriorityStudents.length) return 0
    const total = highPriorityStudents.reduce((sum, student) => sum + Number(student.focus_score || 0), 0)
    return Math.round((total / highPriorityStudents.length) * 10)
  }, [highPriorityStudents])

  const bestImmediateAction = `${topWeakTopic} Support Group`

  return (
    <DashboardLayout
      profileName="Ms Lim"
      profileSubtitle="Math Teacher"
      navItems={navItems}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading intervention data...
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
                    <p className="text-sm font-medium text-slate-500">Priority Intervention</p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {bestImmediateAction}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>✦</span>
                      <span>Most urgent this week</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {(highPriorityStudents.length ? highPriorityStudents.slice(0, 7) : [{}, {}, {}, {}]).map((student, i) => (
                      <div
                        key={student.student_id || i}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{ height: `${student.focus_score ? Math.max(24, student.focus_score * 8) : [22, 30, 40, 48, 60, 70, 82][i % 7]}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Students Requiring Support</p>
                    <div className="mt-4 text-2xl font-semibold tracking-tight">{highAndVeryHighCount} Students</div>
                    <p className="mt-2 text-sm text-slate-500">High and very high focus</p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#8b5cf6 0 ${Math.min(100, Math.max(12, highAndVeryHighCount))}%, #e2e8f0 ${Math.min(100, Math.max(12, highAndVeryHighCount))}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {highAndVeryHighCount}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Intervention Capacity</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">3 Sessions</div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${Math.max(30, Math.min(100, averageFocusScore))}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">Planned for this week</p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">AI Recommended Interventions</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Suggested teacher actions based on student risk and topic analytics
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {interventions.map((item) => (
                    <div
                      key={item.title}
                      className={`rounded-2xl border border-slate-200 p-5 ${item.light}`}
                    >
                      <div>
                        <div className="text-lg font-semibold tracking-tight text-slate-900">
                          {item.title}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-600">{item.meta}</div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${item.priorityClass}`}>
                          {item.priority} priority
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                          {item.target}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-8 gap-1.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-8 rounded-lg ${i < 5 ? item.blockClass : "bg-white/80"}`}
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
                    AI Intervention Insight
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Best Immediate Action
                  </h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                    {bestImmediateAction}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {topWeakTopic} is the most common weak area across focus students, making a targeted support group the highest-value intervention this week.
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm text-slate-600">
                      Targeted small-group intervention can improve performance faster than broad revision when only certain students are falling behind.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">Intervention Snapshot</h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Highest priority topic</div>
                      <div className="mt-1 font-semibold">{lowestPerformingTopic?.topic || topWeakTopic}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Best format</div>
                      <div className="mt-1 font-semibold">Small-group reteaching</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">Why this intervention matters</h3>
                  <div className="mt-4 space-y-3">
                    {whyItMatters.map((item) => (
                      <div key={item} className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm font-medium text-slate-700">{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Weekly Intervention Plan</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Suggested intervention schedule for this week
                  </p>
                </div>
                <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                  This week
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {weeklyPlan.map((item) => (
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

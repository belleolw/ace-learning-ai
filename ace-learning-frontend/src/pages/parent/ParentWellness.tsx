import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"

const STORAGE_KEY = "ace-student-id"

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function buildMockWellnessData() {
  return {
    wellness_summary: {
      wellness_score: 63,
      avg_sleep_hours: 6.2,
      avg_screen_time_hours: 4.5,
      study_sessions_this_week: 4,
      sleep_trend: -0.8,
      screen_trend: +0.6,
    },
    parent_summary: {
      avg_sleep: 6.2,
      screen_flag: true,
      recommendation:
        "Encourage a consistent bedtime before 10:30pm and limit device use after 9:30pm on school nights.",
      study_sessions_completed: 4,
      wellness_trend: "Declining slightly this week",
      last_sent: "Sunday",
    },
    optimal_study_window: "7:00pm – 8:30pm",
    suggested_bedtime: "10:30pm",
    devices_connected: ["iPhone (Screen Time)", "Apple Watch (Sleep)"],
  }
}

export default function ParentWellness() {
  const [wellnessData, setWellnessData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams] = useSearchParams()

  const studentIdFromQuery = searchParams.get("studentId")
  const studentIdFromStorage = localStorage.getItem(STORAGE_KEY)
  const studentId = studentIdFromQuery || studentIdFromStorage || ""

  const navItems = [
    { label: "Dashboard", to: studentId ? `/parent/overview?studentId=${studentId}` : "/parent/overview" },
    { label: "Child Progress", to: studentId ? `/parent/child-progress?studentId=${studentId}` : "/parent/child-progress" },
    { label: "Weak Topics", to: studentId ? `/parent/weak-topics?studentId=${studentId}` : "/parent/weak-topics" },
    { label: "Recommendations", to: studentId ? `/parent/recommendations?studentId=${studentId}` : "/parent/recommendations" },
    { label: "Wellness", to: studentId ? `/parent/wellness?studentId=${studentId}` : "/parent/wellness" },
  ]

  useEffect(() => {
    if (studentIdFromQuery) {
      localStorage.setItem(STORAGE_KEY, studentIdFromQuery)
    }
  }, [studentIdFromQuery])

  useEffect(() => {
    let isMounted = true

    async function fetchWellnessData() {
      try {
        setIsLoading(true)
        setError("")

        if (!studentId) {
          throw new Error("No student selected. Please open this page after selecting a student.")
        }

        // The backend does not expose a wellness endpoint yet, so this page
        // uses the same local wellness snapshot currently shown in student flow.
        await new Promise((resolve) => setTimeout(resolve, 300))

        if (isMounted) {
          setWellnessData(buildMockWellnessData())
        }
      } catch (fetchError: any) {
        if (isMounted) {
          setError(fetchError.message || "Something went wrong while loading wellness.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchWellnessData()

    return () => {
      isMounted = false
    }
  }, [studentId])

  const parentSummary = wellnessData?.parent_summary
  const wellnessSummary = wellnessData?.wellness_summary

  const summaryCards = useMemo(
    () => [
      {
        label: "Avg sleep shared",
        value: `${parentSummary?.avg_sleep ?? 0}h / night`,
        accent: "from-blue-500 to-cyan-400",
      },
      {
        label: "Screen time flag",
        value: parentSummary?.screen_flag ? "Late-night use noted" : "All clear",
        accent: "from-rose-500 to-orange-400",
      },
      {
        label: "Sessions completed",
        value: `${parentSummary?.study_sessions_completed ?? 0} this week`,
        accent: "from-emerald-500 to-teal-400",
      },
      {
        label: "Wellness trend",
        value: parentSummary?.wellness_trend || "No trend yet",
        accent: "from-amber-400 to-orange-400",
      },
    ],
    [parentSummary]
  )

  return (
    <DashboardLayout
      profileName="Grace Tan"
      profileSubtitle={studentId ? `${studentId} · Parent Account` : "Parent Account"}
      navItems={navItems}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading wellness summary...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-600 shadow-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && wellnessData && (
          <>
            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Family Wellness Score</p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {formatPercent(wellnessSummary.wellness_score)}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-600">
                      <span>{wellnessSummary.wellness_score >= 60 ? "↗" : "↘"}</span>
                      <span>{wellnessSummary.wellness_score >= 60 ? "Needs light guidance" : "Needs attention"}</span>
                    </div>
                  </div>
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#3b82f6 0 ${wellnessSummary.wellness_score}%, #e2e8f0 ${wellnessSummary.wellness_score}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {wellnessSummary.wellness_score}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Avg Sleep This Week</p>
                <div className="mt-4 text-5xl font-semibold tracking-tight text-emerald-600">
                  {wellnessSummary.avg_sleep_hours}h
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">
                  {wellnessSummary.sleep_trend >= 0 ? "Improving" : "Down slightly"} this week
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Avg Screen Time</p>
                <div className="mt-4 text-5xl font-semibold tracking-tight text-rose-600">
                  {wellnessSummary.avg_screen_time_hours}h
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">
                  {wellnessSummary.screen_trend >= 0 ? "Higher than last week" : "Lower than last week"}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-500 shadow-sm">
                    Parent Summary · Sent weekly
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
                    Your Child's Wellness at a Glance
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    High-level summaries only. No raw usage data is shared.
                  </p>
                </div>
                <div className="flex-shrink-0 rounded-2xl border border-white bg-white px-4 py-2 text-sm font-medium text-violet-600 shadow-sm">
                  Last sent: {parentSummary.last_sent}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((item) => (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-5"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`} />
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {item.label}
                    </div>
                    <div className="mt-3 text-base font-semibold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/80 bg-white/70 p-4">
                <p className="text-sm font-medium text-slate-700">Parent recommendation this week:</p>
                <p className="mt-1 text-sm text-slate-600">{parentSummary.recommendation}</p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Family Coaching Notes
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                  Suggested support for the week
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The best results come from small routine changes: protect sleep before assessments, reduce late-night device use, and keep revision time inside the strongest study window.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-500">Suggested bedtime</div>
                    <div className="mt-1 font-semibold text-slate-900">{wellnessData.suggested_bedtime}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-500">Optimal study window</div>
                    <div className="mt-1 font-semibold text-slate-900">{wellnessData.optimal_study_window}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-500">Connected devices</div>
                    <div className="mt-1 font-semibold text-slate-900">{wellnessData.devices_connected.length}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold tracking-tight">What is shared</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-4">Sleep averages and trend direction</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Screen-time flags and weekly usage direction</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Study-session count and weekly recommendation</div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

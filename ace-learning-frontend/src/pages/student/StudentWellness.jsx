import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"

const API_BASE_URL = "http://127.0.0.1:5001"
const STORAGE_KEY = "ace-student-id"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSleepStatusStyles(hours) {
  if (hours >= 7.5) return { color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", label: "Well rested" }
  if (hours >= 6) return { color: "bg-amber-400", light: "bg-amber-50", text: "text-amber-600", label: "Moderate" }
  return { color: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600", label: "Low sleep" }
}

function getScreenStatusStyles(hours) {
  if (hours <= 2) return { color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", label: "Healthy" }
  if (hours <= 4) return { color: "bg-amber-400", light: "bg-amber-50", text: "text-amber-600", label: "Moderate" }
  return { color: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600", label: "High usage" }
}

// ─── Mock wellness data (replace with API call when endpoint is ready) ────────

function buildMockWellnessData() {
  return {
    wellness_summary: {
      avg_sleep_hours: 6.2,
      avg_screen_time_hours: 4.5,
      study_sessions_this_week: 4,
      wellness_score: 63,
      sleep_trend: -0.8,
      screen_trend: +0.6,
    },
    weekly_sleep: [
      { day: "Mon", hours: 7.5, score: 88 },
      { day: "Tue", hours: 6.0, score: 71 },
      { day: "Wed", hours: 5.5, score: 62 },
      { day: "Thu", hours: 6.5, score: 78 },
      { day: "Fri", hours: 4.5, score: 51 },
      { day: "Sat", hours: 8.0, score: 93 },
      { day: "Sun", hours: 7.0, score: 82 },
    ],
    weekly_screen: [
      { day: "Mon", hours: 2.5 },
      { day: "Tue", hours: 3.0 },
      { day: "Wed", hours: 5.5 },
      { day: "Thu", hours: 4.0 },
      { day: "Fri", hours: 6.0 },
      { day: "Sat", hours: 3.5 },
      { day: "Sun", hours: 2.0 },
    ],
    study_sessions: [
      { day: "Mon", title: "Algebra Revision", duration: "45 mins", time: "7:30pm", retention_score: 82, optimal: true },
      { day: "Tue", title: "Geometry Practice", duration: "30 mins", time: "9:00pm", retention_score: 58, optimal: false },
      { day: "Wed", title: "Probability Drill", duration: "20 mins", time: "10:30pm", retention_score: 42, optimal: false },
      { day: "Thu", title: "Statistics Review", duration: "50 mins", time: "7:00pm", retention_score: 88, optimal: true },
      { day: "Fri", title: "Mixed Practice", duration: "15 mins", time: "11:00pm", retention_score: 35, optimal: false },
    ],
    ai_insights: [
      {
        type: "sleep",
        title: "Sleep impacting retention",
        detail: "Your Friday session at 11pm followed 4.5hrs of sleep — retention was 35%, well below your 82% average on well-rested days.",
        severity: "high",
      },
      {
        type: "screen",
        title: "Late-night screen use detected",
        detail: "Wednesday shows 5.5hrs of screen time ending past midnight, correlating with your lowest sleep and retention scores that week.",
        severity: "high",
      },
      {
        type: "study",
        title: "Optimal study window identified",
        detail: "Your best retention scores (82–88%) consistently occur in sessions starting between 7–8pm. Sessions after 9pm drop below 60%.",
        severity: "info",
      },
      {
        type: "pattern",
        title: "Weekend recovery helps",
        detail: "Saturday's 8hrs of sleep boosted Sunday's study retention to above-average. Protecting weekend sleep has a measurable impact.",
        severity: "positive",
      },
    ],
    parent_summary: {
      avg_sleep: 6.2,
      screen_flag: true,
      recommendation: "Encourage a consistent bedtime before 10:30pm and limit device use after 9:30pm on school nights.",
      study_sessions_completed: 4,
      wellness_trend: "Declining slightly this week",
    },
    optimal_study_window: "7:00pm – 8:30pm",
    suggested_bedtime: "10:30pm",
    devices_connected: ["iPhone (Screen Time)", "Apple Watch (Sleep)"],
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InsightCard({ insight }) {
  const severityConfig = {
    high: { badge: "bg-rose-50 text-rose-500", border: "border-rose-100", bg: "from-rose-50 to-orange-50", dot: "bg-rose-500" },
    info: { badge: "bg-blue-50 text-blue-500", border: "border-blue-100", bg: "from-blue-50 to-sky-50", dot: "bg-blue-500" },
    positive: { badge: "bg-emerald-50 text-emerald-600", border: "border-emerald-100", bg: "from-emerald-50 to-teal-50", dot: "bg-emerald-500" },
  }
  const cfg = severityConfig[insight.severity] || severityConfig.info
  const typeLabel = { sleep: "Sleep Insight", screen: "Screen Insight", study: "Study Insight", pattern: "Pattern Detected" }

  return (
    <div className={`rounded-2xl border ${cfg.border} bg-gradient-to-br ${cfg.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
        <div>
          <div className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
            {typeLabel[insight.type]}
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">{insight.title}</div>
          <p className="mt-1 text-sm leading-5 text-slate-600">{insight.detail}</p>
        </div>
      </div>
    </div>
  )
}

function SleepBar({ day, hours }) {
  const maxHours = 10
  const heightPct = Math.max(8, (hours / maxHours) * 100)
  const style = getSleepStatusStyles(hours)

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className={`text-xs font-semibold ${style.text}`}>{hours}h</div>
      <div className="flex h-32 w-full items-end justify-center">
        <div
          className={`w-full rounded-t-xl ${style.color} opacity-80`}
          style={{ height: `${heightPct}%` }}
        />
      </div>
      <div className="text-center text-xs font-medium text-slate-500">{day}</div>
    </div>
  )
}

function ScreenBar({ day, hours }) {
  const maxHours = 8
  const heightPct = Math.max(8, (hours / maxHours) * 100)
  const style = getScreenStatusStyles(hours)

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className={`text-xs font-semibold ${style.text}`}>{hours}h</div>
      <div className="flex h-20 w-full items-end justify-center">
        <div
          className={`w-full rounded-t-lg ${style.color} opacity-70`}
          style={{ height: `${heightPct}%` }}
        />
      </div>
      <div className="text-center text-xs font-medium text-slate-500">{day}</div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentWellness() {
  const [wellnessData, setWellnessData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview") // overview | sleep | screen | sessions
  const [searchParams] = useSearchParams()

  const studentIdFromQuery = searchParams.get("studentId")
  const studentIdFromStorage = localStorage.getItem(STORAGE_KEY)
  const studentId = studentIdFromQuery || studentIdFromStorage || "S007"

  const navItems = [
    { label: "Dashboard", to: studentId ? `/student/overview?studentId=${studentId}` : "/student/overview" },
    { label: "Practice", to: studentId ? `/student/practice?studentId=${studentId}` : "/student/practice" },
    { label: "Study Plan", to: studentId ? `/student/study-plan?studentId=${studentId}` : "/student/study-plan" },
    { label: "Progress", to: studentId ? `/student/progress?studentId=${studentId}` : "/student/progress" },
    { label: "Wellness", to: studentId ? `/student/wellness?studentId=${studentId}` : "/student/wellness" },
  ]

  useEffect(() => {
    if (studentIdFromQuery) {
      localStorage.setItem(STORAGE_KEY, studentIdFromQuery)
    }
  }, [studentIdFromQuery])

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        setIsLoading(true)
        setError("")

        // In production, replace with your actual wellness API endpoint:
        // const response = await fetch(`${API_BASE_URL}/api/student/${studentId}/wellness`)
        // if (!response.ok) throw new Error("Failed to load wellness data.")
        // const data = await response.json()

        // For now, using mock data
        await new Promise((r) => setTimeout(r, 400)) // simulate network
        if (isMounted) setWellnessData(buildMockWellnessData())
      } catch (err) {
        if (isMounted) setError(err.message || "Something went wrong loading wellness data.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [studentId])

  const summary = wellnessData?.wellness_summary
  const sleepStyle = summary ? getSleepStatusStyles(summary.avg_sleep_hours) : {}
  const screenStyle = summary ? getScreenStatusStyles(summary.avg_screen_time_hours) : {}

  const optimalSessions = useMemo(
    () => wellnessData?.study_sessions?.filter((s) => s.optimal) || [],
    [wellnessData]
  )

  const avgRetention = useMemo(() => {
    if (!wellnessData?.study_sessions?.length) return 0
    return Math.round(
      wellnessData.study_sessions.reduce((sum, s) => sum + s.retention_score, 0) /
        wellnessData.study_sessions.length
    )
  }, [wellnessData])

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "sleep", label: "Sleep" },
    { id: "screen", label: "Screen Time" },
    { id: "sessions", label: "Study Sessions" },
  ]

  return (
    <DashboardLayout
      profileName="Alicia Tan"
      profileSubtitle={`Sec 4 Student · ${studentId}`}
      navItems={navItems}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading wellness data...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-600 shadow-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && wellnessData && (
          <>
            {/* ── Opt-in / connection banner ─────────────────────────────── */}
            <div className="flex items-center justify-between rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm text-white">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">AI Holistic Wellness is active</p>
                  <p className="text-xs text-slate-500">
                    Connected: {wellnessData.devices_connected.join(" · ")} · Your raw data stays private
                  </p>
                </div>
              </div>
              <button className="flex-shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100">
                Manage settings
              </button>
            </div>

            {/* ── Top stat cards ─────────────────────────────────────────── */}
            <section className="grid gap-5 lg:grid-cols-3">
              {/* Wellness score */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Wellness Score</p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                      {summary.wellness_score}
                    </div>
                    <div
                      className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                        summary.wellness_score >= 75
                          ? "bg-emerald-50 text-emerald-600"
                          : summary.wellness_score >= 55
                          ? "bg-amber-50 text-amber-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      <span>{summary.wellness_score >= 75 ? "↗" : summary.wellness_score >= 55 ? "→" : "↘"}</span>
                      <span>
                        {summary.wellness_score >= 75
                          ? "On track"
                          : summary.wellness_score >= 55
                          ? "Needs attention"
                          : "Needs improvement"}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#3b82f6 0 ${summary.wellness_score}%, #e2e8f0 ${summary.wellness_score}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {summary.wellness_score}
                    </div>
                  </div>
                </div>
              </div>

              {/* Average sleep */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Avg Sleep This Week</p>
                    <div className={`mt-4 text-5xl font-semibold tracking-tight ${sleepStyle.text}`}>
                      {summary.avg_sleep_hours}h
                    </div>
                    <div
                      className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${sleepStyle.light} ${sleepStyle.text}`}
                    >
                      <span>{summary.sleep_trend >= 0 ? "↗" : "↘"}</span>
                      <span>{`${summary.sleep_trend >= 0 ? "+" : ""}${summary.sleep_trend}h vs last week`}</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-24 flex-shrink-0 items-end gap-1">
                    {wellnessData.weekly_sleep.map((d, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-lg ${getSleepStatusStyles(d.hours).color} opacity-70`}
                        style={{ height: `${Math.max(8, (d.hours / 10) * 100)}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Screen time */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Avg Screen Time</p>
                <div className={`mt-4 text-5xl font-semibold tracking-tight ${screenStyle.text}`}>
                  {summary.avg_screen_time_hours}h
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      summary.avg_screen_time_hours <= 2
                        ? "from-emerald-500 to-teal-400"
                        : summary.avg_screen_time_hours <= 4
                        ? "from-amber-400 to-orange-400"
                        : "from-rose-500 to-pink-400"
                    }`}
                    style={{ width: `${Math.min(100, (summary.avg_screen_time_hours / 8) * 100)}%` }}
                  />
                </div>
                <p className={`mt-3 text-sm font-medium ${screenStyle.text}`}>
                  {screenStyle.label} · {summary.screen_trend >= 0 ? "+" : ""}
                  {summary.screen_trend}h vs last week
                </p>
              </div>
            </section>

            {/* ── Tab nav ────────────────────────────────────────────────── */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ══ OVERVIEW TAB ════════════════════════════════════════════ */}
            {activeTab === "overview" && (
              <>
                <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
                  {/* AI Insights list */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight">AI Wellness Insights</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Patterns linking your lifestyle to learning performance
                        </p>
                      </div>
                      <div className="flex-shrink-0 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                        This week
                      </div>
                    </div>
                    <div className="space-y-3">
                      {wellnessData.ai_insights.map((insight, i) => (
                        <InsightCard key={i} insight={insight} />
                      ))}
                    </div>
                  </div>

                  {/* Right sidebar */}
                  <div className="space-y-6">
                    {/* Tonight's nudge */}
                    <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                      <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                        AI Wellness Coaching
                      </div>
                      <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                        Tonight's Recommendation
                      </h3>
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                        Wind down by {wellnessData.suggested_bedtime}
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        You have study sessions scheduled tomorrow. Your best retention scores happen after 7+ hrs of sleep — tonight matters.
                      </p>
                      <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                        <p className="text-sm text-slate-600">
                          Optimal study window tomorrow:{" "}
                          <span className="font-semibold text-slate-900">
                            {wellnessData.optimal_study_window}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Snapshot */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-base font-semibold tracking-tight">Wellness Snapshot</h3>
                      <div className="mt-4 space-y-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-sm font-medium text-slate-500">Study sessions this week</div>
                          <div className="mt-1 font-semibold">
                            {summary.study_sessions_this_week} sessions completed
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-sm font-medium text-slate-500">High-retention sessions</div>
                          <div className="mt-1 font-semibold text-emerald-600">
                            {optimalSessions.length} of {wellnessData.study_sessions.length} this week
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-sm font-medium text-slate-500">Avg retention score</div>
                          <div className="mt-1 font-semibold">{avgRetention}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Parent summary */}
                <section className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-500 shadow-sm">
                        Parent Summary · Sent weekly
                      </div>
                      <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
                        What your parents can see
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        High-level summaries only — no raw usage data is shared
                      </p>
                    </div>
                    <div className="flex-shrink-0 rounded-2xl border border-white bg-white px-4 py-2 text-sm font-medium text-violet-600 shadow-sm">
                      Last sent: Sunday
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: "Avg sleep shared",
                        value: `${wellnessData.parent_summary.avg_sleep}h / night`,
                        accent: "from-blue-500 to-cyan-400",
                      },
                      {
                        label: "Screen time flag",
                        value: wellnessData.parent_summary.screen_flag ? "Late-night use noted" : "All clear",
                        accent: "from-rose-500 to-orange-400",
                      },
                      {
                        label: "Sessions completed",
                        value: `${wellnessData.parent_summary.study_sessions_completed} this week`,
                        accent: "from-emerald-500 to-teal-400",
                      },
                      {
                        label: "Wellness trend",
                        value: wellnessData.parent_summary.wellness_trend,
                        accent: "from-amber-400 to-orange-400",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-5"
                      >
                        <div
                          className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`}
                        />
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {item.label}
                        </div>
                        <div className="mt-3 text-base font-semibold text-slate-900">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm font-medium text-slate-700">Parent recommendation this week:</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {wellnessData.parent_summary.recommendation}
                    </p>
                  </div>
                </section>
              </>
            )}

            {/* ══ SLEEP TAB ═══════════════════════════════════════════════ */}
            {activeTab === "sleep" && (
              <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Sleep Pattern This Week</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Hours slept vs recommended 8hrs per night
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />7.5h+
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />6–7.5h
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />&lt;6h
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-px flex-1 border-t border-dashed border-slate-300" />
                      <span className="text-xs text-slate-400">Recommended: 8h</span>
                    </div>
                    <div className="flex h-44 items-end gap-2">
                      {wellnessData.weekly_sleep.map((d, i) => (
                        <SleepBar key={i} {...d} />
                      ))}
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4">
                        <div className="text-sm font-medium text-slate-500">Best night</div>
                        <div className="mt-1 font-semibold text-emerald-600">
                          {wellnessData.weekly_sleep.reduce((best, d) => (d.hours > best.hours ? d : best)).day} —{" "}
                          {Math.max(...wellnessData.weekly_sleep.map((d) => d.hours))}h
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <div className="text-sm font-medium text-slate-500">Worst night</div>
                        <div className="mt-1 font-semibold text-rose-600">
                          {wellnessData.weekly_sleep.reduce((worst, d) => (d.hours < worst.hours ? d : worst)).day} —{" "}
                          {Math.min(...wellnessData.weekly_sleep.map((d) => d.hours))}h
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <div className="text-sm font-medium text-slate-500">Weekly average</div>
                        <div className="mt-1 font-semibold">{summary.avg_sleep_hours}h / night</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                      AI Sleep Insight
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                      Sleep → Score Link
                    </h3>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                      −27% retention on low-sleep days
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      On days following less than 6 hours of sleep, your quiz retention scores are 27% lower than your baseline. Sleep is your highest-leverage wellness factor.
                    </p>
                    <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                      <p className="text-sm text-slate-600">
                        Suggested bedtime tonight:{" "}
                        <span className="font-semibold text-slate-900">
                          {wellnessData.suggested_bedtime}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold tracking-tight">Daily Sleep Log</h3>
                    <div className="mt-4 space-y-3">
                      {wellnessData.weekly_sleep.map((d) => {
                        const st = getSleepStatusStyles(d.hours)
                        return (
                          <div
                            key={d.day}
                            className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                          >
                            <div className="text-sm font-medium text-slate-600">{d.day}</div>
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={`h-full rounded-full ${st.color}`}
                                  style={{ width: `${(d.hours / 10) * 100}%` }}
                                />
                              </div>
                              <div className={`min-w-[32px] text-right text-sm font-semibold ${st.text}`}>
                                {d.hours}h
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ══ SCREEN TIME TAB ═════════════════════════════════════════ */}
            {activeTab === "screen" && (
              <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Screen Time This Week</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Daily device usage (social, gaming, general browsing)
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />≤2h
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />2–4h
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />&gt;4h
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex h-28 items-end gap-2">
                      {wellnessData.weekly_screen.map((d, i) => (
                        <ScreenBar key={i} {...d} />
                      ))}
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4">
                        <div className="text-sm font-medium text-slate-500">Heaviest day</div>
                        <div className="mt-1 font-semibold text-rose-600">
                          {wellnessData.weekly_screen.reduce((h, d) => (d.hours > h.hours ? d : h)).day} —{" "}
                          {Math.max(...wellnessData.weekly_screen.map((d) => d.hours))}h
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <div className="text-sm font-medium text-slate-500">Lightest day</div>
                        <div className="mt-1 font-semibold text-emerald-600">
                          {wellnessData.weekly_screen.reduce((l, d) => (d.hours < l.hours ? d : l)).day} —{" "}
                          {Math.min(...wellnessData.weekly_screen.map((d) => d.hours))}h
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <div className="text-sm font-medium text-slate-500">Weekly average</div>
                        <div className="mt-1 font-semibold">{summary.avg_screen_time_hours}h / day</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                      AI Screen Insight
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                      Late-night usage detected
                    </h3>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                      Wed: 5.5h screen time
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      Wednesday showed heavy device usage ending past midnight — correlating directly with your lowest sleep and retention scores of the week.
                    </p>
                    <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                      <p className="text-sm text-slate-600">
                        Recommended screen cut-off:{" "}
                        <span className="font-semibold text-slate-900">9:30pm on school nights</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold tracking-tight">Daily Screen Log</h3>
                    <div className="mt-4 space-y-3">
                      {wellnessData.weekly_screen.map((d) => {
                        const st = getScreenStatusStyles(d.hours)
                        return (
                          <div
                            key={d.day}
                            className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                          >
                            <div className="text-sm font-medium text-slate-600">{d.day}</div>
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={`h-full rounded-full ${st.color}`}
                                  style={{ width: `${Math.min(100, (d.hours / 8) * 100)}%` }}
                                />
                              </div>
                              <div className={`min-w-[32px] text-right text-sm font-semibold ${st.text}`}>
                                {d.hours}h
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ══ STUDY SESSIONS TAB ══════════════════════════════════════ */}
            {activeTab === "sessions" && (
              <>
                <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight">Study Session Analysis</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Retention scores correlated with sleep and time-of-day
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />Optimal
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-rose-400" />Low retention
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {wellnessData.study_sessions.map((session, index) => (
                        <div
                          key={index}
                          className={`rounded-2xl border p-5 ${
                            session.optimal
                              ? "border-emerald-100 bg-emerald-50/40"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-500">{session.day}</span>
                                <span className="text-sm text-slate-400">·</span>
                                <span className="text-sm text-slate-500">{session.time}</span>
                              </div>
                              <div className="mt-1.5 text-base font-semibold tracking-tight text-slate-900">
                                {session.title}
                              </div>
                              <div className="mt-1 text-sm text-slate-600">{session.duration}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  session.optimal
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-rose-50 text-rose-600"
                                }`}
                              >
                                {session.optimal ? "High retention" : "Low retention"}
                              </div>
                              <div className="text-lg font-semibold text-slate-900">
                                {session.retention_score}%
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${
                                session.optimal
                                  ? "from-emerald-500 to-teal-400"
                                  : "from-rose-400 to-pink-400"
                              }`}
                              style={{ width: `${session.retention_score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                      <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                        AI Study Insight
                      </div>
                      <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                        Your best study window
                      </h3>
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                        {wellnessData.optimal_study_window}
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        Sessions starting in this window consistently achieve 80%+ retention. Sessions after 9pm drop below 60% — even when session length is the same.
                      </p>
                      <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                        <p className="text-sm text-slate-600">
                          Schedule tomorrow's session at:{" "}
                          <span className="font-semibold text-slate-900">
                            {wellnessData.optimal_study_window.split("–")[0].trim()}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-base font-semibold tracking-tight">Session Snapshot</h3>
                      <div className="mt-4 space-y-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-sm font-medium text-slate-500">Avg retention score</div>
                          <div className="mt-1 font-semibold">{avgRetention}%</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-sm font-medium text-slate-500">High-retention sessions</div>
                          <div className="mt-1 font-semibold text-emerald-600">
                            {optimalSessions.length} / {wellnessData.study_sessions.length} this week
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-sm font-medium text-slate-500">Best retention day</div>
                          <div className="mt-1 font-semibold">
                            {
                              wellnessData.study_sessions.reduce((b, d) =>
                                d.retention_score > b.retention_score ? d : b
                              ).day
                            }{" "}
                            —{" "}
                            {Math.max(...wellnessData.study_sessions.map((d) => d.retention_score))}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Weekly session cards grid */}
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Weekly Session Overview</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        All sessions with sleep context
                      </p>
                    </div>
                    <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                      {wellnessData.study_sessions.length} sessions
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {wellnessData.study_sessions.map((session, index) => {
                      const sleepThatNight = wellnessData.weekly_sleep.find(
                        (d) => d.day === session.day
                      )
                      return (
                        <div
                          key={index}
                          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5"
                        >
                          <div
                            className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${
                              session.optimal
                                ? "from-emerald-500 to-teal-400"
                                : "from-rose-400 to-pink-400"
                            }`}
                          />
                          <div className="text-sm font-semibold text-slate-500">{session.day}</div>
                          <div className="mt-3 text-base font-semibold tracking-tight text-slate-900">
                            {session.title}
                          </div>
                          <div className="mt-2 text-sm text-slate-600">
                            {session.time} · {session.duration}
                          </div>
                          <div
                            className={`mt-3 text-lg font-semibold ${
                              session.optimal ? "text-emerald-600" : "text-rose-500"
                            }`}
                          >
                            {session.retention_score}% retention
                          </div>
                          {sleepThatNight && (
                            <div className="mt-1 text-xs text-slate-500">
                              Sleep: {sleepThatNight.hours}h prior
                            </div>
                          )}
                          <button className="mt-4 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100">
                            View details
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

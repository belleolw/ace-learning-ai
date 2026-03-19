import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"

const API_BASE_URL = "http://127.0.0.1:5001"

function parseMeta(meta = "") {
  const parts = String(meta).split("·").map((part) => part.trim())
  return {
    duration: parts[0] || "15 mins",
    priority: parts[1] || "Medium priority",
  }
}

function getPriorityClass(priority = "") {
  const lower = priority.toLowerCase()

  if (lower.includes("high")) {
    return "bg-rose-50 text-rose-600"
  }

  if (lower.includes("low")) {
    return "bg-emerald-50 text-emerald-600"
  }

  return "bg-amber-50 text-amber-600"
}

function getStatusClass(status = "") {
  return status === "Completed"
    ? "bg-emerald-50 text-emerald-600"
    : status === "In Progress"
      ? "bg-blue-50 text-blue-600"
      : "bg-slate-100 text-slate-600"
}

function getAccent(index) {
  const accents = [
    "from-blue-500 to-cyan-400",
    "from-violet-500 to-fuchsia-400",
    "from-emerald-500 to-teal-400",
    "from-amber-400 to-orange-400",
    "from-sky-500 to-indigo-400",
  ]

  return accents[index % accents.length]
}

export default function StudentStudyPlan() {
  const [studentData, setStudentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [searchParams] = useSearchParams()

  const studentIdFromQuery = searchParams.get("studentId")
  const studentIdFromStorage = localStorage.getItem("studentId")
  const studentId = studentIdFromQuery || studentIdFromStorage || ""

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
  ]

  useEffect(() => {
    let isMounted = true

    async function fetchStudentStudyPlan() {
      try {
        setIsLoading(true)
        setError("")

        const response = await fetch(`${API_BASE_URL}/api/student/${studentId}`)

        if (!response.ok) {
          throw new Error("Failed to load study plan data.")
        }

        const data = await response.json()

        if (isMounted) {
          setStudentData(data)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Something went wrong while loading the study plan.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchStudentStudyPlan()

    return () => {
      isMounted = false
    }
  }, [studentId])

  const studyTasks = useMemo(() => {
    const tasks = studentData?.study_plan || []

    return tasks.map((task, index) => {
      const { duration, priority } = parseMeta(task.meta)
      const status = index < 1 ? "In Progress" : index < 2 ? "Pending" : "Pending"

      return {
        day: task.day,
        title: task.title,
        duration,
        priority,
        status,
        priorityClass: getPriorityClass(priority),
        statusClass: getStatusClass(status),
      }
    })
  }, [studentData])

  const weeklySchedule = useMemo(() => {
    return studyTasks.map((task, index) => ({
      label: task.day,
      title: task.title,
      meta: `${task.duration} · ${task.priority}`,
      accent: getAccent(index),
    }))
  }, [studyTasks])

  const completedCount = useMemo(() => {
    return studyTasks.filter((task) => task.status === "Completed").length
  }, [studyTasks])

  const totalTasks = studyTasks.length
  const completionPercent = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0

  const totalMinutes = useMemo(() => {
    return studyTasks.reduce((sum, task) => {
      const minutes = Number.parseInt(task.duration, 10)
      return sum + (Number.isNaN(minutes) ? 0 : minutes)
    }, 0)
  }, [studyTasks])

  const formattedTotalTime = useMemo(() => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours === 0) {
      return `${minutes}m`
    }

    if (minutes === 0) {
      return `${hours}h`
    }

    return `${hours}h ${minutes}m`
  }, [totalMinutes])

  const topWeakTopic = studentData?.weak_topics?.[0]?.topic || studentData?.topic_mastery?.[0]?.topic || "No topic yet"
  const bestStudyDay = studyTasks[0]?.day || "Monday"
  const highestPriorityTask = studyTasks.find((task) => task.priority.toLowerCase().includes("high"))?.title || studyTasks[0]?.title || "No task yet"

  return (
    <DashboardLayout
      profileName="Alicia Tan"
      profileSubtitle={`Sec 4 Student · ${studentId}`}
      navItems={navItems}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
            Loading study plan...
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
                    <p className="text-sm font-medium text-slate-500">Tasks This Week</p>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">{totalTasks} Tasks</div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>✦</span>
                      <span>AI generated plan</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {(weeklySchedule.length ? weeklySchedule : [{ label: "Mon" }, { label: "Tue" }]).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{ height: `${[26, 40, 34, 50, 58, 64, 78][i % 7]}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Completion Rate</p>
                    <div className="mt-4 text-2xl font-semibold tracking-tight">{completedCount} / {totalTasks || 0}</div>
                    <p className="mt-2 text-sm text-slate-500">{completionPercent}% completed</p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#8b5cf6 0 ${completionPercent}%, #e2e8f0 ${completionPercent}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {completionPercent}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Estimated Weekly Time</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">{formattedTotalTime}</div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${Math.min(100, Math.max(20, totalMinutes))}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">Balanced across {weeklySchedule.length || 0} days</p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">AI Recommended Study Plan</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Personalised based on weak topics and upcoming assessments
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {studyTasks.map((task) => (
                    <div
                      key={`${task.day}-${task.title}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-500">{task.day}</div>
                          <div className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                            {task.title}
                          </div>
                          <div className="mt-2 text-sm text-slate-600">{task.duration}</div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${task.priorityClass}`}>
                            {task.priority}
                          </div>
                          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${task.statusClass}`}>
                            {task.status}
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
                    AI Planning Insight
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">Best Study Focus</h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">{topWeakTopic}</div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {topWeakTopic} remains your weakest topic and should be prioritised early this week to maximise score improvement.
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm text-slate-600">
                      Students who complete their weakest-topic revision first tend to improve overall readiness faster.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">Study Snapshot</h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Highest priority</div>
                      <div className="mt-1 font-semibold">{highestPriorityTask}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">Best study day</div>
                      <div className="mt-1 font-semibold">{bestStudyDay}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Weekly Study Schedule</h2>
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
                  {weeklySchedule.map((item) => (
                    <div key={item.label} className="relative pl-12">
                      <div className={`absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r text-xs font-bold text-white shadow-sm ${item.accent}`}>
                        {item.label.slice(0, 3)}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-500">{item.label}</div>
                            <div className="mt-1 text-base font-semibold tracking-tight text-slate-900">
                              {item.title}
                            </div>
                            <div className="mt-1 text-xs text-slate-600">{item.meta}</div>
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
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

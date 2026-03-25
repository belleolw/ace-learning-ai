import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

export default function AlgebraDrillSet() {
  const navigate = useNavigate()

  const questions = [
    {
      question: "Solve for x: 2x + 3 = 11",
      options: ["x = 2", "x = 3", "x = 4", "x = 5"],
      correctAnswer: "x = 4",
      topic: "Linear equations",
    },
    {
      question: "Simplify: 3a + 2a",
      options: ["5", "5a", "6a", "a5"],
      correctAnswer: "5a",
      topic: "Simplifying expressions",
    },
    {
      question: "Solve for y: y - 7 = 10",
      options: ["y = 17", "y = 3", "y = -17", "y = 70"],
      correctAnswer: "y = 17",
      topic: "One-step equations",
    },
  ]

  const upcomingQuestions = [
    {
      label: "Q2",
      title: "Special angle values",
      meta: "Recall exact trigonometric ratios",
      accent: "from-blue-500 to-cyan-400",
    },
    {
      label: "Q3",
      title: "Applying tangent",
      meta: "Use tangent in right-angled triangles",
      accent: "from-violet-500 to-fuchsia-400",
    },
    {
      label: "Q4",
      title: "Trigonometric reasoning",
      meta: "Build confidence with angle relationships",
      accent: "from-emerald-500 to-teal-400",
    },
  ]

  const navItems = [
    { label: "Dashboard", to: "/student/overview" },
    { label: "Practice", to: "/student/practice" },
    { label: "Study Plan", to: "/student/study-plan" },
    { label: "Progress", to: "/student/progress" },
  ]

  const displayTotalQuestions = 10

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const isComplete = currentQuestionIndex >= questions.length
  const currentQuestion = !isComplete ? questions[currentQuestionIndex] : null
  const answeredCount = Math.min(currentQuestionIndex + (submitted ? 1 : 0), questions.length)

  const handleSubmit = () => {
    if (!selectedOption || submitted || !currentQuestion) return

    setSubmitted(true)

    if (selectedOption === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (!submitted) return

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption("")
      setSubmitted(false)
    } else {
      setCurrentQuestionIndex(questions.length)
      setSelectedOption("")
      setSubmitted(false)
    }
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setSelectedOption("")
    setSubmitted(false)
    setScore(0)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-500 text-sm font-bold text-white shadow-sm">
                A
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Platform</div>
                <div className="text-lg font-semibold tracking-tight">Ace Learning</div>
              </div>
            </div>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm">
              <span className="text-lg">🔔</span>
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
              <div className="hidden sm:block">
                <div className="text-sm font-semibold">Alicia Tan</div>
                <div className="text-xs text-slate-500">Sec 4 Student</div>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <section className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Drill Set</p>
                  <div className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">
                    Algebra Drill Set
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                    <span>✦</span>
                    <span>Weak Topic Focus</span>
                  </div>
                </div>
                <div className="flex h-20 w-28 items-end gap-2">
                  {[28, 40, 34, 50, 58, 66, 78].map((h, i) => (
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
                  <p className="text-sm font-medium text-slate-500">Progress</p>
                  <div className="mt-4 text-2xl font-semibold tracking-tight">
                    {isComplete
                      ? `${questions.length} / ${displayTotalQuestions}`
                      : `Question ${currentQuestionIndex + 1} / ${displayTotalQuestions}`}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Estimated time 15 mins</p>
                </div>
                <div className="relative h-24 w-24">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#8b5cf6 0 ${
                        (answeredCount / questions.length) * 100
                      }%, #e2e8f0 ${(answeredCount / questions.length) * 100}% 100%)`,
                    }}
                  />
                  <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                    {Math.round((answeredCount / questions.length) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Score So Far</p>
              <div className="mt-4 text-3xl font-semibold tracking-tight">
                {score} / {answeredCount || 1}
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                  style={{
                    width: `${answeredCount > 0 ? (score / answeredCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-sm font-medium text-teal-600">Updates as you answer</p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {!isComplete ? (
                <>
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Current Question</h2>
                      <p className="mt-1 text-sm text-slate-500">Algebra fundamentals practice</p>
                    </div>
                    <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                      Q{currentQuestionIndex + 1}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="text-sm font-medium text-slate-500">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                      {currentQuestion.question}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">Topic: {currentQuestion.topic}</p>

                    <div className="mt-6 grid gap-3">
                      {currentQuestion.options.map((option) => {
                        const isSelected = selectedOption === option
                        const isCorrect = submitted && option === currentQuestion.correctAnswer
                        const isWrongSelected =
                          submitted &&
                          isSelected &&
                          option !== currentQuestion.correctAnswer

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => !submitted && setSelectedOption(option)}
                            className={`rounded-2xl border p-4 text-left text-sm font-medium transition ${
                              isCorrect
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : isWrongSelected
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : isSelected
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                            disabled={submitted}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>

                    {submitted && (
                      <div
                        className={`mt-6 rounded-2xl border p-4 ${
                          selectedOption === currentQuestion.correctAnswer
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-rose-200 bg-rose-50"
                        }`}
                      >
                        <div
                          className={`text-sm font-semibold ${
                            selectedOption === currentQuestion.correctAnswer
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {selectedOption === currentQuestion.correctAnswer
                            ? "Correct answer"
                            : "Not quite right"}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {selectedOption === currentQuestion.correctAnswer
                            ? "Great work — you solved this algebra question correctly."
                            : `The correct answer is ${currentQuestion.correctAnswer}.`}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!selectedOption || submitted}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition ${
                          !selectedOption || submitted
                            ? "cursor-not-allowed bg-slate-300"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        Submit Answer
                      </button>
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        disabled={!submitted}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
                          !submitted
                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Next Question
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Current Question</h2>
                      <p className="mt-1 text-sm text-slate-500">Algebra fundamentals practice</p>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      Complete
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-500 shadow-sm">
                      Drill Set Complete
                    </div>
                    <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                      You scored {score} / {questions.length} correct
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      Nice work. Completing targeted algebra practice helps strengthen core exam skills
                      and improves your readiness over time.
                    </p>

                    <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                        style={{ width: `${(score / questions.length) * 100}%` }}
                      />
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        Retry Set
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/student/practice")}
                        className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                      >
                        Back to Practice
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                  AI Support
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">Why this matters</h3>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">Algebra Basics</div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Mastering algebra fundamentals improves accuracy in many exam questions and raises
                  predicted performance over time.
                </p>
                <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                  <p className="text-sm text-slate-600">
                    Students who improve Algebra mastery often gain{" "}
                    <span className="font-semibold text-slate-900">8–12%</span> overall score
                    improvement.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold tracking-tight">Practice Snapshot</h3>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-500">Difficulty</div>
                    <div className="mt-1 font-semibold">Easy → Medium</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-500">Current topic</div>
                    <div className="mt-1 font-semibold">
                      {isComplete ? "Algebra fundamentals" : currentQuestion.topic}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Upcoming Questions</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preview of what comes next in this drill set
                </p>
              </div>
              <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                3 sample questions
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {upcomingQuestions.map((item) => (
                <div
                  key={item.label}
                  className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`} />
                  <div className="text-sm font-semibold text-slate-500">{item.label}</div>
                  <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                    {item.title}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">{item.meta}</div>
                  <button className="mt-5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100">
                    Preview
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
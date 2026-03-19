import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:5001";
const STORAGE_KEY = "ace-student-id";

export default function StudentPractice() {
  const difficultyOptions = [
    {
      label: "Easy",
      title: "Confidence Builder",
      meta: "8 short algebra and geometry questions",
      accent: "from-blue-500 to-cyan-400",
    },
    {
      label: "Medium",
      title: "Skill Reinforcement",
      meta: "10 mixed-topic structured questions",
      accent: "from-violet-500 to-fuchsia-400",
    },
    {
      label: "Hard",
      title: "Exam Challenge",
      meta: "12 high-difficulty exam-style questions",
      accent: "from-emerald-500 to-teal-400",
    },
  ];

  const algebraQuestions = [
    {
      id: 1,
      question: "Solve for x: 2x + 3 = 11",
      options: ["x = 2", "x = 3", "x = 4", "x = 5"],
      correctAnswer: "x = 4",
      explanation:
        "Subtract 3 from both sides to get 2x = 8, then divide by 2.",
    },
    {
      id: 2,
      question: "Simplify: 3a + 2a",
      options: ["5", "5a", "6a", "a5"],
      correctAnswer: "5a",
      explanation: "Like terms can be combined by adding their coefficients.",
    },
    {
      id: 3,
      question: "Solve for y: y - 7 = 10",
      options: ["y = 17", "y = 3", "y = -17", "y = 70"],
      correctAnswer: "y = 17",
      explanation: "Add 7 to both sides to isolate y.",
    },
  ];


  const [activeSet, setActiveSet] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState("");
  const [searchParams] = useSearchParams();

  const studentIdFromQuery = searchParams.get("studentId");
  const studentIdFromStorage = localStorage.getItem(STORAGE_KEY);
  const studentId = studentIdFromQuery || studentIdFromStorage || "";

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
  ];
  useEffect(() => {
    if (studentIdFromQuery) {
      localStorage.setItem(STORAGE_KEY, studentIdFromQuery);
    }
  }, [studentIdFromQuery]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadStudentPracticeData() {
      try {
        setLoading(true);
        setError("");
        if (!studentId) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/student/${studentId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load practice recommendations");
        }

        const data = await response.json();
        if (!ignore) {
          setStudentData(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load practice recommendations");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadStudentPracticeData();

    return () => {
      ignore = true;
    };
  }, [studentId]);

  const topicMastery = studentData?.topic_mastery || [];
  const studyPlan = studentData?.study_plan || [];
  const recentAssessments = studentData?.recent_assessments || [];

  const recommendedTopic = useMemo(() => {
    if (studyPlan.length && topicMastery.length) {
      const title = String(studyPlan[0]?.title || "")
        .trim()
        .toLowerCase();

      const matchedTopic = topicMastery.find((item) =>
        title.includes(String(item?.topic || "").toLowerCase()),
      );

      if (matchedTopic?.topic) {
        return matchedTopic.topic;
      }
    }

    if (topicMastery.length) {
      const lowest = [...topicMastery].sort(
        (a, b) => Number(a?.score || 0) - Number(b?.score || 0),
      )[0];

      if (lowest?.topic) {
        return lowest.topic;
      }
    }

    return "";
  }, [studyPlan, topicMastery]);


  const recommendedSets = useMemo(() => {
    const accents = [
      {
        accent: "from-blue-500 to-cyan-400",
        light: "bg-blue-50",
        blocks: "bg-blue-500",
      },
      {
        accent: "from-violet-500 to-fuchsia-400",
        light: "bg-violet-50",
        blocks: "bg-violet-500",
      },
      {
        accent: "from-emerald-500 to-teal-400",
        light: "bg-emerald-50",
        blocks: "bg-emerald-500",
      },
      {
        accent: "from-amber-400 to-orange-400",
        light: "bg-amber-50",
        blocks: "bg-amber-400",
      },
    ];

    let sourceTopics = [];

    if (studyPlan.length && topicMastery.length) {
      sourceTopics = studyPlan
        .map((task) => {
          const title = String(task?.title || "").toLowerCase();
          return topicMastery.find((item) =>
            title.includes(String(item?.topic || "").toLowerCase()),
          );
        })
        .filter(Boolean);
    }

    if (!sourceTopics.length && topicMastery.length) {
      sourceTopics = [...topicMastery]
        .sort((a, b) => Number(a?.score || 0) - Number(b?.score || 0))
        .slice(0, 4);
    }

    return sourceTopics.slice(0, 4).map((item, index) => {
      const style = accents[index % accents.length];
      const topicName = item.topic;
      const isAlgebraSet = topicName === "Algebra";

      return {
        title: `${topicName} Practice Set`,
        questions: `${index === 0 ? 10 : index === 1 ? 8 : index === 2 ? 8 : 12} questions`,
        difficulty:
          item.mastery_level === "Weak"
            ? "High-priority revision"
            : item.mastery_level === "Moderate"
              ? "Targeted reinforcement"
              : "Confidence booster",
        accent: style.accent,
        light: style.light,
        blocks: style.blocks,
        type: isAlgebraSet ? "algebra-drill" : "coming-soon",
        mastery: Math.round(Number(item.score || 0)),
      };
    });
  }, [studyPlan, topicMastery]);

  const safeRecommendedTopic =
    recommendedTopic ||
    recommendedSets[0]?.title?.replace(" Practice Set", "") ||
    "";

  const bestNextPractice = safeRecommendedTopic
    ? `${safeRecommendedTopic} Practice Set`
    : "No practice set available";
  const recommendedTopicDetails = useMemo(() => {
    if (!topicMastery.length) {
      return null;
    }

    return (
      topicMastery.find((item) => item.topic === safeRecommendedTopic) ||
      topicMastery[0] ||
      null
    );
  }, [topicMastery, safeRecommendedTopic]);

  const currentQuestion = algebraQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === algebraQuestions.length - 1;
  const isDrillComplete =
    activeSet === "algebra-drill" &&
    currentQuestionIndex >= algebraQuestions.length;

  const handleStartSet = (type, title) => {
    if (type === "algebra-drill") {
      setActiveSet(type);
      setCurrentQuestionIndex(0);
      setSelectedOption("");
      setSubmitted(false);
      setScore(0);
      setShowComingSoon("");
      return;
    }
    setShowComingSoon(
      `${title} is not built yet, but it is recommended based on your current topic mastery.`,
    );
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || submitted) return;

    setSubmitted(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!submitted) return;

    if (isLastQuestion) {
      setCurrentQuestionIndex(algebraQuestions.length);
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedOption("");
    setSubmitted(false);
  };

  const handleRetrySet = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setSubmitted(false);
    setScore(0);
    setActiveSet("algebra-drill");
  };

  const handleBackToPractice = () => {
    setActiveSet(null);
    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setSubmitted(false);
    setScore(0);
  };

  const getOptionClassName = (option) => {
    if (!submitted) {
      return selectedOption === option
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60";
    }

    if (option === currentQuestion.correctAnswer) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (option === selectedOption && option !== currentQuestion.correctAnswer) {
      return "border-rose-200 bg-rose-50 text-rose-700";
    }

    return "border-slate-200 bg-white text-slate-500";
  };

  return (
    <DashboardLayout
      profileName="Alicia Tan"
      profileSubtitle="Sec 4 Student"
      navItems={navItems}
    >
      <div className="space-y-6">
        {!activeSet && loading && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Loading practice recommendations...
            </p>
          </section>
        )}

        {!activeSet && error && (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-rose-700">
              Unable to load practice data. Please select a student first.
            </p>
          </section>
        )}

        {!activeSet && !loading && !error && (
          <>
            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Recommended Practice Topic
                    </p>
                    <div className="mt-4 text-4xl font-semibold tracking-tight text-blue-600">
                      {safeRecommendedTopic || "No topic available"}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>✦</span>
                      <span>Based on your lowest scoring topic</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {[24, 36, 32, 45, 52, 66, 74].map((h, i) => (
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
                    <p className="text-sm font-medium text-slate-500">
                      Recommended Topic Focus
                    </p>
                    <div className="mt-4 text-2xl font-semibold tracking-tight">
                      {safeRecommendedTopic || "No topic available"}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {recommendedTopicDetails
                        ? `Current mastery ${Math.round(Number(recommendedTopicDetails.score || 0))}%`
                        : "Based on your latest topic snapshot"}
                    </p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#ef4444 0 ${Math.max(0, Math.min(100, Math.round(Number(recommendedTopicDetails?.score || 0))))}%, #e2e8f0 ${Math.max(0, Math.min(100, Math.round(Number(recommendedTopicDetails?.score || 0))))}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {Math.round(Number(recommendedTopicDetails?.score || 0))}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Practice Streak
                </p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {recentAssessments.length} Assessments
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{
                      width: `${Math.max(20, Math.min(100, recentAssessments.length * 20))}%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">
                  Based on your most recent practice activity
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Recommended Practice Sets
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Personalised based on your recent performance
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {recommendedSets.map((set) => (
                    <div
                      key={set.title}
                      className={`rounded-2xl border border-slate-200 p-4 ${set.light}`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {set.title}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {set.questions}
                          </div>
                          <div className="mt-1 text-sm font-medium text-slate-500">
                            {set.difficulty}
                          </div>
                          <div className="mt-1 text-sm font-medium text-slate-500">
                            Current mastery {set.mastery}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-8 gap-1.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-8 rounded-lg ${i < 5 ? set.blocks : "bg-white/80"}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => handleStartSet(set.type, set.title)}
                        className="mt-4 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                      >
                        Start Set
                      </button>
                    </div>
                  ))}
                </div>

                {showComingSoon && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                    {showComingSoon}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                    AI Practice Insight
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Best Next Practice
                  </h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                    {bestNextPractice}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {safeRecommendedTopic
                      ? `This set is prioritised based on your study plan, focusing on ${safeRecommendedTopic}.`
                      : "No recommended practice topic is available yet."}
                  </p>
                  <button
                    onClick={() =>
                      handleStartSet("algebra-drill", "Algebra Drill Set")
                    }
                    className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Start Practice
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">
                    Practice Snapshot
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Target time
                      </div>
                      <div className="mt-1 font-semibold">
                        {studyPlan[0]?.meta || "15–20 minutes"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Difficulty mix
                      </div>
                      <div className="mt-1 font-semibold">
                        {safeRecommendedTopic || "No topic available"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Practice by Difficulty
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose a set that matches your confidence level
                  </p>
                </div>
                <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                  Adaptive options
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {difficultyOptions.map((item) => (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`}
                    />
                    <div className="text-sm font-semibold text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {item.meta}
                    </div>
                    <button className="mt-5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100">
                      Start set
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeSet === "algebra-drill" && !isDrillComplete && (
          <>
            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Drill Set
                    </p>
                    <div className="mt-4 text-3xl font-semibold tracking-tight text-blue-600">
                      Algebra Drill Set
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                      <span>✦</span>
                      <span>Weak Topic Focus</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-28 items-end gap-2">
                    {[18, 28, 42, 54, 62, 70].map((h, i) => (
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
                    <p className="text-sm font-medium text-slate-500">
                      Progress
                    </p>
                    <div className="mt-4 text-2xl font-semibold tracking-tight">
                      Question{" "}
                      {Math.min(
                        currentQuestionIndex + 1,
                        algebraQuestions.length,
                      )}{" "}
                      / {algebraQuestions.length}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Estimated time 15 mins
                    </p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#3b82f6 0 ${(Math.min(currentQuestionIndex + 1, algebraQuestions.length) / algebraQuestions.length) * 100}%, #e2e8f0 ${(Math.min(currentQuestionIndex + 1, algebraQuestions.length) / algebraQuestions.length) * 100}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {Math.round(
                        (Math.min(
                          currentQuestionIndex + 1,
                          algebraQuestions.length,
                        ) /
                          algebraQuestions.length) *
                          100,
                      )}
                      %
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Score So Far
                </p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {score} /{" "}
                  {submitted ? currentQuestionIndex + 1 : currentQuestionIndex}
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{
                      width: `${
                        (submitted
                          ? currentQuestionIndex + 1
                          : currentQuestionIndex) === 0
                          ? 0
                          : (score /
                              (submitted
                                ? currentQuestionIndex + 1
                                : currentQuestionIndex)) *
                            100
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-600">
                  Updates as you answer
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Current Question
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Algebra fundamentals practice
                    </p>
                  </div>
                  <button
                    onClick={handleBackToPractice}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    Back to Practice
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 shadow-sm">
                    Question {currentQuestion.id}
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {currentQuestion.question}
                  </h3>

                  <div className="mt-6 grid gap-3">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => !submitted && setSelectedOption(option)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${getOptionClassName(option)}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {submitted && (
                    <div
                      className={`mt-5 rounded-2xl border px-4 py-4 text-sm ${
                        selectedOption === currentQuestion.correctAnswer
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      <p className="font-semibold">
                        {selectedOption === currentQuestion.correctAnswer
                          ? "Correct answer"
                          : "Not quite"}
                      </p>
                      <p className="mt-1">
                        {selectedOption === currentQuestion.correctAnswer
                          ? currentQuestion.explanation
                          : `The correct answer is ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedOption || submitted}
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Submit Answer
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={!submitted}
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      {isLastQuestion ? "Finish Set" : "Next Question"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm">
                    AI Support
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Why this matters
                  </h3>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-600">
                    Algebra Basics
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Mastering algebra fundamentals improves accuracy in many
                    exam questions and raises predicted performance over time.
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm text-slate-600">
                      Students who improve Algebra mastery often gain{" "}
                      <span className="font-semibold text-slate-900">
                        8–12%
                      </span>{" "}
                      overall score improvement.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight">
                    Practice Snapshot
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Difficulty
                      </div>
                      <div className="mt-1 font-semibold">Easy → Medium</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-500">
                        Current topic
                      </div>
                      <div className="mt-1 font-semibold">Linear equations</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Upcoming Questions
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Preview of what comes next in this drill set
                  </p>
                </div>
                <div className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600">
                  3 sample questions
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {[
                  {
                    label: "Q2",
                    title: "Simplifying expressions",
                    meta: "Combine like terms",
                    accent: "from-blue-500 to-cyan-400",
                  },
                  {
                    label: "Q3",
                    title: "Solving equations",
                    meta: "One-step linear equations",
                    accent: "from-violet-500 to-fuchsia-400",
                  },
                  {
                    label: "Q4",
                    title: "Rearranging terms",
                    meta: "Build algebra confidence",
                    accent: "from-emerald-500 to-teal-400",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`}
                    />
                    <div className="text-sm font-semibold text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {item.meta}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {isDrillComplete && (
          <>
            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Drill Set</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-blue-600">
                  Algebra Drill Set
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                  <span>✓</span>
                  <span>Completed</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Final Score
                </p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {score} / {algebraQuestions.length}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Questions answered correctly
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Accuracy</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-teal-600">
                  {Math.round((score / algebraQuestions.length) * 100)}%
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Great work reviewing your weakest topic
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-2xl text-white shadow-sm">
                  ✦
                </div>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight">
                  Drill Set Complete
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  You completed the Algebra Drill Set with {score} correct
                  answer{score === 1 ? "" : "s"} out of{" "}
                  {algebraQuestions.length}. Keep building momentum by retrying
                  the set or heading back to your practice dashboard.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleRetrySet}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Retry Set
                  </button>
                  <button
                    onClick={handleBackToPractice}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                  >
                    Back to Practice
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

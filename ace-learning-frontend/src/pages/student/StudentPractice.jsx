import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:5001";
const STORAGE_KEY = "ace-student-id";
const DRILL_SETS = {
  Percentage: {
    displayTitle: "Percentage Drill Set",
    description: "Percentage fundamentals practice",
    supportHeading: "Percentage Essentials",
    supportText:
      "Mastering percentage fundamentals improves speed and accuracy in discount, interest, and comparison questions.",
    supportStat: "Students who improve Percentage mastery often gain 8–12% overall score improvement.",
    upcomingQuestions: [
      {
        label: "Q2",
        title: "Percentage increase",
        meta: "Track change over time",
        accent: "from-blue-500 to-cyan-400",
      },
      {
        label: "Q3",
        title: "Discount problems",
        meta: "Apply percent reductions",
        accent: "from-violet-500 to-fuchsia-400",
      },
      {
        label: "Q4",
        title: "Reverse percentages",
        meta: "Work backwards from totals",
        accent: "from-emerald-500 to-teal-400",
      },
    ],
    questions: [
      {
        id: 1,
        question: "What is 25% of 160?",
        options: ["20", "30", "40", "50"],
        correctAnswer: "40",
        explanation: "25% is one quarter, and one quarter of 160 is 40.",
        topic: "Finding percentages",
      },
      {
        id: 2,
        question: "A shirt costs $80 and is discounted by 15%. What is the discount amount?",
        options: ["$10", "$12", "$15", "$20"],
        correctAnswer: "$12",
        explanation: "15% of 80 is 0.15 × 80 = 12.",
        topic: "Discounts",
      },
      {
        id: 3,
        question: "A value rises from 50 to 60. What is the percentage increase?",
        options: ["10%", "15%", "20%", "25%"],
        correctAnswer: "20%",
        explanation: "The increase is 10, and 10 ÷ 50 = 0.2, which is 20%.",
        topic: "Percentage change",
      },
    ],
  },
  Algebra: {
    displayTitle: "Algebra Drill Set",
    description: "Algebra fundamentals practice",
    supportHeading: "Algebra Basics",
    supportText:
      "Mastering algebra fundamentals improves accuracy in many exam questions and raises predicted performance over time.",
    supportStat: "Students who improve Algebra mastery often gain 8–12% overall score improvement.",
    upcomingQuestions: [
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
    ],
    questions: [
      {
        id: 1,
        question: "Solve for x: 2x + 3 = 11",
        options: ["x = 2", "x = 3", "x = 4", "x = 5"],
        correctAnswer: "x = 4",
        explanation: "Subtract 3 from both sides to get 2x = 8, then divide by 2.",
        topic: "Linear equations",
      },
      {
        id: 2,
        question: "Simplify: 3a + 2a",
        options: ["5", "5a", "6a", "a5"],
        correctAnswer: "5a",
        explanation: "Like terms can be combined by adding their coefficients.",
        topic: "Simplifying expressions",
      },
      {
        id: 3,
        question: "Solve for y: y - 7 = 10",
        options: ["y = 17", "y = 3", "y = -17", "y = 70"],
        correctAnswer: "y = 17",
        explanation: "Add 7 to both sides to isolate y.",
        topic: "One-step equations",
      },
    ],
  },
  Inequalities: {
    displayTitle: "Inequalities Drill Set",
    description: "Inequalities practice",
    supportHeading: "Inequalities Skills",
    supportText:
      "Strong inequalities skills help with number lines, ranges, and exam questions involving constraints.",
    supportStat: "Students who improve Inequalities mastery often gain 8–12% overall score improvement.",
    upcomingQuestions: [
      {
        label: "Q2",
        title: "Number line shading",
        meta: "Show valid regions clearly",
        accent: "from-blue-500 to-cyan-400",
      },
      {
        label: "Q3",
        title: "Compound inequalities",
        meta: "Work with double bounds",
        accent: "from-violet-500 to-fuchsia-400",
      },
      {
        label: "Q4",
        title: "Word constraints",
        meta: "Translate context into symbols",
        accent: "from-emerald-500 to-teal-400",
      },
    ],
    questions: [
      {
        id: 1,
        question: "Solve: x + 4 > 9",
        options: ["x > 5", "x < 5", "x > 13", "x < 13"],
        correctAnswer: "x > 5",
        explanation: "Subtract 4 from both sides to get x > 5.",
        topic: "One-step inequalities",
      },
      {
        id: 2,
        question: "Solve: 2x ≤ 12",
        options: ["x ≤ 6", "x ≥ 6", "x ≤ 10", "x ≥ 10"],
        correctAnswer: "x ≤ 6",
        explanation: "Divide both sides by 2 to get x ≤ 6.",
        topic: "Dividing inequalities",
      },
      {
        id: 3,
        question: "Which value satisfies x < 3?",
        options: ["5", "3", "2", "4"],
        correctAnswer: "2",
        explanation: "Only 2 is less than 3.",
        topic: "Checking solutions",
      },
    ],
  },
  Matrices: {
    displayTitle: "Matrices Drill Set",
    description: "Matrices fundamentals practice",
    supportHeading: "Matrices Basics",
    supportText:
      "Matrices questions reward careful structure and accuracy, especially in operations and reading entries.",
    supportStat: "Students who improve Matrices mastery often gain 8–12% overall score improvement.",
    upcomingQuestions: [
      {
        label: "Q2",
        title: "Matrix addition",
        meta: "Combine entries correctly",
        accent: "from-blue-500 to-cyan-400",
      },
      {
        label: "Q3",
        title: "Scalar multiplication",
        meta: "Scale every entry",
        accent: "from-violet-500 to-fuchsia-400",
      },
      {
        label: "Q4",
        title: "Matrix notation",
        meta: "Identify rows and columns",
        accent: "from-emerald-500 to-teal-400",
      },
    ],
    questions: [
      {
        id: 1,
        question: "How many rows does a 2 × 3 matrix have?",
        options: ["2", "3", "5", "6"],
        correctAnswer: "2",
        explanation: "The first number gives the number of rows.",
        topic: "Matrix dimensions",
      },
      {
        id: 2,
        question: "If A = [[1, 2], [3, 4]], what is the entry in row 2, column 1?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "3",
        explanation: "Row 2, column 1 is the lower-left entry, which is 3.",
        topic: "Reading matrix entries",
      },
      {
        id: 3,
        question: "Add [[1, 2], [0, 3]] and [[2, 1], [4, 0]]. What is the top-left entry?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "3",
        explanation: "Add corresponding entries: 1 + 2 = 3.",
        topic: "Matrix addition",
      },
    ],
  },
  Geometry: {
    displayTitle: "Geometry Drill Set",
    description: "Geometry essentials practice",
    supportHeading: "Geometry Essentials",
    supportText:
      "Geometry practice strengthens visual reasoning and helps with shape, angle, and theorem-based questions.",
    supportStat: "Students who improve Geometry mastery often gain 8–12% overall score improvement.",
    upcomingQuestions: [
      {
        label: "Q2",
        title: "Perimeter review",
        meta: "Add side lengths accurately",
        accent: "from-blue-500 to-cyan-400",
      },
      {
        label: "Q3",
        title: "Area formulas",
        meta: "Match the right formula",
        accent: "from-violet-500 to-fuchsia-400",
      },
      {
        label: "Q4",
        title: "Shape properties",
        meta: "Spot key geometry facts",
        accent: "from-emerald-500 to-teal-400",
      },
    ],
    questions: [
      {
        id: 1,
        question: "What is the sum of the interior angles of a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correctAnswer: "180°",
        explanation: "The interior angles of every triangle add up to 180°.",
        topic: "Angle facts",
      },
      {
        id: 2,
        question: "What is the area of a rectangle with length 8 cm and width 3 cm?",
        options: ["11 cm²", "16 cm²", "24 cm²", "48 cm²"],
        correctAnswer: "24 cm²",
        explanation: "Area of a rectangle is length × width, so 8 × 3 = 24.",
        topic: "Area",
      },
      {
        id: 3,
        question: "How many sides does a hexagon have?",
        options: ["5", "6", "7", "8"],
        correctAnswer: "6",
        explanation: "A hexagon is a 6-sided polygon.",
        topic: "Polygons",
      },
    ],
  },
  Angles: {
    displayTitle: "Angles Drill Set",
    description: "Angle relationships practice",
    supportHeading: "Angle Relationships",
    supportText:
      "Angles questions build fluency with straight lines, intersecting lines, and parallel line rules.",
    supportStat: "Students who improve Angles mastery often gain 8–12% overall score improvement.",
    upcomingQuestions: [
      {
        label: "Q2",
        title: "Straight-line angles",
        meta: "Use 180° totals",
        accent: "from-blue-500 to-cyan-400",
      },
      {
        label: "Q3",
        title: "Vertically opposite angles",
        meta: "Match equal pairs",
        accent: "from-violet-500 to-fuchsia-400",
      },
      {
        label: "Q4",
        title: "Parallel line rules",
        meta: "Spot alternate and corresponding angles",
        accent: "from-emerald-500 to-teal-400",
      },
    ],
    questions: [
      {
        id: 1,
        question: "Angles on a straight line add up to:",
        options: ["90°", "180°", "270°", "360°"],
        correctAnswer: "180°",
        explanation: "A straight line forms 180°.",
        topic: "Straight-line angles",
      },
      {
        id: 2,
        question: "If one angle is 70° on a straight line, what is the adjacent angle?",
        options: ["20°", "70°", "110°", "290°"],
        correctAnswer: "110°",
        explanation: "Adjacent angles on a straight line total 180°, so 180 - 70 = 110.",
        topic: "Supplementary angles",
      },
      {
        id: 3,
        question: "Vertically opposite angles are:",
        options: ["Complementary", "Equal", "Supplementary", "Random"],
        correctAnswer: "Equal",
        explanation: "Vertically opposite angles are always equal.",
        topic: "Vertically opposite angles",
      },
    ],
  },
  Trigonometry: {
    displayTitle: "Trigonometry Drill Set",
    description: "Trigonometry fundamentals practice",
    supportHeading: "Trigonometry Basics",
    supportText:
      "Mastering trigonometry fundamentals improves accuracy in many exam questions and raises predicted performance over time.",
    supportStat: "Students who improve Trigonometry mastery often gain 8–12% overall score improvement.",
    upcomingQuestions: [
      {
        label: "Q2",
        title: "Inverse trig values",
        meta: "Find angles from ratios",
        accent: "from-blue-500 to-cyan-400",
      },
      {
        label: "Q3",
        title: "Cosine ratios",
        meta: "Special angle values",
        accent: "from-violet-500 to-fuchsia-400",
      },
      {
        label: "Q4",
        title: "Trig identities",
        meta: "sin²θ + cos²θ = 1",
        accent: "from-emerald-500 to-teal-400",
      },
    ],
    questions: [
      {
        id: 1,
        question: "What is sin(30°)?",
        options: ["1/2", "√2/2", "√3/2", "1"],
        correctAnswer: "1/2",
        explanation: "For special angles, sin(30°) is equal to 1/2.",
        topic: "Trigonometric ratios",
      },
      {
        id: 2,
        question: "If tan(θ) = 1, what is θ for 0° < θ < 90°?",
        options: ["30°", "45°", "60°", "90°"],
        correctAnswer: "45°",
        explanation: "tan(45°) = 1, so the angle is 45°.",
        topic: "Inverse trigonometric values",
      },
      {
        id: 3,
        question: "What is cos(60°)?",
        options: ["√3/2", "1/2", "√2/2", "0"],
        correctAnswer: "1/2",
        explanation: "For special angles, cos(60°) is equal to 1/2.",
        topic: "Trigonometric ratios",
      },
    ],
  },
  Vectors: {
    displayTitle: "Vectors Drill Set",
    description: "Vector fundamentals practice",
    supportHeading: "Vector Skills",
    supportText:
      "Vectors practice helps with direction, magnitude, and combining movement accurately in problem solving.",
    supportStat: "Students who improve Vectors mastery often gain 8–12% overall score improvement.",
    upcomingQuestions: [
      {
        label: "Q2",
        title: "Vector addition",
        meta: "Combine components correctly",
        accent: "from-blue-500 to-cyan-400",
      },
      {
        label: "Q3",
        title: "Magnitude review",
        meta: "Read vector size confidently",
        accent: "from-violet-500 to-fuchsia-400",
      },
      {
        label: "Q4",
        title: "Direction changes",
        meta: "Interpret negative vectors",
        accent: "from-emerald-500 to-teal-400",
      },
    ],
    questions: [
      {
        id: 1,
        question: "A vector with magnitude 0 is called a:",
        options: ["Unit vector", "Null vector", "Parallel vector", "Column vector"],
        correctAnswer: "Null vector",
        explanation: "A null vector has zero magnitude.",
        topic: "Vector properties",
      },
      {
        id: 2,
        question: "What is the result of adding the vectors (2, 1) and (1, 3)?",
        options: ["(1, 2)", "(2, 3)", "(3, 4)", "(3, 2)"],
        correctAnswer: "(3, 4)",
        explanation: "Add corresponding components: (2 + 1, 1 + 3) = (3, 4).",
        topic: "Vector addition",
      },
      {
        id: 3,
        question: "A unit vector has magnitude:",
        options: ["0", "1", "2", "10"],
        correctAnswer: "1",
        explanation: "By definition, a unit vector has magnitude 1.",
        topic: "Unit vectors",
      },
    ],
  },
  Statistics: {
    displayTitle: "Statistics Drill Set",
    description: "Statistics fundamentals practice",
    supportHeading: "Statistics Basics",
    supportText:
      "Statistics practice strengthens interpretation of data, averages, and spread in exam-style questions.",
    supportStat: "Students who improve Statistics mastery often gain 8–12% overall score improvement.",
    upcomingQuestions: [
      {
        label: "Q2",
        title: "Median and mode",
        meta: "Compare common averages",
        accent: "from-blue-500 to-cyan-400",
      },
      {
        label: "Q3",
        title: "Reading charts",
        meta: "Interpret data displays",
        accent: "from-violet-500 to-fuchsia-400",
      },
      {
        label: "Q4",
        title: "Range and spread",
        meta: "Measure variation",
        accent: "from-emerald-500 to-teal-400",
      },
    ],
    questions: [
      {
        id: 1,
        question: "What is the mean of 4, 6, and 8?",
        options: ["5", "6", "7", "8"],
        correctAnswer: "6",
        explanation: "Add the values and divide by 3: (4 + 6 + 8) ÷ 3 = 6.",
        topic: "Mean",
      },
      {
        id: 2,
        question: "What is the median of 2, 5, 7, 9, 10?",
        options: ["5", "7", "9", "10"],
        correctAnswer: "7",
        explanation: "The median is the middle value when the data is ordered.",
        topic: "Median",
      },
      {
        id: 3,
        question: "What is the range of 3, 8, 10, 12?",
        options: ["4", "8", "9", "12"],
        correctAnswer: "9",
        explanation: "Range = highest value - lowest value = 12 - 3 = 9.",
        topic: "Range",
      },
    ],
  },
};
const BUILT_DRILL_TOPICS = Object.keys(DRILL_SETS);

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
    {
      label: "Wellness",
      to: studentId
        ? `/student/wellness?studentId=${studentId}`
        : "/student/wellness",
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
        type: BUILT_DRILL_TOPICS.includes(topicName) ? topicName : "coming-soon",
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
  const primaryRecommendedSet = recommendedSets[0] || null;
  const activeDrill = activeSet ? DRILL_SETS[activeSet] : null;
  const activeQuestions = activeDrill?.questions || [];
  const activeUpcomingQuestions = activeDrill?.upcomingQuestions || [];
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

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === activeQuestions.length - 1;
  const isDrillComplete =
    Boolean(activeSet) &&
    currentQuestionIndex >= activeQuestions.length;

  const handleStartSet = (type, title) => {
    if (type !== "coming-soon" && DRILL_SETS[type]) {
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
      setCurrentQuestionIndex(activeQuestions.length);
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
    setActiveSet(activeSet);
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
                      handleStartSet(
                        primaryRecommendedSet?.type || "coming-soon",
                        primaryRecommendedSet?.title || "Practice Set",
                      )
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

        {activeSet && !isDrillComplete && activeDrill && (
          <>
            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Drill Set
                    </p>
                    <div className="mt-4 text-3xl font-semibold tracking-tight text-blue-600">
                      {activeDrill.displayTitle}
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
                        activeQuestions.length,
                      )}{" "}
                      / {activeQuestions.length}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Estimated time 15 mins
                    </p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#3b82f6 0 ${(Math.min(currentQuestionIndex + 1, activeQuestions.length) / activeQuestions.length) * 100}%, #e2e8f0 ${(Math.min(currentQuestionIndex + 1, activeQuestions.length) / activeQuestions.length) * 100}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900">
                      {Math.round(
                        (Math.min(
                          currentQuestionIndex + 1,
                          activeQuestions.length,
                        ) /
                          activeQuestions.length) *
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
                      {activeDrill.description}
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
                    {activeDrill.supportHeading}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {activeDrill.supportText}
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                    <p className="text-sm text-slate-600">
                      {activeDrill.supportStat}
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
                      <div className="mt-1 font-semibold">
                        {currentQuestion?.topic || activeQuestions[0]?.topic || activeSet}
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
                {activeUpcomingQuestions.map((item) => (
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

        {isDrillComplete && activeDrill && (
          <>
            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Drill Set</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-blue-600">
                  {activeDrill.displayTitle}
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
                  {score} / {activeQuestions.length}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Questions answered correctly
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Accuracy</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-teal-600">
                  {Math.round((score / activeQuestions.length) * 100)}%
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
                  You completed the {activeDrill.displayTitle} with {score} correct
                  answer{score === 1 ? "" : "s"} out of{" "}
                  {activeQuestions.length}. Keep building momentum by retrying
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

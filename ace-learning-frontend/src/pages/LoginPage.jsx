import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Reusable login card for each user role
function RoleCard({ icon, title, description, accentClasses, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accentClasses}`}
      />

      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accentClasses} text-2xl text-white shadow-sm`}
      >
        {icon}
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition group-hover:gap-3">
        Continue
        <span aria-hidden="true">→</span>
      </div>
    </button>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [studentId, setStudentId] = useState("");

  // Role metadata for rendering the cards
  const roles = [
    {
      title: "Student",
      description: "Access your personalised study dashboard",
      icon: "🎓",
      path: "/student/overview",
      accentClasses: "from-blue-600 to-cyan-400",
    },
    {
      title: "Parent",
      description: "Monitor your child’s academic progress",
      icon: "👨‍👩‍👧",
      path: "/parent/overview",
      accentClasses: "from-violet-600 to-fuchsia-400",
    },
    {
      title: "Teacher",
      description: "View class analytics and student performance",
      icon: "👩‍🏫",
      path: "/teacher/overview",
      accentClasses: "from-emerald-500 to-teal-400",
    },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-10">
      {/* Decorative background blobs */}
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="relative w-full max-w-6xl">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 shadow-xl backdrop-blur">
          <div className="grid lg:grid-cols-[1.1fr_1.4fr]">
            {/* Left panel */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-violet-500 p-8 text-white md:p-12">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 font-bold">
                  A
                </span>
                Ace Learning Platform
              </div>

              <div className="mt-10 max-w-md">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Welcome back
                </h1>
                <p className="mt-4 text-base leading-7 text-blue-50 md:text-lg">
                  Choose your role to enter the adaptive learning platform and
                  access the tools designed for you.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-sm text-blue-100">AI-powered insights</div>
                  <div className="mt-1 text-lg font-semibold">
                    Personalised learning paths
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-sm text-blue-100">Predictive analytics</div>
                  <div className="mt-1 text-lg font-semibold">
                    Smarter exam preparation
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-sm text-blue-100">Progress tracking</div>
                  <div className="mt-1 text-lg font-semibold">
                    Clear performance visibility
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="p-8 md:p-12">
              <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Choose how you would like to log in
                  </h2>
                  <p className="mt-3 text-base text-slate-600">
                    Select your role to continue to the correct dashboard.
                  </p>
                </div>

                {selectedRole && (
                  <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedRole.title} Login
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Enter the student ID to access the dashboard.
                    </p>

                    <div className="mt-4 flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter Student ID (e.g. S001)"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <button
                        onClick={() => {
                          if (!studentId) return;
                          localStorage.setItem("studentId", studentId);

                          if (selectedRole.title === "Student") {
                            navigate("/student/overview");
                          } else if (selectedRole.title === "Parent") {
                            navigate("/parent/overview");
                          }
                        }}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {roles.map((role) => (
                    <RoleCard
                      key={role.title}
                      icon={role.icon}
                      title={role.title}
                      description={role.description}
                      accentClasses={role.accentClasses}
                      onClick={() => {
                        if (role.title === "Teacher") {
                          navigate(role.path);
                        } else {
                          setSelectedRole(role);
                        }
                      }}
                    />
                  ))}
                </div>

                <p className="mt-8 text-center text-sm text-slate-500">
                  Ace Learning helps students, parents, and teachers work
                  together with AI-powered learning insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
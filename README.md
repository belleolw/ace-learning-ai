# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Ace Tuition AI Dashboard

Ace Tuition AI is a prototype AI-powered adaptive learning dashboard designed for tuition centres. The system demonstrates how data analytics and AI insights can help students, parents, and teachers monitor academic performance, detect weak topics early, and plan targeted interventions.

This project was built as part of the **IS215 Digital Business & Technology Transformation** module.

---

# Features

## Student Dashboard
Students can:
- View predicted exam scores
- See topic mastery heatmaps
- Access adaptive practice sets
- Follow AI-generated study plans
- Track personal learning progress

## Parent Dashboard
Parents can:
- Monitor their child’s academic performance
- View progress trends
- Identify weak topics
- Receive AI learning recommendations

## Teacher Dashboard
Teachers can:
- Identify at-risk students
- Analyse class topic performance
- View topic analytics
- Plan teaching interventions

---

# Project Structure

```
src
 ├─ layouts
 │   └─ DashboardLayout.jsx
 │
 ├─ pages
 │   ├─ student
 │   │   ├─ StudentDashboard.jsx
 │   │   ├─ StudentPractice.jsx
 │   │   ├─ StudentStudyPlan.jsx
 │   │   ├─ StudentProgress.jsx
 │   │   └─ AlgebraDrillSet.jsx
 │   │
 │   ├─ parent
 │   │   ├─ ParentDashboard.jsx
 │   │   ├─ ParentChildProgressPage.jsx
 │   │   ├─ ParentWeakTopicsPage.jsx
 │   │   └─ ParentRecommendationsPage.jsx
 │   │
 │   └─ teacher
 │       ├─ TeacherDashboard.jsx
 │       ├─ TeacherAtRiskPage.jsx
 │       ├─ TeacherTopicAnalyticsPage.jsx
 │       └─ TeacherInterventionPage.jsx
```

The **DashboardLayout** component provides a shared navigation bar, profile dropdown, and sign-out functionality for all dashboards.

---

# Tech Stack

Frontend
- React
- Vite
- Tailwind CSS
- React Router

Design
- SaaS-style analytics dashboards
- Component-based layout system

---

# Setup Instructions

## 1. Clone the repository

```
git clone https://github.com/belleolw/ace-tuition-ai.git
cd ace-tuition-ai
```

## 2. Install dependencies

```
npm install
```

## 3. Run the development server

```
npm run dev
```

Then open the local server shown in the terminal (usually):

```
http://localhost:5173
```

---

# Authentication (Prototype)

The system currently uses a **simple login screen** for demonstration purposes.

Signing out from the profile dropdown returns users to the login page.

---

# Purpose of the Project

This system demonstrates how tuition centres can digitally transform from a **traditional classroom model** to a **data-driven adaptive learning platform**.

Key concepts demonstrated:

- Predictive performance analytics
- AI-generated study recommendations
- Early detection of learning gaps
- Teacher intervention planning
- Parent transparency through dashboards

---

# Future Improvements

Potential extensions of the platform include:

- Machine learning model for exam score prediction
- AI-generated question banks
- Adaptive learning difficulty engine
- Automated mock exam generator
- Real student data integration

# Ace Tuition AI Dashboard

Ace Tuition AI is a prototype **AI-powered adaptive learning dashboard** designed for tuition centres. The system demonstrates how **learning analytics and machine learning** can help students, parents, and teachers monitor academic performance, detect weak topics early, and plan targeted interventions.

This project was built as part of the **IS215 Digital Business & Technology Transformation** module.

---

# System Overview

The system consists of three main components:

```
React Dashboard (Frontend)
        ↓
Flask API (Backend)
        ↓
Learning Analytics Model (Machine Learning)
        ↓
Student Learning Dataset
```

The frontend dashboards consume analytics insights from the backend API, which runs the machine learning model to generate predictions and insights.

---

# Features

## Student Dashboard
Students can:

- View predicted exam scores
- See topic mastery levels
- Identify weak topics
- Access adaptive practice sets
- Follow AI-generated study plans
- Track personal learning progress

## Parent Dashboard
Parents can:

- Monitor their child's academic performance
- View progress trends
- Identify weak topics
- Receive AI learning recommendations

## Teacher Dashboard
Teachers can:

- Identify at-risk students
- Analyse class topic performance
- View topic analytics
- Plan teaching interventions

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router

## Backend

- Flask
- Flask-CORS
- Flask-RESTX (Swagger API documentation)

## Machine Learning

- Python
- pandas
- numpy
- scikit-learn

---

# Project Structure

```
ace-tuition-ai
│
├─ src
│   ├─ layouts
│   │   └─ DashboardLayout.jsx
│   │
│   ├─ pages
│   │   ├─ student
│   │   │   ├─ StudentDashboard.jsx
│   │   │   ├─ StudentPractice.jsx
│   │   │   ├─ StudentStudyPlan.jsx
│   │   │   ├─ StudentProgress.jsx
│   │   │   └─ AlgebraDrillSet.jsx
│   │   │
│   │   ├─ parent
│   │   │   ├─ ParentDashboard.jsx
│   │   │   ├─ ParentChildProgressPage.jsx
│   │   │   ├─ ParentWeakTopicsPage.jsx
│   │   │   └─ ParentRecommendationsPage.jsx
│   │   │
│   │   └─ teacher
│   │       ├─ TeacherDashboard.jsx
│   │       ├─ TeacherAtRiskPage.jsx
│   │       ├─ TeacherTopicAnalyticsPage.jsx
│   │       └─ TeacherInterventionPage.jsx
│
├─ learning-analytics
│   ├─ data
│   │   └─ student_learning_data.csv
│   │
│   ├─ learning_analytics_model
│   │   ├─ learning_analytics_model.py
│   │   └─ app.py
│   │
│   └─ requirements.txt
```

---

# Frontend Setup

## 1. Install dependencies

```
npm install
```

## 2. Run the development server

```
npm run dev
```

Open:

```
http://localhost:5173
```

---

# Backend Setup

Navigate to the backend folder:

```
cd learning-analytics
```

## 1. Create a virtual environment

```
python3 -m venv venv
```

Activate it:

```
source venv/bin/activate
```

## 2. Install dependencies

```
pip install -r requirements.txt
```

## 3. Start the API server

```
cd learning_analytics_model
python app.py
```

The API will run on:

```
http://127.0.0.1:5001
```

---

# API Documentation (Swagger)

Once the backend server is running, open:

```
http://127.0.0.1:5001/swagger
```

Swagger provides an interactive interface for testing all API endpoints.

---

# Available API Endpoints

## Health Check

```
GET /api/health
```

Returns API status and dataset information.

---

## Student Dashboard

```
GET /api/student/{student_id}
```

Returns analytics insights for a specific student.

Example:

```
/api/student/S001
```

Returns:

- predicted exam score
- risk level
- topic mastery
- weak topics
- study plan

---

## Topic Analytics

```
GET /api/topic-analytics
```

Returns class-level topic insights:

- average performance per topic
- number of struggling students
- topic difficulty index

---

## Teacher Focus List

```
GET /api/teacher/focus-list
```

Returns a ranked list of students who require intervention based on:

- predicted exam score
- number of weak topics
- risk classification

---

# Machine Learning Model

The learning analytics model uses **interpretable machine learning techniques** suitable for educational analytics.

Models used:

- **Linear Regression** → Predict exam performance
- **Logistic Regression** → Classify student risk levels

Feature engineering includes:

- topic mastery scores
- learning efficiency
- attempt efficiency
- improvement rate proxy

---

# Purpose of the Project

This system demonstrates how tuition centres can digitally transform from a **traditional classroom model** into a **data-driven adaptive learning platform**.

Key digital transformation concepts demonstrated:

- Learning analytics
- Predictive performance modelling
- AI-generated study recommendations
- Early detection of learning gaps
- Teacher intervention planning
- Parent transparency through dashboards

---

# Future Improvements

Potential extensions of the platform include:

- Real student data integration
- Adaptive difficulty question engine
- AI-generated question banks
- Automated mock exam generator
- Reinforcement learning for adaptive practice

---

# Author

Isabelle Ong  
IS215 Digital Business & Technology Transformation
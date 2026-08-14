# Skillpath — Modern Learning Platform

> A production-grade React & Framer solution built for the junior developer evaluation assignment.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Framer](https://img.shields.io/badge/Framer-Code%20Component-black.svg)](https://framer.com/)

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features & Engineering Highlights](#-key-features--engineering-highlights)
3. [Architecture & Resilience Strategy](#-architecture--resilience-strategy)
4. [Quick Start (Run Locally)](#-quick-start-run-locally)
5. [Framer Code Component Installation](#-framer-code-component-installation)
6. [Testing & Evaluation Matrix](#-testing--evaluation-matrix)
7. [Engineering Note](#-engineering-note)
8. [AI Usage Disclosure](#-ai-usage-disclosure)

---

## 🎯 Project Overview
Skillpath is a landing page for a fictional modern education platform. It features:
* **Hero Section**: High-conversion brand messaging and value proposition.
* **Courses Section**: An interactive **React Code Component** communicating with live, intentionally flaky backend APIs.
* **Footer**: Standard utility links and corporate attribution.

### API Endpoints
* **Courses Data**: `https://syncsphere-hiv6.onrender.com/assignment/course-data` (GET)
* **Country Code**: `https://syncsphere-hiv6.onrender.com/assignment/country-code` (GET)

---

## ⚡ Key Features & Engineering Highlights

* **Resilient Micro-Endpoint Orchestration**: Uses `Promise.allSettled` instead of `Promise.all` so intermittent failures on the country endpoint never prevent users from seeing the main course catalog.
* **Precise Currency Conversion**:
  * **India (`IN`)**: `pricePaise / 100` $\rightarrow$ Formatted via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })` (e.g. `₹1,999`).
  * **US / International (`US`)**: `priceUsdCents / 100` $\rightarrow$ Formatted via `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` (e.g. `$39.99`).
* **Deterministic State Machine**: Explicit single state (`'loading' | 'error' | 'empty' | 'success'`) replacing chaotic boolean flags.
* **Framer Property Controls**: Directly exposes `accentColor` (Color Picker) and `cardBorderRadius` (Numeric Stepper) through Framer's `addPropertyControls`.
* **Clean Line Clamping**: Uses CSS `-webkit-line-clamp: 2` with uniform minimum card heights, ensuring descriptions truncate smoothly without mutating API strings.
* **Bonus Capabilities**:
  * Real-time search filter matching course title, category, and description.
  * Numerical price sorting (Low-to-High and High-to-Low).
  * Animated skeleton shimmer loading cards.
  * Refundable badges and category pills.

---

## 🛠️ Architecture & Resilience Strategy

```
SkillpathCourses (Component)
│
├── 1. useEffect Trigger (with AbortController for clean teardown)
│    ├── Fetch Course Data [Primary]
│    └── Fetch Country Code [Secondary]
│
├── 2. Parallel Settling Evaluation
│    ├── If Course API rejects -> Set Status = "error" (Display Error UI + Retry)
│    ├── If Course API is []   -> Set Status = "empty" (Display Empty UI)
│    └── If Country API rejects -> Set Country = "US" (Safe Fallback + Notice)
│
├── 3. Memoized Search & Sorting (useMemo)
│    ├── Filter by Search Query
│    └── Sort by Numeric Converted Price
│
└── 4. Responsive CSS Grid
     ├── Desktop: 3 Columns
     ├── Tablet:  2 Columns
     └── Mobile:  1 Column
```

---

## 🚀 Quick Start (Run Locally)

```bash
# 1. Navigate to project folder
cd skillpath-project

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The top developer bar allows you to test the Framer Property Controls in real time!

---

## 🎨 Framer Code Component Installation

1. Open your project in [Framer](https://framer.com).
2. Go to **Assets** $\rightarrow$ **Code** $\rightarrow$ **New Component**.
3. Name it `SkillpathCourses.tsx`.
4. Copy the entire content from `src/framer/SkillpathCourses.tsx` and paste it into the editor.
5. Drag `SkillpathCourses` onto your canvas.
6. Customize the **Accent Color** and **Border Radius** in Framer's right-hand properties sidebar.

---

## 🧪 Testing & Evaluation Matrix

| Scenario | Input / State | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Normal IN** | Country = `IN` | Prices show as integer INR (e.g. `₹1,999`) | ✅ Pass |
| **Normal US** | Country = `US` | Prices show as decimal USD (e.g. `$39.99`) | ✅ Pass |
| **Course 404/500**| Backend failure | Error UI renders with "Retry Connection" | ✅ Pass |
| **Country 404/500**| Location drops | Courses load in USD with subtle note | ✅ Pass |
| **Empty Data** | Backend returns `[]` | Clean empty state banner | ✅ Pass |
| **Search** | Query typed | Real-time filtering across titles/tags | ✅ Pass |
| **Sort** | Price Asc / Desc | Cards re-order by numerical price | ✅ Pass |
| **Responsive** | Mobile / Tablet / Desktop | 1-col, 2-col, and 3-col grid layout | ✅ Pass |

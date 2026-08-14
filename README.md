# Skillpath — Modern Learning Platform

> A production-grade React & Framer solution engineered for high resilience, accurate localized pricing, and seamless responsive design.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-success.svg)](https://summi815.github.io/skillpath-assignment/)

🔗 **Live Demo**: [https://summi815.github.io/skillpath-assignment/](https://summi815.github.io/skillpath-assignment/)

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features & Engineering Highlights](#-key-features--engineering-highlights)
3. [Architecture & Resilience Strategy](#-architecture--resilience-strategy)
4. [Quick Start (Run Locally)](#-quick-start-run-locally)
5. [Testing & Evaluation Matrix](#-testing--evaluation-matrix)
6. [Engineering Note](#-engineering-note)
7. [AI Usage Disclosure](#-ai-usage-disclosure)

---

## 🎯 Project Overview
Skillpath is a landing page for a modern skill-building platform. It features:
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
  * Interactive enrollment modal and active learner state tracking.
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
# 1. Clone repository
git clone https://github.com/summi815/skillpath-assignment.git
cd skillpath-assignment

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

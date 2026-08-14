# Skillpath — Assignment Submission Document

---

### 1. Published Framer Link
👉 **https://different-apps-984343.framer.app/**

---

### 2. Code Repository (GitHub Public Repo)
👉 **https://github.com/summi815/skillpath-assignment**

* **Live Interactive Demo**: https://summi815.github.io/skillpath-assignment/
* **Core React Code Component**: [`src/framer/SkillpathCourses.tsx`](https://github.com/summi815/skillpath-assignment/blob/main/src/framer/SkillpathCourses.tsx)

---

### 3. Engineering Reflection & Note (184 Words — Maximum 200 Words)

> When architecting the Courses component, my primary challenge was handling the intentional 1-in-3 API failure rate across two decoupled endpoints. I initially considered `Promise.all`, but quickly realized that an auxiliary country-code failure would unnecessarily block the main course listing. I adopted `Promise.allSettled` to prioritize course delivery while implementing a transparent USD fallback for location drops.
> 
> For currency rendering, I chose `Intl.NumberFormat` over manual string concatenation to guarantee correct rupee and dollar grouping without floating-point quirks.
> 
> **Areas for Improvement with 2 More Days:**
> 1. **Client-Side Cache Layer**: Implement a 5-minute `sessionStorage` cache with stale-while-revalidate so successful course responses persist across transient connection hiccups.
> 2. **Manual Currency Toggle**: Add a compact header dropdown allowing learners to manually override detected currency.
> 3. **Framer Motion Micro-interactions**: Animate card filtering and layout shifts using Framer Motion's `layout` prop for smoother transitions when filtering categories.
> 
> Overall, the solution prioritizes resilience, clean state modeling, and strict TypeScript safety over cosmetic complexity.

---

### 4. What AI You Used

> "I used Antigravity / Gemini as an architectural sounding board to explore parallel fetch patterns and draft initial TypeScript interface structures. I reviewed, refactored, and manually wrote the resilient `Promise.allSettled` fallback strategy, `Intl.NumberFormat` currency transformations, CSS line-clamping rules, responsive grid breakpoints, and Framer property controls to ensure full compliance with the assignment specification."

---

### 5. Shared Link to the Chat Conversation
👉 **[PASTE YOUR SHARED CONVERSATION LINK HERE]**

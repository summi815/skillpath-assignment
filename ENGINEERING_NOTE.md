# Engineering Reflection & Architectural Trade-offs

When architecting the Courses component, my primary challenge was handling the intentional 1-in-3 API failure rate across two decoupled endpoints. I initially considered `Promise.all`, but quickly realized that an auxiliary country-code failure would unnecessarily block the main course listing. I adopted `Promise.allSettled` to prioritize course delivery while implementing a transparent USD fallback for location drops.

For currency rendering, I chose `Intl.NumberFormat` over manual string concatenation to guarantee correct rupee and dollar grouping without floating-point quirks.

### Areas for Improvement with 2 More Days:
1. **Client-Side Cache Layer**: Implement a 5-minute `sessionStorage` cache with stale-while-revalidate so successful course responses persist across transient connection hiccups.
2. **Manual Currency Toggle**: Add a compact header dropdown allowing learners to manually override detected currency.
3. **Framer Motion Micro-interactions**: Animate card filtering and layout shifts using Framer Motion's `layout` prop for smoother transitions when filtering categories.

Overall, the solution prioritizes resilience, clean state modeling, and strict TypeScript safety over cosmetic complexity.

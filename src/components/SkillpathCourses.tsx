import * as React from "react"
import { Course, Status, SortOption, SkillpathCoursesProps } from "../types"

// ----------------------------------------------------------------------------
// Constants & API URLs
// ----------------------------------------------------------------------------

const API_COURSES_URL = "https://syncsphere-hiv6.onrender.com/assignment/course-data"
const API_COUNTRY_URL = "https://syncsphere-hiv6.onrender.com/assignment/country-code"
const DEFAULT_FALLBACK_COUNTRY = "US"

// ----------------------------------------------------------------------------
// Currency Formatting Helper
// ----------------------------------------------------------------------------

export function formatPrice(
    course: Course,
    countryCode: string
): { formatted: string; numericValue: number } {
    const isIndia = countryCode && countryCode.toUpperCase() === "IN"

    if (isIndia) {
        const paise = typeof course.pricePaise === "number" ? course.pricePaise : 0
        const rupees = paise / 100
        const formatter = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        })
        return {
            formatted: formatter.format(rupees),
            numericValue: rupees,
        }
    }

    const cents = typeof course.priceUsdCents === "number" ? course.priceUsdCents : 0
    const dollars = cents / 100
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    return {
        formatted: formatter.format(dollars),
        numericValue: dollars,
    }
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export default function SkillpathCourses({
    accentColor = "#2563EB",
    cardBorderRadius = 16,
}: SkillpathCoursesProps) {
    // Core API State
    const [courses, setCourses] = React.useState<Course[]>([])
    const [countryCode, setCountryCode] = React.useState<string>(DEFAULT_FALLBACK_COUNTRY)
    const [status, setStatus] = React.useState<Status>("loading")
    const [countryFailed, setCountryFailed] = React.useState<boolean>(false)

    // User Interaction State
    const [searchQuery, setSearchQuery] = React.useState<string>("")
    const [sortBy, setSortBy] = React.useState<SortOption>("featured")
    const [fetchCount, setFetchCount] = React.useState<number>(0)

    // Enrollment Management State
    const [enrolledMap, setEnrolledMap] = React.useState<Record<string, boolean>>({})
    const [selectedCourseForModal, setSelectedCourseForModal] = React.useState<{
        course: Course
        formattedPrice: string
    } | null>(null)
    const [toastMessage, setToastMessage] = React.useState<string | null>(null)

    // Retry action
    const handleRetry = React.useCallback(() => {
        setStatus("loading")
        setFetchCount((prev) => prev + 1)
    }, [])

    // ------------------------------------------------------------------------
    // Resilient Data Fetching with AbortController & Parallel Settling
    // ------------------------------------------------------------------------
    React.useEffect(() => {
        const abortController = new AbortController()
        const { signal } = abortController

        async function loadData() {
            setStatus("loading")

            try {
                const [coursesResult, countryResult] = await Promise.allSettled([
                    fetch(API_COURSES_URL, { signal }).then(async (res) => {
                        if (!res.ok) {
                            throw new Error(`Courses endpoint returned HTTP ${res.status}`)
                        }
                        return res.json()
                    }),
                    fetch(API_COUNTRY_URL, { signal }).then(async (res) => {
                        if (!res.ok) {
                            throw new Error(`Country endpoint returned HTTP ${res.status}`)
                        }
                        return res.json()
                    }),
                ])

                if (signal.aborted) return

                // 1. Evaluate Course API
                if (coursesResult.status === "rejected") {
                    console.error("Course fetch failed:", coursesResult.reason)
                    setStatus("error")
                    return
                }

                const rawCourseData = coursesResult.value
                if (!Array.isArray(rawCourseData)) {
                    console.error("Course API returned non-array payload:", rawCourseData)
                    setStatus("error")
                    return
                }

                if (rawCourseData.length === 0) {
                    setCourses([])
                    setStatus("empty")
                    return
                }

                // 2. Evaluate Country API
                if (countryResult.status === "fulfilled" && countryResult.value?.country_code) {
                    const detectedCountry = String(countryResult.value.country_code).toUpperCase()
                    setCountryCode(detectedCountry)
                    setCountryFailed(false)
                } else {
                    console.warn("Country code API failed; defaulting safely to:", DEFAULT_FALLBACK_COUNTRY)
                    setCountryCode(DEFAULT_FALLBACK_COUNTRY)
                    setCountryFailed(true)
                }

                setCourses(rawCourseData)
                setStatus("success")
            } catch (err: any) {
                if (signal.aborted) return
                console.error("Unexpected fetch error:", err)
                setStatus("error")
            }
        }

        loadData()

        return () => {
            abortController.abort()
        }
    }, [fetchCount])

    // ------------------------------------------------------------------------
    // Filter & Sort Logic
    // ------------------------------------------------------------------------
    const filteredAndSortedCourses = React.useMemo(() => {
        if (!courses || courses.length === 0) return []

        const query = searchQuery.trim().toLowerCase()
        let result = courses.filter((course) => {
            if (!query) return true
            const name = (course.courseName || "").toLowerCase()
            const category = (course.mainCategory || "").toLowerCase()
            const desc = (course.description || "").toLowerCase()
            return name.includes(query) || category.includes(query) || desc.includes(query)
        })

        if (sortBy === "price-asc") {
            result = [...result].sort((a, b) => {
                const priceA = formatPrice(a, countryCode).numericValue
                const priceB = formatPrice(b, countryCode).numericValue
                return priceA - priceB
            })
        } else if (sortBy === "price-desc") {
            result = [...result].sort((a, b) => {
                const priceA = formatPrice(a, countryCode).numericValue
                const priceB = formatPrice(b, countryCode).numericValue
                return priceB - priceA
            })
        }

        return result
    }, [courses, searchQuery, sortBy, countryCode])

    // ------------------------------------------------------------------------
    // Enrollment Action Handlers
    // ------------------------------------------------------------------------
    const handleOpenEnrollment = (course: Course, formattedPrice: string) => {
        const id = course.courseCode || course.courseName
        if (enrolledMap[id]) {
            setToastMessage(`✓ You have already joined "${course.courseName}". Access details sent to your email!`)
            setTimeout(() => setToastMessage(null), 4000)
            return
        }
        setSelectedCourseForModal({ course, formattedPrice })
    }

    const handleConfirmEnrollment = () => {
        if (!selectedCourseForModal) return
        const course = selectedCourseForModal.course
        const id = course.courseCode || course.courseName

        setEnrolledMap((prev) => ({
            ...prev,
            [id]: true,
        }))

        const courseTitle = course.courseName
        setSelectedCourseForModal(null)
        setToastMessage(`🎉 Congratulations! You are now enrolled in "${courseTitle}". Welcome aboard!`)

        setTimeout(() => {
            setToastMessage(null)
        }, 5000)
    }

    return (
        <section
            className="sp-courses-section"
            style={{
                ["--sp-accent" as any]: accentColor,
                ["--sp-radius" as any]: `${cardBorderRadius}px`,
            }}
        >
            {/* Scoped CSS Styles */}
            <style>{`
                .sp-courses-section {
                    --sp-bg-card: #ffffff;
                    --sp-text-main: #0f172a;
                    --sp-text-muted: #64748b;
                    --sp-border-color: #e2e8f0;
                    --sp-card-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
                    --sp-card-shadow-hover: 0 16px 32px -4px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.06);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 48px 24px 80px 24px;
                    box-sizing: border-box;
                    color: var(--sp-text-main);
                    position: relative;
                }

                .sp-header-wrap {
                    text-align: center;
                    max-width: 720px;
                    margin: 0 auto 36px auto;
                }

                .sp-badge-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 9999px;
                    background-color: rgba(37, 99, 235, 0.08);
                    color: var(--sp-accent);
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    margin-bottom: 12px;
                }

                .sp-title {
                    font-size: 36px;
                    font-weight: 800;
                    line-height: 1.2;
                    letter-spacing: -0.03em;
                    margin: 0 0 12px 0;
                    color: var(--sp-text-main);
                }

                .sp-subtitle {
                    font-size: 17px;
                    color: var(--sp-text-muted);
                    line-height: 1.5;
                    margin: 0;
                }

                /* Controls Toolbar: Search & Sort */
                .sp-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .sp-search-box {
                    position: relative;
                    flex: 1 1 280px;
                    max-width: 400px;
                }

                .sp-search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    pointer-events: none;
                    display: flex;
                }

                .sp-search-input {
                    width: 100%;
                    padding: 12px 14px 12px 42px;
                    border: 1px solid var(--sp-border-color);
                    border-radius: calc(var(--sp-radius) * 0.75);
                    font-size: 14px;
                    background: #ffffff;
                    color: var(--sp-text-main);
                    outline: none;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                    box-sizing: border-box;
                }

                .sp-search-input:focus {
                    border-color: var(--sp-accent);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
                }

                .sp-sort-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .sp-sort-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--sp-text-muted);
                }

                .sp-sort-select {
                    padding: 10px 14px;
                    border: 1px solid var(--sp-border-color);
                    border-radius: calc(var(--sp-radius) * 0.75);
                    font-size: 14px;
                    font-weight: 500;
                    background: #ffffff;
                    color: var(--sp-text-main);
                    cursor: pointer;
                    outline: none;
                    transition: border-color 0.15s ease;
                }

                .sp-sort-select:focus {
                    border-color: var(--sp-accent);
                }

                /* Fallback Notice Banner */
                .sp-fallback-banner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 16px;
                    border-radius: calc(var(--sp-radius) * 0.6);
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 24px;
                    font-size: 13px;
                    color: #475569;
                }

                /* Responsive Grid */
                .sp-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    width: 100%;
                }

                @media (max-width: 1024px) {
                    .sp-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .sp-grid {
                        grid-template-columns: 1fr;
                        gap: 18px;
                    }
                    .sp-title {
                        font-size: 28px;
                    }
                    .sp-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .sp-search-box {
                        max-width: 100%;
                    }
                    .sp-sort-group {
                        justify-content: space-between;
                    }
                }

                /* Course Card Design */
                .sp-card {
                    background: var(--sp-bg-card);
                    border: 1px solid var(--sp-border-color);
                    border-radius: var(--sp-radius);
                    box-shadow: var(--sp-card-shadow);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                    position: relative;
                    box-sizing: border-box;
                }

                .sp-card.enrolled {
                    border-color: #10b981;
                    background: #f0fdf4;
                }

                .sp-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--sp-card-shadow-hover);
                    border-color: #cbd5e1;
                }

                .sp-card.enrolled:hover {
                    border-color: #059669;
                }

                .sp-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 14px;
                }

                .sp-category-tag {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--sp-accent);
                    background: rgba(37, 99, 235, 0.06);
                    padding: 4px 10px;
                    border-radius: 6px;
                }

                .sp-refundable-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #059669;
                    background: #ecfdf5;
                    border: 1px solid #a7f3d0;
                    padding: 3px 8px;
                    border-radius: 9999px;
                    white-space: nowrap;
                }

                .sp-course-title {
                    font-size: 20px;
                    font-weight: 700;
                    line-height: 1.35;
                    color: var(--sp-text-main);
                    margin: 0 0 10px 0;
                    letter-spacing: -0.01em;
                }

                /* CSS Line Clamping (2 Lines) */
                .sp-course-desc {
                    font-size: 14px;
                    color: var(--sp-text-muted);
                    line-height: 1.55;
                    margin: 0 0 20px 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    min-height: 44px;
                }

                .sp-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 16px;
                    border-top: 1px solid #f1f5f9;
                    margin-top: auto;
                }

                .sp-price-wrap {
                    display: flex;
                    flex-direction: column;
                }

                .sp-price-label {
                    font-size: 11px;
                    font-weight: 500;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }

                .sp-price-val {
                    font-size: 22px;
                    font-weight: 800;
                    color: var(--sp-text-main);
                    letter-spacing: -0.02em;
                }

                .sp-enroll-btn {
                    background: var(--sp-accent);
                    color: #ffffff;
                    border: none;
                    border-radius: calc(var(--sp-radius) * 0.6);
                    padding: 10px 18px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: filter 0.15s ease, transform 0.15s ease, background-color 0.2s;
                    outline: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .sp-enroll-btn:hover {
                    filter: brightness(1.1);
                    transform: scale(1.02);
                }

                .sp-enroll-btn:active {
                    transform: scale(0.98);
                }

                .sp-enroll-btn.enrolled-btn {
                    background: #10b981;
                    color: #ffffff;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
                }

                .sp-enroll-btn.enrolled-btn:hover {
                    background: #059669;
                }

                /* State Views */
                .sp-state-container {
                    background: #ffffff;
                    border: 1px solid var(--sp-border-color);
                    border-radius: var(--sp-radius);
                    padding: 48px 24px;
                    text-align: center;
                    max-width: 520px;
                    margin: 20px auto;
                    box-shadow: var(--sp-card-shadow);
                }

                .sp-state-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 16px auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .sp-state-icon.error {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .sp-state-icon.empty {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .sp-state-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                }

                .sp-state-desc {
                    font-size: 14px;
                    color: var(--sp-text-muted);
                    line-height: 1.5;
                    margin: 0 0 20px 0;
                }

                .sp-retry-btn {
                    background: var(--sp-text-main);
                    color: #ffffff;
                    border: none;
                    border-radius: calc(var(--sp-radius) * 0.6);
                    padding: 10px 22px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.15s ease;
                }

                .sp-retry-btn:hover {
                    background: #334155;
                }

                /* Toast Notification */
                .sp-toast {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    z-index: 9999;
                    background: #0f172a;
                    color: #ffffff;
                    padding: 14px 20px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    animation: sp-toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    max-width: 420px;
                    border: 1px solid #334155;
                }

                @keyframes sp-toast-in {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                /* Enrollment Modal Overlay */
                .sp-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 9998;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: sp-fade-in 0.2s ease-out;
                }

                @keyframes sp-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .sp-modal-card {
                    background: #ffffff;
                    border-radius: var(--sp-radius);
                    max-width: 480px;
                    width: 100%;
                    padding: 32px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    position: relative;
                    animation: sp-scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    box-sizing: border-box;
                }

                @keyframes sp-scale-up {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .sp-modal-close {
                    position: absolute;
                    top: 18px;
                    right: 18px;
                    background: #f1f5f9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                    transition: background 0.15s;
                }

                .sp-modal-close:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }

                .sp-modal-perks {
                    margin: 20px 0;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: calc(var(--sp-radius) * 0.6);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    font-size: 13px;
                    color: #334155;
                }

                .sp-modal-perk-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .sp-modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }

                /* Skeleton Shimmer */
                @keyframes sp-shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                .sp-skeleton-box {
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                    background-size: 200% 100%;
                    animation: sp-shimmer 1.6s infinite linear;
                    border-radius: 6px;
                }

                .sp-skeleton-card {
                    background: #ffffff;
                    border: 1px solid var(--sp-border-color);
                    border-radius: var(--sp-radius);
                    padding: 24px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
            `}</style>

            {/* Section Header */}
            <div className="sp-header-wrap">
                <span className="sp-badge-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Practical Masterclasses
                </span>
                <h2 className="sp-title">Explore Career-Defining Skills</h2>
                <p className="sp-subtitle">
                    Learn direct, battle-tested frameworks from industry operators. Built for modern creators and builders.
                </p>
            </div>

            {/* Toolbar: Search and Sort */}
            {status !== "error" && (
                <div className="sp-toolbar">
                    <div className="sp-search-box">
                        <span className="sp-search-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            className="sp-search-input"
                            placeholder="Search courses or categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search courses"
                        />
                    </div>

                    <div className="sp-sort-group">
                        <label htmlFor="sp-sort-select" className="sp-sort-label">
                            Sort by:
                        </label>
                        <select
                            id="sp-sort-select"
                            className="sp-sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            aria-label="Sort courses"
                        >
                            <option value="featured">Featured (Default)</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Fallback Notice Banner */}
            {status === "success" && countryFailed && (
                <div className="sp-fallback-banner" role="status">
                    <span>
                        <strong>Note:</strong> Standard USD pricing shown (location service temporarily unavailable).
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                        All guarantees & course access remain fully active.
                    </span>
                </div>
            )}

            {/* 1. LOADING STATE */}
            {status === "loading" && (
                <div className="sp-grid" aria-busy="true" aria-label="Loading available courses">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <div key={idx} className="sp-skeleton-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div className="sp-skeleton-box" style={{ width: "90px", height: "20px" }} />
                                <div className="sp-skeleton-box" style={{ width: "65px", height: "18px", borderRadius: "9999px" }} />
                            </div>
                            <div className="sp-skeleton-box" style={{ width: "85%", height: "24px", marginTop: "4px" }} />
                            <div className="sp-skeleton-box" style={{ width: "100%", height: "16px" }} />
                            <div className="sp-skeleton-box" style={{ width: "70%", height: "16px" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                                <div className="sp-skeleton-box" style={{ width: "70px", height: "28px" }} />
                                <div className="sp-skeleton-box" style={{ width: "84px", height: "36px", borderRadius: "8px" }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. ERROR STATE */}
            {status === "error" && (
                <div className="sp-state-container" role="alert">
                    <div className="sp-state-icon error">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h3 className="sp-state-title">Unable to Load Courses</h3>
                    <p className="sp-state-desc">
                        We encountered a temporary connection issue while retrieving the latest course schedule. Please try refreshing.
                    </p>
                    <button className="sp-retry-btn" onClick={handleRetry}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Retry Connection
                    </button>
                </div>
            )}

            {/* 3. EMPTY STATE */}
            {status === "empty" || (status === "success" && filteredAndSortedCourses.length === 0) ? (
                <div className="sp-state-container" role="status">
                    <div className="sp-state-icon empty">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <h3 className="sp-state-title">
                        {status === "empty" ? "No Courses Available" : "No Matching Courses Found"}
                    </h3>
                    <p className="sp-state-desc">
                        {status === "empty"
                            ? "There are currently no active cohorts scheduled. Check back shortly for upcoming releases."
                            : `No results matching "${searchQuery}". Try searching for another keyword or clear your filter.`}
                    </p>
                    {searchQuery && (
                        <button
                            className="sp-retry-btn"
                            onClick={() => setSearchQuery("")}
                            style={{ background: "#475569" }}
                        >
                            Clear Search Filter
                        </button>
                    )}
                </div>
            ) : null}

            {/* 4. SUCCESS STATE */}
            {status === "success" && filteredAndSortedCourses.length > 0 && (
                <div className="sp-grid">
                    {filteredAndSortedCourses.map((course) => {
                        const priceInfo = formatPrice(course, countryCode)
                        const key = course.mangoId || course.courseCode || course.courseName
                        const isEnrolled = !!enrolledMap[course.courseCode || course.courseName]

                        return (
                            <article key={key} className={`sp-card ${isEnrolled ? "enrolled" : ""}`}>
                                <div>
                                    <div className="sp-card-top">
                                        <span className="sp-category-tag">
                                            {course.mainCategory || "Course"}
                                        </span>

                                        {isEnrolled ? (
                                            <span className="sp-refundable-badge" style={{ background: "#dcfce7", color: "#15803d", borderColor: "#86efac" }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                Active Learner
                                            </span>
                                        ) : course.refundable ? (
                                            <span className="sp-refundable-badge" title="100% Refundable within 14 days">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                Refundable
                                            </span>
                                        ) : null}
                                    </div>

                                    <h3 className="sp-course-title">
                                        {course.courseName || "Untitled Course"}
                                    </h3>

                                    <p className="sp-course-desc" title={course.description}>
                                        {course.description || "Comprehensive hands-on training and actionable frameworks."}
                                    </p>
                                </div>

                                <div className="sp-card-footer">
                                    <div className="sp-price-wrap">
                                        <span className="sp-price-label">
                                            {isEnrolled ? "Status" : "Tuition"}
                                        </span>
                                        <span className="sp-price-val" style={{ fontSize: isEnrolled ? "18px" : "22px", color: isEnrolled ? "#10b981" : "inherit" }}>
                                            {isEnrolled ? "Enrolled" : priceInfo.formatted}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className={`sp-enroll-btn ${isEnrolled ? "enrolled-btn" : ""}`}
                                        onClick={() => handleOpenEnrollment(course, priceInfo.formatted)}
                                        aria-label={isEnrolled ? `You are enrolled in ${course.courseName}` : `Enroll in ${course.courseName} for ${priceInfo.formatted}`}
                                    >
                                        {isEnrolled ? (
                                            <>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                Enrolled ✓
                                            </>
                                        ) : (
                                            "Enroll Now"
                                        )}
                                    </button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}

            {/* Interactive Enrollment Modal */}
            {selectedCourseForModal && (
                <div className="sp-modal-backdrop" onClick={() => setSelectedCourseForModal(null)}>
                    <div className="sp-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                        <button
                            className="sp-modal-close"
                            onClick={() => setSelectedCourseForModal(null)}
                            aria-label="Close modal"
                        >
                            ✕
                        </button>

                        <span className="sp-badge-pill" style={{ marginBottom: "8px" }}>
                            {selectedCourseForModal.course.mainCategory || "Masterclass"}
                        </span>

                        <h3 style={{ fontSize: "24px", fontWeight: 800, margin: "6px 0 10px 0", color: "#0f172a" }}>
                            {selectedCourseForModal.course.courseName}
                        </h3>

                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                            {selectedCourseForModal.course.description}
                        </p>

                        <div className="sp-modal-perks">
                            <div className="sp-modal-perk-item">
                                <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span>
                                <span>Lifetime access to cohort recordings & blueprints</span>
                            </div>
                            <div className="sp-modal-perk-item">
                                <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span>
                                <span>Direct async instructor Q&A and project reviews</span>
                            </div>
                            {selectedCourseForModal.course.refundable && (
                                <div className="sp-modal-perk-item">
                                    <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span>
                                    <span><strong>100% money-back guarantee</strong> within 14 days</span>
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>Total Tuition:</span>
                            <span style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                                {selectedCourseForModal.formattedPrice}
                            </span>
                        </div>

                        <div className="sp-modal-actions">
                            <button
                                type="button"
                                className="sp-enroll-btn"
                                style={{ flex: 1, justifyContent: "center", padding: "14px 20px", fontSize: "15px" }}
                                onClick={handleConfirmEnrollment}
                            >
                                Confirm & Complete Enrollment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Instant Toast Notification */}
            {toastMessage && (
                <div className="sp-toast" role="status">
                    <span>{toastMessage}</span>
                </div>
            )}
        </section>
    )
}

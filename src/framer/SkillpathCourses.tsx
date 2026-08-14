import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

export interface Course {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    shortCourse?: string
    courseType?: string
    pricePaise: number
    priceUsdCents: number
    mangoId?: string
    refundable: boolean
}

type Status = "loading" | "error" | "empty" | "success"
type SortOption = "featured" | "price-asc" | "price-desc"

interface SkillpathCoursesProps {
    accentColor?: string
    cardBorderRadius?: number
}

const API_COURSES_URL = "https://syncsphere-hiv6.onrender.com/assignment/course-data"
const API_COUNTRY_URL = "https://syncsphere-hiv6.onrender.com/assignment/country-code"
const DEFAULT_FALLBACK_COUNTRY = "US"

function formatPrice(
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
        return { formatted: formatter.format(rupees), numericValue: rupees }
    }

    const cents = typeof course.priceUsdCents === "number" ? course.priceUsdCents : 0
    const dollars = cents / 100
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    return { formatted: formatter.format(dollars), numericValue: dollars }
}

const STYLES_CSS = `
.sp-courses-section {
    --sp-bg-card: #ffffff;
    --sp-text-main: #0f172a;
    --sp-text-muted: #64748b;
    --sp-border-color: #e2e8f0;
    --sp-card-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
    --sp-card-shadow-hover: 0 16px 32px -4px rgba(15, 23, 42, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 16px 64px 16px;
    box-sizing: border-box;
    color: #0f172a;
    position: relative;
}
.sp-header-wrap { text-align: center; max-width: 720px; margin: 0 auto 32px auto; }
.sp-badge-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; background-color: rgba(37, 99, 235, 0.08); font-size: 13px; font-weight: 600; margin-bottom: 12px; }
.sp-title { font-size: 32px; font-weight: 800; line-height: 1.2; letter-spacing: -0.03em; margin: 0 0 12px 0; color: #0f172a; }
.sp-subtitle { font-size: 16px; color: #64748b; line-height: 1.5; margin: 0; }
.sp-toolbar { display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center; margin-bottom: 28px; }
.sp-search-box { position: relative; flex: 1 1 240px; max-width: 380px; }
.sp-search-input { width: 100%; padding: 10px 14px 10px 36px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #ffffff; outline: none; box-sizing: border-box; }
.sp-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; pointer-events: none; }
.sp-sort-group { display: flex; align-items: center; gap: 8px; }
.sp-sort-label { font-size: 13px; font-weight: 500; color: #64748b; }
.sp-sort-select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 500; background: #ffffff; cursor: pointer; outline: none; }
.sp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%; }
@media (max-width: 900px) { .sp-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .sp-grid { grid-template-columns: 1fr; } .sp-title { font-size: 26px; } .sp-toolbar { flex-direction: column; align-items: stretch; } }
.sp-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: var(--sp-radius, 16px); box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05); padding: 22px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s ease, box-shadow 0.2s ease; box-sizing: border-box; }
.sp-card.enrolled { border-color: #10b981; background: #f0fdf4; }
.sp-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08); }
.sp-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
.sp-category-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 6px; }
.sp-refundable-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 9999px; }
.sp-course-title { font-size: 18px; font-weight: 700; line-height: 1.35; color: #0f172a; margin: 0 0 8px 0; }
.sp-course-desc { font-size: 13.5px; color: #64748b; line-height: 1.5; margin: 0 0 16px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px; }
.sp-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid #f1f5f9; margin-top: auto; }
.sp-price-wrap { display: flex; flex-direction: column; }
.sp-price-label { font-size: 11px; font-weight: 500; color: #94a3b8; text-transform: uppercase; }
.sp-price-val { font-size: 20px; font-weight: 800; color: #0f172a; }
.sp-enroll-btn { background: var(--sp-accent, #2563eb); color: #ffffff; border: none; border-radius: 8px; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: filter 0.15s ease; outline: none; }
.sp-enroll-btn.enrolled-btn { background: #10b981; color: #ffffff; }
.sp-state-container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px 20px; text-align: center; max-width: 480px; margin: 20px auto; }
.sp-retry-btn { background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
.sp-modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
.sp-modal-card { background: #ffffff; border-radius: 16px; max-width: 460px; width: 100%; padding: 28px; position: relative; }
.sp-modal-close { position: absolute; top: 16px; right: 16px; background: #f1f5f9; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; color: #64748b; }
.sp-modal-perks { margin: 16px 0; padding: 14px; background: #f8fafc; border-radius: 10px; display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #334155; }
.sp-toast { position: fixed; bottom: 24px; right: 24px; z-index: 10000; background: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; }
`

export default function SkillpathCourses({
    accentColor = "#2563EB",
    cardBorderRadius = 16,
}: SkillpathCoursesProps) {
    const [courses, setCourses] = React.useState<Course[]>([])
    const [countryCode, setCountryCode] = React.useState<string>(DEFAULT_FALLBACK_COUNTRY)
    const [status, setStatus] = React.useState<Status>("loading")
    const [countryFailed, setCountryFailed] = React.useState<boolean>(false)

    const [searchQuery, setSearchQuery] = React.useState<string>("")
    const [sortBy, setSortBy] = React.useState<SortOption>("featured")
    const [fetchCount, setFetchCount] = React.useState<number>(0)

    const [enrolledMap, setEnrolledMap] = React.useState<Record<string, boolean>>({})
    const [selectedCourseForModal, setSelectedCourseForModal] = React.useState<{
        course: Course
        formattedPrice: string
    } | null>(null)
    const [toastMessage, setToastMessage] = React.useState<string | null>(null)

    // Inject styles cleanly into document head for Framer SSR safety
    React.useEffect(() => {
        if (typeof document !== "undefined") {
            const styleId = "sp-injected-styles"
            if (!document.getElementById(styleId)) {
                const styleTag = document.createElement("style")
                styleTag.id = styleId
                styleTag.textContent = STYLES_CSS
                document.head.appendChild(styleTag)
            }
        }
    }, [])

    const handleRetry = React.useCallback(() => {
        setStatus("loading")
        setFetchCount((prev) => prev + 1)
    }, [])

    React.useEffect(() => {
        let isMounted = true

        async function fetchWithRetry(url: string) {
            try {
                const res = await fetch(url)
                if (res.ok) return await res.json()
                throw new Error(`HTTP ${res.status}`)
            } catch (firstErr) {
                await new Promise((r) => setTimeout(r, 600))
                const retryRes = await fetch(url)
                if (retryRes.ok) return await retryRes.json()
                throw new Error(`HTTP ${retryRes.status}`)
            }
        }

        async function loadData() {
            setStatus("loading")
            try {
                const [coursesResult, countryResult] = await Promise.allSettled([
                    fetchWithRetry(API_COURSES_URL),
                    fetchWithRetry(API_COUNTRY_URL),
                ])

                if (!isMounted) return

                if (coursesResult.status === "rejected") {
                    console.error("Course fetch failed:", coursesResult.reason)
                    setStatus("error")
                    return
                }

                const rawData = coursesResult.value
                if (!Array.isArray(rawData) || rawData.length === 0) {
                    setCourses([])
                    setStatus("empty")
                    return
                }

                if (countryResult.status === "fulfilled" && countryResult.value?.country_code) {
                    setCountryCode(String(countryResult.value.country_code).toUpperCase())
                    setCountryFailed(false)
                } else {
                    setCountryCode(DEFAULT_FALLBACK_COUNTRY)
                    setCountryFailed(true)
                }

                setCourses(rawData)
                setStatus("success")
            } catch (err) {
                if (!isMounted) return
                setStatus("error")
            }
        }

        loadData()
        return () => {
            isMounted = false
        }
    }, [fetchCount])

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
            result = [...result].sort((a, b) => formatPrice(a, countryCode).numericValue - formatPrice(b, countryCode).numericValue)
        } else if (sortBy === "price-desc") {
            result = [...result].sort((a, b) => formatPrice(b, countryCode).numericValue - formatPrice(a, countryCode).numericValue)
        }
        return result
    }, [courses, searchQuery, sortBy, countryCode])

    const handleOpenEnrollment = (course: Course, formattedPrice: string) => {
        const id = course.courseCode || course.courseName
        if (enrolledMap[id]) {
            setToastMessage(`✓ You are already enrolled in "${course.courseName}".`)
            setTimeout(() => setToastMessage(null), 3000)
            return
        }
        setSelectedCourseForModal({ course, formattedPrice })
    }

    const handleConfirmEnrollment = () => {
        if (!selectedCourseForModal) return
        const course = selectedCourseForModal.course
        const id = course.courseCode || course.courseName
        setEnrolledMap((prev) => ({ ...prev, [id]: true }))
        const title = course.courseName
        setSelectedCourseForModal(null)
        setToastMessage(`🎉 Congratulations! You are enrolled in "${title}".`)
        setTimeout(() => setToastMessage(null), 4000)
    }

    return (
        <section
            className="sp-courses-section"
            style={{
                // @ts-ignore
                "--sp-accent": accentColor,
                // @ts-ignore
                "--sp-radius": `${cardBorderRadius}px`,
            }}
        >
            <div className="sp-header-wrap">
                <span className="sp-badge-pill" style={{ color: accentColor }}>
                    Practical Masterclasses
                </span>
                <h2 className="sp-title">Explore Career-Defining Skills</h2>
                <p className="sp-subtitle">Learn direct, battle-tested frameworks from industry operators.</p>
            </div>

            {status !== "error" && (
                <div className="sp-toolbar">
                    <div className="sp-search-box">
                        <span className="sp-search-icon">🔍</span>
                        <input
                            type="text"
                            className="sp-search-input"
                            placeholder="Search courses or categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="sp-sort-group">
                        <label className="sp-sort-label">Sort by:</label>
                        <select
                            className="sp-sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                        >
                            <option value="featured">Featured (Default)</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            )}

            {status === "loading" && (
                <div className="sp-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="sp-card" style={{ minHeight: "220px", background: "#f8fafc" }}>
                            <div style={{ height: "18px", width: "40%", background: "#e2e8f0", borderRadius: "4px", marginBottom: "12px" }} />
                            <div style={{ height: "24px", width: "80%", background: "#e2e8f0", borderRadius: "4px", marginBottom: "8px" }} />
                            <div style={{ height: "14px", width: "100%", background: "#e2e8f0", borderRadius: "4px", marginBottom: "16px" }} />
                            <div style={{ height: "36px", width: "100%", background: "#e2e8f0", borderRadius: "8px", marginTop: "auto" }} />
                        </div>
                    ))}
                </div>
            )}

            {status === "error" && (
                <div className="sp-state-container">
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" }}>Unable to Load Courses</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 16px 0" }}>A temporary connection issue occurred with the mock API.</p>
                    <button className="sp-retry-btn" onClick={handleRetry}>Retry Connection</button>
                </div>
            )}

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
                                        <span className="sp-category-tag" style={{ color: accentColor, background: `${accentColor}14` }}>
                                            {course.mainCategory || "Course"}
                                        </span>
                                        {isEnrolled ? (
                                            <span className="sp-refundable-badge" style={{ background: "#dcfce7", color: "#15803d" }}>Active Learner</span>
                                        ) : course.refundable ? (
                                            <span className="sp-refundable-badge">Refundable</span>
                                        ) : null}
                                    </div>
                                    <h3 className="sp-course-title">{course.courseName}</h3>
                                    <p className="sp-course-desc">{course.description}</p>
                                </div>
                                <div className="sp-card-footer">
                                    <div className="sp-price-wrap">
                                        <span className="sp-price-label">{isEnrolled ? "Status" : "Tuition"}</span>
                                        <span className="sp-price-val" style={{ color: isEnrolled ? "#10b981" : "#0f172a" }}>
                                            {isEnrolled ? "Enrolled" : priceInfo.formatted}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className={`sp-enroll-btn ${isEnrolled ? "enrolled-btn" : ""}`}
                                        style={{ backgroundColor: isEnrolled ? "#10b981" : accentColor }}
                                        onClick={() => handleOpenEnrollment(course, priceInfo.formatted)}
                                    >
                                        {isEnrolled ? "Enrolled ✓" : "Enroll Now"}
                                    </button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}

            {selectedCourseForModal && (
                <div className="sp-modal-backdrop" onClick={() => setSelectedCourseForModal(null)}>
                    <div className="sp-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="sp-modal-close" onClick={() => setSelectedCourseForModal(null)}>✕</button>
                        <span className="sp-badge-pill" style={{ color: accentColor, marginBottom: "8px" }}>
                            {selectedCourseForModal.course.mainCategory}
                        </span>
                        <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "6px 0 8px 0" }}>{selectedCourseForModal.course.courseName}</h3>
                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.5, margin: "0 0 16px 0" }}>{selectedCourseForModal.course.description}</p>
                        <div className="sp-modal-perks">
                            <div>✓ Lifetime access to cohort blueprints & recordings</div>
                            <div>✓ Direct async instructor feedback</div>
                            {selectedCourseForModal.course.refundable && (
                                <div>✓ <strong>100% money-back guarantee</strong> within 14 days</div>
                            )}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #e2e8f0" }}>
                            <span style={{ color: "#64748b", fontSize: "14px" }}>Total Tuition:</span>
                            <span style={{ fontSize: "22px", fontWeight: 800 }}>{selectedCourseForModal.formattedPrice}</span>
                        </div>
                        <button
                            type="button"
                            className="sp-enroll-btn"
                            style={{ width: "100%", marginTop: "14px", padding: "12px", fontSize: "14px", backgroundColor: accentColor }}
                            onClick={handleConfirmEnrollment}
                        >
                            Confirm & Complete Enrollment
                        </button>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="sp-toast">
                    <span>{toastMessage}</span>
                </div>
            )}
        </section>
    )
}

addPropertyControls(SkillpathCourses, {
    accentColor: {
        type: ControlType.Color,
        title: "Accent Color",
        defaultValue: "#2563EB",
    },
    cardBorderRadius: {
        type: ControlType.Number,
        title: "Border Radius",
        defaultValue: 16,
        min: 4,
        max: 32,
        step: 2,
        unit: "px",
        displayStepper: true,
    },
})

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

export interface Course {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    pricePaise: number
    priceUsdCents: number
    refundable: boolean
}

interface SkillpathCoursesProps {
    accentColor?: string
    cardBorderRadius?: number
}

const API_COURSES_URL = "https://syncsphere-hiv6.onrender.com/assignment/course-data"
const API_COUNTRY_URL = "https://syncsphere-hiv6.onrender.com/assignment/country-code"

function formatPrice(course: Course, countryCode: string) {
    const isIndia = countryCode && countryCode.toUpperCase() === "IN"
    if (isIndia) {
        const rupees = (typeof course.pricePaise === "number" ? course.pricePaise : 0) / 100
        const formatter = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        })
        return { formatted: formatter.format(rupees), numericValue: rupees }
    }
    const dollars = (typeof course.priceUsdCents === "number" ? course.priceUsdCents : 0) / 100
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    return { formatted: formatter.format(dollars), numericValue: dollars }
}

export default function SkillpathCourses({
    accentColor = "#2563EB",
    cardBorderRadius = 16,
}: SkillpathCoursesProps) {
    const [courses, setCourses] = React.useState<Course[]>([])
    const [countryCode, setCountryCode] = React.useState<string>("US")
    const [status, setStatus] = React.useState<"loading" | "error" | "empty" | "success">("loading")
    const [searchQuery, setSearchQuery] = React.useState<string>("")
    const [sortBy, setSortBy] = React.useState<string>("featured")
    const [fetchCount, setFetchCount] = React.useState<number>(0)
    const [enrolledMap, setEnrolledMap] = React.useState<Record<string, boolean>>({})
    const [selectedCourse, setSelectedCourse] = React.useState<{ course: Course; formattedPrice: string } | null>(null)
    const [toastMessage, setToastMessage] = React.useState<string | null>(null)

    React.useEffect(() => {
        let isSubscribed = true

        async function fetchWithRetry(url: string) {
            try {
                const res = await fetch(url)
                if (res.ok) return await res.json()
                throw new Error(`HTTP ${res.status}`)
            } catch (err) {
                await new Promise((r) => setTimeout(r, 600))
                const retryRes = await fetch(url)
                if (retryRes.ok) return await retryRes.json()
                throw new Error(`HTTP ${retryRes.status}`)
            }
        }

        async function loadData() {
            setStatus("loading")
            try {
                const [coursesRes, countryRes] = await Promise.allSettled([
                    fetchWithRetry(API_COURSES_URL),
                    fetchWithRetry(API_COUNTRY_URL),
                ])

                if (!isSubscribed) return

                if (coursesRes.status === "rejected") {
                    setStatus("error")
                    return
                }

                const data = coursesRes.value
                if (!Array.isArray(data) || data.length === 0) {
                    setCourses([])
                    setStatus("empty")
                    return
                }

                if (countryRes.status === "fulfilled" && countryRes.value?.country_code) {
                    setCountryCode(String(countryRes.value.country_code).toUpperCase())
                } else {
                    setCountryCode("US")
                }

                setCourses(data)
                setStatus("success")
            } catch (e) {
                if (!isSubscribed) return
                setStatus("error")
            }
        }

        loadData()
        return () => {
            isSubscribed = false
        }
    }, [fetchCount])

    const filteredCourses = React.useMemo(() => {
        if (!courses || courses.length === 0) return []
        const q = searchQuery.trim().toLowerCase()
        let list = courses.filter((c) => {
            if (!q) return true
            return (
                (c.courseName || "").toLowerCase().includes(q) ||
                (c.mainCategory || "").toLowerCase().includes(q) ||
                (c.description || "").toLowerCase().includes(q)
            )
        })

        if (sortBy === "price-asc") {
            list = [...list].sort((a, b) => formatPrice(a, countryCode).numericValue - formatPrice(b, countryCode).numericValue)
        } else if (sortBy === "price-desc") {
            list = [...list].sort((a, b) => formatPrice(b, countryCode).numericValue - formatPrice(a, countryCode).numericValue)
        }
        return list
    }, [courses, searchQuery, sortBy, countryCode])

    const handleEnroll = (course: Course, formattedPrice: string) => {
        const id = course.courseCode || course.courseName
        if (enrolledMap[id]) {
            setToastMessage(`✓ You are already enrolled in "${course.courseName}".`)
            setTimeout(() => setToastMessage(null), 3000)
            return
        }
        setSelectedCourse({ course, formattedPrice })
    }

    const confirmEnroll = () => {
        if (!selectedCourse) return
        const id = selectedCourse.course.courseCode || selectedCourse.course.courseName
        setEnrolledMap((prev) => ({ ...prev, [id]: true }))
        const title = selectedCourse.course.courseName
        setSelectedCourse(null)
        setToastMessage(`🎉 Successfully enrolled in "${title}"!`)
        setTimeout(() => setToastMessage(null), 4000)
    }

    return (
        <div
            style={{
                width: "100%",
                minHeight: "800px",
                padding: "40px 24px 80px 24px",
                maxWidth: "1200px",
                margin: "0 auto",
                boxSizing: "border-box",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                color: "#0f172a",
                position: "relative",
            }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 36px auto" }}>
                <span
                    style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        borderRadius: "9999px",
                        backgroundColor: `${accentColor}18`,
                        color: accentColor,
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "12px",
                    }}
                >
                    ★ Practical Masterclasses
                </span>
                <h2 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 12px 0", letterSpacing: "-0.03em", color: "#0f172a" }}>
                    Explore Career-Defining Skills
                </h2>
                <p style={{ fontSize: "16px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                    Learn direct, battle-tested frameworks from industry operators.
                </p>
            </div>

            {/* Toolbar */}
            {status !== "error" && (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "32px",
                    }}
                >
                    <div style={{ flex: "1 1 280px", maxWidth: "420px" }}>
                        <input
                            type="text"
                            placeholder="🔍 Search courses or categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "10px",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Sort by:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: "10px 14px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "10px",
                                fontSize: "14px",
                                fontWeight: 500,
                                background: "#ffffff",
                                cursor: "pointer",
                            }}
                        >
                            <option value="featured">Featured (Default)</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Loading Skeleton */}
            {status === "loading" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: cardBorderRadius,
                                padding: "24px",
                                minHeight: "220px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}
                        >
                            <div style={{ height: "20px", width: "40%", background: "#e2e8f0", borderRadius: "4px" }} />
                            <div style={{ height: "24px", width: "80%", background: "#e2e8f0", borderRadius: "4px" }} />
                            <div style={{ height: "14px", width: "100%", background: "#e2e8f0", borderRadius: "4px" }} />
                            <div style={{ height: "40px", width: "100%", background: "#e2e8f0", borderRadius: "8px", marginTop: "auto" }} />
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {status === "error" && (
                <div
                    style={{
                        background: "#ffffff",
                        border: "1px solid #fee2e2",
                        borderRadius: cardBorderRadius,
                        padding: "48px 24px",
                        textAlign: "center",
                        maxWidth: "480px",
                        margin: "40px auto",
                    }}
                >
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0" }}>Unable to Load Courses</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px 0" }}>
                        Encountered a connection issue with the mock API.
                    </p>
                    <button
                        onClick={() => setFetchCount((p) => p + 1)}
                        style={{
                            background: "#0f172a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px 24px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {/* Success Grid */}
            {status === "success" && filteredCourses.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "24px",
                        width: "100%",
                    }}
                >
                    {filteredCourses.map((course) => {
                        const price = formatPrice(course, countryCode)
                        const key = course.courseCode || course.courseName
                        const isEnrolled = !!enrolledMap[key]

                        return (
                            <article
                                key={key}
                                style={{
                                    background: isEnrolled ? "#f0fdf4" : "#ffffff",
                                    border: isEnrolled ? "1px solid #10b981" : "1px solid #e2e8f0",
                                    borderRadius: `${cardBorderRadius}px`,
                                    padding: "24px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    minHeight: "260px",
                                    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
                                    boxSizing: "border-box",
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                color: accentColor,
                                                background: `${accentColor}15`,
                                                padding: "4px 10px",
                                                borderRadius: "6px",
                                            }}
                                        >
                                            {course.mainCategory || "Course"}
                                        </span>
                                        {isEnrolled ? (
                                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "4px 8px", borderRadius: "9999px" }}>
                                                Active Learner ✓
                                            </span>
                                        ) : course.refundable ? (
                                            <span style={{ fontSize: "11px", fontWeight: 600, color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "3px 8px", borderRadius: "9999px" }}>
                                                Refundable
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3 style={{ fontSize: "19px", fontWeight: 700, margin: "0 0 10px 0", color: "#0f172a", lineHeight: 1.35 }}>
                                        {course.courseName}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: "14px",
                                            color: "#64748b",
                                            lineHeight: 1.55,
                                            margin: "0 0 20px 0",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {course.description}
                                    </p>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                                    <div>
                                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
                                            {isEnrolled ? "Status" : "Tuition"}
                                        </div>
                                        <div style={{ fontSize: "22px", fontWeight: 800, color: isEnrolled ? "#10b981" : "#0f172a" }}>
                                            {isEnrolled ? "Enrolled" : price.formatted}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleEnroll(course, price.formatted)}
                                        style={{
                                            backgroundColor: isEnrolled ? "#10b981" : accentColor,
                                            color: "#ffffff",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "10px 18px",
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {isEnrolled ? "Enrolled ✓" : "Enroll Now"}
                                    </button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}

            {/* Modal */}
            {selectedCourse && (
                <div
                    onClick={() => setSelectedCourse(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.65)",
                        backdropFilter: "blur(4px)",
                        zIndex: 99999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#ffffff",
                            borderRadius: `${cardBorderRadius}px`,
                            maxWidth: "460px",
                            width: "100%",
                            padding: "32px",
                            boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                            position: "relative",
                        }}
                    >
                        <button
                            onClick={() => setSelectedCourse(null)}
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                background: "#f1f5f9",
                                border: "none",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                cursor: "pointer",
                                fontSize: "14px",
                                color: "#64748b",
                            }}
                        >
                            ✕
                        </button>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: accentColor, background: `${accentColor}15`, padding: "4px 8px", borderRadius: "6px" }}>
                            {selectedCourse.course.mainCategory}
                        </span>
                        <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "10px 0 8px 0", color: "#0f172a" }}>
                            {selectedCourse.course.courseName}
                        </h3>
                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.5, margin: "0 0 16px 0" }}>
                            {selectedCourse.course.description}
                        </p>
                        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", margin: "16px 0", fontSize: "13px", color: "#334155", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div>✓ Full lifetime access & cohort recordings</div>
                            <div>✓ Async reviews and project feedback</div>
                            {selectedCourse.course.refundable && (
                                <div>✓ <strong>100% money-back guarantee</strong> within 14 days</div>
                            )}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #e2e8f0" }}>
                            <span style={{ color: "#64748b", fontSize: "14px" }}>Tuition:</span>
                            <span style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{selectedCourse.formattedPrice}</span>
                        </div>
                        <button
                            type="button"
                            onClick={confirmEnroll}
                            style={{
                                width: "100%",
                                backgroundColor: accentColor,
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "10px",
                                padding: "14px",
                                fontSize: "15px",
                                fontWeight: 700,
                                cursor: "pointer",
                                marginTop: "16px",
                            }}
                        >
                            Confirm & Complete Enrollment
                        </button>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toastMessage && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "24px",
                        right: "24px",
                        zIndex: 100000,
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        padding: "14px 20px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    }}
                >
                    {toastMessage}
                </div>
            )}
        </div>
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

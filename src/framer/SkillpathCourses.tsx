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
    const [countryCode, setCountryCode] = React.useState<string>("IN")
    const [status, setStatus] = React.useState<"loading" | "error" | "empty" | "success">("loading")
    const [searchQuery, setSearchQuery] = React.useState<string>("")
    const [sortBy, setSortBy] = React.useState<string>("featured")
    const [fetchCount, setFetchCount] = React.useState<number>(0)
    const [enrolledMap, setEnrolledMap] = React.useState<Record<string, boolean>>({})
    const [selectedCourse, setSelectedCourse] = React.useState<{ course: Course; formattedPrice: string } | null>(null)
    const [toastMessage, setToastMessage] = React.useState<string | null>(null)

    React.useEffect(() => {
        let isMounted = true

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

                if (!isMounted) return

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
                    setCountryCode("IN")
                }

                setCourses(data)
                setStatus("success")
            } catch (e) {
                if (!isMounted) return
                setStatus("error")
            }
        }

        loadData()
        return () => {
            isMounted = false
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
        setToastMessage(`🎉 Enrolled in "${title}"!`)
        setTimeout(() => setToastMessage(null), 4000)
    }

    return (
        <div
            style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "24px 16px 48px 16px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                color: "#0f172a",
                backgroundColor: "#ffffff",
            }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div
                    style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        backgroundColor: `${accentColor}15`,
                        color: accentColor,
                        fontSize: "12px",
                        fontWeight: 700,
                        marginBottom: "8px",
                    }}
                >
                    ★ Practical Masterclasses
                </div>
                <h2 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                    Explore Career-Defining Skills
                </h2>
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                    Learn direct, battle-tested frameworks from industry operators.
                </p>
            </div>

            {/* Controls */}
            {status !== "error" && (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="🔍 Search courses or categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: "1 1 200px",
                            padding: "10px 14px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "13px",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                fontSize: "13px",
                                background: "#ffffff",
                                cursor: "pointer",
                            }}
                        >
                            <option value="featured">Featured</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Loading */}
            {status === "loading" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: `${cardBorderRadius}px`,
                                padding: "20px",
                                minHeight: "180px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                            }}
                        >
                            <div style={{ height: "16px", width: "35%", background: "#e2e8f0", borderRadius: "4px" }} />
                            <div style={{ height: "20px", width: "75%", background: "#e2e8f0", borderRadius: "4px" }} />
                            <div style={{ height: "12px", width: "95%", background: "#e2e8f0", borderRadius: "4px" }} />
                            <div style={{ height: "32px", width: "100%", background: "#e2e8f0", borderRadius: "6px", marginTop: "auto" }} />
                        </div>
                    ))}
                </div>
            )}

            {/* Error */}
            {status === "error" && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: `${cardBorderRadius}px`, padding: "32px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚠️</div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#991b1b" }}>Unable to Load Courses</h3>
                    <p style={{ fontSize: "13px", color: "#7f1d1d", margin: "0 0 16px 0" }}>Temporary API issue. Click retry below.</p>
                    <button
                        onClick={() => setFetchCount((p) => p + 1)}
                        style={{ background: "#0f172a", color: "#ffffff", border: "none", borderRadius: "6px", padding: "10px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {/* Courses Grid */}
            {status === "success" && filteredCourses.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: "16px",
                        width: "100%",
                        boxSizing: "border-box",
                    }}
                >
                    {filteredCourses.map((course) => {
                        const price = formatPrice(course, countryCode)
                        const key = course.courseCode || course.courseName
                        const isEnrolled = !!enrolledMap[key]

                        return (
                            <div
                                key={key}
                                style={{
                                    background: isEnrolled ? "#f0fdf4" : "#ffffff",
                                    border: isEnrolled ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                                    borderRadius: `${cardBorderRadius}px`,
                                    padding: "18px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    minHeight: "220px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                    boxSizing: "border-box",
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.04em",
                                                color: accentColor,
                                                background: `${accentColor}12`,
                                                padding: "3px 8px",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            {course.mainCategory || "Course"}
                                        </span>
                                        {isEnrolled ? (
                                            <span style={{ fontSize: "10px", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 6px", borderRadius: "9999px" }}>
                                                Enrolled ✓
                                            </span>
                                        ) : course.refundable ? (
                                            <span style={{ fontSize: "10px", fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "2px 6px", borderRadius: "9999px" }}>
                                                Refundable
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a", lineHeight: 1.3 }}>
                                        {course.courseName}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: "12.5px",
                                            color: "#64748b",
                                            lineHeight: 1.45,
                                            margin: "0 0 14px 0",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {course.description}
                                    </p>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                                    <div>
                                        <div style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
                                            Tuition
                                        </div>
                                        <div style={{ fontSize: "18px", fontWeight: 800, color: isEnrolled ? "#10b981" : "#0f172a" }}>
                                            {price.formatted}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleEnroll(course, price.formatted)}
                                        style={{
                                            backgroundColor: isEnrolled ? "#10b981" : accentColor,
                                            color: "#ffffff",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "8px 14px",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {isEnrolled ? "Enrolled ✓" : "Enroll Now"}
                                    </button>
                                </div>
                            </div>
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
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        zIndex: 99999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#ffffff",
                            borderRadius: `${cardBorderRadius}px`,
                            maxWidth: "420px",
                            width: "100%",
                            padding: "24px",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                            position: "relative",
                            boxSizing: "border-box",
                        }}
                    >
                        <button
                            onClick={() => setSelectedCourse(null)}
                            style={{ position: "absolute", top: "14px", right: "14px", background: "#f1f5f9", border: "none", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "12px" }}
                        >
                            ✕
                        </button>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: accentColor, background: `${accentColor}15`, padding: "3px 6px", borderRadius: "4px" }}>
                            {selectedCourse.course.mainCategory}
                        </span>
                        <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "8px 0 6px 0" }}>
                            {selectedCourse.course.courseName}
                        </h3>
                        <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.4, margin: "0 0 12px 0" }}>
                            {selectedCourse.course.description}
                        </p>
                        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", margin: "12px 0", fontSize: "12px", color: "#334155", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div>✓ Full lifetime access to all lessons</div>
                            <div>✓ Async project reviews & support</div>
                            {selectedCourse.course.refundable && (
                                <div>✓ <strong>100% money-back guarantee</strong> (14 days)</div>
                            )}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid #e2e8f0" }}>
                            <span style={{ color: "#64748b", fontSize: "13px" }}>Total:</span>
                            <span style={{ fontSize: "20px", fontWeight: 800 }}>{selectedCourse.formattedPrice}</span>
                        </div>
                        <button
                            type="button"
                            onClick={confirmEnroll}
                            style={{ width: "100%", backgroundColor: accentColor, color: "#ffffff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "12px" }}
                        >
                            Confirm Enrollment
                        </button>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toastMessage && (
                <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 100000, backgroundColor: "#0f172a", color: "#ffffff", padding: "12px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>
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

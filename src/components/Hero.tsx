export default function Hero() {
    return (
        <section style={{
            maxWidth: "960px",
            margin: "40px auto 20px auto",
            padding: "0 24px",
            textAlign: "center"
        }}>
            <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "9999px",
                marginBottom: "24px"
            }}>
                <span style={{ color: "#2563eb" }}>●</span> Cohort 2026 Enrollments Open
            </div>
            
            <h1 style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.04em",
                color: "#0f172a",
                marginBottom: "20px"
            }}>
                Real-world systems for creators & operators.
            </h1>
            
            <p style={{
                fontSize: "clamp(16px, 2vw, 19px)",
                color: "#475569",
                maxWidth: "680px",
                margin: "0 auto 32px auto",
                lineHeight: 1.6
            }}>
                Master the execution, business frameworks, and craft behind today's top digital businesses with practical, project-based courses.
            </p>
            
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap"
            }}>
                <a
                    href="#courses"
                    style={{
                        background: "#2563eb",
                        color: "#ffffff",
                        padding: "14px 28px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                        transition: "transform 0.15s ease"
                    }}
                >
                    Browse Masterclasses
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </a>
                
                <a
                    href="#philosophy"
                    style={{
                        background: "#ffffff",
                        color: "#0f172a",
                        border: "1px solid #e2e8f0",
                        padding: "14px 24px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        fontWeight: 600
                    }}
                >
                    Our Learning Philosophy
                </a>
            </div>
        </section>
    )
}

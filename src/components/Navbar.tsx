export default function Navbar() {
    return (
        <header style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <a href="#" style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: 800,
                fontSize: "20px",
                letterSpacing: "-0.03em",
                color: "#0f172a"
            }}>
                <div style={{
                    width: "32px",
                    height: "32px",
                    background: "#2563eb",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff"
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                Skillpath
            </a>
            <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <a href="#courses" style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Courses</a>
                <a href="#philosophy" style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Methodology</a>
                <a href="#pricing" style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Pricing</a>
            </nav>
        </header>
    )
}

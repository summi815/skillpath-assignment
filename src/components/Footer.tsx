export default function Footer() {
    return (
        <footer style={{
            borderTop: "1px solid #e2e8f0",
            background: "#ffffff",
            padding: "48px 24px",
            marginTop: "60px"
        }}>
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "24px"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontWeight: 800,
                    fontSize: "17px",
                    color: "#0f172a"
                }}>
                    <div style={{
                        width: "26px",
                        height: "26px",
                        background: "#2563eb",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff"
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    Skillpath
                </div>
                
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    <a href="#terms" style={{ fontSize: "14px", color: "#64748b" }}>Terms of Service</a>
                    <a href="#privacy" style={{ fontSize: "14px", color: "#64748b" }}>Privacy Policy</a>
                    <a href="#contact" style={{ fontSize: "14px", color: "#64748b" }}>Support & Contact</a>
                </div>
                
                <div style={{ fontSize: "14px", color: "#64748b" }}>
                    &copy; {new Date().getFullYear()} Skillpath Technologies Inc. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

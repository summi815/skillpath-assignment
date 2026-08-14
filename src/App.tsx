import * as React from "react"
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import SkillpathCourses from "./components/SkillpathCourses"
import Footer from "./components/Footer"

export default function App() {
    const [accentColor, setAccentColor] = React.useState<string>("#2563EB")
    const [cardBorderRadius, setCardBorderRadius] = React.useState<number>(16)

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Framer Property Controls Simulator for Live Verification */}
            <div style={{
                position: "sticky",
                top: 0,
                zIndex: 1000,
                background: "#0f172a",
                color: "#e2e8f0",
                padding: "10px 24px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
                    <span style={{ color: "#38bdf8" }}>⚡</span>
                    Framer Property Controls Live Simulator
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <label htmlFor="dev-accent-picker" style={{ color: "#94a3b8" }}>Accent Color:</label>
                        <input
                            id="dev-accent-picker"
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            style={{
                                background: "none",
                                border: "1px solid #334155",
                                borderRadius: "4px",
                                cursor: "pointer",
                                width: "28px",
                                height: "24px"
                            }}
                        />
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#cbd5e1" }}>{accentColor}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <label htmlFor="dev-radius-slider" style={{ color: "#94a3b8" }}>
                            Border Radius ({cardBorderRadius}px):
                        </label>
                        <input
                            id="dev-radius-slider"
                            type="range"
                            min="4"
                            max="32"
                            step="2"
                            value={cardBorderRadius}
                            onChange={(e) => setCardBorderRadius(Number(e.target.value))}
                            style={{ cursor: "pointer" }}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <Navbar />

            {/* Hero Section */}
            <main style={{ flex: 1 }}>
                <Hero />

                {/* Main Dynamic Courses Evaluation Component */}
                <div id="courses">
                    <SkillpathCourses
                        accentColor={accentColor}
                        cardBorderRadius={cardBorderRadius}
                    />
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}

// src/components/Logo.jsx
// Ícono + wordmark de NutriiApp. Úsalo en cualquier parte de la app.
// Props:
//   size: "sm" | "md" | "lg"  (default: "md")
//   iconOnly: bool             (default: false)

const SIZES = {
    sm: { icon: 28, text: 18, gap: 8 },
    md: { icon: 36, text: 22, gap: 10 },
    lg: { icon: 48, text: 30, gap: 12 },
};

export default function Logo({ size = "md", iconOnly = false }) {
    const s = SIZES[size];

    return (
        <div style={{ display: "flex", alignItems: "center", gap: s.gap, userSelect: "none" }}>
            {/* ── Ícono ── */}
            <svg
                width={s.icon}
                height={s.icon}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
            >
                {/* Fondo degradado */}
                <defs>
                    <linearGradient id="logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3DDC84" />
                        <stop offset="100%" stopColor="#2BC8A0" />
                    </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#logo-bg)" />

                {/* Hoja izquierda */}
                <path
                    d="M20 28 C20 28 10 22 10 15 C10 10.5 14 8 20 8"
                    stroke="#0D1117"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    fill="none"
                />
                {/* Hoja derecha */}
                <path
                    d="M20 8 C26 8 30 10.5 30 15 C30 22 20 28 20 28"
                    stroke="#0D1117"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    fill="none"
                />
                {/* Tallo */}
                <line x1="20" y1="28" x2="20" y2="34" stroke="#0D1117" strokeWidth="2.8" strokeLinecap="round" />
                {/* Vena central */}
                <line x1="20" y1="8" x2="20" y2="28" stroke="#0D1117" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.3" />
            </svg>

            {/* ── Wordmark ── */}
            {!iconOnly && (
                <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: s.text,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                }}>
                    <span style={{ color: "#3DDC84" }}>Nutrii</span>
                    <span style={{ color: "#E6EDF3" }}>App</span>
                </span>
            )}
        </div>
    );
}

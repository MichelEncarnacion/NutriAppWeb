// src/components/Logo.jsx
const SIZES = {
    sm: { height: 28 },
    md: { height: 36 },
    lg: { height: 48 },
};

export default function Logo({ size = "md", iconOnly = false }) {
    const s = SIZES[size];

    if (iconOnly) {
        return (
            <img
                src="/nutriAppLOGO.jpeg"
                alt="NutriiApp"
                style={{ height: s.height, width: "auto", borderRadius: 8, objectFit: "contain", display: "block" }}
            />
        );
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, userSelect: "none" }}>
            <img
                src="/nutriAppLOGO.jpeg"
                alt="NutriiApp"
                style={{ height: s.height, width: "auto", borderRadius: 8, objectFit: "contain", flexShrink: 0 }}
            />
        </div>
    );
}

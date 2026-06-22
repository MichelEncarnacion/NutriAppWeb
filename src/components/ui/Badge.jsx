// src/components/ui/Badge.jsx
const TONES = {
    green:  "bg-brand-green/15 text-brand-green",
    blue:   "bg-brand-blue/15 text-brand-blue",
    orange: "bg-brand-orange/15 text-brand-orange",
    red:    "bg-brand-red/15 text-brand-red",
    purple: "bg-brand-purple/15 text-brand-purple",
    neutral: "bg-dark-700 text-text-muted",
};

export default function Badge({ tone = "neutral", className = "", children }) {
    return (
        <span className={`inline-flex items-center text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded-full ${TONES[tone]} ${className}`}>
            {children}
        </span>
    );
}

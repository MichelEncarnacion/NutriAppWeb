// src/components/ui/Input.jsx
const ACCENT_FOCUS = {
    green:  "focus:border-brand-green",
    purple: "focus:border-brand-purple",
};

export function Field({ label, accent = "green", className = "", children }) {
    return (
        <label className={`flex flex-col gap-1.5 ${className}`}>
            {label && <span className="text-xs text-text-muted">{label}</span>}
            {children}
        </label>
    );
}

export default function Input({ accent = "green", as: Tag = "input", className = "", ...props }) {
    return (
        <Tag
            className={`bg-dark-700 border border-dark-600 rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted ${ACCENT_FOCUS[accent]} ${className}`}
            {...props}
        />
    );
}

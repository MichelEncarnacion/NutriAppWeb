// src/components/ui/Button.jsx
const VARIANTS = {
    primary:   "bg-brand-green text-white hover:bg-brand-greenL",
    secondary: "bg-white text-text-primary border border-dark-600 hover:border-text-muted",
    ghost:     "bg-transparent text-text-muted hover:bg-dark-700 hover:text-text-primary",
    danger:    "bg-transparent text-brand-red border border-brand-red/30 hover:bg-brand-red/10",
    admin:     "bg-brand-purple text-white hover:bg-brand-purple/85",
};

const SIZES = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-sm",
};

export default function Button({
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    children,
    ...props
}) {
    return (
        <button
            className={`font-display font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

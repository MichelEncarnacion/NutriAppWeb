// src/components/ui/ThemeToggle.jsx
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle({ className = "" }) {
    const { tema, toggleTema } = useTheme();
    const esOscuro = tema === "dark";

    return (
        <button
            type="button"
            onClick={toggleTema}
            aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={esOscuro ? "Modo claro" : "Modo oscuro"}
            className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors bg-dark-600 ${className}`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-dark-900 shadow-sm flex items-center justify-center text-[10px] transition-transform ${esOscuro ? "translate-x-5" : "translate-x-0"
                    }`}
            >
                {esOscuro ? "🌙" : "☀️"}
            </span>
        </button>
    );
}

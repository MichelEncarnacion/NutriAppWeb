// src/hooks/useTheme.js
import { useEffect, useState } from "react";

const STORAGE_KEY = "nutriiapp-theme";

function aplicarTema(tema) {
    document.documentElement.classList.toggle("dark", tema === "dark");
}

export function useTheme() {
    const [tema, setTema] = useState(() => {
        const guardado = localStorage.getItem(STORAGE_KEY);
        return guardado === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        aplicarTema(tema);
        localStorage.setItem(STORAGE_KEY, tema);
    }, [tema]);

    const toggleTema = () => setTema((t) => (t === "dark" ? "light" : "dark"));

    return { tema, toggleTema };
}

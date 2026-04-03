// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";

const MACROS = [
    { label: "Carbohidratos", value: "0g", color: "#58A6FF" },
    { label: "Proteínas", value: "0g", color: "#3DDC84" },
    { label: "Grasas", value: "0g", color: "#F0A500" },
    { label: "Calorías", value: "404 kcal", color: "#FF6B6B" },
];

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 font-sans relative overflow-hidden"
            style={{ background: "#0D1117", color: "#E6EDF3" }}
        >
            {/* Blobs decorativos */}
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-5 pointer-events-none"
                style={{ background: "#3DDC84", filter: "blur(80px)" }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-5 pointer-events-none"
                style={{ background: "#A855F7", filter: "blur(80px)" }} />

            {/* Contenido */}
            <div className="flex flex-col items-center gap-8 max-w-md w-full z-10 text-center">

                {/* Plato vacío */}
                <div className="relative flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full flex items-center justify-center"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "2px dashed rgba(61,220,132,0.2)",
                            boxShadow: "0 0 60px rgba(61,220,132,0.06) inset",
                        }}>
                        <span style={{ fontSize: "4rem", lineHeight: 1 }}>🍽️</span>
                    </div>
                    {/* Badge 404 */}
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-xs"
                        style={{ background: "#FF6B6B", color: "#0D1117" }}>
                        404
                    </div>
                </div>

                {/* Título */}
                <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-black tracking-[0.25em] font-display"
                        style={{ color: "#3DDC84" }}>
                        PÁGINA NO ENCONTRADA
                    </div>
                    <h1 className="font-display font-black leading-none"
                        style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", letterSpacing: "-0.03em" }}>
                        Este platillo{" "}
                        <span style={{
                            background: "linear-gradient(135deg, #3DDC84, #58A6FF)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            no existe
                        </span>
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: "#7D8590" }}>
                        La página que buscas no está en tu plan nutricional.<br />
                        Quizás fue eliminada o nunca estuvo en el menú.
                    </p>
                </div>

                {/* Tabla de macros vacía — humor */}
                <div className="w-full rounded-2xl overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="px-4 py-3 flex items-center gap-2"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                        <span className="text-[10px] font-black tracking-widest font-display" style={{ color: "#7D8590" }}>
                            INFORMACIÓN NUTRICIONAL
                        </span>
                        <span className="text-[10px] font-bold ml-auto" style={{ color: "#FF6B6B" }}>Página vacía</span>
                    </div>
                    <div className="grid grid-cols-4 divide-x" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        {MACROS.map((m) => (
                            <div key={m.label} className="flex flex-col items-center py-3 px-2 gap-1">
                                <span className="font-display font-black text-base" style={{ color: m.color }}>{m.value}</span>
                                <span className="text-[9px] font-bold text-center leading-tight" style={{ color: "#4A5568" }}>{m.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#7D8590",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#E6EDF3"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#7D8590"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={() => navigate("/panel")}
                        className="flex-1 py-3 rounded-2xl text-sm font-black font-display transition-all"
                        style={{
                            background: "linear-gradient(135deg, #3DDC84, #2bc96e)",
                            color: "#0D1117",
                            boxShadow: "0 4px 20px rgba(61,220,132,0.25)",
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 30px rgba(61,220,132,0.4)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(61,220,132,0.25)"}
                    >
                        Ir al panel
                    </button>
                </div>

                {/* Footer branding */}
                <p className="text-[11px]" style={{ color: "#2D3748" }}>
                    <span className="font-display font-black" style={{ color: "#3DDC84" }}>Nutrii</span>
                    <span className="font-display font-black" style={{ color: "#4A5568" }}>App</span>
                    {" · "}Tu nutrición, bajo control.
                </p>
            </div>
        </div>
    );
}

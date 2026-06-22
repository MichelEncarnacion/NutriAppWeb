// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";

const MACROS = [
    { label: "Carbohidratos", value: "0g", color: "#2563eb" },
    { label: "Proteínas", value: "0g", color: "#1b5e20" },
    { label: "Grasas", value: "0g", color: "#bf9000" },
    { label: "Calorías", value: "404 kcal", color: "#d64545" },
];

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 font-sans relative overflow-hidden"
            style={{ background: "#FFFFFF", color: "#1A1A1A" }}
        >
            {/* Blobs decorativos */}
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
                style={{ background: "#1b5e20", filter: "blur(80px)" }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none"
                style={{ background: "#7c3aed", filter: "blur(80px)" }} />

            {/* Contenido */}
            <div className="flex flex-col items-center gap-8 max-w-md w-full z-10 text-center">

                {/* Plato vacío */}
                <div className="relative flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full flex items-center justify-center"
                        style={{
                            background: "#F8F9FA",
                            border: "2px dashed rgba(27,94,32,0.25)",
                            boxShadow: "0 0 60px rgba(27,94,32,0.06) inset",
                        }}>
                        <span style={{ fontSize: "4rem", lineHeight: 1 }}>🍽️</span>
                    </div>
                    {/* Badge 404 */}
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-xs"
                        style={{ background: "#D64545", color: "#FFFFFF" }}>
                        404
                    </div>
                </div>

                {/* Título */}
                <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-black tracking-[0.25em] font-display"
                        style={{ color: "#1B5E20" }}>
                        PÁGINA NO ENCONTRADA
                    </div>
                    <h1 className="font-display font-black leading-none"
                        style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", letterSpacing: "-0.03em", color: "#1A1A1A" }}>
                        Este platillo{" "}
                        <span style={{
                            background: "linear-gradient(135deg, #1B5E20, #2563eb)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            no existe
                        </span>
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: "#4A5568" }}>
                        La página que buscas no está en tu plan nutricional.<br />
                        Quizás fue eliminada o nunca estuvo en el menú.
                    </p>
                </div>

                {/* Tabla de macros vacía — humor */}
                <div className="w-full rounded-2xl overflow-hidden"
                    style={{ border: "1px solid #E2E8F0", background: "#F8F9FA" }}>
                    <div className="px-4 py-3 flex items-center gap-2"
                        style={{ borderBottom: "1px solid #E2E8F0", background: "#F8F9FA" }}>
                        <span className="text-[10px] font-black tracking-widest font-display" style={{ color: "#4A5568" }}>
                            INFORMACIÓN NUTRICIONAL
                        </span>
                        <span className="text-[10px] font-bold ml-auto" style={{ color: "#D64545" }}>Página vacía</span>
                    </div>
                    <div className="grid grid-cols-4 divide-x" style={{ borderColor: "#E2E8F0" }}>
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
                            background: "#F8F9FA",
                            border: "1px solid #E2E8F0",
                            color: "#4A5568",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#1A1A1A"; e.currentTarget.style.borderColor = "#1B5E20"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#4A5568"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={() => navigate("/panel")}
                        className="flex-1 py-3 rounded-2xl text-sm font-black font-display transition-all"
                        style={{
                            background: "linear-gradient(135deg, #1B5E20, #2e7d32)",
                            color: "#FFFFFF",
                            boxShadow: "0 4px 20px rgba(27,94,32,0.25)",
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 30px rgba(27,94,32,0.4)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(27,94,32,0.25)"}
                    >
                        Ir al panel
                    </button>
                </div>

                {/* Footer branding */}
                <p className="text-[11px]" style={{ color: "#94A3B8" }}>
                    <span className="font-display font-black" style={{ color: "#1B5E20" }}>Nutrii</span>
                    <span className="font-display font-black" style={{ color: "#4A5568" }}>App</span>
                    {" · "}Tu nutrición, bajo control.
                </p>
            </div>
        </div>
    );
}

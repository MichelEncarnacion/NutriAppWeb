// src/pages/Wearables.jsx
import Layout from "../components/Layout";

export default function Wearables() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-fadeUp">
                <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
                    style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
                >
                    ⌚
                </div>
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                        style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.2)" }}>
                        PRÓXIMAMENTE
                    </div>
                    <h1 className="text-white text-2xl font-black font-display mb-2">Wearables</h1>
                    <p className="text-[#7D8590] text-sm max-w-xs leading-relaxed">
                        Conecta tu dispositivo wearable para sincronizar automáticamente tus métricas de salud y actividad.
                    </p>
                </div>
                <div className="flex flex-col gap-3 mt-2 w-full max-w-xs">
                    {["Sincronización con Apple Watch y Garmin", "Importación automática de métricas", "Análisis de sueño y recuperación"].map((feat) => (
                        <div key={feat} className="flex items-center gap-3 px-4 py-3 bg-[#161B22] border border-[#2D3748] rounded-xl text-left">
                            <span className="text-[#A855F7]">✓</span>
                            <span className="text-[#7D8590] text-xs">{feat}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

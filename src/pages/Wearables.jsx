// src/pages/Wearables.jsx
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export default function Wearables() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-fadeUp">
                <div className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl bg-brand-purple/10 border border-brand-purple/20">
                    ⌚
                </div>
                <div>
                    <Badge tone="purple" className="mb-4">PRÓXIMAMENTE</Badge>
                    <h1 className="text-text-primary text-2xl font-black font-display mb-2">Wearables</h1>
                    <p className="text-text-muted text-sm max-w-xs leading-relaxed">
                        Conecta tu dispositivo wearable para sincronizar automáticamente tus métricas de salud y actividad.
                    </p>
                </div>
                <div className="flex flex-col gap-3 mt-2 w-full max-w-xs">
                    {["Sincronización con Apple Watch y Garmin", "Importación automática de métricas", "Análisis de sueño y recuperación"].map((feat) => (
                        <Card key={feat} className="flex items-center gap-3 px-4 py-3 text-left">
                            <span className="text-brand-purple">✓</span>
                            <span className="text-text-muted text-xs">{feat}</span>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

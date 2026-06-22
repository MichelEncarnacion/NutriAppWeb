// src/pages/Ejercicios.jsx
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export default function Ejercicios() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-fadeUp">
                <div className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl bg-brand-blue/10 border border-brand-blue/20">
                    💪
                </div>
                <div>
                    <Badge tone="blue" className="mb-4">PRÓXIMAMENTE</Badge>
                    <h1 className="text-text-primary text-2xl font-black font-display mb-2">Ejercicios</h1>
                    <p className="text-text-muted text-sm max-w-xs leading-relaxed">
                        Rutinas de entrenamiento personalizadas que complementan tu plan nutricional. Pronto disponible.
                    </p>
                </div>
                <div className="flex flex-col gap-3 mt-2 w-full max-w-xs">
                    {["Rutinas personalizadas por IA", "Integración con tu plan nutricional", "Seguimiento de actividad física"].map((feat) => (
                        <Card key={feat} className="flex items-center gap-3 px-4 py-3 text-left">
                            <span className="text-brand-blue">✓</span>
                            <span className="text-text-muted text-xs">{feat}</span>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

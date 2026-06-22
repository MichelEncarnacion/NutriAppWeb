// src/pages/ListaCompras.jsx
import { useNavigate } from "react-router-dom";
import { useActivePlan } from "../hooks/useActivePlan";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const CATEGORIA_META = {
    "Proteínas": { icon: "🥩", color: "#D64545", bg: "rgba(214,69,69,0.08)", border: "rgba(214,69,69,0.2)" },
    "Verduras y frutas": { icon: "🥦", color: "#1B5E20", bg: "rgba(27,94,32,0.08)", border: "rgba(27,94,32,0.2)" },
    "Cereales y derivados": { icon: "🌽", color: "#BF9000", bg: "rgba(191,144,0,0.08)", border: "rgba(191,144,0,0.2)" },
    "Lácteos": { icon: "🥛", color: "#2563EB", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)" },
    "Leguminosas": { icon: "🫘", color: "#7C3AED", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)" },
    "Condimentos y otros": { icon: "🧂", color: "#4A5568", bg: "rgba(74,85,104,0.08)", border: "rgba(74,85,104,0.2)" },
};

const DEFAULT_META = { icon: "🛒", color: "#4A5568", bg: "rgba(74,85,104,0.08)", border: "rgba(74,85,104,0.2)" };

function getCatMeta(categoria) {
    return CATEGORIA_META[categoria] ?? DEFAULT_META;
}

export default function ListaCompras() {
    const { plan, isLoading } = useActivePlan();
    const navigate = useNavigate();

    const lista = plan?.lista_compras ?? null;
    const items = lista?.items ?? [];
    const costoTotal = lista?.costo_total_estimado ?? 0;

    // Agrupar por categoría
    const porCategoria = items.reduce((acc, item) => {
        const cat = item.categoria ?? "Otros";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const categorias = Object.keys(porCategoria);

    return (
        <Layout>
            <div className="flex flex-col gap-6 max-w-2xl">

                {/* Header */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-brand-green mb-1 font-display">MI PLAN</p>
                        <h1 className="text-text-primary text-3xl font-black font-display leading-none">Lista de Compras</h1>
                    </div>
                    {!isLoading && lista && costoTotal > 0 && (
                        <div className="text-right">
                            <p className="text-[10px] text-text-muted mb-0.5">Costo estimado</p>
                            <span className="text-3xl font-black font-display text-brand-green leading-none">
                                ${costoTotal.toLocaleString("es-MX")}
                            </span>
                            <p className="text-[10px] text-text-muted mt-0.5">MXN quincena</p>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <div className="h-4 bg-dark-600 rounded w-32 mb-3" />
                                <div className="flex flex-col gap-2">
                                    {[...Array(3)].map((_, j) => <div key={j} className="h-3 bg-dark-600 rounded w-full" />)}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Sin plan */}
                {!isLoading && !plan && (
                    <Card className="p-10 text-center flex flex-col items-center gap-4">
                        <span className="text-5xl">🛒</span>
                        <div>
                            <p className="text-text-primary font-bold font-display mb-1">Sin plan activo</p>
                            <p className="text-text-muted text-sm">Genera tu plan nutricional para ver tu lista de compras personalizada.</p>
                        </div>
                        <Button variant="secondary" onClick={() => navigate("/diagnostico")}>
                            Generar mi plan →
                        </Button>
                    </Card>
                )}

                {/* Plan sin lista_compras (plan viejo sin el campo) */}
                {!isLoading && plan && !lista && (
                    <Card className="p-10 text-center flex flex-col items-center gap-4">
                        <span className="text-5xl">🔄</span>
                        <div>
                            <p className="text-text-primary font-bold font-display mb-1">Lista no disponible</p>
                            <p className="text-text-muted text-sm leading-relaxed">Tu plan actual fue generado antes de esta función.<br />Regenera tu plan para obtener la lista de compras.</p>
                        </div>
                        <Button variant="secondary" onClick={() => navigate("/mi-plan")}>
                            Ver mi plan →
                        </Button>
                    </Card>
                )}

                {/* Lista de compras */}
                {!isLoading && lista && categorias.length > 0 && (
                    <>
                        {/* Resumen de categorías */}
                        <div className="grid grid-cols-3 gap-2">
                            {categorias.map((cat) => {
                                const meta = getCatMeta(cat);
                                const subtotal = porCategoria[cat].reduce((s, i) => s + (i.costo_aproximado ?? 0), 0);
                                return (
                                    <div key={cat} className="rounded-xl p-3 flex flex-col gap-1"
                                        style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                                        <span className="text-lg">{meta.icon}</span>
                                        <p className="text-[10px] font-bold leading-tight" style={{ color: meta.color }}>
                                            {cat}
                                        </p>
                                        <p className="text-text-primary font-black text-sm font-display">
                                            ${subtotal.toLocaleString("es-MX")}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Items por categoría */}
                        <div className="flex flex-col gap-4">
                            {categorias.map((cat) => {
                                const meta = getCatMeta(cat);
                                const catItems = porCategoria[cat];
                                const subtotal = catItems.reduce((s, i) => s + (i.costo_aproximado ?? 0), 0);
                                return (
                                    <Card key={cat} className="p-0 overflow-hidden">
                                        {/* Header categoría */}
                                        <div className="flex items-center justify-between px-4 py-3 bg-dark-700 border-b border-dark-600">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{meta.icon}</span>
                                                <span className="text-xs font-black font-display tracking-wide text-text-primary">
                                                    {cat.toUpperCase()}
                                                </span>
                                                <span className="text-[10px] font-medium text-text-muted">
                                                    ({catItems.length} {catItems.length === 1 ? "producto" : "productos"})
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold font-display text-text-primary">
                                                ${subtotal.toLocaleString("es-MX")} MXN
                                            </span>
                                        </div>

                                        {/* Items */}
                                        <div className="divide-y divide-dark-700">
                                            {catItems.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-dark-700/40 transition-colors">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        {/* Checkbox decorativo */}
                                                        <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border border-dark-600 bg-dark-700">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-text-primary text-sm font-medium truncate">{item.nombre}</p>
                                                            <p className="text-text-muted text-[11px] mt-0.5">{item.cantidad}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs font-bold font-display ml-3 flex-shrink-0 ${item.costo_aproximado > 0 ? "text-text-primary" : "text-text-muted"}`}>
                                                        {item.costo_aproximado > 0 ? `~$${item.costo_aproximado.toLocaleString("es-MX")}` : "—"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Total final */}
                        <Card className="flex items-center justify-between border-brand-green/20">
                            <div>
                                <p className="text-[10px] font-black font-display tracking-widest text-brand-green">TOTAL ESTIMADO</p>
                                <p className="text-text-muted text-xs mt-0.5">{items.length} productos para 15 días</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black font-display text-text-primary">
                                    ${costoTotal.toLocaleString("es-MX")}
                                </p>
                                <p className="text-[10px] text-text-muted">MXN</p>
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </Layout>
    );
}

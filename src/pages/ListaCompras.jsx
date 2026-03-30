// src/pages/ListaCompras.jsx
import { useNavigate } from "react-router-dom";
import { useActivePlan } from "../hooks/useActivePlan";
import Layout from "../components/Layout";

const CATEGORIA_META = {
    "Proteínas": { icon: "🥩", color: "#FF6B6B", bg: "rgba(255,107,107,0.08)", border: "rgba(255,107,107,0.2)" },
    "Verduras y frutas": { icon: "🥦", color: "#3DDC84", bg: "rgba(61,220,132,0.08)", border: "rgba(61,220,132,0.2)" },
    "Cereales y derivados": { icon: "🌽", color: "#F0A500", bg: "rgba(240,165,0,0.08)", border: "rgba(240,165,0,0.2)" },
    "Lácteos": { icon: "🥛", color: "#58A6FF", bg: "rgba(88,166,255,0.08)", border: "rgba(88,166,255,0.2)" },
    "Leguminosas": { icon: "🫘", color: "#A855F7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)" },
    "Condimentos y otros": { icon: "🧂", color: "#7D8590", bg: "rgba(125,133,144,0.08)", border: "rgba(125,133,144,0.2)" },
};

const DEFAULT_META = { icon: "🛒", color: "#7D8590", bg: "rgba(125,133,144,0.08)", border: "rgba(125,133,144,0.2)" };

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
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#3DDC84] mb-1 font-display">MI PLAN</p>
                        <h1 className="text-white text-3xl font-black font-display leading-none">Lista de Compras</h1>
                    </div>
                    {!isLoading && lista && costoTotal > 0 && (
                        <div className="text-right">
                            <p className="text-[10px] text-[#7D8590] mb-0.5">Costo estimado</p>
                            <span className="text-3xl font-black font-display text-[#3DDC84] leading-none">
                                ${costoTotal.toLocaleString("es-MX")}
                            </span>
                            <p className="text-[10px] text-[#7D8590] mt-0.5">MXN quincena</p>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-4 animate-pulse">
                                <div className="h-4 bg-[#2D3748] rounded w-32 mb-3" />
                                <div className="flex flex-col gap-2">
                                    {[...Array(3)].map((_, j) => <div key={j} className="h-3 bg-[#2D3748] rounded w-full" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sin plan */}
                {!isLoading && !plan && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-10 text-center flex flex-col items-center gap-4">
                        <span className="text-5xl">🛒</span>
                        <div>
                            <p className="text-white font-bold font-display mb-1">Sin plan activo</p>
                            <p className="text-[#7D8590] text-sm">Genera tu plan nutricional para ver tu lista de compras personalizada.</p>
                        </div>
                        <button
                            onClick={() => navigate("/diagnostico")}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold font-display transition-all"
                            style={{ background: "rgba(61,220,132,0.1)", color: "#3DDC84", border: "1px solid rgba(61,220,132,0.2)" }}
                        >
                            Generar mi plan →
                        </button>
                    </div>
                )}

                {/* Plan sin lista_compras (plan viejo sin el campo) */}
                {!isLoading && plan && !lista && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-10 text-center flex flex-col items-center gap-4">
                        <span className="text-5xl">🔄</span>
                        <div>
                            <p className="text-white font-bold font-display mb-1">Lista no disponible</p>
                            <p className="text-[#7D8590] text-sm leading-relaxed">Tu plan actual fue generado antes de esta función.<br />Regenera tu plan para obtener la lista de compras.</p>
                        </div>
                        <button
                            onClick={() => navigate("/mi-plan")}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold font-display transition-all"
                            style={{ background: "rgba(61,220,132,0.1)", color: "#3DDC84", border: "1px solid rgba(61,220,132,0.2)" }}
                        >
                            Ver mi plan →
                        </button>
                    </div>
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
                                        <p className="text-white font-black text-sm font-display">
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
                                    <div key={cat} className="bg-[#161B22] border border-[#2D3748] rounded-2xl overflow-hidden">
                                        {/* Header categoría */}
                                        <div className="flex items-center justify-between px-4 py-3"
                                            style={{ background: meta.bg, borderBottom: `1px solid ${meta.border}` }}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{meta.icon}</span>
                                                <span className="text-xs font-black font-display tracking-wide" style={{ color: meta.color }}>
                                                    {cat.toUpperCase()}
                                                </span>
                                                <span className="text-[10px] font-medium" style={{ color: meta.color, opacity: 0.7 }}>
                                                    ({catItems.length} {catItems.length === 1 ? "producto" : "productos"})
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold font-display" style={{ color: meta.color }}>
                                                ${subtotal.toLocaleString("es-MX")} MXN
                                            </span>
                                        </div>

                                        {/* Items */}
                                        <div className="divide-y divide-[#1C2330]">
                                            {catItems.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        {/* Checkbox decorativo */}
                                                        <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center"
                                                            style={{ border: `1.5px solid ${meta.border}`, background: meta.bg }}>
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color, opacity: 0.4 }} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-white text-sm font-medium truncate">{item.nombre}</p>
                                                            <p className="text-[#7D8590] text-[11px] mt-0.5">{item.cantidad}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold font-display ml-3 flex-shrink-0"
                                                        style={{ color: item.costo_aproximado > 0 ? meta.color : "#4A5568" }}>
                                                        {item.costo_aproximado > 0 ? `~$${item.costo_aproximado.toLocaleString("es-MX")}` : "—"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total final */}
                        <div className="rounded-2xl p-5 flex items-center justify-between"
                            style={{ background: "rgba(61,220,132,0.07)", border: "1px solid rgba(61,220,132,0.2)" }}>
                            <div>
                                <p className="text-[10px] font-black font-display tracking-widest text-[#3DDC84]">TOTAL ESTIMADO</p>
                                <p className="text-[#7D8590] text-xs mt-0.5">{items.length} productos para 15 días</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black font-display text-white">
                                    ${costoTotal.toLocaleString("es-MX")}
                                </p>
                                <p className="text-[10px] text-[#7D8590]">MXN</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

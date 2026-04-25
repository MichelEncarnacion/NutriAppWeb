// src/pages/Progreso.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import {
    ResponsiveContainer,
    AreaChart, Area,
    BarChart, Bar,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    XAxis,
    Tooltip,
    Line,
    Cell,
} from "recharts";

function ImcGauge({ imc, clasificacion }) {
    const r = 36, cx = 50, cy = 50;
    const startAngle = 225, totalAngle = 270;
    const minImc = 15, maxImc = 40;

    const pt = (deg) => {
        const d = ((deg % 360) + 360) % 360;
        const rad = (d - 90) * Math.PI / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };
    const arc = (a1, a2) => {
        const s = pt(a1), e = pt(a2);
        const large = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
        return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
    };
    const toDeg = (v) => startAngle + ((v - minImc) / (maxImc - minImc)) * totalAngle;

    const zones = [
        { from: minImc, to: 18.5, color: "#58A6FF" },
        { from: 18.5,   to: 25,   color: "#3DDC84" },
        { from: 25,     to: 30,   color: "#F0A500" },
        { from: 30,     to: maxImc, color: "#FF6B6B" },
    ];

    const needleDeg = toDeg(Math.min(Math.max(imc, minImc), maxImc));
    const needle = pt(needleDeg);

    return (
        <svg viewBox="0 0 100 100" width={120} height={120}>
            <path
                d={arc(startAngle, startAngle + totalAngle)}
                fill="none" stroke="#1C2330" strokeWidth={10} strokeLinecap="butt"
            />
            {zones.map((z, i) => (
                <path
                    key={i}
                    d={arc(toDeg(z.from), toDeg(z.to))}
                    fill="none" stroke={z.color} strokeWidth={10} strokeLinecap="butt" opacity={0.85}
                />
            ))}
            <circle cx={needle.x} cy={needle.y} r={4} fill="white" />
            <text x={cx} y={cy - 2} textAnchor="middle" fill="white" fontSize={16} fontWeight="900">{Number.isFinite(imc) ? imc : "—"}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={clasificacion?.color ?? "#7D8590"} fontSize={8} fontWeight="bold">{clasificacion?.label ?? ""}</text>
        </svg>
    );
}

function PesoTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-3 text-xs">
            <p className="text-[#7D8590] mb-1">{label}</p>
            {payload.map((p) => p.value != null && (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.dataKey === "peso" ? "Peso real" : "Proyección"}: {p.value} kg
                </p>
            ))}
        </div>
    );
}

const STAT_PILLS = [
    { key: "peso",              label: "Peso",      unit: "kg", color: "#3DDC84", bueno: false },
    { key: "porcentaje_grasa",  label: "% Grasa",   unit: "%",  color: "#FF6B6B", bueno: false },
    { key: "porcentaje_musculo",label: "% Músculo", unit: "%",  color: "#58A6FF", bueno: true  },
];

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-3 text-xs">
            <p className="text-[#7D8590] mb-1">{label}</p>
            {d?.peso != null && (
                <p className="text-[#3DDC84]">Peso: {d.peso} kg</p>
            )}
            {d?.porcentaje_grasa != null && (
                <p className="text-[#FF6B6B]">Grasa: {d.porcentaje_grasa}%</p>
            )}
            {d?.porcentaje_musculo != null && (
                <p className="text-[#58A6FF]">Músculo: {d.porcentaje_musculo}%</p>
            )}
        </div>
    );
}

function ComposicionTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-3 text-xs">
            <p className="text-[#7D8590] mb-1">{label}</p>
            {payload.map((p) => {
                const labels = { porcentaje_grasa: "Grasa", porcentaje_musculo: "Músculo" };
                return (
                    <p key={p.dataKey} style={{ color: p.fill ?? p.color }}>
                        {labels[p.dataKey] ?? p.dataKey}: {p.value}%
                    </p>
                );
            })}
        </div>
    );
}

export default function Progreso() {
    const { session } = useAuth();
    const uid = session?.user?.id;
    const navigate = useNavigate();

    const [metricas, setMetricas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [diag, setDiag] = useState(null);

    useEffect(() => {
        if (!uid) return;

        const cargar = async () => {
            try {
                const { data, error } = await supabase
                    .from("metricas")
                    .select("fecha, peso, porcentaje_grasa, porcentaje_musculo")
                    .eq("perfil_id", uid)
                    .order("fecha", { ascending: false })
                    .limit(10);
                if (error) console.error("Progreso fetch error:", error);
                setMetricas(data ?? []);

                const { data: diagData } = await supabase
                    .from("diagnosticos")
                    .select("peso, estatura, peso_meta")
                    .eq("perfil_id", uid)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();
                setDiag(diagData ?? null);
            } catch (err) {
                console.error("Progreso load error:", err);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [uid]);

    const ultima  = metricas[0] ?? null;
    const segunda = metricas[1] ?? null;

    const delta = (campo) => {
        if (!ultima || !segunda || ultima[campo] == null || segunda[campo] == null) return null;
        const d = parseFloat((ultima[campo] - segunda[campo]).toFixed(1));
        if (d === 0) return null;
        return { valor: d, positivo: d > 0 };
    };

    const imc = (() => {
        if (!diag?.estatura || !ultima?.peso) return null;
        const estatura_m = diag.estatura / 100;
        return parseFloat((ultima.peso / (estatura_m * estatura_m)).toFixed(1));
    })();

    const imcClasificacion = (() => {
        if (imc === null) return null;
        if (imc < 18.5) return { label: "Bajo peso", color: "#58A6FF" };
        if (imc < 25)   return { label: "Normal",    color: "#3DDC84" };
        if (imc < 30)   return { label: "Sobrepeso", color: "#F0A500" };
        return              { label: "Obesidad",   color: "#FF6B6B" };
    })();

    const pesoProgreso = (() => {
        const pesoInicial = diag?.peso;
        const pesoMeta    = diag?.peso_meta;
        const pesoActual  = ultima?.peso;
        if (!pesoMeta || pesoInicial == null || pesoActual == null) return null;

        const subiendo = pesoMeta > pesoInicial;
        const deltaTotal  = subiendo ? pesoMeta - pesoInicial : pesoInicial - pesoMeta;
        const deltaActual = subiendo ? pesoActual - pesoInicial : pesoInicial - pesoActual;
        const pct = deltaTotal === 0 ? 0 : Math.min(Math.max((deltaActual / deltaTotal) * 100, 0), 100);

        return {
            pesoInicial,
            pesoMeta,
            pesoActual,
            pct: parseFloat(pct.toFixed(1)),
        };
    })();

    const pesoChartData = (() => {
        const puntos = [...metricas].reverse().filter((m) => m.peso != null);
        if (puntos.length < 3) return null;

        const fechaBase = new Date(puntos[0].fecha + "T00:00:00");
        const xs = puntos.map((m) =>
            Math.round((new Date(m.fecha + "T00:00:00") - fechaBase) / 86400000)
        );
        const ys = puntos.map((m) => m.peso);

        const n = puntos.length;
        const sumX  = xs.reduce((a, b) => a + b, 0);
        const sumY  = ys.reduce((a, b) => a + b, 0);
        const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
        const sumX2 = xs.reduce((s, x) => s + x * x, 0);
        const denom = n * sumX2 - sumX * sumX;
        const slope     = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
        const intercept = (sumY - slope * sumX) / n;

        const lastX = xs[xs.length - 1];
        const kgPorSemana = parseFloat((slope * 7).toFixed(2));
        const tendencia =
            Math.abs(kgPorSemana) < 0.1
                ? { label: "→ Estable",                                color: "#7D8590" }
                : kgPorSemana < 0
                ? { label: `↓ Bajando ${Math.abs(kgPorSemana)} kg/semana`, color: "#3DDC84" }
                : { label: `↑ Subiendo ${kgPorSemana} kg/semana`,      color: "#F0A500" };

        const data = puntos.map((m, i) => ({
            fecha: new Date(m.fecha + "T00:00:00").toLocaleDateString("es-MX", {
                day: "numeric", month: "short",
            }),
            peso: m.peso,
            proyeccion: i === puntos.length - 1
                ? parseFloat((intercept + slope * lastX).toFixed(1))
                : null,
        }));

        const fechaFutura = new Date(
            new Date(puntos[puntos.length - 1].fecha + "T00:00:00").getTime() +
            15 * 86400000
        );
        data.push({
            fecha: fechaFutura.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
            peso: null,
            proyeccion: parseFloat((intercept + slope * (lastX + 15)).toFixed(1)),
        });

        return { data, tendencia };
    })();

    const radarData = (() => {
        const dims = [
            {
                dim: "IMC",
                val: imc !== null
                    ? Math.round(Math.max(0, Math.min(100, (1 - Math.abs(imc - 22) / 15) * 100)))
                    : 0,
            },
            {
                dim: "Músculo",
                val: ultima?.porcentaje_musculo != null
                    ? Math.round(Math.min(100, (ultima.porcentaje_musculo / 50) * 100))
                    : 0,
            },
            {
                dim: "Grasa",
                val: ultima?.porcentaje_grasa != null
                    ? Math.round(Math.max(0, 100 - (ultima.porcentaje_grasa / 35) * 100))
                    : 0,
            },
            {
                dim: "Meta",
                val: pesoProgreso?.pct != null ? Math.round(pesoProgreso.pct) : 0,
            },
        ];
        return dims.some((d) => d.val > 0) ? dims : null;
    })();

    const composicionData = (() => {
        const puntos = [...metricas].reverse().filter(
            (m) => m.porcentaje_grasa != null || m.porcentaje_musculo != null
        );
        if (puntos.length < 2) return null;
        return puntos.map((m) => ({
            fecha: new Date(m.fecha + "T00:00:00").toLocaleDateString("es-MX", {
                day: "numeric", month: "short",
            }),
            porcentaje_grasa: m.porcentaje_grasa ?? 0,
            porcentaje_musculo: m.porcentaje_musculo ?? 0,
        }));
    })();

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl relative">

                {/* Header */}
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Progreso</h1>
                    <p className="text-[#7D8590] text-xs">
                        Seguimiento de tus métricas corporales a lo largo del tiempo
                    </p>
                </div>

                {/* Loading skeleton */}
                {loading ? (
                    <>
                        <div className="flex gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex-1 bg-[#161B22] border border-[#2D3748] rounded-xl h-20 animate-pulse" />
                            ))}
                        </div>
                        <div className="bg-[#161B22] border border-[#2D3748] rounded-xl h-48 animate-pulse" />
                    </>

                /* Empty state */
                ) : !ultima ? (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-3">📊</span>
                        <p className="text-white font-bold mb-2">Sin métricas registradas</p>
                        <p className="text-[#7D8590] text-sm">
                            Completa tu primer formulario de seguimiento para ver tu progreso.
                        </p>
                    </div>

                ) : (
                    <>
                        {/* Stat pills */}
                        <div className="flex gap-3">
                            {STAT_PILLS.map((s) => {
                                if (ultima[s.key] == null) return null;
                                const d = delta(s.key);
                                const mejora = d
                                    ? (s.bueno ? d.positivo : !d.positivo)
                                    : null;
                                return (
                                    <div key={s.key} className="flex-1 bg-[#161B22] border border-[#2D3748] rounded-xl p-3 text-center">
                                        <p className="text-[9px] text-[#7D8590] font-bold tracking-widest mb-1">
                                            {s.label.toUpperCase()}
                                        </p>
                                        <p className="font-display font-black text-lg" style={{ color: s.color }}>
                                            {ultima[s.key]}
                                            <span className="text-xs font-normal text-[#7D8590]"> {s.unit}</span>
                                        </p>
                                        {d && (
                                            <p className={`text-xs font-bold mt-0.5 ${mejora ? "text-[#3DDC84]" : "text-[#FF6B6B]"}`}>
                                                {Number(d.valor) > 0 ? "▲" : "▼"} {Math.abs(d.valor)}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* IMC Gauge + Radar — fila lado a lado */}
                        {(imc !== null || radarData) && (
                            <div className="flex gap-3">
                                {imc !== null && (
                                    <div className="flex-1 bg-[#161B22] border border-[#2D3748] rounded-xl p-5 flex flex-col items-center">
                                        <p className="text-[#7D8590] text-xs font-bold tracking-widest mb-3 self-start">IMC</p>
                                        <ImcGauge imc={imc} clasificacion={imcClasificacion} />
                                        <div className="flex gap-3 mt-2 flex-wrap justify-center">
                                            {[
                                                { label: "Bajo", color: "#58A6FF" },
                                                { label: "Normal", color: "#3DDC84" },
                                                { label: "Sobre", color: "#F0A500" },
                                                { label: "Obeso", color: "#FF6B6B" },
                                            ].map((z) => (
                                                <div key={z.label} className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ background: z.color }} />
                                                    <span className="text-[9px] text-[#7D8590]">{z.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {radarData && (
                                    <div className="flex-1 bg-[#161B22] border border-[#2D3748] rounded-xl p-5 flex flex-col">
                                        <p className="text-[#7D8590] text-xs font-bold tracking-widest mb-1">SALUD GLOBAL</p>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                                                <PolarGrid stroke="#2D3748" />
                                                <PolarAngleAxis dataKey="dim" tick={{ fill: "#7D8590", fontSize: 9 }} />
                                                <Radar
                                                    dataKey="val"
                                                    stroke="#3DDC84"
                                                    fill="#3DDC84"
                                                    fillOpacity={0.2}
                                                    strokeWidth={2}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BarChart apilado — composición corporal */}
                        {composicionData && (
                            <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[#7D8590] text-xs font-bold tracking-widest">COMPOSICIÓN CORPORAL</p>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-sm" style={{ background: "#FF6B6B" }} />
                                            <span className="text-[10px] text-[#7D8590]">Grasa %</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-sm" style={{ background: "#58A6FF" }} />
                                            <span className="text-[10px] text-[#7D8590]">Músculo %</span>
                                        </div>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={composicionData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                        <XAxis
                                            dataKey="fecha"
                                            tick={{ fontSize: 10, fill: "#7D8590" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={ComposicionTooltip} />
                                        <Bar
                                            dataKey="porcentaje_grasa"
                                            stackId="composicion"
                                            fill="#FF6B6B"
                                            opacity={0.8}
                                            radius={[0, 0, 4, 4]}
                                        />
                                        <Bar
                                            dataKey="porcentaje_musculo"
                                            stackId="composicion"
                                            fill="#58A6FF"
                                            opacity={0.8}
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {composicionData.map((_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill="#58A6FF"
                                                    opacity={i === composicionData.length - 1 ? 1 : 0.7}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Progress towards weight goal */}
                        {pesoProgreso !== null ? (
                            <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                                <p className="text-[#7D8590] text-xs font-bold tracking-widest mb-3">PROGRESO HACIA TU META</p>
                                <div className="flex justify-between text-xs text-[#7D8590] mb-1">
                                    <span>Inicio: <strong className="text-white">{pesoProgreso.pesoInicial} kg</strong></span>
                                    <span className="font-bold text-[#3DDC84]">{pesoProgreso.pct}% completado</span>
                                    <span>Meta: <strong className="text-white">{pesoProgreso.pesoMeta} kg</strong></span>
                                </div>
                                <div className="relative h-3 bg-[#0D1117] rounded-full overflow-hidden">
                                    <div
                                        className="absolute left-0 top-0 h-full rounded-full transition-all"
                                        style={{ width: `${pesoProgreso.pct}%`, background: "#3DDC84" }}
                                    />
                                </div>
                                <p className="text-center text-xs text-[#7D8590] mt-2">
                                    Peso actual: <strong className="text-white">{pesoProgreso.pesoActual} kg</strong>
                                </p>
                            </div>
                        ) : diag && !diag.peso_meta ? (
                            <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5 text-center">
                                <p className="text-[#7D8590] text-xs font-bold tracking-widest mb-3">PROGRESO HACIA TU META</p>
                                <p className="text-[#7D8590] text-sm mb-3">Actualiza tu diagnóstico para ver tu progreso hacia tu meta</p>
                                <button
                                    onClick={() => navigate("/diagnostico")}
                                    className="px-4 py-2 bg-[rgba(61,220,132,.1)] border border-[rgba(61,220,132,.3)] text-[#3DDC84] text-sm font-bold rounded-xl hover:bg-[rgba(61,220,132,.2)] transition-all"
                                >
                                    Actualizar diagnóstico →
                                </button>
                            </div>
                        ) : null}

                        {pesoChartData && (
                            <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[#7D8590] text-xs font-bold tracking-widest">TENDENCIA DE PESO</p>
                                    <span
                                        className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0D1117]"
                                        style={{ color: pesoChartData.tendencia.color }}
                                    >
                                        {pesoChartData.tendencia.label}
                                    </span>
                                </div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <LineChart
                                        data={pesoChartData.data}
                                        margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                                    >
                                        <XAxis
                                            dataKey="fecha"
                                            tick={{ fontSize: 10, fill: "#7D8590" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={PesoTooltip} />
                                        <Line
                                            type="monotone"
                                            dataKey="peso"
                                            stroke="#3DDC84"
                                            strokeWidth={2}
                                            dot={false}
                                            connectNulls
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="proyeccion"
                                            stroke="#3DDC84"
                                            strokeWidth={1.5}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            connectNulls
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-0.5 rounded-full" style={{ background: "#3DDC84" }} />
                                        <span className="text-[10px] text-[#7D8590]">Peso real</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-0.5" style={{ background: "repeating-linear-gradient(90deg,#3DDC84 0,#3DDC84 4px,transparent 4px,transparent 8px)" }} />
                                        <span className="text-[10px] text-[#7D8590]">Proyección</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* History list — unchanged */}
                {metricas.length > 0 && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <h3 className="text-white font-bold font-display text-sm mb-4">Historial de registros</h3>
                        <div className="flex flex-col divide-y divide-[#2D3748]">
                            {metricas.map((m, i) => (
                                <div key={m.fecha} className="flex items-center gap-4 py-3 text-sm flex-wrap">
                                    <span className="text-[#7D8590] text-xs w-20 flex-shrink-0">
                                        {new Date(m.fecha + "T00:00:00").toLocaleDateString("es-MX", {
                                            day: "numeric", month: "short",
                                        })}
                                    </span>
                                    {m.peso != null && (
                                        <span className="text-white font-semibold">{m.peso} kg</span>
                                    )}
                                    {m.porcentaje_grasa != null && (
                                        <span className="text-[#7D8590]">Grasa: {m.porcentaje_grasa}%</span>
                                    )}
                                    {m.porcentaje_musculo != null && (
                                        <span className="text-[#7D8590]">Músculo: {m.porcentaje_musculo}%</span>
                                    )}
                                    {i === 0 && (
                                        <span className="ml-auto text-[10px] bg-[rgba(61,220,132,.12)] text-[#3DDC84] font-bold px-2 py-0.5 rounded-full">
                                            ACTUAL
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
}

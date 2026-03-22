// src/pages/Diagnostico.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

// ── Definición de los 24 pasos ─────────────────────────────────────────
const PASOS = [
    // BLOQUE 1: Biométricos
    {
        bloque: "Datos básicos",
        emoji: "📏",
        pregunta: "¿Cuántos años tienes?",
        campo: "edad",
        tipo: "numero",
        placeholder: "25",
        min: 14, max: 80,
    },
    {
        bloque: "Datos básicos",
        emoji: "⚖️",
        pregunta: "¿Cuánto pesas actualmente?",
        campo: "peso_kg",
        tipo: "numero",
        placeholder: "70",
        sufijo: "kg",
        min: 30, max: 300,
    },
    {
        bloque: "Datos básicos",
        emoji: "📐",
        pregunta: "¿Cuánto mides?",
        campo: "estatura_cm",
        tipo: "numero",
        placeholder: "170",
        sufijo: "cm",
        min: 100, max: 250,
    },
    {
        bloque: "Datos básicos",
        emoji: "🧬",
        pregunta: "¿Cuál es tu sexo biológico?",
        campo: "sexo",
        tipo: "opciones",
        opciones: [
            { valor: "masculino", etiqueta: "Masculino", emoji: "♂️" },
            { valor: "femenino", etiqueta: "Femenino", emoji: "♀️" },
            { valor: "otro", etiqueta: "Prefiero no decirlo", emoji: "—" },
        ],
    },

    // BLOQUE 2: Objetivo
    {
        bloque: "Tu objetivo",
        emoji: "🎯",
        pregunta: "¿Cuál es tu objetivo principal?",
        campo: "objetivo",
        tipo: "opciones",
        opciones: [
            { valor: "perder_peso", etiqueta: "Perder peso", emoji: "📉" },
            { valor: "ganar_masa_muscular", etiqueta: "Ganar masa muscular", emoji: "💪" },
            { valor: "bajar_grasa", etiqueta: "Bajar % de grasa", emoji: "🔥" },
            { valor: "peso_ideal", etiqueta: "Alcanzar peso ideal", emoji: "⚖️" },
            { valor: "subir_peso", etiqueta: "Subir de peso", emoji: "📈" },
        ],
    },
    {
        bloque: "Tu objetivo",
        emoji: "💬",
        pregunta: "¿Por qué quieres lograr este objetivo? (tu motivación personal)",
        campo: "meta_personal",
        tipo: "texto_largo",
        placeholder: "Ej: Quiero verme bien para mi boda en junio y sentirme con más energía...",
    },
    {
        bloque: "Tu objetivo",
        emoji: "💼",
        pregunta: "¿Cuál es tu ocupación principal?",
        campo: "ocupacion",
        tipo: "texto",
        placeholder: "Ej: Estudiante, oficinista, maestro...",
    },

    // BLOQUE 3: Actividad física
    {
        bloque: "Actividad física",
        emoji: "🏃",
        pregunta: "¿Cuál es tu nivel de actividad física general?",
        campo: "nivel_actividad",
        tipo: "opciones",
        opciones: [
            { valor: "sedentario", etiqueta: "Sedentario", emoji: "🛋️", desc: "Trabajo de escritorio, poco o nada de ejercicio" },
            { valor: "ligeramente_activo", etiqueta: "Ligeramente activo", emoji: "🚶", desc: "Ejercicio ligero 1-3 días/semana" },
            { valor: "moderadamente_activo", etiqueta: "Moderadamente activo", emoji: "🚴", desc: "Ejercicio moderado 3-5 días/semana" },
            { valor: "muy_activo", etiqueta: "Muy activo", emoji: "🏋️", desc: "Ejercicio intenso 6-7 días/semana" },
            { valor: "extremadamente_activo", etiqueta: "Extremadamente activo", emoji: "🏆", desc: "Atleta o trabajo físico muy intenso" },
        ],
        grande: true,
    },
    {
        bloque: "Actividad física",
        emoji: "📅",
        pregunta: "¿Cuántos días a la semana haces ejercicio?",
        campo: "dias_ejercicio",
        tipo: "slider",
        min: 0, max: 7,
    },
    {
        bloque: "Actividad física",
        emoji: "🏊",
        pregunta: "¿Qué tipo de ejercicio practicas? (puedes elegir varios)",
        campo: "tipo_ejercicio",
        tipo: "multiselect",
        opciones: [
            { valor: "pesas", etiqueta: "Pesas / gimnasio", emoji: "🏋️" },
            { valor: "cardio", etiqueta: "Cardio", emoji: "🏃" },
            { valor: "futbol", etiqueta: "Fútbol", emoji: "⚽" },
            { valor: "natacion", etiqueta: "Natación", emoji: "🏊" },
            { valor: "yoga", etiqueta: "Yoga / pilates", emoji: "🧘" },
            { valor: "ciclismo", etiqueta: "Ciclismo", emoji: "🚴" },
            { valor: "artes_marciales", etiqueta: "Artes marciales", emoji: "🥊" },
            { valor: "ninguno", etiqueta: "Ninguno", emoji: "—" },
        ],
    },

    // BLOQUE 4: Hábitos alimenticios
    {
        bloque: "Hábitos alimenticios",
        emoji: "🍽️",
        pregunta: "¿Cuántas veces comes al día normalmente?",
        campo: "comidas_por_dia",
        tipo: "opciones",
        opciones: [
            { valor: "2", etiqueta: "2 veces", emoji: "2️⃣" },
            { valor: "3", etiqueta: "3 veces", emoji: "3️⃣" },
            { valor: "4", etiqueta: "4 veces", emoji: "4️⃣" },
            { valor: "5", etiqueta: "5 o más", emoji: "5️⃣" },
        ],
    },
    {
        bloque: "Hábitos alimenticios",
        emoji: "🌅",
        pregunta: "¿A qué hora haces tu primera comida del día?",
        campo: "horario_primer_comida",
        tipo: "hora",
    },
    {
        bloque: "Hábitos alimenticios",
        emoji: "🌙",
        pregunta: "¿A qué hora haces tu última comida del día?",
        campo: "horario_ultima_comida",
        tipo: "hora",
    },
    {
        bloque: "Hábitos alimenticios",
        emoji: "✅",
        pregunta: "¿Qué alimentos te gustan o consumes con frecuencia? (puedes elegir varios)",
        campo: "preferencias_comida",
        tipo: "multiselect",
        opciones: [
            { valor: "pollo", etiqueta: "Pollo", emoji: "🍗" },
            { valor: "res", etiqueta: "Res / carne", emoji: "🥩" },
            { valor: "pescado", etiqueta: "Pescado", emoji: "🐟" },
            { valor: "huevo", etiqueta: "Huevo", emoji: "🥚" },
            { valor: "verduras", etiqueta: "Verduras", emoji: "🥦" },
            { valor: "frutas", etiqueta: "Frutas", emoji: "🍎" },
            { valor: "legumbres", etiqueta: "Frijoles / legumbres", emoji: "🫘" },
            { valor: "lacteos", etiqueta: "Lácteos", emoji: "🥛" },
            { valor: "arroz_pasta", etiqueta: "Arroz / pasta", emoji: "🍚" },
        ],
    },
    {
        bloque: "Hábitos alimenticios",
        emoji: "❌",
        pregunta: "¿Hay alimentos que NO te gustan o no consumes? (puedes elegir varios)",
        campo: "alimentos_no_gustados",
        tipo: "multiselect",
        opciones: [
            { valor: "mariscos", etiqueta: "Mariscos", emoji: "🦐" },
            { valor: "cerdo", etiqueta: "Cerdo", emoji: "🐷" },
            { valor: "picante", etiqueta: "Picante", emoji: "🌶️" },
            { valor: "cebolla", etiqueta: "Cebolla", emoji: "🧅" },
            { valor: "cilantro", etiqueta: "Cilantro", emoji: "🌿" },
            { valor: "higado", etiqueta: "Vísceras", emoji: "—" },
            { valor: "ninguno", etiqueta: "Me gusta todo", emoji: "😋" },
        ],
    },

    // BLOQUE 5: Restricciones médicas
    {
        bloque: "Salud y restricciones",
        emoji: "🌾",
        pregunta: "¿Tienes alguna alergia o intolerancia alimentaria?",
        campo: "alergias",
        tipo: "multiselect",
        opciones: [
            { valor: "gluten", etiqueta: "Gluten / trigo", emoji: "🌾" },
            { valor: "lactosa", etiqueta: "Lactosa", emoji: "🥛" },
            { valor: "nueces", etiqueta: "Nueces / frutos secos", emoji: "🥜" },
            { valor: "mariscos", etiqueta: "Mariscos", emoji: "🦐" },
            { valor: "soya", etiqueta: "Soya", emoji: "🫘" },
            { valor: "ninguna", etiqueta: "Ninguna", emoji: "✅" },
        ],
    },
    {
        bloque: "Salud y restricciones",
        emoji: "💊",
        pregunta: "¿Tienes alguna condición médica diagnosticada?",
        campo: "enfermedades",
        tipo: "multiselect",
        opciones: [
            { valor: "diabetes", etiqueta: "Diabetes", emoji: "🩸" },
            { valor: "hipertension", etiqueta: "Hipertensión", emoji: "❤️" },
            { valor: "hipotiroidismo", etiqueta: "Hipotiroidismo", emoji: "🦋" },
            { valor: "colesterol_alto", etiqueta: "Colesterol alto", emoji: "⚡" },
            { valor: "sop", etiqueta: "SOP", emoji: "🔵" },
            { valor: "gastritis", etiqueta: "Gastritis / colitis", emoji: "🫃" },
            { valor: "ninguna", etiqueta: "Ninguna", emoji: "✅" },
        ],
    },
    {
        bloque: "Salud y restricciones",
        emoji: "💉",
        pregunta: "¿Tomas actualmente algún medicamento o suplemento?",
        campo: "medicamentos",
        tipo: "texto_largo",
        placeholder: "Ej: Metformina 500mg, Vitamina D, Creatina... (escribe 'ninguno' si no tomas nada)",
    },

    // BLOQUE 6: Economía
    {
        bloque: "Presupuesto",
        emoji: "💰",
        pregunta: "¿Cuánto dinero puedes destinar a tu alimentación cada 15 días?",
        campo: "presupuesto_quincenal",
        tipo: "opciones",
        opciones: [
            { valor: "500", etiqueta: "Menos de $500", emoji: "💵" },
            { valor: "1000", etiqueta: "$500 – $1,000", emoji: "💵💵" },
            { valor: "1500", etiqueta: "$1,000 – $1,500", emoji: "💵💵💵" },
            { valor: "2000", etiqueta: "$1,500 – $2,000", emoji: "💰" },
            { valor: "3000", etiqueta: "Más de $2,000", emoji: "💰💰" },
        ],
    },

    // BLOQUE 7: Estilo de vida
    {
        bloque: "Estilo de vida",
        emoji: "💧",
        pregunta: "¿Cuántos vasos de agua tomas aproximadamente al día?",
        campo: "vasos_agua",
        tipo: "opciones",
        opciones: [
            { valor: "2", etiqueta: "1-2 vasos", emoji: "🥤" },
            { valor: "4", etiqueta: "3-4 vasos", emoji: "🥤🥤" },
            { valor: "6", etiqueta: "5-6 vasos", emoji: "💧" },
            { valor: "8", etiqueta: "7-8 vasos", emoji: "💧💧" },
            { valor: "10", etiqueta: "Más de 8", emoji: "🏊" },
        ],
    },
    {
        bloque: "Estilo de vida",
        emoji: "😴",
        pregunta: "¿Cuántas horas duermes en promedio cada noche?",
        campo: "horas_sueno",
        tipo: "opciones",
        opciones: [
            { valor: "5", etiqueta: "Menos de 6h", emoji: "😵" },
            { valor: "6", etiqueta: "6 horas", emoji: "😪" },
            { valor: "7", etiqueta: "7 horas", emoji: "😴" },
            { valor: "8", etiqueta: "8 horas", emoji: "😊" },
            { valor: "9", etiqueta: "9 o más horas", emoji: "🌙" },
        ],
    },
    {
        bloque: "Estilo de vida",
        emoji: "🍺",
        pregunta: "¿Consumes alcohol con frecuencia?",
        campo: "consume_alcohol",
        tipo: "opciones",
        opciones: [
            { valor: "nunca", etiqueta: "Nunca", emoji: "🚫" },
            { valor: "ocasional", etiqueta: "Ocasionalmente", emoji: "🥂" },
            { valor: "fines", etiqueta: "Fines de semana", emoji: "🍻" },
            { valor: "frecuente", etiqueta: "Varias veces/semana", emoji: "⚠️" },
        ],
    },
    {
        bloque: "Estilo de vida",
        emoji: "🧘",
        pregunta: "¿Cómo describirías tu nivel de estrés actual?",
        campo: "nivel_estres",
        tipo: "opciones",
        opciones: [
            { valor: "bajo", etiqueta: "Bajo", emoji: "😌" },
            { valor: "medio", etiqueta: "Moderado", emoji: "😐" },
            { valor: "alto", etiqueta: "Alto", emoji: "😤" },
            { valor: "muy_alto", etiqueta: "Muy alto", emoji: "😩" },
        ],
    },
    {
        bloque: "Estilo de vida",
        emoji: "🚗",
        pregunta: "¿Cuánto tiempo libre tienes para preparar tus comidas al día?",
        campo: "tiempo_cocina",
        tipo: "opciones",
        opciones: [
            { valor: "15", etiqueta: "Menos de 15 min", emoji: "⚡" },
            { valor: "30", etiqueta: "15-30 min", emoji: "🕐" },
            { valor: "45", etiqueta: "30-45 min", emoji: "🕑" },
            { valor: "60", etiqueta: "Más de 45 min", emoji: "👨‍🍳" },
        ],
    },
];

const TOTAL = PASOS.length; // 24

export default function Diagnostico() {
    const { session, recargarPerfil } = useAuth();
    const navigate = useNavigate();

    const [paso, setPaso] = useState(0);
    const [respuestas, setResp] = useState({});
    const [error, setError] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const pregunta = PASOS[paso];
    const valor = respuestas[pregunta.campo];
    const progreso = Math.round(((paso) / TOTAL) * 100);

    // ── Handlers ──────────────────────────────────────────────────────────
    const setValor = (v) => {
        setError(null);
        setResp((r) => ({ ...r, [pregunta.campo]: v }));
    };

    const toggleMulti = (v) => {
        const actual = respuestas[pregunta.campo] ?? [];
        // Si elige "ninguno/ninguna", limpia los demás
        if (v === "ninguno" || v === "ninguna") {
            setValor([v]);
            return;
        }
        const sinNinguno = actual.filter((x) => x !== "ninguno" && x !== "ninguna");
        const existe = sinNinguno.includes(v);
        setValor(existe ? sinNinguno.filter((x) => x !== v) : [...sinNinguno, v]);
    };

    const validar = () => {
        if (pregunta.tipo === "multiselect") return (valor ?? []).length > 0;
        if (pregunta.tipo === "slider") return valor !== undefined && valor !== null;
        return !!valor && String(valor).trim() !== "";
    };

    const avanzar = () => {
        if (!validar()) { setError("Por favor responde esta pregunta para continuar."); return; }
        if (paso < TOTAL - 1) { setPaso((p) => p + 1); setError(null); }
        else { guardar(); }
    };

    const retroceder = () => { if (paso > 0) { setPaso((p) => p - 1); setError(null); } };

    // ── Guardar en Supabase ───────────────────────────────────────────────
    const guardar = async () => {
        setGuardando(true);
        const tieneEnfermedad =
            (respuestas.enfermedades ?? []).some((e) => e !== "ninguna");

        // Solo campos que existen en el schema de diagnosticos.
        // Los demás campos del formulario (meta_personal, ocupacion, tipo_ejercicio, etc.)
        // se pasan completos a la Edge Function via navigate state.
        const datos = {
            perfil_id: session.user.id,          // era usuario_id — corregido
            acepto_terminos: true,
            peso: Number(respuestas.peso_kg) || null,
            estatura: Number(respuestas.estatura_cm) || null,
            edad: Number(respuestas.edad) || null,
            sexo: respuestas.sexo ?? null,
            objetivo: respuestas.objetivo ?? null,
            nivel_actividad: respuestas.nivel_actividad ?? null,
            habitos_alimenticios: respuestas.preferencias_comida?.join(", ") ?? null,
            restricciones_medicas: respuestas.medicamentos ?? null,
            alergias: respuestas.alergias ?? [],
            enfermedades: respuestas.enfermedades ?? [],
            presupuesto_quincenal: Number(respuestas.presupuesto_quincenal) || null,
        };

        const { error: dbError } = await supabase
            .from("diagnosticos")
            .insert(datos);

        if (dbError) {
            setError("Error al guardar. Intenta de nuevo.");
            setGuardando(false);
            return;
        }

        // NO llamar actualizarPerfil({ diagnostico_completado: true })
        // El trigger on_diagnostico_created lo hace automáticamente en Postgres.
        //
        // recargarPerfil() llama cargarPerfil() + setPerfil() para que el contexto
        // refleje diagnostico_completado=true y acepto_terminos=true.
        // CRÍTICO: este await debe ir ANTES de navigate().
        // Si se invierte el orden, PrivateRoute de /generando-plan ve
        // aceptoTerminos=false y redirige a /terminos (loop infinito).
        const recargado = await recargarPerfil();
        if (!recargado) {
            setError("Error al actualizar tu sesión. Por favor intenta de nuevo.");
            setGuardando(false);
            return;
        }

        navigate("/generando-plan", {
            replace: true,
            state: { respuestas, tieneEnfermedad },
        });
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center px-4 py-8 font-sans">

            {/* Barra de progreso */}
            <div className="w-full max-w-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#7D8590] font-semibold tracking-wide">
                        {pregunta.bloque.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#3DDC84] font-bold font-display">
                        {paso + 1} / {TOTAL}
                    </span>
                </div>
                <div className="h-1.5 bg-[#1C2330] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#3DDC84] to-[#58A6FF] rounded-full transition-all duration-500"
                        style={{ width: `${progreso}%` }}
                    />
                </div>
            </div>

            {/* Tarjeta de pregunta */}
            <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-xl p-8 flex flex-col gap-6">

                {/* Pregunta */}
                <div>
                    <span className="text-4xl block mb-3">{pregunta.emoji}</span>
                    <h2 className="text-white text-xl font-bold leading-snug font-display">
                        {pregunta.pregunta}
                    </h2>
                </div>

                {/* Input según tipo */}
                {pregunta.tipo === "numero" && (
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min={pregunta.min}
                            max={pregunta.max}
                            placeholder={pregunta.placeholder}
                            value={valor ?? ""}
                            onChange={(e) => setValor(e.target.value)}
                            className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-lg w-40 outline-none focus:border-[#3DDC84] transition-colors"
                        />
                        {pregunta.sufijo && (
                            <span className="text-[#7D8590] text-base">{pregunta.sufijo}</span>
                        )}
                    </div>
                )}

                {pregunta.tipo === "texto" && (
                    <input
                        type="text"
                        placeholder={pregunta.placeholder}
                        value={valor ?? ""}
                        onChange={(e) => setValor(e.target.value)}
                        className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm w-full outline-none focus:border-[#3DDC84] transition-colors"
                    />
                )}

                {pregunta.tipo === "texto_largo" && (
                    <textarea
                        placeholder={pregunta.placeholder}
                        value={valor ?? ""}
                        onChange={(e) => setValor(e.target.value)}
                        rows={3}
                        className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm w-full outline-none focus:border-[#3DDC84] transition-colors resize-none"
                    />
                )}

                {pregunta.tipo === "hora" && (
                    <input
                        type="time"
                        value={valor ?? ""}
                        onChange={(e) => setValor(e.target.value)}
                        className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-lg w-40 outline-none focus:border-[#3DDC84] transition-colors"
                    />
                )}

                {pregunta.tipo === "slider" && (
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-xs text-[#7D8590]">
                            <span>{pregunta.min} días</span>
                            <span className="text-[#3DDC84] font-bold text-base">
                                {valor ?? pregunta.min} días
                            </span>
                            <span>{pregunta.max} días</span>
                        </div>
                        <input
                            type="range"
                            min={pregunta.min}
                            max={pregunta.max}
                            value={valor ?? pregunta.min}
                            onChange={(e) => setValor(Number(e.target.value))}
                            className="w-full accent-[#3DDC84] cursor-pointer"
                        />
                    </div>
                )}

                {pregunta.tipo === "opciones" && (
                    <div className={`grid gap-3 ${pregunta.grande ? "grid-cols-1" : "grid-cols-2"}`}>
                        {pregunta.opciones.map((op) => (
                            <button
                                key={op.valor}
                                onClick={() => setValor(op.valor)}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all
                  ${valor === op.valor
                                        ? "border-[#3DDC84] bg-[rgba(61,220,132,0.12)] text-white"
                                        : "border-[#2D3748] bg-[#1C2330] text-[#7D8590] hover:border-[#3DDC84] hover:text-white"
                                    }`}
                            >
                                <span className="text-xl">{op.emoji}</span>
                                <div>
                                    <div className="text-sm font-semibold">{op.etiqueta}</div>
                                    {op.desc && <div className="text-xs text-[#7D8590] mt-0.5">{op.desc}</div>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {pregunta.tipo === "multiselect" && (
                    <div className="grid grid-cols-2 gap-2">
                        {pregunta.opciones.map((op) => {
                            const sel = (valor ?? []).includes(op.valor);
                            return (
                                <button
                                    key={op.valor}
                                    onClick={() => toggleMulti(op.valor)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all
                    ${sel
                                            ? "border-[#3DDC84] bg-[rgba(61,220,132,0.12)] text-white"
                                            : "border-[#2D3748] bg-[#1C2330] text-[#7D8590] hover:border-[#3DDC84] hover:text-white"
                                        }`}
                                >
                                    <span>{op.emoji}</span>
                                    <span className="text-sm">{op.etiqueta}</span>
                                    {sel && <span className="ml-auto text-[#3DDC84] text-xs">✓</span>}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <p className="text-[#FF6B6B] text-sm">⚠️ {error}</p>
                )}

                {/* Navegación */}
                <div className="flex gap-3 pt-2">
                    {paso > 0 && (
                        <button
                            onClick={retroceder}
                            className="px-5 py-3 rounded-xl border border-[#2D3748] text-[#7D8590] text-sm hover:border-[#3DDC84] hover:text-white transition-all"
                        >
                            ← Atrás
                        </button>
                    )}
                    <button
                        onClick={avanzar}
                        disabled={guardando}
                        className="flex-1 py-3 rounded-xl bg-[#3DDC84] text-black font-bold font-display text-sm tracking-wide hover:bg-[#5EF0A0] transition-all disabled:opacity-60"
                    >
                        {guardando
                            ? "Guardando..."
                            : paso === TOTAL - 1
                                ? "Generar mi plan nutricional 🚀"
                                : "Continuar →"}
                    </button>
                </div>
            </div>
        </div>
    );
}
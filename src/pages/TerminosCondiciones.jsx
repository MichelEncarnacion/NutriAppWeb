// src/pages/TerminosCondiciones.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function TerminosCondiciones() {
    const navigate = useNavigate();
    const { session } = useAuth();
    const [aceptado, setAceptado] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const handleAceptar = async () => {
        if (!aceptado || !session) return;
        setGuardando(true);
        await supabase.from("diagnosticos").upsert(
            { perfil_id: session.user.id, acepto_terminos: true },
            { onConflict: "perfil_id" }
        );
        setGuardando(false);
        navigate("/diagnostico", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4 py-10 font-sans">
            <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-2xl flex flex-col gap-6 overflow-hidden">

                {/* Header */}
                <div className="bg-[#1C2330] px-8 py-6 border-b border-[#2D3748]">
                    <span className="text-[#3DDC84] font-black text-2xl font-display block mb-1">NutriiApp</span>
                    <h1 className="text-white text-xl font-bold">Términos y Condiciones de Uso</h1>
                    <p className="text-[#7D8590] text-sm mt-1">Última actualización: Febrero 2026</p>
                </div>

                {/* Contenido scrolleable */}
                <div className="px-8 max-h-[50vh] overflow-y-auto flex flex-col gap-5 text-sm text-[#7D8590] leading-relaxed scrollbar-thin">

                    {[
                        ["1. Propósito de NutriiApp",
                            "NutriiApp es una aplicación de orientación nutricional diseñada para personas clínicamente sanas que desean mejorar su alimentación. No sustituye la consulta médica ni el diagnóstico profesional. El contenido generado por inteligencia artificial tiene carácter informativo y orientativo."],
                        ["2. Límites de responsabilidad",
                            "NutriiApp no es responsable por decisiones alimentarias tomadas sin supervisión médica. Si el usuario padece alguna enfermedad crónica, metabólica o de cualquier índole, debe consultar a un médico o nutriólogo certificado antes de iniciar cualquier plan nutricional. Al aceptar estos términos, el usuario reconoce que NutriiApp actúa como herramienta de apoyo y no como proveedor de servicios médicos."],
                        ["3. Uso del plan nutricional",
                            "El plan generado por NutriiApp está basado en las respuestas proporcionadas por el usuario en el formulario de diagnóstico. La precisión del plan depende de la veracidad de dicha información. NutriiApp no puede garantizar resultados específicos de pérdida de peso, ganancia muscular o mejora en indicadores de salud."],
                        ["4. Privacidad y datos personales",
                            "Los datos biométricos y de salud recopilados (peso, talla, edad, condiciones médicas, entre otros) son utilizados exclusivamente para personalizar el plan nutricional del usuario. NutriiApp no vende, comparte ni transfiere estos datos a terceros sin consentimiento explícito. Los datos son almacenados de forma segura con cifrado en reposo y en tránsito."],
                        ["5. Propiedad intelectual",
                            "Los planes nutricionales, lecciones y contenido generado dentro de NutriiApp son propiedad de NutriiApp. Queda prohibida su reproducción, distribución o venta sin autorización expresa por escrito. Las capturas de pantalla del plan nutricional están deshabilitadas para proteger el contenido."],
                        ["6. Modificaciones al servicio",
                            "NutriiApp se reserva el derecho de modificar, suspender o discontinuar cualquier funcionalidad del servicio en cualquier momento. Los cambios sustanciales en estos términos serán notificados al usuario con al menos 15 días de anticipación."],
                        ["7. Aceptación",
                            "Al marcar la casilla de aceptación y continuar, el usuario declara haber leído, entendido y aceptado en su totalidad los presentes Términos y Condiciones, así como la Política de Privacidad de NutriiApp."],
                    ].map(([titulo, texto]) => (
                        <div key={titulo}>
                            <h3 className="text-white font-semibold mb-1">{titulo}</h3>
                            <p>{texto}</p>
                        </div>
                    ))}
                </div>

                {/* Footer con checkbox y botón */}
                <div className="px-8 pb-8 flex flex-col gap-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={aceptado}
                            onChange={(e) => setAceptado(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-[#3DDC84] cursor-pointer"
                        />
                        <span className="text-sm text-[#7D8590] group-hover:text-[#E6EDF3] transition-colors">
                            He leído y acepto los Términos y Condiciones y la Política de Privacidad de NutriiApp.
                        </span>
                    </label>

                    <button
                        onClick={handleAceptar}
                        disabled={!aceptado || guardando}
                        className={`w-full py-3 rounded-xl font-bold font-display text-sm tracking-wide transition-all
              ${aceptado && !guardando
                                ? "bg-[#3DDC84] text-black hover:bg-[#5EF0A0] cursor-pointer"
                                : "bg-[#1C2330] text-[#7D8590] cursor-not-allowed border border-[#2D3748]"
                            }`}
                    >
                        {guardando ? "Guardando..." : "Aceptar y continuar →"}
                    </button>
                </div>
            </div>
        </div>
    );
}
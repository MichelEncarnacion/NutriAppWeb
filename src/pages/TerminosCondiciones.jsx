// src/pages/TerminosCondiciones.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
                    <p className="text-[#7D8590] text-sm mt-1">Última actualización: Marzo 2026 · Versión 1.0</p>
                </div>

                {/* Contenido scrolleable */}
                <div className="px-8 max-h-[50vh] overflow-y-auto flex flex-col gap-5 text-sm text-[#7D8590] leading-relaxed scrollbar-thin">

                    <p className="text-[#7D8590] text-xs italic">
                        Por favor lee con atención estos Términos y Condiciones antes de usar NutriiApp. Al acceder o usar el servicio, aceptas quedar vinculado por estos términos.
                    </p>

                    {[
                        ["1. Descripción del servicio",
                            "NutriiApp es una plataforma digital de orientación nutricional que utiliza inteligencia artificial para generar planes de alimentación personalizados basados en las respuestas del usuario. El servicio está disponible en versiones Freemium, Demo y Premium. NutriiApp opera bajo las leyes de los Estados Unidos Mexicanos y tiene su domicilio en Puebla, México."],
                        ["2. Carácter informativo — No es un servicio médico",
                            "NutriiApp NO es un servicio médico, clínico ni terapéutico. Los planes nutricionales generados tienen carácter estrictamente informativo y orientativo. No sustituyen la consulta, el diagnóstico ni el tratamiento de un médico, nutriólogo o profesional de la salud certificado. Si el usuario padece diabetes, hipertensión, obesidad mórbida, trastornos alimentarios u otras condiciones médicas, debe obtener autorización de su médico antes de iniciar cualquier cambio en su alimentación."],
                        ["3. Condiciones de uso",
                            "El usuario debe ser mayor de 18 años o contar con supervisión de un tutor legal. El usuario se compromete a proporcionar información veraz y actualizada en el cuestionario de diagnóstico. El uso de NutriiApp está prohibido para fines comerciales, de reventa o distribución de los planes generados. Queda prohibido el uso de bots, scripts o cualquier medio automatizado para acceder al servicio."],
                        ["4. Exactitud y limitaciones del plan nutricional",
                            "El plan nutricional se genera con base exclusiva en las respuestas del cuestionario. NutriiApp no garantiza resultados específicos de pérdida de peso, ganancia muscular, mejora metabólica ni ningún otro indicador de salud. Los valores calóricos y de macronutrientes son estimaciones. La respuesta fisiológica varía entre personas. El usuario asume la responsabilidad de adaptar el plan a sus condiciones reales con supervisión profesional cuando sea necesario."],
                        ["5. Datos personales y privacidad",
                            "El tratamiento de los datos personales del usuario, incluyendo datos biométricos y de salud, se rige por nuestra Política de Privacidad, la cual forma parte integrante de estos Términos. Los datos son tratados conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México. El usuario puede consultar, rectificar, cancelar u oponerse al tratamiento de sus datos (Derechos ARCO) en cualquier momento."],
                        ["6. Propiedad intelectual",
                            "Todo el contenido de NutriiApp —incluyendo lecciones, planes, interfaces, logotipos y código— es propiedad de NutriiApp o sus licenciantes, protegido por las leyes de propiedad intelectual aplicables. Queda prohibida la reproducción, distribución, modificación o venta de cualquier contenido sin autorización expresa por escrito."],
                        ["7. Planes y pagos",
                            "Los planes de suscripción Premium están sujetos a precios y condiciones publicados en la aplicación en el momento de la contratación. NutriiApp se reserva el derecho de modificar precios con previo aviso de 15 días. Las cancelaciones proceden conforme a la política de reembolso vigente publicada en la aplicación. En versión Freemium, la generación de planes está limitada a 1 por mes."],
                        ["8. Limitación de responsabilidad",
                            "NutriiApp, sus directores, empleados y colaboradores no serán responsables por daños directos, indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso del servicio, incluyendo sin limitación: daños a la salud derivados del seguimiento del plan sin supervisión médica, pérdida de datos, o interrupciones del servicio. La responsabilidad máxima de NutriiApp ante el usuario no excederá el importe pagado por el usuario en los últimos 3 meses."],
                        ["9. Modificaciones al servicio y a los términos",
                            "NutriiApp se reserva el derecho de modificar, suspender o discontinuar el servicio o cualquiera de sus funcionalidades en cualquier momento. Los cambios sustanciales a estos Términos serán notificados al usuario por correo electrónico o mediante aviso dentro de la aplicación con al menos 15 días naturales de anticipación. El uso continuado del servicio después de dicho plazo constituye aceptación de los cambios."],
                        ["10. Ley aplicable y jurisdicción",
                            "Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia derivada del uso del servicio, las partes acuerdan someterse a la jurisdicción de los tribunales competentes de la ciudad de Puebla de Zaragoza, Puebla, México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro."],
                        ["11. Contacto",
                            "Para cualquier consulta, queja o ejercicio de derechos, puedes contactarnos en: soporte@nutriiapp.mx. Tiempo de respuesta estimado: 5 días hábiles."],
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
                            He leído y acepto los Términos y Condiciones y la{" "}
                            <Link to="/privacidad" target="_blank" className="text-[#58A6FF] hover:underline">
                                Política de Privacidad
                            </Link>{" "}
                            de NutriiApp.
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
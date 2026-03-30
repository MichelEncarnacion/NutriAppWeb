// src/pages/PoliticaPrivacidad.jsx
import { useNavigate } from "react-router-dom";

const SECCIONES = [
    {
        titulo: "1. Responsable del tratamiento",
        texto: "NutriiApp (en adelante, \"NutriiApp\" o \"nosotros\"), con domicilio en Puebla de Zaragoza, Puebla, México, es el responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento. Para contactarnos: soporte@nutriiapp.mx",
    },
    {
        titulo: "2. Datos personales que recopilamos",
        items: [
            "Datos de identificación: nombre, correo electrónico.",
            "Datos biométricos y de salud: peso, estatura, edad, sexo, nivel de actividad física, objetivo de salud.",
            "Datos médicos (voluntarios): condiciones de salud diagnosticadas, alergias, intolerancias alimentarias.",
            "Datos de uso: interacciones con la aplicación, lecciones completadas, registro de alimentos.",
            "Datos técnicos: dirección IP, tipo de dispositivo, sistema operativo (recopilados automáticamente).",
        ],
    },
    {
        titulo: "3. Finalidades del tratamiento",
        subtitulo: "Finalidades primarias (necesarias para el servicio):",
        items: [
            "Generar y personalizar su plan nutricional mediante inteligencia artificial.",
            "Gestionar su cuenta, acceso y autenticación.",
            "Enviar comunicaciones de servicio: confirmación de cuenta, recuperación de contraseña, actualizaciones del plan.",
            "Dar seguimiento a su progreso y racha de uso.",
        ],
        subtitulo2: "Finalidades secundarias (requieren su consentimiento):",
        items2: [
            "Enviar comunicaciones de marketing y promociones de NutriiApp.",
            "Realizar análisis estadísticos agregados y anonimizados para mejorar el servicio.",
            "Compartir casos de éxito (siempre con su autorización expresa y sin datos identificables).",
        ],
    },
    {
        titulo: "4. Transferencia de datos a terceros",
        texto: "NutriiApp no vende, arrienda ni comparte sus datos personales con terceros para fines comerciales. Únicamente transferimos datos a:",
        items: [
            "Supabase Inc. (proveedor de infraestructura y base de datos), bajo contrato de procesamiento de datos conforme al GDPR y estándares equivalentes.",
            "Anthropic PBC (proveedor del modelo de IA para generación del plan), exclusivamente con los datos necesarios para personalizar el plan, sin almacenamiento persistente.",
            "Autoridades competentes, cuando así lo requiera la ley mexicana aplicable.",
        ],
    },
    {
        titulo: "5. Derechos ARCO",
        texto: "Conforme a la LFPDPPP, usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales (Derechos ARCO). Para ejercerlos:",
        items: [
            "Envíe su solicitud a: soporte@nutriiapp.mx con el asunto \"Derechos ARCO\".",
            "Incluya: nombre completo, correo registrado, descripción del derecho que desea ejercer y copia de identificación oficial.",
            "Tiempo de respuesta: 20 días hábiles contados a partir de la recepción de la solicitud.",
            "También puede cancelar su cuenta directamente desde la sección Perfil de la aplicación, lo que eliminará sus datos del sistema en un plazo de 30 días.",
        ],
    },
    {
        titulo: "6. Seguridad de los datos",
        texto: "Implementamos medidas técnicas, administrativas y físicas para proteger sus datos personales:",
        items: [
            "Cifrado en tránsito: TLS 1.2+ para todas las comunicaciones.",
            "Cifrado en reposo: los datos sensibles son almacenados cifrados en los servidores de Supabase.",
            "Autenticación segura: tokens JWT con expiración automática y refresco seguro.",
            "Acceso restringido: solo el personal autorizado con necesidad de acceso puede ver datos de usuarios.",
            "Sin almacenamiento de contraseñas en texto claro: usamos el sistema de autenticación de Supabase con bcrypt.",
        ],
    },
    {
        titulo: "7. Retención de datos",
        texto: "Sus datos personales se conservan durante el tiempo que mantenga una cuenta activa en NutriiApp, más un período adicional de 90 días tras la cancelación para fines de resolución de disputas. Los datos anonimizados y agregados (sin posibilidad de reidentificación) pueden conservarse indefinidamente para mejora del servicio.",
    },
    {
        titulo: "8. Cookies y tecnologías de seguimiento",
        texto: "NutriiApp utiliza exclusivamente cookies de sesión estrictamente necesarias para el funcionamiento de la autenticación. No utilizamos cookies de seguimiento publicitario ni compartimos datos de comportamiento con redes de publicidad. La sesión se almacena en localStorage del navegador para permitir el acceso persistente.",
    },
    {
        titulo: "9. Datos de menores de edad",
        texto: "NutriiApp no está dirigida a menores de 18 años. Si eres padre, madre o tutor y crees que un menor ha proporcionado datos personales en nuestra plataforma, contáctanos a soporte@nutriiapp.mx para eliminar dicha información de inmediato.",
    },
    {
        titulo: "10. Cambios a esta política",
        texto: "Podemos actualizar esta Política de Privacidad periódicamente. Los cambios sustanciales serán notificados por correo electrónico o mediante aviso destacado en la aplicación con al menos 15 días de anticipación. La versión vigente siempre estará disponible en /privacidad dentro de la aplicación.",
    },
    {
        titulo: "11. Autoridad de protección de datos",
        texto: "Si considera que sus derechos no han sido atendidos adecuadamente, puede presentar una queja ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI): www.inai.org.mx",
    },
];

export default function PoliticaPrivacidad() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4 py-10 font-sans">
            <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-2xl flex flex-col gap-6 overflow-hidden">

                {/* Header */}
                <div className="bg-[#1C2330] px-8 py-6 border-b border-[#2D3748]">
                    <span className="text-[#3DDC84] font-black text-2xl font-display block mb-1">NutriiApp</span>
                    <h1 className="text-white text-xl font-bold">Política de Privacidad</h1>
                    <p className="text-[#7D8590] text-sm mt-1">
                        Última actualización: Marzo 2026 · Versión 1.0 · Conforme a LFPDPPP (México)
                    </p>
                </div>

                {/* Contenido scrolleable */}
                <div className="px-8 max-h-[60vh] overflow-y-auto flex flex-col gap-5 text-sm text-[#7D8590] leading-relaxed">

                    <p className="text-[#7D8590] text-xs italic">
                        Este aviso de privacidad describe cómo NutriiApp recopila, usa y protege sus datos personales.
                        Al usar NutriiApp, usted acepta las prácticas descritas en este documento.
                    </p>

                    {SECCIONES.map(({ titulo, texto, items, subtitulo, subtitulo2, items2 }) => (
                        <div key={titulo}>
                            <h3 className="text-white font-semibold mb-2">{titulo}</h3>
                            {texto && <p className="mb-2">{texto}</p>}
                            {subtitulo && <p className="text-[#E6EDF3] text-xs font-semibold mb-1">{subtitulo}</p>}
                            {items && (
                                <ul className="flex flex-col gap-1 mb-2">
                                    {items.map((item, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-[#3DDC84] mt-0.5 flex-shrink-0">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {subtitulo2 && <p className="text-[#E6EDF3] text-xs font-semibold mb-1 mt-2">{subtitulo2}</p>}
                            {items2 && (
                                <ul className="flex flex-col gap-1">
                                    {items2.map((item, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-[#58A6FF] mt-0.5 flex-shrink-0">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 flex flex-col gap-3">
                    <div className="p-3 bg-[rgba(61,220,132,0.06)] border border-[rgba(61,220,132,0.15)] rounded-xl text-xs text-[#7D8590] text-center">
                        Para ejercer sus derechos o resolver dudas:{" "}
                        <span className="text-[#3DDC84] font-medium">soporte@nutriiapp.mx</span>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 rounded-xl font-bold font-display text-sm transition-all bg-[#1C2330] text-[#7D8590] hover:text-white border border-[#2D3748] hover:border-[#3DDC84]"
                    >
                        ← Volver
                    </button>
                </div>
            </div>
        </div>
    );
}

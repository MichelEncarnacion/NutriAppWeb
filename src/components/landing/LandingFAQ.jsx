// src/components/landing/LandingFAQ.jsx
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { C } from "./landingTokens";
import { useMotionSafe } from "../../hooks/useMotionSafe";

const FAQS = [
  {
    q: "¿Cuánto cuesta NutriiApp para mi empresa?",
    a: "$28,600 MXN al año para 20 colaboradores, equivalente a $1,430 MXN por persona al año. Somos 50% más baratos que el competidor corporativo más cercano y 65% más económicos que una consulta nutricional tradicional.",
  },
  {
    q: "¿Cómo se calcula el ROI y cuándo veo resultados?",
    a: "El dashboard mide reducción de ausentismo, incremento de productividad y ahorro en servicios médicos. Con un margen bruto del 86.9% y una TIR del 54.6% a 5 años, la inversión en NutriiApp se justifica sola ante el CFO.",
  },
  {
    q: "¿Qué es el NutriiPoint y cómo se instala?",
    a: "NutriiPoint es nuestro dispositivo IoT propio que mide 16+ indicadores corporales por colaborador en menos de 5 minutos. La instalación en tu empresa toma menos de 1 día y no requiere modificaciones de infraestructura.",
  },
  {
    q: "¿Cómo cumple NutriiApp con NOM-030 y NOM-035?",
    a: "NutriiApp tiene cumplimiento nativo con ambas normas. El dashboard genera automáticamente los reportes requeridos por la NOM-030 y NOM-035 con un solo clic. Tu equipo de RR.HH. no tiene que hacer trabajo extra.",
  },
  {
    q: "¿Cuánto tiempo tarda la implementación completa?",
    a: "La instalación del NutriiPoint y la configuración del dashboard toman menos de una semana. Los primeros planes personalizados están disponibles en las primeras 48 horas tras la medición inicial.",
  },
  {
    q: "¿Cómo se protege la información médica de mis colaboradores?",
    a: "Los datos biométricos se almacenan con cifrado de extremo a extremo y nunca se comparten con terceros. Cumplimos con la Ley Federal de Protección de Datos Personales (LFPDPPP) y los datos sensibles están segregados por nivel de acceso.",
  },
];

export default function LandingFAQ() {
  const [expanded, setExpanded] = useState(null);
  const { fadeInUp, stagger } = useMotionSafe();

  return (
    <div id="faq" className="py-16 md:py-24" style={{ background: C.bgMain }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[4fr_7fr] md:gap-20">
          {/* Left — heading pegado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="md:sticky md:top-[100px]">
              <h2
                className="mb-4 text-[1.9rem] font-black leading-[1.2] md:text-[2.3rem]"
                style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Todo lo que necesitas saber antes de agendar
              </h2>
              <p className="text-[0.95rem] leading-[1.7]" style={{ color: C.textMuted }}>
                Si tienes otra pregunta, escríbenos a{" "}
                <a
                  href="mailto:hola@nutriiapp.mx"
                  className="font-semibold hover:underline"
                  style={{ color: C.primary }}
                >
                  hola@nutriiapp.mx
                </a>
              </p>
            </div>
          </motion.div>

          {/* Right — acordeón */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => {
                const isOpen = expanded === i;
                return (
                  <motion.div key={i} variants={fadeInUp}>
                    <div
                      className="overflow-hidden rounded-xl transition-[border-color,box-shadow] duration-200"
                      style={{
                        background: C.bgCard,
                        border:     `1px solid ${isOpen ? C.accent : C.border}`,
                        boxShadow:  isOpen ? C.shadow : "none",
                      }}
                    >
                      <button
                        onClick={() => setExpanded(isOpen ? null : i)}
                        className="flex w-full items-center justify-between gap-3 px-6 py-3 text-left"
                      >
                        <span
                          className="text-[0.95rem] font-bold transition-colors duration-200"
                          style={{ color: isOpen ? C.primary : C.textPrimary }}
                        >
                          {faq.q}
                        </span>
                        {isOpen ? <Minus size={16} color={C.primary} /> : <Plus size={16} color={C.textMuted} />}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <p className="text-[0.9rem] leading-[1.78]" style={{ color: C.textMuted }}>
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

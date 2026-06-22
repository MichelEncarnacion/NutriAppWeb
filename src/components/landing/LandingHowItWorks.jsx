// src/components/landing/LandingHowItWorks.jsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Wifi, Sparkles, Smartphone, TrendingUp } from "lucide-react";
import { C } from "./landingTokens";
import { useMotionSafe } from "../../hooks/useMotionSafe";

const STEPS = [
  {
    num:        "01",
    Icon:       Wifi,
    title:      "Medición con NutriiPoint",
    desc:       "NutriiPoint mide 16+ indicadores biométricos por colaborador en menos de 5 minutos.",
    screenshotBg: "linear-gradient(135deg, #E8F5E9, #A5D6A7)",
    screenshotLabel: "NutriiPoint UI",
    screenshotColor: "#1B5E20",
  },
  {
    num:        "02",
    Icon:       Sparkles,
    title:      "IA genera el plan personalizado",
    desc:       "La IA crea un plan nutricional considerando biomarcadores, alergias, enfermedades y el presupuesto real de cada persona.",
    screenshotBg: "linear-gradient(135deg, #E3F2FD, #90CAF9)",
    screenshotLabel: "IA generando plan",
    screenshotColor: "#1565C0",
  },
  {
    num:        "03",
    Icon:       Smartphone,
    title:      "El colaborador actúa",
    desc:       "Cada colaborador recibe su plan en la app con guías de alimentación, lista de compra y seguimiento diario.",
    screenshotBg: "linear-gradient(135deg, #F3E5F5, #CE93D8)",
    screenshotLabel: "App colaborador",
    screenshotColor: "#6A1B9A",
  },
  {
    num:        "04",
    Icon:       TrendingUp,
    title:      "La empresa mide el impacto",
    desc:       "El dashboard muestra KPIs de salud, productividad y ROI en tiempo real. Reportes NOM-030 y NOM-035 con un clic.",
    screenshotBg: "linear-gradient(135deg, #E8F5E9, #66BB6A)",
    screenshotLabel: "Dashboard RR.HH.",
    screenshotColor: "#1B5E20",
  },
];

function AnimatedConnector() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div
      ref={ref}
      className="absolute top-[26px] left-[12.5%] right-[12.5%] z-0 h-0.5 overflow-hidden"
      style={{ background: C.border }}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={inView ? { width: "100%" } : { width: "0%" }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
        style={{ height: "100%", background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`, borderRadius: 2 }}
      />
    </div>
  );
}

export default function LandingHowItWorks() {
  const { fadeInUp, stagger } = useMotionSafe();
  return (
    <div id="como-funciona" className="py-16 md:py-24" style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}` }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">

        <div className="mb-12 grid grid-cols-1 items-end gap-6 md:grid-cols-2 md:mb-16">
          <h2
            className="text-[1.9rem] font-black leading-[1.2] md:text-[2.6rem]"
            style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            De la medición al ROI
            en cuatro pasos
          </h2>
          <p className="text-base leading-[1.7]" style={{ color: C.textMuted }}>
            Implementación completa en menos de una semana.
            Primeros resultados medibles desde el mes 1.
          </p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Desktop: horizontal con línea conectora animada */}
          <div className="relative hidden grid-cols-4 gap-6 md:grid">
            <AnimatedConnector />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeInUp}
                transition={{ delay: i * 0.15 }}
              >
                <div className="flex h-full flex-col items-center text-center">
                  {/* Ícono con ring */}
                  <div
                    className="relative z-[1] mb-[10px] flex h-14 w-14 items-center justify-center rounded-full transition-shadow duration-300"
                    style={{
                      background: C.primary,
                      boxShadow:  `0 0 0 6px ${C.bgAlt}, 0 0 0 8px #C8E6C9, 0 8px 20px rgba(27,94,32,0.25)`,
                    }}
                  >
                    <step.Icon size={22} color="#fff" />
                  </div>

                  {/* Chip número */}
                  <div className="mb-1 rounded-md px-[6px] py-1" style={{ background: "#E8F5E9" }}>
                    <span className="text-[0.7rem] font-extrabold" style={{ color: C.primary }}>
                      {step.num}
                    </span>
                  </div>

                  <p
                    className="mb-[10px] text-[0.95rem] font-extrabold leading-[1.3]"
                    style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    {step.title}
                  </p>
                  <p className="mb-3 flex-1 text-[0.82rem] leading-[1.7]" style={{ color: C.textMuted }}>
                    {step.desc}
                  </p>

                  {/* Mini screenshot */}
                  <div
                    className="flex h-[52px] w-full items-center justify-center rounded-lg"
                    style={{ background: step.screenshotBg, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                  >
                    <span className="text-[0.72rem] font-bold" style={{ color: step.screenshotColor }}>
                      {step.screenshotLabel}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile: filas */}
          <div className="flex flex-col md:hidden">
            {STEPS.map((step, i) => (
              <motion.div key={step.num} variants={fadeInUp}>
                <div
                  className="flex items-start gap-[10px] py-6"
                  style={{ borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: C.primary, boxShadow: "0 4px 14px rgba(27,94,32,0.25)" }}
                  >
                    <step.Icon size={19} color="#fff" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="rounded px-[6px] py-[2px]" style={{ background: "#E8F5E9" }}>
                        <span className="text-[0.65rem] font-extrabold" style={{ color: C.primary }}>{step.num}</span>
                      </div>
                    </div>
                    <p className="mb-[6px] text-[0.95rem] font-extrabold" style={{ color: C.textPrimary }}>
                      {step.title}
                    </p>
                    <p className="mb-2 text-[0.83rem] leading-[1.7]" style={{ color: C.textMuted }}>
                      {step.desc}
                    </p>
                    <div
                      className="flex h-10 items-center justify-center rounded-md"
                      style={{ background: step.screenshotBg }}
                    >
                      <span className="text-[0.7rem] font-bold" style={{ color: step.screenshotColor }}>
                        {step.screenshotLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

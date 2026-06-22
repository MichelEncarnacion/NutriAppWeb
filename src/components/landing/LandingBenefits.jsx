// src/components/landing/LandingBenefits.jsx
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Stethoscope, BrainCircuit, BarChart3 } from "lucide-react";
import { C } from "./landingTokens";
import { useMotionSafe } from "../../hooks/useMotionSafe";

const PILLARS = [
  {
    Icon:        Stethoscope,
    title:       "Precisión clínica, no estimaciones",
    desc:        "El NutriiPoint mide 16+ indicadores corporales por colaborador: composición corporal, biométricos y biomarcadores reales. La base clínica que ninguna app de bienestar puede igualar.",
    metric:      "16+",
    metricLabel: "indicadores por colaborador",
    progress:    80,
    color:       C.primary,
    iconBg:      "#E8F5E9",
  },
  {
    Icon:        BrainCircuit,
    title:       "IA verdaderamente personalizada",
    desc:        "Nuestro modelo integra biomarcadores, alergias, enfermedades, medicamentos y el presupuesto real de cada persona. No plantillas. No promedios.",
    metric:      "100%",
    metricLabel: "personalizado por persona",
    progress:    100,
    color:       C.primary,
    iconBg:      "#E8F5E9",
  },
  {
    Icon:        BarChart3,
    title:       "ROI medible desde el día uno",
    desc:        "KPIs de productividad, ausentismo y retorno de inversión en tiempo real. Reportes NOM-030 y NOM-035 con un clic, sin trabajo extra para RR.HH.",
    color:       C.gold,
    iconBg:      "#FFF8E1",
  },
];

function ProgressBar({ progress, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="mt-1 h-1 max-w-[180px] overflow-hidden rounded-full"
      style={{ background: "rgba(0,0,0,0.06)" }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${progress}%` } : { width: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        style={{
          height:       "100%",
          background:   color === C.gold
            ? "linear-gradient(90deg, #BF9000, #F9A825)"
            : "linear-gradient(90deg, #1B5E20, #66BB6A)",
          borderRadius: 8,
        }}
      />
    </div>
  );
}

export default function LandingBenefits() {
  const { fadeInUp, stagger } = useMotionSafe();
  return (
    <div className="py-16 md:py-24" style={{ background: C.bgMain }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[5fr_7fr] md:gap-20">
          {/* Left — heading sticky en desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="md:sticky md:top-[100px]">
              {/* Eyebrow label */}
              <div
                className="mb-4 inline-flex items-center rounded-[20px] px-3 py-1"
                style={{ background: "#E8F5E9", border: "1px solid #C8E6C9" }}
              >
                <span className="text-[0.75rem] font-bold" style={{ color: C.primary, letterSpacing: "0.05em" }}>
                  POR QUÉ NUTRIIAPP
                </span>
              </div>

              <h2
                className="mb-5 text-[1.9rem] font-black leading-[1.2] md:text-[2.4rem]"
                style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Tres pilares que hacen única a NutriiApp en el mercado
              </h2>
              <p className="mb-6 text-base leading-[1.75]" style={{ color: C.textMuted }}>
                50% más barato que el competidor corporativo más cercano.
                65% más barato que una consulta nutricional tradicional.
              </p>
            </div>
          </motion.div>

          {/* Right — pilares */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="flex flex-col">
              {PILLARS.map(({ Icon, title, desc, metric, metricLabel, progress, color, iconBg }, i) => (
                <motion.div key={title} variants={fadeInUp}>
                  <motion.div whileHover={{ backgroundColor: "rgba(27,94,32,0.025)" }} style={{ borderRadius: 12 }}>
                    <div
                      className="flex gap-6 px-1 py-7 md:py-8"
                      style={{ borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}
                    >
                      {/* Icon con hover */}
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                        <div
                          className="mt-1 flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl"
                          style={{
                            background: iconBg,
                            boxShadow:  color === C.gold
                              ? "0 4px 14px rgba(191,144,0,0.2)"
                              : "0 4px 14px rgba(27,94,32,0.15)",
                          }}
                        >
                          <Icon size={24} color={color} />
                        </div>
                      </motion.div>

                      <div className="flex-1">
                        <p
                          className="mb-1 text-[1.05rem] font-extrabold leading-[1.3]"
                          style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                        >
                          {title}
                        </p>
                        <p className="mb-4 text-[0.875rem] leading-[1.75]" style={{ color: C.textMuted }}>
                          {desc}
                        </p>

                        {metric && (
                          <>
                            <div className="flex items-baseline gap-[6px]">
                              <span
                                className="text-[1.6rem] font-black leading-none"
                                style={{ color, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                              >
                                {metric}
                              </span>
                              <span className="text-[0.78rem] font-semibold" style={{ color: C.textMuted }}>
                                {metricLabel}
                              </span>
                            </div>
                            {progress && <ProgressBar progress={progress} color={color} />}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

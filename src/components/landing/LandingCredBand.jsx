// src/components/landing/LandingCredBand.jsx
import { motion } from "framer-motion";
import { C } from "./landingTokens";
import { useMotionSafe } from "../../hooks/useMotionSafe";

const STATS = [
  { value: "75%",     label: "de adultos mexicanos vive con sobrepeso u obesidad", source: "ENSANUT 2022" },
  { value: "44 días", label: "de ausentismo promedio al año por enfermedad crónica", source: "IMSS / STPS" },
  { value: "60%",     label: "de productividad perdida por enfermedades crónicas no gestionadas", source: "OIT México" },
];

export default function LandingCredBand() {
  const { fadeInUp, stagger } = useMotionSafe();
  return (
    <div className="py-16 md:py-20" style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}` }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[5fr_7fr] md:gap-16">
            {/* Heading */}
            <motion.div variants={fadeInUp}>
              <h2
                className="text-[1.75rem] font-black leading-[1.25] md:text-[2.1rem]"
                style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                La salud de tu equipo
                impacta directamente
                en tus resultados.
              </h2>
              <p className="mt-4 text-[0.95rem] leading-[1.7]" style={{ color: C.textMuted }}>
                Tres realidades que toda empresa mexicana enfrenta, pero pocas miden.
              </p>
            </motion.div>

            {/* Stats — sin tarjetas, solo números con divisores */}
            <motion.div variants={fadeInUp}>
              <div className="grid grid-cols-3">
                {STATS.map((s, i) => (
                  <div
                    key={s.value}
                    className="px-2 py-2 text-center md:px-3 md:py-0"
                    style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : "none" }}
                  >
                    <p
                      className="mb-2 text-[2rem] font-black leading-none md:text-[2.6rem]"
                      style={{ color: C.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                    >
                      {s.value}
                    </p>
                    <p className="mb-1 text-[0.8rem] leading-[1.6]" style={{ color: C.textMuted }}>
                      {s.label}
                    </p>
                    <p className="text-[0.67rem] font-semibold" style={{ color: C.textLight }}>
                      {s.source}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

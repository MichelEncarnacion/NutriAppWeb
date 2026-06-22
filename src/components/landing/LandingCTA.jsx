// src/components/landing/LandingCTA.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { C } from "./landingTokens";
import { useMotionSafe } from "../../hooks/useMotionSafe";

const HIGHLIGHTS = [
  "Sin compromiso de contrato",
  "Demo personalizada en 24 h",
  "50% más barato que la competencia",
];

const HEADLINE_WORDS = ["¿Listo", "para", "medir", "el", "ROI"];
const HEADLINE_WORDS2 = ["de", "tu", "inversión", "en", "salud?"];

export default function LandingCTA() {
  const navigate = useNavigate();
  const { fadeInUp, stagger, shouldAnimate } = useMotionSafe();

  return (
    <div className="relative overflow-hidden py-[72px] md:py-[104px]" style={{ background: C.ctaGrad }}>
      {/* Radial base */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 50%, rgba(255,255,255,0.05) 0%, transparent 45%), " +
            "radial-gradient(circle at 90% 50%, rgba(255,255,255,0.04) 0%, transparent 45%)",
        }}
      />

      {/* Orbe izquierda */}
      {shouldAnimate && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-[20%] -left-[10%] aspect-square w-[45%] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(165,214,167,0.15), transparent 70%)", filter: "blur(50px)" }}
        />
      )}

      {/* Orbe derecha */}
      {shouldAnimate && (
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="pointer-events-none absolute -bottom-[15%] -right-[8%] aspect-square w-[40%] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(67,160,71,0.12), transparent 70%)", filter: "blur(60px)" }}
        />
      )}

      <div className="relative z-[1] mx-auto max-w-[900px] px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Headline animado por palabras */}
          <motion.div variants={fadeInUp}>
            <div className="mb-4 text-center">
              <h2
                className="text-[2rem] font-black leading-[1.15] md:text-[2.8rem]"
                style={{ color: C.white, fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                <span className="flex flex-wrap justify-center gap-[0.25em]">
                  {HEADLINE_WORDS.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
                <span className="flex flex-wrap justify-center gap-[0.25em]">
                  {HEADLINE_WORDS2.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (HEADLINE_WORDS.length + i) * 0.07, duration: 0.4, ease: "easeOut" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
              </h2>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <p
              className="mx-auto mb-10 max-w-[480px] text-center text-[1.05rem] leading-[1.7]"
              style={{ color: "rgba(255,255,255,0.78)" }}
            >
              $28,600 MXN/año para 20 colaboradores. La inversión más inteligente
              que puedes hacer en productividad corporativa.
            </p>
          </motion.div>

          {/* Botón con shimmer */}
          <motion.div variants={fadeInUp}>
            <div className="mb-8 flex justify-center">
              <div className="relative inline-flex overflow-hidden rounded-xl">
                <button
                  onClick={() => navigate("/demo")}
                  className="relative z-[1] flex items-center gap-2 rounded-xl px-8 py-[14px] text-[1.05rem] font-extrabold transition-shadow"
                  style={{ background: C.white, color: C.primary, boxShadow: "0 6px 28px rgba(0,0,0,0.2)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F0FFF4"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(0,0,0,0.25)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C.white; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.2)"; }}
                >
                  Agendar mi demo gratuita
                  <ArrowRight size={18} />
                </button>
                {/* Shimmer sweep */}
                {shouldAnimate && (
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                    className="pointer-events-none absolute top-0 left-0 z-[2] h-full w-[40%]"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                      transform:  "skewX(-15deg)",
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              {HIGHLIGHTS.map((h) => (
                <div key={h} className="flex items-center gap-2">
                  <CheckCircle2 size={15} color="rgba(255,255,255,0.7)" />
                  <span className="text-[0.83rem] font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {h}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

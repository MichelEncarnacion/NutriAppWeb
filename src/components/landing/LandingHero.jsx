// src/components/landing/LandingHero.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { C } from "./landingTokens";
import { useMotionSafe } from "../../hooks/useMotionSafe";

const TRUST_BADGES = [
  "NOM-030 / NOM-035",
  "IoT propio · NutriiPoint",
  "IA clínica certificada",
];

const EMPLOYEES = [
  { name: "Ana García",    dept: "Finanzas",    score: 87, trend: "+12 pts" },
  { name: "Carlos Méndez", dept: "Operaciones", score: 74, trend: "+8 pts"  },
  { name: "Laura Torres",  dept: "Ventas",      score: 91, trend: "+19 pts" },
];

const KPIS = [
  { label: "Ausentismo",    end: 38, prefix: "−", suffix: "%", sub: "vs. año ant.", color: "#A5D6A7" },
  { label: "Productividad", end: 24, prefix: "+", suffix: "%", sub: "índice gral.", color: "#81C784" },
];

export default function LandingHero() {
  const navigate = useNavigate();
  const { fadeInUp, stagger, floatAnim, shouldAnimate } = useMotionSafe();

  return (
    <div
      className="relative flex min-h-screen items-center overflow-hidden pt-[88px] pb-16 md:pt-20 md:pb-20"
      style={{ background: C.heroGrad }}
    >
      {/* Radial gradients base */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)",
        }}
      />

      {/* Orbe top-right */}
      {shouldAnimate && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-[10%] right-[3%] aspect-square w-[38%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(165,214,167,0.18), transparent 70%)",
            filter:     "blur(50px)",
          }}
        />
      )}

      {/* Orbe bottom-left */}
      {shouldAnimate && (
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="pointer-events-none absolute bottom-[5%] -left-[5%] aspect-square w-[30%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(67,160,71,0.14), transparent 70%)",
            filter:     "blur(60px)",
          }}
        />
      )}

      <div className="relative z-[1] mx-auto max-w-[1200px] px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left column */}
          <motion.div variants={stagger} initial="hidden" animate="visible">

            <motion.div variants={fadeInUp}>
              <h1
                className="mb-6 text-[2.3rem] leading-[1.12] font-black tracking-[-0.01em] md:text-[3rem] lg:text-[3.4rem]"
                style={{ color: C.white, fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Tus colaboradores más sanos.{" "}
                <span
                  className={shouldAnimate ? "animate-[shimmerText_4s_linear_infinite]" : ""}
                  style={{
                    color:                "transparent",
                    backgroundImage:      "linear-gradient(90deg, #A5D6A7, #E8F5E9, #A5D6A7)",
                    backgroundSize:       "200% auto",
                    WebkitBackgroundClip: "text",
                    backgroundClip:       "text",
                  }}
                >
                  Tu empresa más productiva.
                </span>
              </h1>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <p
                className="mb-8 max-w-[500px] text-[1rem] leading-[1.78] md:text-[1.1rem]"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                Medimos a cada colaborador con nuestro propio hardware, generamos un plan
                nutricional con IA y entregamos a RR.HH. un dashboard con KPIs de
                productividad y retorno de inversión reales.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="mb-10 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/demo")}
                  className="flex items-center gap-2 rounded-xl px-7 py-3 text-base font-extrabold transition-shadow"
                  style={{ background: C.white, color: C.primary, boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F0FFF4"; e.currentTarget.style.boxShadow = "0 6px 32px rgba(0,0,0,0.22)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C.white; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.18)"; }}
                >
                  Solicitar demo
                  <ArrowRight size={18} />
                </button>

                <a
                  href="#como-funciona"
                  className="flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold"
                  style={{ color: C.white, border: "1.5px solid rgba(255,255,255,0.4)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                >
                  <PlayCircle size={18} />
                  Ver cómo funciona
                </a>
              </div>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeInUp}>
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck size={14} color="rgba(255,255,255,0.6)" style={{ marginRight: 4 }} />
                {TRUST_BADGES.map((badge, i) => (
                  <div key={badge} className="flex items-center gap-2">
                    {i > 0 && (
                      <span className="mx-1 inline-block h-[3px] w-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.35)" }} />
                    )}
                    <span className="text-[0.78rem] font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right column — dashboard mockup 3D */}
          <motion.div
            initial={{ opacity: 0, x: shouldAnimate ? 40 : 0, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          >
            <div className="relative flex items-center justify-center">
              {/* Glow detrás del mockup */}
              <div
                className="pointer-events-none absolute -inset-[10%]"
                style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.1), transparent 70%)", filter: "blur(30px)" }}
              />

              {/* Dashboard flotante con perspectiva 3D */}
              <motion.div
                {...floatAnim}
                style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}
              >
                <div
                  className="overflow-hidden rounded-[20px]"
                  style={{
                    border:         "1px solid rgba(255,255,255,0.15)",
                    boxShadow:      "0 32px 80px rgba(0,0,0,0.45)",
                    background:     "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(10px)",
                    transform:      "perspective(800px) rotateX(3deg) rotateY(-4deg)",
                  }}
                >
                  {/* App bar */}
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{ background: "rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <span className="text-[0.78rem] font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
                      NutriiApp · Dashboard RR.HH.
                    </span>
                    <span className="text-[0.68rem]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Mayo 2026
                    </span>
                  </div>

                  <div className="p-5">
                    {/* KPI row con CountUp */}
                    <div className="mb-4 grid grid-cols-2 items-stretch gap-[10px]">
                      {KPIS.map((kpi) => (
                        <div
                          key={kpi.label}
                          className="flex flex-col rounded-[10px] p-[10px]"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <span className="text-[1.15rem] font-black leading-none" style={{ color: kpi.color }}>
                            <CountUp
                              end={kpi.end}
                              prefix={kpi.prefix}
                              suffix={kpi.suffix}
                              duration={2.5}
                              enableScrollSpy
                              scrollSpyOnce
                            />
                          </span>
                          <span className="mt-1 text-[0.6rem] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                            {kpi.label}
                          </span>
                          <span className="mt-0.5 text-[0.56rem]" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {kpi.sub}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Employee list */}
                    <p className="mb-2 text-[0.62rem] font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Colaboradores · plan activo
                    </p>
                    <div className="flex flex-col gap-[6px]">
                      {EMPLOYEES.map((emp) => (
                        <div
                          key={emp.name}
                          className="flex items-center gap-3 rounded-lg px-3 py-[7px]"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                            style={{ background: "rgba(165,214,167,0.25)" }}
                          >
                            <span className="text-[0.6rem] font-extrabold" style={{ color: "#A5D6A7" }}>
                              {emp.name.split(" ").map(w => w[0]).join("")}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[0.7rem] font-bold leading-tight" style={{ color: "rgba(255,255,255,0.85)" }}>
                              {emp.name}
                            </p>
                            <p className="text-[0.58rem]" style={{ color: "rgba(255,255,255,0.38)" }}>
                              {emp.dept}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-[0.7rem] font-extrabold leading-none" style={{ color: "#81C784" }}>
                              {emp.score}
                            </p>
                            <p className="text-[0.56rem]" style={{ color: "rgba(129,199,132,0.6)" }}>
                              {emp.trend}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

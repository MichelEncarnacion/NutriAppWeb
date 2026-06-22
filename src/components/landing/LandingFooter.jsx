// src/components/landing/LandingFooter.jsx
import { Link as RouterLink } from "react-router-dom";
import { Mail } from "lucide-react";
import { C } from "./landingTokens";
import Logo from "../Logo";

const COMPANY_LINKS = [
  { label: "Inicio",        to:   "/" },
  { label: "Nosotros",      to:   "/nosotros" },
  { label: "Solicitar demo",to:   "/demo" },
];

const LEGAL_LINKS = [
  { label: "Política de privacidad",   to: "/privacidad" },
  { label: "Acceso colaboradores",     to: "/login" },
];

export default function LandingFooter() {
  return (
    <div className="pt-14 pb-4 md:pt-[72px]" style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}` }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-[2fr_1fr_1fr] md:grid-cols-[2.5fr_1fr_1fr] md:gap-12">
          {/* Col 1 — Brand */}
          <div>
            <div className="mb-4">
              <Logo size="sm" />
            </div>
            <p className="mb-6 max-w-[300px] text-[0.875rem] leading-[1.78]" style={{ color: C.textMuted }}>
              Plataforma SaaS de salud preventiva corporativa para empresas mexicanas.
              IoT + IA clínica + ROI medible desde el día uno.
            </p>
            <div className="flex gap-1">
              <a
                href="mailto:hola@nutriiapp.mx"
                aria-label="Email"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg transition-colors"
                style={{ color: C.textLight, border: `1px solid ${C.border}` }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.primary; e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = "#E8F5E9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.textLight; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "transparent"; }}
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Col 2 — Empresa */}
          <div>
            <p
              className="mb-5 text-[0.78rem] font-bold uppercase"
              style={{ color: C.textPrimary, letterSpacing: "0.08em" }}
            >
              Empresa
            </p>
            {COMPANY_LINKS.map((link) => (
              <RouterLink
                key={link.label}
                to={link.to}
                className="mb-3 block text-[0.875rem] no-underline transition-colors"
                style={{ color: C.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.textMuted; }}
              >
                {link.label}
              </RouterLink>
            ))}
          </div>

          {/* Col 3 — Legal / Acceso */}
          <div>
            <p
              className="mb-5 text-[0.78rem] font-bold uppercase"
              style={{ color: C.textPrimary, letterSpacing: "0.08em" }}
            >
              Acceso
            </p>
            {LEGAL_LINKS.map((link) => (
              <RouterLink
                key={link.label}
                to={link.to}
                className="mb-3 block text-[0.875rem] no-underline transition-colors"
                style={{ color: C.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.textMuted; }}
              >
                {link.label}
              </RouterLink>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col items-center justify-between gap-2 pt-6 sm:flex-row"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <p className="text-[0.75rem]" style={{ color: C.textLight }}>
            © 2025-2026 NutriiApp · Todos los derechos reservados · Puebla, México
          </p>
          <p className="text-[0.75rem]" style={{ color: C.textLight }}>
            Hecho en{" "}
            <span className="font-bold" style={{ color: C.primary }}>
              México
            </span>
            {" · "}
            NOM-030 · NOM-035
          </p>
        </div>
      </div>
    </div>
  );
}

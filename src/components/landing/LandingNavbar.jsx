// src/components/landing/LandingNavbar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { C } from "./landingTokens";
import Logo from "../Logo";

const NAV_LINKS = [
  { label: "Inicio",    to: "/" },
  { label: "Nosotros",  to: "/nosotros" },
];

export default function LandingNavbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Solo el home tiene hero oscuro; /nosotros ahora abre con fondo claro
  const onHero = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const dark           = scrolled || !onHero;
  const textColor       = dark ? C.textPrimary : C.white;
  const hoverBg         = dark ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.12)";
  const navBg           = dark ? "rgba(255,255,255,0.96)" : "transparent";
  const navShadow       = dark ? "0 1px 16px rgba(0,0,0,0.08)" : "none";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] transition-[background,box-shadow] duration-300"
      style={{
        background:     navBg,
        backdropFilter: dark ? "blur(12px)" : "none",
        boxShadow:      navShadow,
      }}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex items-center justify-between py-[14px]">

          {/* Logo */}
          <div className="flex cursor-pointer items-center" onClick={() => navigate("/")}>
            <Logo size="sm" />
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.to)}
                className="rounded-lg px-4 py-2 text-[0.95rem] font-semibold normal-case transition-opacity"
                style={{
                  color:   textColor,
                  opacity: location.pathname === link.to ? 1 : 0.85,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.opacity = 1; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.opacity = location.pathname === link.to ? 1 : 0.85; }}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={() => navigate("/login")}
              className="ml-2 rounded-[10px] px-4 py-[7px] text-[0.9rem] font-semibold"
              style={{ color: textColor, border: `1px solid ${dark ? C.border : "rgba(255,255,255,0.3)"}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Acceso colaboradores
            </button>

            <button
              onClick={() => navigate("/demo")}
              className="ml-2 rounded-[10px] px-5 py-[7px] text-[0.9rem] font-bold"
              style={{ background: C.primary, color: C.white }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.secondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; }}
            >
              Solicitar demo
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex md:hidden p-2"
            style={{ color: textColor }}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[150] bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed top-0 right-0 z-[151] flex h-full w-[280px] flex-col p-6"
            style={{ background: C.bgMain }}
          >
            <div className="mb-8 flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
                <X size={20} color={C.textPrimary} />
              </button>
            </div>

            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    className="w-full rounded-[10px] px-4 py-[10px] text-left font-semibold"
                    style={{ color: C.textPrimary }}
                    onClick={() => { navigate(link.to); setMobileOpen(false); }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}

              <li className="mt-2">
                <button
                  className="w-full rounded-[10px] px-4 py-[10px] text-left font-semibold"
                  style={{ color: C.textPrimary, border: `1px solid ${C.border}` }}
                  onClick={() => { navigate("/login"); setMobileOpen(false); }}
                >
                  Acceso colaboradores
                </button>
              </li>

              <li className="mt-2">
                <button
                  className="w-full rounded-[10px] py-3 text-center font-bold"
                  style={{ background: C.primary, color: C.white }}
                  onClick={() => { navigate("/demo"); setMobileOpen(false); }}
                >
                  Solicitar demo
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </nav>
  );
}

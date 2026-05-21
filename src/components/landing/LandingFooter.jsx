// src/components/landing/LandingFooter.jsx
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, IconButton } from "@mui/material";
import { Instagram, Facebook, Linkedin, Mail } from "lucide-react";
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
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor:   C.bgAlt,
        borderTop: `1px solid ${C.border}`,
        pt:        { xs: 7, md: 9 },
        pb:        4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display:               "grid",
            gridTemplateColumns:   { xs: "1fr", sm: "2fr 1fr 1fr", md: "2.5fr 1fr 1fr" },
            gap:                   { xs: 5, md: 6 },
            mb:                    6,
          }}
        >
          {/* Col 1 — Brand */}
          <Box>
            <Box sx={{ mb: 2 }}>
              <Logo size="sm" />
            </Box>
            <Typography
              sx={{
                color:     C.textMuted,
                fontSize:  "0.875rem",
                lineHeight: 1.78,
                mb:        3,
                maxWidth:  300,
              }}
            >
              Plataforma SaaS de salud preventiva corporativa para empresas mexicanas.
              IoT + IA clínica + ROI medible desde el día uno.
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Facebook,  label: "Facebook"  },
                { Icon: Linkedin,  label: "LinkedIn"  },
                { Icon: Mail,      label: "Email"     },
              ].map(({ Icon, label }) => (
                <IconButton
                  key={label}
                  size="small"
                  aria-label={label}
                  sx={{
                    color:     C.textLight,
                    border:    `1px solid ${C.border}`,
                    borderRadius: "8px",
                    width:     34,
                    height:    34,
                    "&:hover": { color: C.primary, borderColor: C.accent, bgcolor: "#E8F5E9" },
                  }}
                >
                  <Icon size={15} />
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Col 2 — Empresa */}
          <Box>
            <Typography
              sx={{
                color:         C.textPrimary,
                fontWeight:    700,
                fontSize:      "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb:            2.5,
              }}
            >
              Empresa
            </Typography>
            {COMPANY_LINKS.map((link) => (
              <Box
                key={link.label}
                onClick={() => navigate(link.to)}
                sx={{
                  color:    C.textMuted,
                  fontSize: "0.875rem",
                  mb:       1.5,
                  cursor:   "pointer",
                  display:  "block",
                  transition: "color 0.2s",
                  "&:hover": { color: C.primary },
                }}
              >
                {link.label}
              </Box>
            ))}
          </Box>

          {/* Col 3 — Legal / Acceso */}
          <Box>
            <Typography
              sx={{
                color:         C.textPrimary,
                fontWeight:    700,
                fontSize:      "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb:            2.5,
              }}
            >
              Acceso
            </Typography>
            {LEGAL_LINKS.map((link) => (
              <Box
                key={link.label}
                onClick={() => navigate(link.to)}
                sx={{
                  color:    C.textMuted,
                  fontSize: "0.875rem",
                  mb:       1.5,
                  cursor:   "pointer",
                  display:  "block",
                  transition: "color 0.2s",
                  "&:hover": { color: C.primary },
                }}
              >
                {link.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom bar */}
        <Box
          sx={{
            borderTop:     `1px solid ${C.border}`,
            pt:            3,
            display:       "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems:    "center",
            justifyContent:"space-between",
            gap:           1,
          }}
        >
          <Typography sx={{ color: C.textLight, fontSize: "0.75rem" }}>
            © {new Date().getFullYear()} NutriiApp · Todos los derechos reservados · Ciudad de México
          </Typography>
          <Typography sx={{ color: C.textLight, fontSize: "0.75rem" }}>
            Hecho en{" "}
            <Box component="span" sx={{ color: C.primary, fontWeight: 700 }}>
              México
            </Box>
            {" · "}
            NOM-030 · NOM-035
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

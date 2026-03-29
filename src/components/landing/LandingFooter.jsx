// src/components/landing/LandingFooter.jsx
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Button, IconButton } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import { C } from "./landingTokens";
import { useAuth } from "../../hooks/useAuth";

const NAV_LINKS = [
  { label: "Cómo funciona",         href: "#como-funciona" },
  { label: "Preguntas frecuentes",  href: "#faq" },
  { label: "Términos y condiciones", to: "/terminos" },
  { label: "Iniciar sesión",         to: "/login" },
];

export default function LandingFooter() {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <Box sx={{ bgcolor: C.bgFooter, borderTop: `1px solid ${C.border}`, pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        {/* Top 3 columns */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1.5fr" },
            gap: 6,
            mb: 6,
          }}
        >
          {/* Col 1 — Brand */}
          <Box>
            <Typography sx={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "1.6rem", mb: 1.5 }}>
              <Box component="span" sx={{ color: C.green }}>Nutrii</Box>
              <Box component="span" sx={{ color: C.textPrimary }}>App</Box>
            </Typography>
            <Typography sx={{ color: C.textMuted, fontSize: "0.875rem", lineHeight: 1.75, mb: 3, maxWidth: 280 }}>
              Nutrición personalizada con IA y expertos certificados.
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton size="small" sx={{ color: C.textMuted, "&:hover": { color: C.green } }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: C.textMuted, "&:hover": { color: C.green } }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Col 2 — Links */}
          <Box>
            <Typography
              sx={{
                color: C.textPrimary, fontWeight: 700, fontSize: "0.8rem",
                mb: 2.5, textTransform: "uppercase", letterSpacing: "0.1em",
              }}
            >
              Navegación
            </Typography>
            {NAV_LINKS.map((link) => (
              <Box key={link.label} sx={{ mb: 1.5 }}>
                {link.href ? (
                  <Box
                    component="a"
                    href={link.href}
                    sx={{
                      color: C.textMuted, fontSize: "0.875rem",
                      textDecoration: "none",
                      "&:hover": { color: C.textPrimary },
                    }}
                  >
                    {link.label}
                  </Box>
                ) : (
                  <Box
                    component="span"
                    onClick={() => navigate(link.to)}
                    sx={{
                      color: C.textMuted, fontSize: "0.875rem",
                      cursor: "pointer",
                      "&:hover": { color: C.textPrimary },
                    }}
                  >
                    {link.label}
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Col 3 — CTA */}
          <Box>
            <Typography
              sx={{
                color: C.textPrimary, fontWeight: 800,
                fontSize: "1.2rem", fontFamily: "Syne, sans-serif", mb: 1,
              }}
            >
              ¿Listo para empezar?
            </Typography>
            <Typography sx={{ color: C.textMuted, fontSize: "0.875rem", mb: 3 }}>
              Únete gratis hoy
            </Typography>
            <Button
              onClick={() => navigate(session ? "/panel" : "/registro")}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: C.green, color: "#000", fontWeight: 700,
                textTransform: "none", borderRadius: "12px",
                py: 1.5, fontSize: "0.95rem", boxShadow: "none",
                "&:hover": { bgcolor: "#5EF0A0" },
              }}
            >
              {session ? "Ir al panel" : "Crear cuenta gratis"}
            </Button>
          </Box>
        </Box>

        {/* Bottom bar */}
        <Box sx={{ borderTop: `1px solid ${C.border}`, pt: 3, textAlign: "center" }}>
          <Typography sx={{ color: C.textMuted, fontSize: "0.75rem" }}>
            © 2026 NutriiApp · Todos los derechos reservados
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

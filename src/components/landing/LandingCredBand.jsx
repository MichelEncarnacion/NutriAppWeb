// src/components/landing/LandingCredBand.jsx
import { Box, Container, Typography } from "@mui/material";
import { C } from "./landingTokens";

const STATS = [
  { value: "Nutriólogos certificados", label: "Equipo especializado" },
  { value: "15 días",                  label: "Por plan generado" },
  { value: "IA + Expertos",            label: "Respaldado por ciencia" },
];

export default function LandingCredBand() {
  return (
    <Box
      sx={{
        bgcolor: C.bgCard,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 4,
            textAlign: "center",
          }}
        >
          {STATS.map((s) => (
            <Box key={s.value}>
              <Typography
                sx={{
                  color: C.textPrimary,
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                {s.value}
              </Typography>
              <Typography sx={{ color: C.textMuted, fontSize: "0.8rem", mt: 0.5 }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

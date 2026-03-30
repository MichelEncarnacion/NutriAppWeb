// src/components/landing/LandingNavbar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container } from "@mui/material";
import { C } from "./landingTokens";
import { useAuth } from "../../hooks/useAuth";

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll(); // initialize state for current scroll position
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        transition: "background 0.3s, backdrop-filter 0.3s",
        background: scrolled ? "rgba(13,17,23,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}>
          {/* Logo */}
          <Box
            sx={{ cursor: "pointer", fontWeight: 900, fontSize: "1.4rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Box component="span" sx={{ color: C.green }}>Nutrii</Box>
            <Box component="span" sx={{ color: C.textPrimary }}>App</Box>
          </Box>

          {/* CTAs */}
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            {!session && (
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  color: C.textMuted, textTransform: "none", fontWeight: 600,
                  "&:hover": { color: C.textPrimary, background: "transparent" },
                }}
              >
                Iniciar sesión
              </Button>
            )}
            <Button
              onClick={() => navigate(session ? "/panel" : "/registro")}
              variant="contained"
              sx={{
                bgcolor: C.green, color: "#000", fontWeight: 700,
                textTransform: "none", borderRadius: "10px", px: 2.5, py: 1,
                "&:hover": { bgcolor: "#5EF0A0" },
                boxShadow: "none",
              }}
            >
              {session ? "Ir al panel" : "Comenzar gratis"}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

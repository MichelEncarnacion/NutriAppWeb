// src/components/landing/LandingNavbar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Button, Container, IconButton, Drawer, List, ListItem,
} from "@mui/material";
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

  const onHero = location.pathname === "/" || location.pathname === "/nosotros";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor     = (scrolled || !onHero) ? C.textPrimary : C.white;
  const navBg         = (scrolled || !onHero)
    ? "rgba(255,255,255,0.96)"
    : "transparent";
  const navShadow     = (scrolled || !onHero)
    ? "0 1px 16px rgba(0,0,0,0.08)"
    : "none";

  return (
    <Box
      component="nav"
      sx={{
        position:     "fixed",
        top: 0, left: 0, right: 0,
        zIndex:       100,
        transition:   "background 0.3s, box-shadow 0.3s",
        background:   navBg,
        backdropFilter: (scrolled || !onHero) ? "blur(12px)" : "none",
        boxShadow:    navShadow,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.75 }}>

          {/* Logo */}
          <Box sx={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => navigate("/")}>
            <Logo size="sm" />
          </Box>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.label}
                onClick={() => navigate(link.to)}
                sx={{
                  color:         textColor,
                  textTransform: "none",
                  fontWeight:    600,
                  fontSize:      "0.95rem",
                  px:            2,
                  borderRadius:  "8px",
                  opacity:       location.pathname === link.to ? 1 : 0.85,
                  "&:hover":     { bgcolor: "rgba(255,255,255,0.12)", opacity: 1 },
                }}
              >
                {link.label}
              </Button>
            ))}

            <Button
              onClick={() => navigate("/demo")}
              variant="contained"
              sx={{
                ml:            1.5,
                bgcolor:       C.primary,
                color:         C.white,
                fontWeight:    700,
                textTransform: "none",
                borderRadius:  "10px",
                px:            2.5,
                py:            0.9,
                fontSize:      "0.9rem",
                boxShadow:     "none",
                "&:hover":     { bgcolor: C.secondary, boxShadow: "none" },
              }}
            >
              Solicitar demo
            </Button>
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { xs: "flex", md: "none" },
              color:   textColor,
            }}
          >
            <Menu size={22} />
          </IconButton>
        </Box>
      </Container>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, p: 3, bgcolor: C.bgMain, height: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Logo size="sm" />
            <IconButton onClick={() => setMobileOpen(false)}>
              <X size={20} color={C.textPrimary} />
            </IconButton>
          </Box>

          <List disablePadding>
            {NAV_LINKS.map((link) => (
              <ListItem key={link.label} disablePadding sx={{ mb: 0.5 }}>
                <Button
                  fullWidth
                  onClick={() => { navigate(link.to); setMobileOpen(false); }}
                  sx={{
                    justifyContent: "flex-start",
                    color:          C.textPrimary,
                    textTransform:  "none",
                    fontWeight:     600,
                    borderRadius:   "10px",
                    py:             1.2,
                    px:             2,
                    "&:hover":      { bgcolor: C.bgAlt },
                  }}
                >
                  {link.label}
                </Button>
              </ListItem>
            ))}

            <ListItem disablePadding sx={{ mt: 2 }}>
              <Button
                fullWidth
                onClick={() => { navigate("/demo"); setMobileOpen(false); }}
                variant="contained"
                sx={{
                  justifyContent: "center",
                  bgcolor:        C.primary,
                  color:          C.white,
                  textTransform:  "none",
                  fontWeight:     700,
                  borderRadius:   "10px",
                  py:             1.3,
                  boxShadow:      "none",
                  "&:hover":      { bgcolor: C.secondary, boxShadow: "none" },
                }}
              >
                Solicitar demo
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

// src/pages/RequestDemo.jsx
import { useState } from "react";
import {
  Box, Container, Typography, TextField, Button, MenuItem,
  Select, FormControl, InputLabel, Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Users, Shield } from "lucide-react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { C, fadeInUp, stagger } from "../components/landing/landingTokens";
import { supabase } from "../lib/supabase";

const COLLABORATOR_RANGES = [
  { value: "20-50",   label: "20 – 50 colaboradores"  },
  { value: "51-150",  label: "51 – 150 colaboradores" },
  { value: "151-500", label: "151 – 500 colaboradores"},
  { value: "+500",    label: "Más de 500 colaboradores"},
];

const TRUST_ITEMS = [
  { Icon: Shield,       text: "Sin compromiso de contrato" },
  { Icon: Clock,        text: "Respuesta en menos de 24 horas" },
  { Icon: Users,        text: "Demo personalizada a tu empresa" },
  { Icon: CheckCircle2, text: "Asesor dedicado sin costo" },
];

const FIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor:      C.bgAlt,
    fontSize:     "0.95rem",
    "&:hover .MuiOutlinedInput-notchedOutline":  { borderColor: C.accent },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.primary, borderWidth: 2 },
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: C.border },
  "& .MuiInputLabel-root.Mui-focused":  { color: C.primary },
};

export default function RequestDemo() {
  const [form, setForm]         = useState({
    nombre:        "",
    empresa:       "",
    cargo:         "",
    email:         "",
    telefono:      "",
    colaboradores: "",
    reto:          "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState(null);

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.from("solicitudes_demo").insert({
      nombre:        form.nombre.trim(),
      empresa:       form.empresa.trim(),
      cargo:         form.cargo.trim(),
      email:         form.email.trim(),
      telefono:      form.telefono.trim() || null,
      colaboradores: form.colaboradores,
      reto:          form.reto.trim() || null,
    });
    setLoading(false);
    if (error) { setErrorMsg("Ocurrió un error al enviar. Intenta de nuevo."); return; }
    setSubmitted(true);
  };

  const isValid =
    form.nombre.trim() &&
    form.empresa.trim() &&
    form.cargo.trim() &&
    form.email.trim() &&
    form.colaboradores;

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh" }}>
      <LandingNavbar />

      {/* ── Hero ── */}
      <Box
        sx={{
          background: C.heroGrad,
          pt:         { xs: 13, md: 14 },
          pb:         { xs: 7, md: 9 },
          textAlign:  "center",
          position:   "relative",
          overflow:   "hidden",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05), transparent 50%)", pointerEvents: "none" }} />
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Chip
              label="Sin costo · Sin compromiso"
              sx={{
                bgcolor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "0.72rem",
                mb: 3, "& .MuiChip-label": { py: 0.6, px: 1.5 },
              }}
            />
            <Typography
              component="h1"
              sx={{
                color:      C.white,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 900,
                fontSize:   { xs: "2rem", md: "2.7rem" },
                lineHeight: 1.15,
                mb:         2,
              }}
            >
              Agenda tu demo
              <br />
              personalizada
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: { xs: "0.95rem", md: "1.05rem" }, lineHeight: 1.75 }}>
              Te mostramos cómo NutriiApp transforma la salud de tus colaboradores
              en productividad medible, adaptado a tu empresa.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* ── Form section ── */}
      <Box sx={{ bgcolor: C.bgAlt, py: { xs: 7, md: 10 } }}>
        <Container maxWidth="sm">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <Box
                sx={{
                  bgcolor:      C.bgCard,
                  borderRadius: "20px",
                  border:       `1px solid ${C.border}`,
                  boxShadow:    C.shadowMd,
                  p:            { xs: 4, md: 6 },
                  textAlign:    "center",
                }}
              >
                <Box
                  sx={{
                    width:          72,
                    height:         72,
                    bgcolor:        "#E8F5E9",
                    borderRadius:   "50%",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    mx:             "auto",
                    mb:             3,
                  }}
                >
                  <CheckCircle2 size={32} color={C.primary} />
                </Box>
                <Typography
                  sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: "1.6rem", mb: 1.5 }}
                >
                  ¡Solicitud recibida!
                </Typography>
                <Typography sx={{ color: C.textMuted, fontSize: "1rem", lineHeight: 1.75, mb: 3 }}>
                  Nuestro equipo revisará tu información y te contactará en menos de{" "}
                  <Box component="span" sx={{ color: C.primary, fontWeight: 700 }}>24 horas</Box>{" "}
                  para agendar tu demo personalizada.
                </Typography>
                <Typography sx={{ color: C.textLight, fontSize: "0.85rem" }}>
                  ¿Dudas? Escríbenos a{" "}
                  <Box component="span" sx={{ color: C.primary, fontWeight: 600 }}>hola@nutriiapp.mx</Box>
                </Typography>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  bgcolor:      C.bgCard,
                  borderRadius: "20px",
                  border:       `1px solid ${C.border}`,
                  boxShadow:    C.shadowMd,
                  p:            { xs: 3.5, md: 5 },
                }}
              >
                <motion.div variants={fadeInUp}>
                  <Typography
                    sx={{
                      color:      C.textPrimary,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 900,
                      fontSize:   "1.3rem",
                      mb:         0.75,
                    }}
                  >
                    Cuéntanos sobre tu empresa
                  </Typography>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.875rem", mb: 3.5 }}>
                    Completamos la demo en 30 minutos, enfocada en tu industria y tamaño de empresa.
                  </Typography>
                </motion.div>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <motion.div variants={fadeInUp}>
                    <TextField
                      label="Nombre completo"
                      value={form.nombre}
                      onChange={handleChange("nombre")}
                      fullWidth
                      required
                      sx={FIELD_SX}
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                      <TextField
                        label="Empresa"
                        value={form.empresa}
                        onChange={handleChange("empresa")}
                        required
                        sx={FIELD_SX}
                      />
                      <TextField
                        label="Cargo"
                        value={form.cargo}
                        onChange={handleChange("cargo")}
                        required
                        placeholder="Director RR.HH., CEO…"
                        sx={FIELD_SX}
                      />
                    </Box>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                      <TextField
                        label="Correo corporativo"
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        required
                        sx={FIELD_SX}
                      />
                      <TextField
                        label="Teléfono (opcional)"
                        type="tel"
                        value={form.telefono}
                        onChange={handleChange("telefono")}
                        placeholder="Ej. 222 123 4567"
                        sx={FIELD_SX}
                      />
                    </Box>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <FormControl fullWidth required sx={FIELD_SX}>
                      <InputLabel>Número de colaboradores</InputLabel>
                      <Select
                        value={form.colaboradores}
                        label="Número de colaboradores"
                        onChange={handleChange("colaboradores")}
                        sx={{ borderRadius: "10px", bgcolor: C.bgAlt }}
                      >
                        {COLLABORATOR_RANGES.map((r) => (
                          <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <TextField
                      label="¿Cuál es tu mayor reto de bienestar hoy? (opcional)"
                      value={form.reto}
                      onChange={handleChange("reto")}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Ausentismo elevado, cumplimiento NOM, estrés laboral, productividad…"
                      sx={FIELD_SX}
                    />
                  </motion.div>

                  {errorMsg && (
                    <Box sx={{ bgcolor: "rgba(255,107,107,.08)", border: "1px solid rgba(255,107,107,.3)", borderRadius: "10px", px: 2, py: 1.5 }}>
                      <Typography sx={{ color: "#FF6B6B", fontSize: "0.85rem" }}>{errorMsg}</Typography>
                    </Box>
                  )}

                  <motion.div variants={fadeInUp}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={!isValid || loading}
                      sx={{
                        bgcolor:       C.primary,
                        color:         C.white,
                        fontWeight:    800,
                        textTransform: "none",
                        borderRadius:  "12px",
                        py:            1.7,
                        fontSize:      "1rem",
                        mt:            0.5,
                        boxShadow:     "none",
                        "&:hover":     { bgcolor: C.secondary, boxShadow: "none" },
                        "&.Mui-disabled": { bgcolor: C.border, color: C.textLight },
                      }}
                    >
                      {loading ? "Enviando…" : "Quiero mi demo personalizada"}
                    </Button>
                  </motion.div>
                </Box>
              </Box>

              {/* Trust band */}
              <motion.div variants={fadeInUp}>
                <Box
                  sx={{
                    mt:             3,
                    display:        "flex",
                    flexWrap:       "wrap",
                    justifyContent: "center",
                    gap:            { xs: 2, md: 3 },
                    py:             2,
                  }}
                >
                  {TRUST_ITEMS.map(({ Icon, text }) => (
                    <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Icon size={14} color={C.primary} />
                      <Typography sx={{ color: C.textMuted, fontSize: "0.8rem", fontWeight: 600 }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </motion.div>
          )}
        </Container>
      </Box>

      <LandingFooter />
    </Box>
  );
}

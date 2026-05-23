// src/pages/Landing.jsx
import { Box } from "@mui/material";
import LandingNavbar       from "../components/landing/LandingNavbar";
import LandingHero         from "../components/landing/LandingHero";
import LandingCredBand     from "../components/landing/LandingCredBand";
import LandingBenefits     from "../components/landing/LandingBenefits";
import LandingHowItWorks   from "../components/landing/LandingHowItWorks";
import LandingFAQ          from "../components/landing/LandingFAQ";
import LandingCTA          from "../components/landing/LandingCTA";
import LandingFooter       from "../components/landing/LandingFooter";

export default function Landing() {
  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh" }}>
      <LandingNavbar />
      <LandingHero />
      <LandingCredBand />
      <LandingBenefits />
      <LandingHowItWorks />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
    </Box>
  );
}

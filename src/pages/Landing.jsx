// src/pages/Landing.jsx
import LandingNavbar       from "../components/landing/LandingNavbar";
import LandingHero         from "../components/landing/LandingHero";
import LandingCredBand     from "../components/landing/LandingCredBand";
import LandingBenefits     from "../components/landing/LandingBenefits";
import LandingHowItWorks   from "../components/landing/LandingHowItWorks";
import LandingColaboradores from "../components/landing/LandingColaboradores";
import LandingFAQ          from "../components/landing/LandingFAQ";
import LandingCTA          from "../components/landing/LandingCTA";
import LandingFooter       from "../components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <LandingHero />
      <LandingCredBand />
      <LandingBenefits />
      <LandingHowItWorks />
      <LandingColaboradores />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}

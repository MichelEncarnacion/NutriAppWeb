// src/pages/Landing.jsx
import LandingNavbar      from "../components/landing/LandingNavbar";
import LandingHero        from "../components/landing/LandingHero";
import LandingCredBand    from "../components/landing/LandingCredBand";
import LandingHowItWorks  from "../components/landing/LandingHowItWorks";
import LandingBenefits    from "../components/landing/LandingBenefits";
import LandingFAQ         from "../components/landing/LandingFAQ";
import LandingFooter      from "../components/landing/LandingFooter";

export default function Landing() {
  return (
    <>
      <LandingNavbar />
      <LandingHero />
      <LandingCredBand />
      <LandingHowItWorks />
      <LandingBenefits />
      <LandingFAQ />
      <LandingFooter />
    </>
  );
}

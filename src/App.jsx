import Atmosphere from "./components/Atmosphere.jsx"
import CustomCursor from "./components/CustomCursor.jsx"
import Navbar from "./components/Navbar.jsx"
import Counter from "./components/Counter.jsx"
import Hero from "./components/Hero.jsx"
import GamesSection from "./components/GamesSection.jsx"
import UpdatesSection from "./components/UpdatesSection.jsx"
import WhySection from "./components/WhySection.jsx"
import CommunitySection from "./components/CommunitySection.jsx"
import AboutSection from "./components/AboutSection.jsx"
import ToolsSection from "./components/ToolsSection.jsx"
import StaffSection from "./components/StaffSection.jsx"
import DeveloperSection from "./components/DeveloperSection.jsx"
import LunaSection from "./components/LunaSection.jsx"
import FaqSection from "./components/FaqSection.jsx"
import SocialsSection from "./components/SocialsSection.jsx"
import FinalCta from "./components/FinalCta.jsx"
import Footer from "./components/Footer.jsx"
import useSmoothScroll from "./hooks/useSmoothScroll.js"
import useTilt from "./hooks/useTilt.js"

export default function App() {
  const smoothScroll = useSmoothScroll()
  useTilt()

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          smoothScroll(document.getElementById("main"))
        }}
      >
        Skip to content
      </a>
      <CustomCursor />
      <Atmosphere />
      <Navbar />

      <main id="main">
        <Counter />
        <Hero />
        <GamesSection />
        <UpdatesSection />
        <WhySection />
        <CommunitySection />
        <AboutSection />
        <ToolsSection />
        <StaffSection />
        <DeveloperSection />
        <LunaSection />
        <FaqSection />
        <SocialsSection />
        <FinalCta />
      </main>

      <Footer />
    </>
  )
}

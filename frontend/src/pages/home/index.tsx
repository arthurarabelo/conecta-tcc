import { HeroSection } from './HeroSection'
import { HowItWorksSection } from './HowItWorksSection'
import { FeaturedProposalsSection } from './FeaturedProposalsSection'
import { FooterSection } from './FooterSection'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <FeaturedProposalsSection />
      <FooterSection />
    </div>
  )
}

import { Header } from '../components/Header';
import { BannerCarousel } from '../components/BannerCarousel';
import { HeroSection } from '../components/HeroSection';
import { AiAssistantButton } from '../components/AiAssistantButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <BannerCarousel />
      <main>
        <HeroSection />
      </main>
      <AiAssistantButton />
    </div>
  );
}

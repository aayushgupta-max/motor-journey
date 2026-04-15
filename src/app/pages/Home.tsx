import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { AiAssistantButton } from '../components/AiAssistantButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
      </main>
      <AiAssistantButton />
    </div>
  );
}

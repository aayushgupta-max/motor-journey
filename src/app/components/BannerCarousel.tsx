import { useState, useEffect } from 'react';
import { Zap, ShieldCheck, Percent } from 'lucide-react';

const slides = [
  {
    id: 1,
    icon: ShieldCheck,
    title: 'Comprehensive Coverage',
    subtitle: 'Protection for every journey in UAE',
    bg: 'bg-[#F3F5F7]',
    iconBg: 'bg-[#0F1113]',
    iconColor: 'text-[#FFFFFF]',
    textColor: 'text-[#0F1113]',
  },
  {
    id: 2,
    icon: Zap,
    title: 'Instant Quotes',
    subtitle: 'Compare 20+ providers in seconds',
    bg: 'bg-[#FAFBFC]',
    iconBg: 'bg-[#1D1E20]',
    iconColor: 'text-[#D6DADE]',
    textColor: 'text-[#1D1E20]',
  },
  {
    id: 3,
    icon: Percent,
    title: 'Save up to 40%',
    subtitle: 'Best prices guaranteed every time',
    bg: 'bg-[#F3F5F7]',
    iconBg: 'bg-[#3A3F45]',
    iconColor: 'text-[#F3F5F7]',
    textColor: 'text-[#3A3F45]',
  },
];

export function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className={`${slide.bg} transition-colors duration-500 overflow-hidden`}>
      <div className="container mx-auto px-5 py-4 max-w-6xl">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 ${slide.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${slide.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${slide.textColor}`}>{slide.title}</p>
            <p className={`text-xs ${slide.textColor} opacity-70`}>{slide.subtitle}</p>
          </div>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? `${slide.iconBg} w-5` : `${slide.iconBg} opacity-20`
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

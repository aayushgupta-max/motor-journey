import { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const bannerSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1726003354143-41cfdbe673a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBpbnN1cmFuY2UlMjBkdWJhaSUyMHVhZXxlbnwxfHx8fDE3NzUxMzg1NDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Comprehensive Car Insurance',
    subtitle: 'Protect your vehicle with the best coverage in UAE',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1762449030025-5b3f63b3f002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBoaWdod2F5JTIwZHViYWl8ZW58MXx8fHwxNzc1MTM4NTQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Drive with Confidence',
    subtitle: 'Get instant quotes from top insurers in the UAE',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1690533681839-01c4d82d7c86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBjYXIlMjBwcm90ZWN0aW9ufGVufDF8fHx8MTc3NTEzODU0Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Family Protection Plans',
    subtitle: 'Safeguard your loved ones on every journey',
  },
];

export function HeroBanner() {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  return (
    <div className="relative">
      <Slider ref={sliderRef} {...settings}>
        {bannerSlides.map((slide) => (
          <div key={slide.id} className="relative">
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl text-white">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                      {slide.title}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-200">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Custom Navigation Arrows */}
      <button
        onClick={() => sliderRef.current?.slickPrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={() => sliderRef.current?.slickNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}

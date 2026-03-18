import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft as ChevronL, ChevronRight as ChevronR } from 'lucide-react';

const BannerCarousel = ({ banners = [] }: { banners?: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-background py-4 md:py-6">
      <div className="container mx-auto px-4">
        {/* Slides Container */}
        <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg bg-slate-100">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner) => (
              <Link
                key={banner.id}
                to={banner.link}
                className="w-full flex-shrink-0 relative"
              >
                <div className="aspect-[2.3/1] md:aspect-[3.5/1] w-full relative overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle Dark Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
                    <div className="px-8 md:px-16 max-w-xl">
                      <h2 className="text-xl md:text-4xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
                        {banner.title}
                      </h2>
                      <p className="text-sm md:text-xl text-white/90 font-medium mb-4 md:mb-6 line-clamp-2 drop-shadow-sm">
                        {banner.subtitle}
                      </p>
                      <button className="bg-[#22c55e] text-white font-bold text-sm md:text-base px-8 py-2.5 rounded-sm shadow-md hover:bg-[#16a34a] transition-all transform hover:scale-105">
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all z-10"
          >
            <ChevronL size={20} className="text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all z-10"
          >
            <ChevronR size={20} className="text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-[#22c55e] w-6 md:w-10' : 'bg-white/50 w-1.5 md:w-2'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;

import { Shield, Star, TrendingUp, Award } from 'lucide-react';
import { Button } from './ui/button';

const insuranceBrands = [
  {
    id: 1,
    name: 'Dubai Insurance',
    rating: 4.8,
    icon: Shield,
    color: 'bg-gray-600',
  },
  {
    id: 2,
    name: 'AXA Gulf',
    rating: 4.7,
    icon: Star,
    color: 'bg-gray-500',
  },
  {
    id: 3,
    name: 'Oman Insurance',
    rating: 4.9,
    icon: Award,
    color: 'bg-gray-700',
  },
  {
    id: 4,
    name: 'Orient Insurance',
    rating: 4.6,
    icon: TrendingUp,
    color: 'bg-gray-400',
  },
  {
    id: 5,
    name: 'Al Ain Insurance',
    rating: 4.7,
    icon: Shield,
    color: 'bg-gray-600',
  },
  {
    id: 6,
    name: 'National General',
    rating: 4.5,
    icon: Star,
    color: 'bg-gray-500',
  },
  {
    id: 7,
    name: 'Abu Dhabi National',
    rating: 4.8,
    icon: Award,
    color: 'bg-gray-700',
  },
  {
    id: 8,
    name: 'Emirates Insurance',
    rating: 4.6,
    icon: TrendingUp,
    color: 'bg-gray-400',
  },
];

export function BrandSelection() {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Top Insurance Brands in UAE
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare quotes from the most trusted insurance providers and find the perfect coverage for your vehicle
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {insuranceBrands.map((brand) => {
            const IconComponent = brand.icon;
            return (
              <button
                key={brand.id}
                className="group bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-6 transition-all hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`${brand.color} w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {brand.name}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold text-gray-700">
                      {brand.rating}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <Button size="lg" className="px-8">
            Search from More Brands
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Compare quotes from 20+ insurance providers
          </p>
        </div>
      </div>
    </div>
  );
}

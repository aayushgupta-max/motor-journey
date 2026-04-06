import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Camera, ArrowRight } from "lucide-react";
import { MulkiyaBottomSheet } from "./MulkiyaBottomSheet";
import { carBrands } from "./vehicle-details/vehicleData";

export function HeroSection() {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState<
    number | null
  >(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleBrandSelect = (brandId: number) => {
    setSelectedBrand(brandId);
    const brand = carBrands.find((b) => b.id === brandId);
    if (brand) {
      setTimeout(() => {
        navigate('/vehicle-details', { state: { brand } });
      }, 300);
    }
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-5xl">
        {/* Title */}
        <div className="text-center mb-5">
          <h2 className="text-2xl md:text-3xl tracking-tight text-[#163300] mb-1 font-bold">
            Get your car <span className="text-[#9FE870]">insured</span>
          </h2>
          <p className="text-sm text-gray-500">
            Fast, simple, no paperwork headaches
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-5">
          {/* Mulkiya Upload Card */}
          <div className="bg-[#9FE870] rounded-2xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#8BD85E] rounded-full opacity-50" />
            <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-[#B5F495] rounded-full opacity-40" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 bg-[#163300] text-[#9FE870] text-xs px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#9FE870] rounded-full animate-pulse" />
                  Fastest · Quote in 5 seconds
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-xl tracking-tight text-[#163300] mb-1">
                  Upload Mulkiya
                </h3>
                <p className="text-sm text-[#163300]/60">
                  Snap or upload your registration card
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => setSheetOpen(true)}
                  className="w-full h-11 rounded-xl bg-[#163300] hover:bg-[#1e4400] text-[#9FE870] cursor-pointer flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Upload Mulkiya
                </button>
              </div>
            </div>
          </div>

          {/* Brand Selection Card */}
          <div className="bg-[#F7F7F7] rounded-2xl p-5 flex flex-col">
            <div className="mb-3">
              <h3 className="text-xl tracking-tight text-[#163300] mb-1">
                Select your car brand
              </h3>
              <p className="text-sm text-gray-500">
                Enter details manually
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {carBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand.id)}
                  className={`flex flex-col items-center gap-2 py-3 px-1 rounded-xl transition-all active:scale-95 bg-gray-50 border border-gray-200 ${
                    selectedBrand === brand.id
                      ? "ring-2 ring-[#163300] ring-offset-1"
                      : "hover:ring-2 hover:ring-gray-200"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={`${brand.initial}`}
                      alt={brand.name}
                      className="w-7 h-7 object-contain rounded"
                    />
                  </div>
                  <span className="text-[10px] leading-none text-gray-600">
                    {brand.name}
                  </span>
                </button>
              ))}
            </div>

            <button
              className="w-full h-11 rounded-xl bg-[#163300] hover:bg-[#1e4400] text-white flex items-center justify-center gap-2 transition-colors text-sm mt-auto"
              onClick={() => navigate('/vehicle-details', { state: { moreBrands: true } })}
            >
              More Brands
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#9FE870] rounded-full" />
            20+ providers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#62D4FF] rounded-full" />
            Best prices
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#FFD662] rounded-full" />
            Instant quotes
          </span>
        </div>
      </div>

      {/* Bottom Sheet */}
      <MulkiyaBottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
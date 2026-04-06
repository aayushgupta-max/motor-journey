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
          <h2 className="text-2xl md:text-3xl tracking-tight text-[#2D2D2D] mb-1 font-bold">
            Get your car <span className="text-[#888888]">insured</span>
          </h2>
          <p className="text-sm text-gray-500">
            Fast, simple, no paperwork headaches
          </p>
        </div>

        <div className="relative flex flex-col md:grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-5">
          {/* Mulkiya Upload Card */}
          <div className="bg-[#D4D4D4] rounded-2xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#BEBEBE] rounded-full opacity-50" />
            <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-[#E0E0E0] rounded-full opacity-40" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 bg-[#2D2D2D] text-[#D4D4D4] text-xs px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#D4D4D4] rounded-full animate-pulse" />
                  Fastest · Quote in 5 seconds
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-xl tracking-tight text-[#2D2D2D] mb-1">
                  Upload Mulkiya
                </h3>
                <p className="text-sm text-[#2D2D2D]/60">
                  Snap or upload your registration card
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => setSheetOpen(true)}
                  className="w-full h-11 rounded-xl bg-[#2D2D2D] hover:bg-[#404040] text-[#D4D4D4] cursor-pointer flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Upload Mulkiya
                </button>
              </div>
            </div>
          </div>

          {/* Or divider chip - overlapping between cards */}
          <div className="flex items-center justify-center -my-7 relative z-10 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:my-0">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500">Or</span>
            </div>
          </div>

          {/* Brand Selection Card */}
          <div className="bg-[#EBEBEB] rounded-2xl p-5 flex flex-col">
            <div className="mb-3">
              <h3 className="text-xl tracking-tight text-[#2D2D2D] mb-1">
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
                      ? "ring-2 ring-[#2D2D2D] ring-offset-1"
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
              className="w-full h-11 rounded-xl bg-[#2D2D2D] hover:bg-[#404040] text-white flex items-center justify-center gap-2 transition-colors text-sm mt-auto"
              onClick={() => navigate('/vehicle-details', { state: { moreBrands: true } })}
            >
              More Brands
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#888888] rounded-full" />
            20+ providers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#888888] rounded-full" />
            Best prices
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#888888] rounded-full" />
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
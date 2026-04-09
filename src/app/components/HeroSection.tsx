import { useState } from "react";
import { Camera } from "lucide-react";
import { MulkiyaBottomSheet } from "./MulkiyaBottomSheet";
import { SmartVehicleInput } from "./SmartVehicleInput";

export function HeroSection() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 md:px-6 pt-5 pb-6 md:py-8 max-w-5xl">
        {/* Title */}
        <div className="text-center mb-5">
          <h2 className="text-2xl md:text-3xl tracking-tight text-[#0F1113] mb-0 font-bold">
            Get your car <span className="text-[#5E6670]">insured</span>
          </h2>
          <p className="text-sm text-[#4B525A]">
            Fast, simple, no paperwork headaches
          </p>
        </div>

        <div className="relative flex flex-col md:grid md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-5">
          {/* Mulkiya Upload Card */}
          <div className="bg-[#F3F5F7] rounded-[28px] border border-[#D6DADE] p-5 flex flex-col relative overflow-hidden shadow-[0_6px_18px_rgba(15,17,19,0.06)]">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#D6DADE] rounded-full opacity-60" />
            <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-[#FAFBFC] rounded-full opacity-80" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 bg-[#1D1E20] text-[#F3F5F7] text-xs px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#F3F5F7] rounded-full animate-pulse" />
                  Fastest · Quote in 5 seconds
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-xl tracking-tight text-[#0F1113] mb-0 font-bold">
                  Upload Mulkiya
                </h3>
                <p className="text-sm text-[#4B525A]">
                  Snap or upload your registration card
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => setSheetOpen(true)}
                  className="w-full h-11 rounded-xl bg-[#0F1113] hover:bg-[#1D1E20] text-[#FFFFFF] cursor-pointer flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Upload Mulkiya
                </button>
              </div>
            </div>
          </div>

          {/* Or divider chip */}
          <div className="flex items-center justify-center -my-7 relative z-10 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:my-0">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#D6DADE] flex items-center justify-center">
              <span className="text-xs font-semibold text-[#5E6670]">Or</span>
            </div>
          </div>

          {/* Smart Vehicle Input Card */}
          <div className="bg-[#F3F5F7] rounded-[28px] flex flex-col">
            <SmartVehicleInput />
          </div>
        </div>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 text-xs text-[#4B525A]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#5E6670] rounded-full" />
            20+ providers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#5E6670] rounded-full" />
            Best prices
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#5E6670] rounded-full" />
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

import { useState } from "react";
import { Camera, Zap, ShieldCheck, TrendingDown, TriangleAlert } from "lucide-react";
import { MulkiyaBottomSheet } from "./MulkiyaBottomSheet";
import { SmartVehicleInput } from "./SmartVehicleInput";

export function HeroSection() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-5xl">
        {/* Title */}
        <div className="text-center mb-5">
          <h2 className="text-2xl md:text-3xl tracking-tight text-[#0F1113] mb-0 font-bold">
            Get your car <span className="text-[#5E6670]">insured</span>
          </h2>
          <p className="text-sm text-[#4B525A]">
            Compare and buy from <span className="font-semibold text-[#0F1113]">35+ insurers</span> in seconds with <span className="font-semibold text-[#0F1113]">instant claims</span> support
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
                <p className="text-[12px] text-[#4B525A]">
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

      {/* ── Why Policybazaar.ae ─────────────────── */}
      <div className="py-6 px-4 bg-[#F3F5F7]">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-[17px] font-bold text-[#0F1113] text-center mb-4">Why Policybazaar.ae</h3>
          <div className="flex gap-3">
            {([
              { stat: '35+', label: 'Insurers', sublabel: 'Compare instantly' },
              { stat: '100%', label: 'Regulated', sublabel: 'UAE Central Bank' },
              { stat: '87%', label: 'Success', sublabel: 'Instant claim assist' },
            ] as const).map(({ stat, label, sublabel }, i) => (
              <div key={i} className="flex-1 bg-[#FFFFFF] rounded-[16px] px-3 py-4 text-center">
                <p className="text-[22px] font-black text-[#0F1113] leading-none tracking-tight">{stat}</p>
                <p className="text-[12px] font-semibold text-[#4B525A] mt-2">{label}</p>
                <p className="text-[12px] text-[#8A919A] mt-0.5 leading-snug">{sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ─────────────────────────── */}
      <div className="bg-[#FFFFFF] pt-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-[18px] font-bold text-[#0F1113] text-center mb-4 px-4">
            What people are saying
          </h3>
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pl-4">
            <div className="flex gap-2.5 w-max pr-4">
              {[
                { name: 'Ahmed K.', car: 'Camry 2023', text: 'Saved AED 1,200 on my renewal. Took 3 minutes.', rating: 5 },
                { name: 'Fatima S.', car: 'Patrol 2024', text: 'Half the price my dealer quoted. Incredible.', rating: 5 },
                { name: 'Ravi M.', car: 'Civic 2020', text: 'AI helped me pick the right coverage. So easy.', rating: 5 },
                { name: 'Sara A.', car: 'X5 2022', text: 'Agency repair at the best rate I could find.', rating: 4 },
                { name: 'Omar H.', car: 'Tucson 2023', text: 'Policy active in one hour. No paperwork at all.', rating: 5 },
                { name: 'Priya L.', car: 'GLC 2021', text: 'Oman extension included by default. Great value.', rating: 5 },
                { name: 'Khalid R.', car: 'Mustang 2024', text: 'Switched insurer, saved AED 900. Under 5 mins.', rating: 4 },
                { name: 'Noor T.', car: 'Q5 2023', text: 'Roadside + rental car bundled. Can\'t beat it.', rating: 5 },
              ].map((t, i) => (
                <div key={i} className="w-[200px] flex-shrink-0 bg-[#FAFBFC] rounded-[14px] border border-[#D6DADE] overflow-hidden flex flex-col">
                  <div className="w-full aspect-[4/3] overflow-hidden">
                    <img
                      src={(i + 1) % 2 === 0
                        ? 'https://images.unsplash.com/photo-1534708112740-cb40ecb0663e?q=80&w=400&auto=format&fit=crop'
                        : 'https://images.unsplash.com/photo-1758521961483-30f5908b9c93?q=80&w=400&auto=format&fit=crop'}
                      alt=""
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex gap-px mb-1.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <span key={s} className={`text-[11px] ${s < t.rating ? 'text-[#F59E0B]' : 'text-[#D6DADE]'}`}>&#9733;</span>
                      ))}
                    </div>
                    <p className="text-[12px] text-[#4B525A] leading-[1.4] flex-1 mb-2">&ldquo;{t.text}&rdquo;</p>
                    <p className="text-[12px] font-semibold text-[#0F1113]">{t.name} <span className="font-normal text-[#8A919A]">{t.car}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── UAE Insurance Law ────────────────────── */}
      <div className="bg-[#0F1113] py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <TriangleAlert className="w-10 h-10 text-[#F59E0B] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[11px] uppercase tracking-widest text-[#5E6670] font-semibold mb-2">UAE Federal Law</p>
          <h3 className="text-[20px] font-bold text-[#FFFFFF] leading-tight mb-1">
            Driving without insurance<br />is illegal
          </h3>
          <p className="text-[12px] text-[#5E6670] mb-5">
            Federal Law No. 21 of 1995 — all vehicles must be insured
          </p>
          <div className="flex gap-3">
            {[
              { stat: 'د.إ 500', label: 'Fine' },
              { stat: '7 days', label: 'Impounded' },
              { stat: '100%', label: 'Liability' },
            ].map((p, i) => (
              <div key={i} className="flex-1 bg-[#1D1E20] rounded-[16px] px-3 py-4 text-center">
                <p className="text-[20px] font-bold text-[#FFFFFF] leading-none">{p.stat}</p>
                <p className="text-[12px] text-[#5E6670] mt-1.5">{p.label}</p>
              </div>
            ))}
          </div>
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

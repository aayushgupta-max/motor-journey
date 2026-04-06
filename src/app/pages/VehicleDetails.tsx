import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SelectBrand } from '../components/vehicle-details/SelectBrand';
import { SelectModel } from '../components/vehicle-details/SelectModel';
import { SelectYear } from '../components/vehicle-details/SelectYear';
import { MulkiyaBottomSheet } from '../components/MulkiyaBottomSheet';
import { modelsByBrand } from '../components/vehicle-details/vehicleData';
import type { CarBrand } from '../components/vehicle-details/vehicleData';
import { AiAssistantButton } from '../components/AiAssistantButton';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function VehicleDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialBrand = (location.state as { brand?: CarBrand })?.brand ?? null;
  const moreBrands = (location.state as { moreBrands?: boolean })?.moreBrands ?? false;

  const [selectedBrand, setSelectedBrand] = useState<CarBrand | null>(initialBrand);
  const [currentStep, setCurrentStep] = useState(moreBrands ? 0 : 1);
  const [direction, setDirection] = useState(1);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const models = selectedBrand ? (modelsByBrand[selectedBrand.name] ?? []) : [];

  const handleBrandSelect = (brand: CarBrand) => {
    setSelectedBrand(brand);
    setDirection(1);
    setCurrentStep(1);
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setDirection(1);
    setCurrentStep(2);
  };

  const handleYearSelect = (year: number, isBrandNew: boolean | null) => {
    navigate('/quotes', {
      state: { brand: selectedBrand, model: selectedModel, year, isBrandNew },
    });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
      if (currentStep === 1 && moreBrands) {
        // Going back to brand selection, keep brand but clear model
        setSelectedModel(null);
      }
    } else {
      navigate('/');
    }
  };

  const totalSteps = moreBrands ? 3 : 2;
  // For 3-step: step 0→33%, 1→66%, 2→100%. For 2-step: step 1→50%, 2→100%.
  const stepIndex = moreBrands ? currentStep + 1 : currentStep;
  const progress = (stepIndex / totalSteps) * 100;

  const headerTitle = currentStep === 0
    ? 'Select Brand'
    : selectedBrand?.name ?? 'Vehicle Details';

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-5 py-3 max-w-5xl flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-[#F7F7F7] flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#2D2D2D]" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedBrand && currentStep > 0 && (
              <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={selectedBrand.initial}
                  alt={selectedBrand.name}
                  className="w-5 h-5 object-contain"
                />
              </div>
            )}
            <span className="text-sm font-medium text-[#2D2D2D] truncate">
              {headerTitle}
            </span>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">
            Step {moreBrands ? currentStep + 1 : currentStep} of {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#2D2D2D] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" custom={direction}>
        {currentStep === 0 && (
          <motion.div
            key="step-brand"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <SelectBrand onSelect={handleBrandSelect} />
          </motion.div>
        )}
        {currentStep === 1 && selectedBrand && (
          <motion.div
            key="step-model"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <SelectModel
              brandName={selectedBrand.name}
              models={models}
              onSelect={handleModelSelect}
            />
          </motion.div>
        )}
        {currentStep === 2 && selectedModel && (
          <motion.div
            key="step-year"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <SelectYear
              modelName={selectedModel}
              onSelect={handleYearSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer so content isn't hidden behind fixed bar */}
      <div className="h-24" />

      {/* Mulkiya fasttrack */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-5 py-3">
        <p className="text-xs text-gray-500 text-center mb-2">Get more accurate quotes!</p>
        <button
          onClick={() => setSheetOpen(true)}
          className="w-full h-11 rounded-xl bg-[#F7F7F7] text-[#2D2D2D] flex items-center justify-center gap-2 text-sm font-medium active:scale-[0.98] transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload Mulkiya to fast-track
        </button>
      </div>

      <MulkiyaBottomSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      <AiAssistantButton />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Drawer } from 'vaul';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Camera, Upload, Check, ArrowRight, X, ImageIcon } from 'lucide-react';

interface MulkiyaBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MulkiyaBottomSheet({ open, onOpenChange }: MulkiyaBottomSheetProps) {
  const navigate = useNavigate();
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    // PDF = both sides in one document
    if (file.type === 'application/pdf') {
      setFrontFile(file);
      setBackFile(file);
      return;
    }
    // Simulate side detection — if back side detected in front slot, swap silently
    // In production this would use OCR; here we just accept as-is
    setFrontFile(file);
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.type === 'application/pdf') {
      setFrontFile(file);
      setBackFile(file);
      return;
    }
    setBackFile(file);
  };

  const handleContinue = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onOpenChange(false);
      navigate('/quotes');
    }, 1500);
  };

  const bothUploaded = frontFile && backFile;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-[#0F1113]/45 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none" aria-describedby={undefined}>
          <VisuallyHidden>
            <Drawer.Title>Upload Mulkiya</Drawer.Title>
          </VisuallyHidden>
          <div className="bg-[#FFFFFF] rounded-t-3xl max-h-[85vh] overflow-auto border-t border-[#D6DADE]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[#D6DADE] rounded-full" />
            </div>

            <div className="px-5 pb-6 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-lg tracking-tight text-[#0F1113] font-bold">Upload Mulkiya</h3>
                  <p className="text-sm text-[#5E6670]">Front and back side required</p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 rounded-full bg-[#F3F5F7] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#5E6670]" />
                </button>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 my-3">
                <div className={`flex-1 h-1 rounded-full transition-colors ${frontFile ? 'bg-[#0F1113]' : 'bg-[#F3F5F7]'}`} />
                <div className={`flex-1 h-1 rounded-full transition-colors ${backFile ? 'bg-[#0F1113]' : 'bg-[#F3F5F7]'}`} />
              </div>

              {/* Upload Cards */}
              <div className="space-y-2.5 mb-4">
                {/* Front Side */}
                <UploadCard
                  id="front"
                  label="Front Side"
                  sublabel="Vehicle registration details"
                  file={frontFile}
                  onChange={handleFrontChange}
                  onClear={() => setFrontFile(null)}
                />

                {/* Back Side */}
                <UploadCard
                  id="back"
                  label="Back Side"
                  sublabel="Owner & insurance details"
                  file={backFile}
                  onChange={handleBackChange}
                  onClear={() => setBackFile(null)}
                />
              </div>

              {/* Info */}
              <div className="bg-[#F3F5F7] rounded-xl p-3 mb-4 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <p className="text-xs text-[#5E6670] leading-relaxed">
                  Upload each side separately, or a single PDF with both sides — we'll handle the rest automatically.
                </p>
              </div>

              {/* Continue Button */}
              <button
                disabled={!bothUploaded || processing}
                onClick={handleContinue}
                className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm transition-all ${
                  bothUploaded
                    ? 'bg-[#0F1113] text-[#FFFFFF] active:scale-[0.98]'
                    : 'bg-[#F3F5F7] text-[#B0B6BE] cursor-not-allowed'
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#F3F5F7]/30 border-t-[#FFFFFF] rounded-full animate-spin" />
                    Processing Mulkiya...
                  </>
                ) : (
                  <>
                    Continue to Quotes
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function UploadCard({
  id,
  label,
  sublabel,
  file,
  onChange,
  onClear,
}: {
  id: string;
  label: string;
  sublabel: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className={`rounded-xl border-2 border-dashed transition-colors ${
      file ? 'border-[#B0B6BE] bg-[#FAFBFC]' : 'border-[#D6DADE] bg-[#FAFBFC]'
    }`}>
      <input
        type="file"
        id={`mulkiya-${id}`}
        className="hidden"
        accept="image/*,.pdf"
        onChange={onChange}
      />

      {!file ? (
        <label htmlFor={`mulkiya-${id}`} className="flex items-center gap-4 p-4 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#D6DADE] flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-[#B0B6BE]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#0F1113]">{label}</p>
            <p className="text-xs text-[#5E6670]">{sublabel}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#0F1113] flex items-center justify-center flex-shrink-0">
            <Camera className="w-4 h-4 text-[#FFFFFF]" />
          </div>
        </label>
      ) : (
        <div className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-[#D6DADE] flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-[#0F1113]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#0F1113]">{label}</p>
            <p className="text-xs text-[#5E6670] truncate">{file.name}</p>
          </div>
          <button
            onClick={onClear}
            className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#D6DADE] flex items-center justify-center flex-shrink-0"
          >
            <X className="w-3 h-3 text-[#5E6670]" />
          </button>
        </div>
      )}
    </div>
  );
}

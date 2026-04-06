import { useState } from 'react';
import { Drawer } from 'vaul';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Camera, Check, ArrowRight, X, ImageIcon } from 'lucide-react';

interface DLUploadBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function DLUploadBottomSheet({ open, onOpenChange, onComplete }: DLUploadBottomSheetProps) {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFrontFile(e.target.files[0]);
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setBackFile(e.target.files[0]);
  };

  const handleContinue = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onOpenChange(false);
      onComplete();
    }, 1200);
  };

  const bothUploaded = frontFile && backFile;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none" aria-describedby={undefined}>
          <VisuallyHidden>
            <Drawer.Title>Upload Driving License</Drawer.Title>
          </VisuallyHidden>
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-auto">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-5 pb-8 pt-2">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-lg tracking-tight text-[#163300]">Upload Driving License</h3>
                  <p className="text-sm text-gray-400">Front and back side required</p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex items-center gap-2 my-5">
                <div className={`flex-1 h-1 rounded-full transition-colors ${frontFile ? 'bg-[#9FE870]' : 'bg-gray-100'}`} />
                <div className={`flex-1 h-1 rounded-full transition-colors ${backFile ? 'bg-[#9FE870]' : 'bg-gray-100'}`} />
              </div>

              <div className="space-y-3 mb-6">
                <UploadCard
                  id="dl-front"
                  label="Front Side"
                  sublabel="Photo & personal details"
                  file={frontFile}
                  onChange={handleFrontChange}
                  onClear={() => setFrontFile(null)}
                />
                <UploadCard
                  id="dl-back"
                  label="Back Side"
                  sublabel="License categories & expiry"
                  file={backFile}
                  onChange={handleBackChange}
                  onClear={() => setBackFile(null)}
                />
              </div>

              <div className="bg-[#F7F7F0] rounded-xl p-3 mb-5 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Make sure the photo is clear and all text is readable. We'll auto-fill your driving details.
                </p>
              </div>

              <button
                disabled={!bothUploaded || processing}
                onClick={handleContinue}
                className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm transition-all ${
                  bothUploaded
                    ? 'bg-[#163300] text-[#9FE870] active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#9FE870]/30 border-t-[#9FE870] rounded-full animate-spin" />
                    Processing License...
                  </>
                ) : (
                  <>
                    Continue
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
      file ? 'border-[#9FE870] bg-[#F4FFEB]' : 'border-gray-200 bg-[#FAFAFA]'
    }`}>
      <input
        type="file"
        id={`dl-upload-${id}`}
        className="hidden"
        accept="image/*,.pdf"
        onChange={onChange}
      />

      {!file ? (
        <label htmlFor={`dl-upload-${id}`} className="flex items-center gap-4 p-4 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-gray-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#163300]">{label}</p>
            <p className="text-xs text-gray-400">{sublabel}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#163300] flex items-center justify-center flex-shrink-0">
            <Camera className="w-4 h-4 text-[#9FE870]" />
          </div>
        </label>
      ) : (
        <div className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-[#9FE870] flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-[#163300]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#163300]">{label}</p>
            <p className="text-xs text-gray-400 truncate">{file.name}</p>
          </div>
          <button
            onClick={onClear}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
}

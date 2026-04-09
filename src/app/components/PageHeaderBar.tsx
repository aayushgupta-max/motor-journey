import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

type PageHeaderBarProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightSlot?: ReactNode;
  className?: string;
};

export function PageHeaderBar({
  title,
  subtitle,
  onBack,
  rightSlot,
  className = '',
}: PageHeaderBarProps) {
  return (
    <div className={`border-b border-[#D6DADE] bg-[#FFFFFF] flex-shrink-0 ${className}`.trim()}>
      <div className="container mx-auto max-w-5xl px-5 py-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F5F7]"
        >
          <ArrowLeft className="h-4 w-4 text-[#0F1113]" />
        </button>
        <div className="min-w-0">
          <p className="text-[16px] leading-5 font-bold text-[#0F1113]">{title}</p>
          {subtitle ? <p className="text-[12px] leading-4 text-[#8A919A]">{subtitle}</p> : null}
        </div>
        {rightSlot ? <div className="ml-auto flex items-center">{rightSlot}</div> : null}
      </div>
    </div>
  );
}

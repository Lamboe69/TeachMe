import { Check } from 'lucide-react';

export function Stepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-ink-900">Step {currentStep + 1} of {steps.length}</span>
        <span className="text-ink-600">{steps[currentStep]}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-200">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        {steps.map((_, idx) => (
          <div key={idx} className="flex flex-1 items-center">
            <div
              className={`grid h-10 w-10 place-items-center rounded-full transition-all ${
                idx < currentStep
                  ? 'bg-green-600 text-white'
                  : idx === currentStep
                  ? 'bg-green-600 text-white ring-4 ring-green-100'
                  : 'bg-ink-200 text-ink-500'
              }`}
            >
              {idx < currentStep ? <Check className="h-5 w-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 ${idx < currentStep ? 'bg-green-600' : 'bg-ink-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

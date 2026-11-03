import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  /** Called for completed steps so the user can go back to them. */
  onStepClick?: (index: number) => void;
}

export default function Stepper({
  steps,
  currentStep,
  onStepClick,
}: StepperProps) {
  return (
    <ol className="flex items-center gap-2 mb-4" aria-label="Progress">
      {steps.map((label, index) => {
        const isCurrent = index === currentStep;
        const isDone = index < currentStep;
        const circleClasses = isDone
          ? "bg-brand-primary text-text-inverse"
          : isCurrent
            ? "border-2 border-brand-primary text-brand-primary"
            : "border border-surface-border text-text-secondary";

        return (
          <li
            key={label}
            className="flex items-center gap-2 flex-1 last:flex-none"
            aria-current={isCurrent ? "step" : undefined}
          >
            <button
              type="button"
              disabled={!isDone || !onStepClick}
              onClick={() => onStepClick?.(index)}
              className="flex items-center gap-2 disabled:cursor-default"
              aria-label={`Step ${index + 1}: ${label}${isDone ? " (completed)" : ""}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${circleClasses}`}
              >
                {isDone ? <Check size={14} /> : index + 1}
              </span>
              <span
                className={`hidden sm:inline text-xs ${isCurrent ? "font-semibold text-text-primary" : "text-text-secondary"}`}
              >
                {label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span
                className={`h-px flex-1 ${isDone ? "bg-brand-primary" : "bg-surface-border"}`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

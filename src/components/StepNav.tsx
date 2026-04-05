interface StepNavProps {
  activeStep: number;
  onStepChange: (step: number) => void;
}

const steps = [
  { id: 1, label: 'Fichaje' },
  { id: 2, label: 'Asign.' },
  { id: 3, label: 'Horas' },
  { id: 4, label: 'Enviar' },
];

const StepNav = ({ activeStep, onStepChange }: StepNavProps) => {
  return (
    <div className="flex items-center justify-center gap-1 py-3 px-4 bg-background border-b border-border">
      {steps.map((step, i) => {
        const isActive = activeStep === step.id;
        return (
          <button
            key={step.id}
            onClick={() => onStepChange(step.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span
              className={`step-badge ${
                isActive ? 'step-badge-active' : 'step-badge-inactive'
              }`}
            >
              {step.id}
            </span>
            {step.label}
          </button>
        );
      })}
    </div>
  );
};

export default StepNav;
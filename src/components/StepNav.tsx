interface StepNavProps {
  activeStep: number;
  onStepChange: (step: number) => void;
}

const steps = [
  { id: 1, label: 'Fichaje' },
  { id: 2, label: 'Asign.' },
  { id: 3, label: 'Horas' },
  { id: 4, label: 'Maquin.' },
  { id: 5, label: 'Enviar' },
];

const StepNav = ({ activeStep, onStepChange }: StepNavProps) => {
  return (
    <div className="flex flex-shrink-0" style={{ background: 'hsl(var(--navy-light))', borderTop: '1px solid rgba(255,255,255,.06)' }}>
      {steps.map((step) => {
        const isActive = activeStep === step.id;
        const isDone = step.id < activeStep;
        return (
          <button
            key={step.id}
            onClick={() => onStepChange(step.id)}
            className="flex-1 py-2 text-[10px] font-bold tracking-[.03em] uppercase border-none cursor-pointer transition-all"
            style={{
              background: 'transparent',
              borderBottom: `3px solid ${isActive ? 'hsl(var(--teal))' : 'transparent'}`,
              color: isActive ? '#fff' : isDone ? 'hsl(var(--teal-pale))' : 'rgba(255,255,255,.35)',
            }}
          >
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold mr-[3px]"
              style={{
                background: isActive || isDone ? 'hsl(var(--teal))' : 'rgba(255,255,255,.12)',
                color: isActive || isDone ? 'hsl(var(--navy))' : 'inherit',
              }}
            >
              {isDone ? '✓' : step.id}
            </span>
            {step.label}
          </button>
        );
      })}
    </div>
  );
};

export default StepNav;

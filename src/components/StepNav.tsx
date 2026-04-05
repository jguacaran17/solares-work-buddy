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
    <div className="flex flex-shrink-0" style={{ background: 'hsl(var(--g8))', borderTop: '1px solid rgba(255,255,255,.08)' }}>
      {steps.map((step) => {
        const isActive = activeStep === step.id;
        const isDone = step.id < activeStep;
        return (
          <button
            key={step.id}
            onClick={() => onStepChange(step.id)}
            className="flex-1 py-2 text-[10px] font-bold tracking-[.03em] uppercase border-b-2 transition-all cursor-pointer"
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${isActive ? 'hsl(var(--g4))' : 'transparent'}`,
              color: isActive ? '#fff' : isDone ? 'hsl(var(--g2))' : 'rgba(255,255,255,.4)',
            }}
          >
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold mr-[3px]"
              style={{
                background: isActive || isDone ? 'hsl(var(--g4))' : 'rgba(255,255,255,.15)',
                color: isActive || isDone ? 'hsl(var(--g8))' : 'inherit',
              }}
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

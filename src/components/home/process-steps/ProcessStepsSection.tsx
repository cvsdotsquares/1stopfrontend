interface ProcessStep {
  step_no: string;
  title: string;
  description: string;
}

interface ProcessStepsData {
  title: string;
  steps: ProcessStep[];
}

interface ProcessStepsSectionProps {
  data: ProcessStepsData;
}

export default function ProcessStepsSection({ data }: ProcessStepsSectionProps) {
  return (
    <section>
      <div className="[&_h2]:text-3xl [&_h2]:mb-4 [&_h2]:text-black" dangerouslySetInnerHTML={{ __html: data.title || '' }} />
      <div className="space-y-4">
        {data.steps && data.steps.map((step, stepIndex) => (
          <div key={`step-${stepIndex}`} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md border-l-4 border-red-600 transition-all hover:shadow-xl">
            <div className="p-8 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-black dark:text-white flex items-center gap-3">
                  <span className="text-red-600 text-4xl italic opacity-30">{step.step_no}</span>
                  {step.title}
                </h3>
              </div>
              <div
                className="text-slate-600 dark:text-slate-400 leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: step.description || '' }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface ProcessStep {
  step_no: string;
  title: string;
  description: string;
  image?: string;
  step_image?: string;
  item_image?: string;
}

interface ProcessStepsData {
  title: string;
  steps: ProcessStep[];
}

interface ProcessStepsSectionProps {
  data: ProcessStepsData;
}

export default function ProcessStepsSection({ data, sidebar }: Readonly<ProcessStepsSectionProps & { sidebar: { hasSidebar: boolean } } >) {
  const hasTextContent = (value: string) =>
    value
      .replaceAll(/<[^>]*>/g, "")
      .replaceAll("&nbsp;", " ")
      .trim().length > 0;

  const visibleSteps = (data.steps || []).filter((step) => {
    const hasTitle = (step.title || "").trim().length > 0;
    const hasDescription = hasTextContent(step.description || "");
    return hasTitle && hasDescription;
  });
  return (
    <section className={sidebar.hasSidebar ? "" : "mx-auto max-w-[1400px] px-6 py-12"}>
      <h2 className="text-3xl text-center mb-4 text-black dark:text-white">{data.title}</h2>
      <div className="space-y-4">
        {visibleSteps.map((step, index) => (

          <div key={`${step.step_no}-${index}`} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md border-l-4 border-red-600 transition-all hover:shadow-xl">
            <div className="p-8 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-black dark:text-white flex items-center gap-3">
                  { step.step_no && <span className="text-red-600 text-4xl italic opacity-30">{step.step_no}</span> }
                  {step.title}
                </h3>
              </div>
              {(step.image || step.step_image || step.item_image) && (
                <img
                  src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${step.image || step.step_image || step.item_image}`}
                  alt={step.title}
                  className="rounded-xl w-full object-cover max-h-64"
                />
              )}
              <div
                className="text-slate-600 dark:text-slate-400 leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: step.description || '' }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

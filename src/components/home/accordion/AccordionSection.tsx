'use client';

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionSectionData {
  header: string;
  items: AccordionItem[];
}

export default function AccordionSection({ data, order }: { data: AccordionSectionData , order: number}) {
  return (
    <section className="py-10 lg:py-20">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid md:grid-cols-1 items-center">
          {/* Header */}
          <div
            className="text-center [&_h2]:text-3xl [&_h2]:mb-2 [&_p]:text-gray-600 [&_div]:contents"
            dangerouslySetInnerHTML={{ __html: data.header }}
          />

          {/* Accordion */}
          <div className="relative w-full max-w-3xl mx-auto p-6">
            {data.items.map((item, index) => (
              <div key={index} className="relative py-1 border-b border-gray-900/20">
                <input
                  type="checkbox"
                  name={`accordion-${order}-${index}`}
                  id={`accordion-item-${order}-${index}`}
                  className="absolute opacity-0 z-0 peer"
                />
                <label
                  htmlFor={`accordion-item-${order}-${index}`}
                  className="flex justify-between py-4 cursor-pointer after:w-[24px] after:h-[24px] after:min-w-[24px] after:min-h-[24px] after:opacity-40 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] after:bg-contain after:bg-no-repeat after:bg-center after:transition-all after:duration-300 peer-checked:after:rotate-180"
                >
                  <span className="text-xl font-medium">{item.title}</span>
                </label>
                <div className="overflow-hidden max-h-0 transition-all duration-500 peer-checked:max-h-[80rem]">
                  <div
                    className="pb-6 text-gray-500 space-y-4 [&_p]:leading-relaxed [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_.flex]:flex [&_.gap-8]:gap-8 [&_.justify-center]:justify-center"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

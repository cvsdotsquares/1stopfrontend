interface ServiceArea {
  left_text: string;
  right_text: string;
}

interface ServiceAreasSectionData {
  border?: boolean;
  show_bg?: boolean;
  areas: ServiceArea[];
}

export default function ServiceAreasSection({ data }: { data: ServiceAreasSectionData }) {
  const borderClass = data.border ? 'border border-gray-300' : '';
  const bgClass = data.show_bg ? 'bg-blue-50' : '';

  return (
    <section className={`py-10 md:py-16 ${bgClass}`}>
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
          {data.areas.map((area, index) => (
            <div key={index} className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 lg:col-span-2">
              {/* Left Card */}
              <div className={`rounded-lg ${borderClass} p-4 md:p-8 relative`}>
                <div 
                  className="[&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:font-bold [&_p]:mb-3 [&_p]:md:mb-6 [&_p]:text-gray-500 [&_ul]:grid [&_ul]:grid-cols-2 [&_ul]:gap-2 [&_ul]:md:grid-cols-2 [&_li]:flex [&_li]:items-start [&_li]:text-black [&_li]:text-sm [&_li]:md:text-base [&_li]:before:content-[''] [&_li]:before:inline-block [&_li]:before:w-4 [&_li]:before:h-4 [&_li]:before:mr-1 [&_li]:before:md:mr-3 [&_li]:before:bg-[url('/location-dot-solid.png')] [&_li]:before:bg-contain [&_li]:before:bg-no-repeat [&_li]:before:bg-center"
                  dangerouslySetInnerHTML={{ __html: area.left_text }}
                />
              </div>

              {/* Right Card */}
              <div className={`rounded-lg ${borderClass} p-4 md:p-8 relative`}>
                <div 
                  className="[&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:font-bold [&_p]:mb-3 [&_p]:md:mb-6 [&_p]:text-gray-500 [&_ul]:grid [&_ul]:grid-cols-1 [&_ul]:gap-2 [&_li]:flex [&_li]:items-start [&_li]:text-black [&_li]:text-sm [&_li]:md:text-base [&_li]:before:content-[''] [&_li]:before:inline-block [&_li]:before:w-4 [&_li]:before:h-4 [&_li]:before:mr-1 [&_li]:before:md:mr-3 [&_li]:before:bg-[url('/location-dot-solid.png')] [&_li]:before:bg-contain [&_li]:before:bg-no-repeat [&_li]:before:bg-center"
                  dangerouslySetInnerHTML={{ __html: area.right_text }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

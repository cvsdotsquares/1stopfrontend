interface FeatureData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  marker_text?: string;
  cta?: {
    text: string;
    link: string;
  };
  bgColor?: string;
  bg_color?: boolean;
  title_top_center?: boolean;
}

export default function FeatureImageRight({ data }: { data: FeatureData }) {
  console.log('FeatureImageRight - bg_color value:', data.bg_color, 'type:', typeof data.bg_color, 'bgColor:', data.bgColor);
  const bgClass = data.bg_color ? "bg-slate-100" : "";
  console.log('FeatureImageRight - bgClass:', bgClass);
  return (
    <section className={`${bgClass} py-10 md:py-16`}>
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Title at top center if title_top_center is true */}
        {data.title_top_center && data.title && (
          <div 
            className="text-center mb-8 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_p]:font-semibold [&_p]:tracking-wide [&_strong]:text-blue-600"
            dangerouslySetInnerHTML={{ __html: data.title }}
          />
        )}
        
        <div className="grid grid-cols-1 items-center gap-6 md:gap-12 lg:grid-cols-2">
          {/* Content - Left */}
          <div>
            {/* Marker text */}
            {data.marker_text && (
              <div className="mb-4 inline-block bg-red-600 text-white px-4 py-2 rounded-md shadow-lg text-left leading-tight">
                <div className="text-xl md:text-2xl font-bold" dangerouslySetInnerHTML={{ __html: data.marker_text }} />
              </div>
            )}
            {/* Title - only show here if title_top_center is false */}
            {!data.title_top_center && data.title && (
              <div
                className="mb-4 [&_h2]:mb-2 [&_p]:font-semibold [&_p]:tracking-wide [&_strong]:text-blue-600"
                dangerouslySetInnerHTML={{ __html: data.title }}
              />
            )}

            {/* Subtitle */}
            <div
              className="mb-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-2"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />

            {/* Description */}
            <div
              className="prose prose-lg max-w-none text-black [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_ul]:space-y-2 [&_li]:flex [&_li]:items-start"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />

            {data.cta && (
              <a
                href={data.cta.link}
                className="mt-6 inline-block rounded-lg bg-red-600 px-8 py-3 text-base font-bold text-white hover:bg-red-700"
              >
                {data.cta.text}
              </a>
            )}
          </div>

          {/* Image - Right */}
          <div>
            <div className="relative rounded-4xl overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${data.image}`}
                alt="CBT Training London"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
interface FeatureData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta?: {
    text: string;
    link: string;
  };
  bgColor?: string;
}

export default function FeatureImageRight({ data }: { data: FeatureData }) {
  const bgClass = data.bgColor === "white" ? "bg-white" : "bg-gray-50";

  return (
    <section className={`${bgClass} py-16`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Content - Left */}
          <div>
            {/* Title */}
            <div 
              className="mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-2 [&_p]:text-sm [&_p]:font-semibold [&_p]:uppercase [&_p]:tracking-wide [&_strong]:text-red-600"
              dangerouslySetInnerHTML={{ __html: data.title }}
            />
            
            {/* Subtitle */}
            <div 
              className="mb-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-2"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />
            
            {/* Description */}
            <div 
              className="prose prose-lg max-w-none text-gray-700 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_ul]:space-y-2 [&_li]:flex [&_li]:items-start"
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
            <div className="relative h-96 overflow-hidden rounded-2xl shadow-lg">
              <img
                src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${data.image}`}
                alt="CBT Training London"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
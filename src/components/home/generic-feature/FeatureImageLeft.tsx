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

export default function FeatureImageLeft({ data }: { data: FeatureData }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 across-london-block">
          {/* Image - Left */}
          <div>
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${data.image}`}
                alt="CBT Training London"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content - Right */}
          <div className="list-icon">
            {/* Title */}
            <div 
              className="mb-2 text-base text-red-600"
              dangerouslySetInnerHTML={{ __html: data.title }}
            />
            
            {/* Subtitle */}
            <div 
              className="mb-6 text-gray-500 [&_h2]:text-black [&_h2]:mb-3"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />
            
            {/* Description */}
            <div 
              className="prose prose-lg max-w-none text-gray-500 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_ul]:space-y-2 [&_li]:flex [&_li]:items-start"
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
        </div>
      </div>
    </section>
  );
}
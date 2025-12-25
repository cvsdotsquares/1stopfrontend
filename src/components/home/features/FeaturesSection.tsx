interface Feature {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image: string;
  cta?: {
    text: string;
    link: string;
  };
}

interface FeaturesSectionProps {
  features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="bg-white py-16">
      {features.map((feature) => (
        <div key={feature.id} className="mx-auto max-w-7xl px-6">
          {/* Title and Subtitle - Centered */}
          <div className="mb-12 text-center">
            <div 
              className="[&_h2]:text-4xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-4"
              dangerouslySetInnerHTML={{ __html: feature.title }}
            />
            <p className="text-gray-600 text-lg">{feature.subtitle}</p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Image - Left */}
            <div>
              <div className="relative h-96 overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${feature.image}`}
                  alt={feature.subtitle}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content - Right */}
            <div>
              <div 
                className="prose prose-lg max-w-none text-gray-700 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-4 [&_ul]:space-y-2 [&_li]:flex [&_li]:items-start [&_li]:text-gray-700 [&_li]:before:content-['•'] [&_li]:before:text-red-600 [&_li]:before:font-bold [&_li]:before:mr-2 [&_li]:before:mt-1 [&_a]:text-blue-600 hover:[&_a]:text-blue-800 [&_span[style*='background-color']]:px-3 [&_span[style*='background-color']]:py-2 [&_span[style*='background-color']]:rounded [&_span[style*='background-color']]:bg-pink-50 [&_span[style*='background-color']]:text-gray-700 [&_span[style*='background-color']]:block [&_span[style*='background-color']]:mt-4"
                dangerouslySetInnerHTML={{ __html: feature.content }}
              />

              {feature.cta && (
                <a
                  href={feature.cta.link}
                  className="mt-6 inline-block rounded-lg bg-red-600 px-8 py-3 text-base font-bold text-white hover:bg-red-700 transition-colors"
                >
                  {feature.cta.text}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
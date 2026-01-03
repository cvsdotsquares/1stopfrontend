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
    <section className="bg-white py-8 md:py-16">
      {features.map((feature) => (
        <div key={feature.id} className="mx-auto max-w-[1400px] px-6">
          {/* Title and Subtitle - Centered */}
          <div className="mb-6 md:mb-12  text-center">
            <div 
              className="[&_h2]:mb-4"
              dangerouslySetInnerHTML={{ __html: feature.title }}
            />
            <p className="text-gray-600">{feature.subtitle}</p>
            
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 items-center gap-6 md:gap-12 lg:grid-cols-2">
            {/* Image - Left */}
            <div>
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${feature.image}`}
                  alt={feature.subtitle}
                  className="w-full"
                />
              </div>
            </div>

            {/* Content - Right */}
            <div>
              <div 
                className="list-icon prose prose-lg max-w-none text-gray-700 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-4 [&_a]:text-blue-600 hover:[&_a]:text-blue-800 [&_span[style*='background-color']]:px-5 [&_span[style*='background-color']]:text-sm [&_span[style*='background-color']]:py-5 [&_span[style*='background-color']]:rounded-2xl [&_span[style*='background-color']]:bg-red-50 [&_span[style*='background-color']]:text-black [&_span[style*='background-color']]:block [&_span[style*='background-color']]:mt-4"
                dangerouslySetInnerHTML={{ __html: feature.content }}
              />

              {feature.cta && (
                <a
                  href={feature.cta.link}
                  className="mt-6 inline-block radius20-left radius20-right-bottom bg-red-600 px-6 py-3 text-lg text-white hover:bg-red-500"
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
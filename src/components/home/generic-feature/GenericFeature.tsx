import Image from "next/image";
import Link from "next/link";

interface ContentItem {
  type: string;
  text?: string;
  items?: string[];
}

interface Feature {
  id: string;
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  badge?: string;
  content: ContentItem[];
  cta?: {
    text: string;
    link: string;
  };
  image: string;
  bgColor: string;
  imagePosition?: string;
}

interface GenericFeatureProps {
  features: Feature[];
}

export default function GenericFeature({ features }: GenericFeatureProps) {
  return (
    <section>
      {features.map((feature, index) => {
        const imageOnLeft = feature.imagePosition === "left" || index % 2 === 0;
        const bgClass = feature.bgColor === "white" ? "bg-white" : "bg-gray-50";

        return (
          <div key={feature.id} className={`${bgClass} py-16`}>
            <div className="mx-auto max-w-7xl px-6">
              {/* Title and Subtitle - Centered */}
              {(feature.title || feature.subtitle) && (
                <div className="mb-12 text-center">
                  {feature.title && (
                    <h2 className="text-4xl font-bold text-gray-900">
                      {feature.title}{" "}
                      {feature.titleHighlight && (
                        <span className="text-indigo-700">{feature.titleHighlight}</span>
                      )}
                    </h2>
                  )}
                  {feature.subtitle && (
                    <p className="mt-3 text-gray-600">{feature.subtitle}</p>
                  )}
                </div>
              )}

              <div
                className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 ${
                  imageOnLeft ? "" : "lg:grid-flow-dense"
                }`}
              >
                {/* Image */}
                <div className={imageOnLeft ? "" : "lg:col-start-2"}>
                  <div className="relative h-96 overflow-hidden rounded-2xl shadow-lg">
                    <Image
                      src={feature.image}
                      alt={feature.title || "Feature image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={imageOnLeft ? "" : "lg:col-start-1"}>
                  {feature.badge && (
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-600">
                      {feature.badge}
                    </p>
                  )}

                  <div className="space-y-4 text-gray-700">
                    {feature.content.map((item, idx) => {
                      if (item.type === "text") {
                        return (
                          <p
                            key={idx}
                            dangerouslySetInnerHTML={{ __html: item.text || "" }}
                          />
                        );
                      }
                      if (item.type === "heading") {
                        return (
                          <h3 key={idx} className="mt-6 text-xl font-bold text-gray-900">
                            {item.text}
                          </h3>
                        );
                      }
                      if (item.type === "list") {
                        return (
                          <ul key={idx} className="space-y-2">
                            {item.items?.map((listItem, listIdx) => (
                              <li
                                key={listIdx}
                                className="flex items-start"
                              >
                                <span className="mr-2 mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                                  ✓
                                </span>
                                <span dangerouslySetInnerHTML={{ __html: listItem }} />
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (item.type === "callout") {
                        return (
                          <div key={idx} className="mt-6 rounded-lg bg-red-50 p-6">
                            <p className="text-gray-700">{item.text}</p>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {feature.cta && (
                    <Link
                      href={feature.cta.link}
                      className="mt-6 inline-block rounded-lg bg-red-600 px-8 py-3 text-base font-bold text-white hover:bg-red-700"
                    >
                      {feature.cta.text}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
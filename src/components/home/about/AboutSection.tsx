interface AboutData {
  title: string;
  subtitle: string;
  paragraphs: unknown;
  content?: unknown;
  images: Array<{ src: string; alt: string }>;
}

export default function AboutSection({ data }: Readonly<{ data: AboutData }>) {
  const decodeHtml = (html: string) => {
    // Keep decoding deterministic between SSR and hydration
    return html
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'");
  };

  const toHtmlString = (value: unknown): string => {
    if (typeof value === "string") return value;

    if (
      value &&
      typeof value === "object" &&
      "__html" in value &&
      typeof (value as { __html?: unknown }).__html === "string"
    ) {
      return (value as { __html: string }).__html;
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return `<p>${item}</p>`;

          if (item && typeof item === "object") {
            const paragraph = item as {
              text?: unknown;
              links?: Array<{ text?: unknown; url?: unknown }>;
              afterText?: unknown;
            };

            const text = typeof paragraph.text === "string" ? paragraph.text : "";
            const links = Array.isArray(paragraph.links)
              ? paragraph.links
                  .map((link) => {
                    const label = typeof link?.text === "string" ? link.text : "";
                    const href = typeof link?.url === "string" ? link.url : "#";
                    return label ? `<a href="${href}">${label}</a>` : "";
                  })
                  .filter(Boolean)
                  .join(" ")
              : "";
            const afterText = typeof paragraph.afterText === "string" ? paragraph.afterText : "";
            const linksWithSpacing = links ? ` ${links}` : "";

            return `<p>${text}${linksWithSpacing}${afterText}</p>`;
          }

          return "";
        })
        .join("");
    }

    return "";
  };

  let rawTitle = "";
  if (typeof data?.title === "string" && data.title.trim()) {
    rawTitle = data.title;
  } else if (typeof data?.content === "string") {
    rawTitle = data.content;
  }

  const titleHtml = decodeHtml(rawTitle);
  const paragraphsHtml = toHtmlString(data?.paragraphs) || toHtmlString(data?.content);

  return (
    <section className="bg-white py-8 md:py-16 about-sec-home">
      <div className="mx-auto max-w-[1400px] px-6 md:[&_h2]:text-3xl [&_h2_p]:leading-[1.3]">
        {/* Title */}
        <div className="mb-8 text-center" dangerouslySetInnerHTML={{ __html: titleHtml }} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Text Content */}
          <div
            className="space-y-5 text-gray-500 [&_a]:underline [&_a:hover]:text-red-500"
            dangerouslySetInnerHTML={{ __html: paragraphsHtml }}
          />

          {/* Images */}
          <div className="grid grid-cols-2 gap-4 about-home">
            {data.images.map((image) => (
              <div
                key={`${image.src}-${image.alt}`}
                className="relative"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${image.src}`}
                  alt={image.alt}
                  className="w-full "
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

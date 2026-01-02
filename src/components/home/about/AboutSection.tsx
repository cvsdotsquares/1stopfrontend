import Image from "next/image";

interface AboutData {
  title: string;
  subtitle: string;
  paragraphs: string;
  images: Array<{ src: string; alt: string }>;
}

export default function AboutSection({ data }: { data: AboutData }) {
  const decodeHtml = (html: string) => {
    // Prefer browser decoding when available (client-side); fallback to common entity replacements for SSR
    if (typeof document !== "undefined") {
      const txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    }
    return html
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  return (
    <section className="bg-white py-16 about-sec-home">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Title */}
        <h2 className="mb-8 text-center">
          {data.title}{" "}
          
          <span className="text-blue-600" dangerouslySetInnerHTML={{ __html: decodeHtml(data. subtitle) }}></span>
        </h2>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Text Content */}
          <div
            className="space-y-5 text-gray-500"
            dangerouslySetInnerHTML={{ __html: data.paragraphs }}
          />

          {/* Images */}
          <div className="grid grid-cols-2 gap-4 about-home">
            {data.images.map((image, index) => (
              <div
                key={index}
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

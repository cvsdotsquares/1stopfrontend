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
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Title */}
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
          {data.title}{" "}
          <span className="text-blue-600">{decodeHtml(data.subtitle)}</span>
        </h2>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Text Content */}
          <div
            className="space-y-6 text-gray-700 prose prose-lg max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800"
            dangerouslySetInnerHTML={{ __html: data.paragraphs }}
          />

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            {data.images.map((image, index) => (
              <div
                key={index}
                className="relative h-64 overflow-hidden rounded-lg shadow-lg"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${image.src}`}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

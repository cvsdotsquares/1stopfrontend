import Image from "next/image";
import Link from "next/link";

interface AboutData {
  title: string;
  subtitle: string;
  paragraphs: Array<{
    text: string;
    links?: Array<{ text: string; url: string }>;
    afterText?: string;
  }>;
  images: Array<{ src: string; alt: string }>;
}

export default function AboutSection({ data }: { data: AboutData }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Title */}
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
          {data.title}{" "}
          <span className="text-blue-600">({data.subtitle})</span>
        </h2>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Text Content */}
          <div className="space-y-6 text-gray-700">
            {data.paragraphs.map((paragraph, index) => (
              <p key={index} className="leading-relaxed">
                {paragraph.text}
                {paragraph.links && paragraph.links.map((link, linkIndex) => (
                  <span key={linkIndex}>
                    <Link
                      href={link.url}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {link.text}
                    </Link>
                    {linkIndex < paragraph.links!.length - 1 && " and "}
                  </span>
                ))}
                {paragraph.afterText}
              </p>
            ))}
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            {data.images.map((image, index) => (
              <div
                key={index}
                className="relative h-64 overflow-hidden rounded-lg shadow-lg"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

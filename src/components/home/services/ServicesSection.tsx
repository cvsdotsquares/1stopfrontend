import Image from "next/image";
import Link from "next/link";

interface ServicesData {
  header: string;
  services: Array<{
    id: number;
    title: string;
    description: string;
    image: string;
    link: string;
  }>;
}

export default function ServicesSection({ data }: { data: ServicesData }) {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div 
          className="mb-12 text-center [&_h2]:text-4xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_p]:text-sm [&_p]:font-semibold [&_p]:uppercase [&_p]:tracking-wide [&_p]:text-gray-600 [&_p]:mb-2"
          dangerouslySetInnerHTML={{ __html: data.header }}
        />

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {data.services.map((service) => (
            <Link
              key={service.id}
              href={service.link}
              className="group overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-[1.02]"
            >
              {/* Image */}
              <div className="relative h-80 w-full">
                <img
                  src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${service.image}`}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="bg-indigo-700 px-8 py-6 text-center text-white">
                <h3 className="text-2xl font-bold">{service.title}</h3>
                <p className="mt-2 text-base">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

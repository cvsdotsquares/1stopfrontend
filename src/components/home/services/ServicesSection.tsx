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
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Header */}
        <div 
          className="mb-12 text-center  [&_p]:text-xl [&_p]:font-semibold [&_p]:mb-0"
          dangerouslySetInnerHTML={{ __html: data.header }}
        />

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
          {data.services.map((service) => (
            <Link
              key={service.id}
              href={service.link}
              className="group overflow-hidden rounded-2xl transition-transform hover:scale-[1.02]"
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
              <div className="bg-blue-600 px-4 py-4 text-center text-white">
                <h3 className="text-2xl font-bold">{service.title}</h3>
                <p className="mt-1 text-lg">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

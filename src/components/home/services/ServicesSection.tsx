import Image from "next/image";
import Link from "next/link";

interface ServicesData {
  heading: string;
  title: string;
  titleHighlight: string;
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
        {/* Heading */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
            {data.heading}
          </p>
          <h2 className="text-4xl font-bold text-gray-900">
            {data.title}{" "}
            <span className="text-indigo-700">{data.titleHighlight}</span>
          </h2>
        </div>

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
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
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

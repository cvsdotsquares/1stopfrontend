import Image from "next/image";

interface AccreditationsData {
  title: string;
  logos: Array<{
    id: number;
    name: string;
    image: string;
    alt: string;
  }>;
  cards: Array<{
    id: number;
    title: string;
    subtitle: string;
    type: string;
    locations?: string[];
    image?: string;
  }>;
}

export default function AccreditationsSection({ data }: { data: AccreditationsData }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Title */}
        <h2 className="mb-12 text-center text-4xl font-bold text-indigo-700">
          {data.title}
        </h2>

        {/* Logos Grid */}
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {data.logos.map((logo) => (
            <div
              key={logo.id}
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <Image
                src={logo.image}
                alt={logo.alt}
                width={120}
                height={80}
                className="max-h-20 w-auto object-contain"
              />
            </div>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {data.cards.map((card) => (
            <div
              key={card.id}
              className="rounded-lg bg-gray-100 p-8 relative"
            >
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                {card.title}
              </h3>
              <p className="mb-6 text-gray-600">
                {card.subtitle}
              </p>

              {card.type === "locations" && card.locations && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {card.locations.map((location, index) => (
                    <div key={index} className="flex items-center">
                      <span className="mr-3 text-red-600 text-lg">📍</span>
                      <span className="text-gray-700">{location}</span>
                    </div>
                  ))}
                </div>
              )}

              {card.type === "gift" && (
                <>
                  <h4 className="mb-2 text-xl">
                    Gift <span className="text-red-600 font-bold">Vouchers</span> Available
                  </h4>
                  <p className="text-gray-700 mb-4">
                    Give the gift of two wheels — CBT<br />Training and Motorcycle Course<br />Gift Vouchers available now!
                  </p>
                  {card.image && (
                    <div className="absolute bottom-4 right-4">
                      <Image
                        src={card.image}
                        alt="Gift voucher"
                        width={100}
                        height={100}
                        className="object-contain"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
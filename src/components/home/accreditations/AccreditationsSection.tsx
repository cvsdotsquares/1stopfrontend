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
    title?: string;
    subtitle?: string;
    type: string;
    locations?: string[];
    image?: string;
  }>;
}
export default function AccreditationsSection({ data }: { data: AccreditationsData }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Title */}
        <h2 className="mb-12 text-center" dangerouslySetInnerHTML={{ __html: data.title }}/>

        {/* Logos Grid */}
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {data.logos.map((logo) => (
            <div
              key={logo.id}
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${logo.image}`}
                alt={logo.alt || logo.name || 'Accreditation logo'}
                width={120}
                height={80}
                className="max-h-20 w-auto object-contain"
              />
            </div>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
          {data.cards.map((card) => (
            <div
              key={card.id}
              className="rounded-lg bg-blue-50 border border-gray-300 p-4 md:p-8 relative"
            >
              <h3 className="mb-2 text-2xl md:text-3xl font-bold">
                {card.title || ""}
              </h3>
              <p className="mb-3 md:mb-6 text-gray-500">
                {card.subtitle || ""}
              </p>

              {card.type === "locations" && card.locations && (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-2">
                  {card.locations.map((location, index) => (
                    <div key={index} className="flex items-start">
                      <span className="mr-1 md:mr-3 text-red-500 text-base"><i className="fa-solid fa-location-dot"></i></span>
                      <span className="text-black text-sm md:text-base">{location}</span>
                    </div>
                  ))}
                </div>
              )}

              {card.type === "gift" && (
                <>
                  <h4 className="mb-3 text-2xl md:text-3xl font-bold">
                    Gift <span className="text-red-500">Vouchers</span> Available
                  </h4>
                  <p className="text-base md:text-2xl">
                    Give the gift of two wheels — CBT<br />Training and Motorcycle Course<br />Gift Vouchers available now!
                  </p>
                  <img src='/gift.png' alt="Gift Vouchers" className="absolute bottom-0 top-0 right-4 object-contain h-full"/>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
interface PriceCard {
  marker_text?: string | null;
  title: string;
  time: string;
  price: number;
  description: string;
  note_text?: string | null;
  button: {
    text: string;
    url: string;
  };
}

interface PriceCardSectionData {
  title: string;
  note?: string;
  bottom_text?: string;
  cards: PriceCard[];
}

export default function PriceCardSection({ data }: { data: PriceCardSectionData }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl mb-2">{data.title}</h2>
        </div>

        {/* Price Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {data.cards.map((card, index) => (
            <div
              key={index}
              className="relative bg-white rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl transition-all p-8 flex flex-col"
            >
              {/* Marker Badge */}
              {card.marker_text && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                  {card.marker_text}
                </div>
              )}

              {/* Card Title */}
              <h3 className="text-2xl font-bold text-center mb-1">{card.title}</h3>
              
              {/* Time */}
              <p className="text-slate-500 text-sm text-center mb-6 whitespace-pre-line">{card.time}</p>

              {/* Price */}
              <div className="text-center mb-8">
                <span className="text-5xl font-extrabold">£{card.price}</span>
              </div>

              {/* Features List */}
              <div
                className="mb-8 flex-grow [&_ul]:space-y-4 [&_li]:flex [&_li]:items-center [&_li]:gap-3 [&_li]:text-sm [&_li]:text-slate-600 [&_li]:before:content-['✓'] [&_li]:before:flex [&_li]:before:items-center [&_li]:before:justify-center [&_li]:before:w-5 [&_li]:before:h-5 [&_li]:before:rounded-full [&_li]:before:bg-green-100 [&_li]:before:text-green-600 [&_li]:before:text-xs [&_li]:before:font-bold [&_li]:before:flex-shrink-0"
                dangerouslySetInnerHTML={{ __html: card.description }}
              />

              {/* Note Text */}
              {card.note_text && (
                <p className="text-sm text-center text-red-500 mb-4 italic leading-tight">
                  {card.note_text}
                </p>
              )}

              {/* Button */}
              <a
                className="block w-full text-center radius20-left radius20-right-bottom bg-red-600 px-6 py-3 text-lg text-white hover:bg-red-500 transition-colors"
                href={card.button.url}
              >
                {card.button.text}
              </a>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        {data.note && (
          <p className="text-center mt-12 text-slate-500 text-xs italic">{data.note}</p>
        )}

        {/* Bottom Text */}
        {data.bottom_text && (
          <div
            className="text-center pt-3 max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: data.bottom_text }}
          />
        )}
      </div>
    </section>
  );
}

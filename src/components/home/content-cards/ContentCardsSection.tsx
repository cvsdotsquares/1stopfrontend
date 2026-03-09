interface Button {
  text: string;
  url: string;
}

interface ContentCard {
  image: string;
  title: string;
  description: string;
  marker_text?: string | null;
  red_button: Button;
  blue_button: Button;
}

interface ContentCardsSectionData {
  content_text: string;
  cards: ContentCard[];
}

export default function ContentCardsSection({ data }: { data: ContentCardsSectionData }) {
  return (
    <section className="py-10 md:py-16 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1">
          {/* Header */}
          <div 
            className="max-w-[900px] mx-auto text-center pb-4 [&_h2]:text-3xl [&_h2]:mb-4 [&_h2]:text-black [&_p]:text-gray-600 [&_div]:contents"
            dangerouslySetInnerHTML={{ __html: data.content_text }}
          />

          {/* Cards */}
          {data.cards.map((card, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={index}
                className={`bg-white mt-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row ${
                  isEven ? '' : 'md:flex-row-reverse'
                }`}
              >
                {/* Image */}
                <div className="w-full md:w-1/3 lg:w-1/4 relative overflow-hidden group">
                  <img
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${card.image}`}
                  />
                  {card.marker_text && (
                    <div className="absolute top-6 left-6 z-10">
                      <span className="bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {card.marker_text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="w-full md:w-2/3 lg:w-3/4 p-8 lg:p-12 flex flex-col justify-between">
                  <div className="text-gray-500 space-y-4">
                    <h3 className="text-2xl font-bold text-black">{card.title}</h3>
                    <div dangerouslySetInnerHTML={{ __html: card.description }} />
                  </div>
                  
                  <div className={`flex flex-wrap gap-4 mt-4 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                    <a
                      className="px-8 py-3 bg-red-600 text-primary radius20-left radius20-right-bottom hover:bg-red-500 text-white transition-all duration-300"
                      href={card.red_button.url}
                    >
                      {card.red_button.text}
                    </a>
                    <a
                      className="px-8 py-3 bg-blue-800 text-primary radius20-left radius20-right-bottom hover:bg-blue-600 text-white transition-all duration-300"
                      href={card.blue_button.url}
                    >
                      {card.blue_button.text}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface Card {
  icon: string;
  title: string;
  description: string;
}

interface InfoCardsSectionData {
  background?: 'gray' | 'light_blue';
  cards: Card[];
}

export default function InfoCardsSection({ data }: { data: InfoCardsSectionData }) {
  const bgClass = data.background === 'gray' 
    ? 'bg-gray-50' 
    : data.background === 'light_blue' 
    ? 'bg-blue-50' 
    : '';

  return (
    <section className={`py-10 lg:py-20 ${bgClass}`}>
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {data.cards.map((card, index) => (
            <div 
              key={index} 
              className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="flex h-[62px] w-[62px] items-center justify-center rounded-xl bg-red-100 mb-5 md:mb-8 [&_img]:w-[42px]">
                <img 
                  src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${card.icon}`} 
                  alt={card.title}
                />
              </div>
              <h2 className="text-3xl mb-4 md:mb-6">{card.title}</h2>
              <div 
                className="mb-6 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800"
                dangerouslySetInnerHTML={{ __html: card.description }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

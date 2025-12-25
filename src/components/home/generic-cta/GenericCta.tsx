import Link from "next/link";

interface CtaProps {
  title: string;
  backgroundImage?: string;
  backgroundColor?: string;
  containerFullWidth?: boolean;
  cta: {
    text: string;
    link: string;
  };
}

export default function GenericCta({
  title,
  backgroundImage,
  backgroundColor = "#f9fafb",
  containerFullWidth = false,
  cta
}: CtaProps) {
  const bgStyle = backgroundImage 
    ? { 
        backgroundImage: `url("${process.env.NEXT_PUBLIC_FILES_URL || ''}${backgroundImage}")`
      }
    : { backgroundColor };

  if (containerFullWidth) {
    return (
      <section
        className="relative py-16 bg-cover bg-center"
        style={bgStyle}
      >
        {backgroundImage && <div className="absolute inset-0 bg-black/40" />}
        
        <div className="relative z-10 flex items-center justify-between px-6 mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            {title}
          </h2>
          
          <a
            href={cta.link}
            className="rounded-lg bg-red-600 px-8 py-3 text-lg font-bold text-white hover:bg-red-700 transition-colors"
          >
            {cta.text}
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div 
          className={`rounded-2xl px-8 py-12 flex items-center justify-between ${backgroundImage ? 'bg-cover bg-center relative' : ''}`}
          style={bgStyle}
        >
          {backgroundImage && <div className="absolute inset-0 bg-black/40 rounded-2xl" />}
          
          <h2 className={`text-2xl font-bold md:text-3xl relative z-10 ${backgroundImage ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          
          <a
            href={cta.link}
            className="rounded-lg bg-red-600 px-8 py-3 text-lg font-bold text-white hover:bg-red-700 transition-colors relative z-10"
          >
            {cta.text}
          </a>
        </div>
      </div>
    </section>
  );
}
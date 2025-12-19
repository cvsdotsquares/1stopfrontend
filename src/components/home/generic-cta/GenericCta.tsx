import Link from "next/link";

interface CtaProps {
  title: string;
  titleHighlight?: string;
  titleEnd?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  containerized?: boolean;
  cta: {
    text: string;
    link: string;
  };
}

export default function GenericCta({
  title,
  titleHighlight,
  titleEnd,
  backgroundImage,
  backgroundColor = "bg-gray-50",
  textColor = "text-gray-900",
  containerized = false,
  cta
}: CtaProps) {
  const bgStyle = backgroundImage 
    ? { backgroundImage: `url(${backgroundImage})` }
    : {};

  const bgClass = backgroundImage 
    ? "bg-cover bg-center" 
    : backgroundColor;

  if (containerized) {
    return (
      <section className={`${backgroundColor} py-16`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl bg-indigo-700 px-8 py-12 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              {title}
              {titleHighlight && (
                <span className="text-white"> {titleHighlight}</span>
              )}
              {titleEnd && (
                <span className="text-white"> {titleEnd}</span>
              )}
            </h2>
            
            <Link
              href={cta.link}
              className="rounded-lg bg-red-600 px-8 py-3 text-lg font-bold text-white hover:bg-red-700 transition-colors"
            >
              {cta.text}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative h-32 w-full ${bgClass}`}
      style={bgStyle}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/60" />}
      
      <div className="relative z-10 flex h-full items-center justify-between px-6 mx-auto max-w-7xl">
        <h2 className={`text-2xl font-bold md:text-3xl ${textColor}`}>
          {title}
          {titleHighlight && (
            <span className="text-indigo-700"> {titleHighlight}</span>
          )}
          {titleEnd && (
            <span> {titleEnd}</span>
          )}
        </h2>
        
        <Link
          href={cta.link}
          className="rounded-lg bg-red-600 px-8 py-3 text-lg font-bold text-white hover:bg-red-700 transition-colors"
        >
          {cta.text}
        </Link>
      </div>
    </section>
  );
}
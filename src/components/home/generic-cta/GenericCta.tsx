import Link from "next/link";

interface CtaProps {
  title: string;
  backgroundImage?: string;
  backgroundColor?: string;
  containerFullWidth?: boolean;
  titleColor?: boolean;
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
  titleColor = false,
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
        className="relative py-8 md:py-16 bg-cover bg-center"
        style={bgStyle}
      >
        {backgroundImage && <div className="absolute inset-0 bg-black/40" />}

        <div className="relative z-10 flex gap-5 flex-wrap md:flex-nowrap justify-center text-center md:text-left items-center md:justify-between px-5 mx-auto max-w-[1400px]">
          <h2 className={`text-2xl font-bold ${titleColor === 1 || titleColor === true || titleColor === "1" || titleColor === "true" ? 'text-white' : 'text-gray-900'} md:text-3xl`} dangerouslySetInnerHTML={{ __html: title }} />
          <a
            href={cta.link}
            className="radius20-left radius20-right-bottom bg-red-600 px-6 py-3 text-lg text-white hover:bg-red-500 min-w-[180px] text-center"
          >
            {cta.text}
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1400px] px-6">
        <div
          className={`rounded-2xl px-8 py-12 flex gap-5 flex-wrap md:flex-nowrap justify-center text-center md:text-left items-center md:justify-between ${backgroundImage ? 'bg-cover bg-center relative' : ''}`}
          style={bgStyle}
        >
          {backgroundImage && <div className="absolute inset-0 bg-black/40 rounded-2xl" />}

          <h2 className={`text-2xl font-bold md:text-3xl relative z-10 ${titleColor === 1 || titleColor === true || titleColor === "1" || titleColor === "true" ? 'text-white' : 'text-gray-900'} md:text-3xl`} dangerouslySetInnerHTML={{ __html: title }} />

          <a
            href={cta.link}
            className="radius20-left radius20-right-bottom bg-red-600 px-6 py-3 text-lg text-white hover:bg-red-500 min-w-[180px] text-center">
            {cta.text}
          </a>
        </div>
      </div>
    </section>
  );
}
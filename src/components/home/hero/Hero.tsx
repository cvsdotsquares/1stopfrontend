interface HeroData {
  backgroundImage: string;
  nextCourse: {
    label: string;
    dateText: string;
    ctaText: string;
    ctaLink: string;
  };
  search: {
    title: string;
    placeholder: string;
  };
  promotion: {
    title: string;
    subtitle: string;
    promoCode: string;
    primaryCta: { text: string; link: string };
    secondaryCta: { text: string; link: string };
  };
  footerText: string;
}

export default function Hero({ data }: { data: HeroData }) {
  return (
    <section
      className="relative h-[740px] w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${data.backgroundImage})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Right-side content */}
      <div className="relative z-10 flex h-full items-start justify-end">
        <div className="w-full max-w-[440px]">

          {/* CBT floating card */}
          <div className="mb-4 bg-gray-200 px-10 py-7 text-center shadow-lg">
            <p className="text-sm font-semibold text-red-600">
              {data.nextCourse.label}
            </p>

            <p className="mt-2 text-[2.5rem] font-bold leading-none text-red-600">
              {data.nextCourse.dateText}
            </p>

            <a
              href={data.nextCourse.ctaLink}
              className="mt-5 inline-block rounded-xl bg-red-600 px-14 py-3 text-lg font-bold text-white hover:bg-red-700"
            >
              {data.nextCourse.ctaText}
            </a>
          </div>

          {/* Purple panel */}
          <div className="bg-[#5b4d9d] px-10 py-10 text-white shadow-lg">

            {/* Search */}
            <div className="mb-12">
              <p className="mb-3 text-base font-semibold">
                {data.search.title}
              </p>

              <div className="relative">
                <input
                  type="text"
                  placeholder={data.search.placeholder}
                  className="w-full rounded-lg bg-white px-4 py-3 pr-12 text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600">
                  🔍
                </span>
              </div>
            </div>

            {/* Summer Special */}
            <h2 className="text-[1.5rem] font-bold leading-none">
              {data.promotion.title}
            </h2>

            <p className="mt-6 text-2xl font-normal">
              {data.promotion.subtitle}
            </p>

            <p className="mt-4 text-base font-normal">
              Use Promo Code{" "}
              <span className="font-bold">
                {data.promotion.promoCode}
              </span>
            </p>

            <div className="mt-10 flex gap-4">
              <a
                href={data.promotion.primaryCta.link}
                className="rounded-lg bg-red-600 px-8 py-3 text-base font-bold text-white hover:bg-red-700"
              >
                {data.promotion.primaryCta.text}
              </a>

              <a
                href={data.promotion.secondaryCta.link}
                className="rounded-lg bg-white px-8 py-3 text-base font-bold text-gray-900 hover:bg-gray-100"
              >
                {data.promotion.secondaryCta.text}
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom banner */}
      <div className="absolute bottom-0 w-full bg-black py-6 text-center">
        <p className="text-lg font-semibold text-white">
          {data.footerText}
        </p>
      </div>
    </section>
  );
}

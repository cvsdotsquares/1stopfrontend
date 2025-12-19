import Link from "next/link";

interface WhyUsData {
  title: string;
  titleHighlight: string;
  description: string;
  subtitle: string;
  subtitleLink: { text: string; url: string };
  subtitleEnd: string;
  courses: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
  }>;
  footerText: string;
  bottomText: string;
  bottomLink: { text: string; url: string };
}

export default function WhyUsSection({ data }: { data: WhyUsData }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Title */}
        <h2 className="mb-8 text-center text-4xl font-bold text-gray-900">
          {data.title}{" "}
          <span className="text-indigo-700">{data.titleHighlight}</span>
        </h2>

        {/* Description */}
        <p className="mx-auto mb-8 max-w-5xl text-center text-gray-600 leading-relaxed">
          {data.description}
        </p>

        {/* Subtitle with link */}
        <p className="mb-12 text-center text-gray-700">
          {data.subtitle}{" "}
          <Link
            href={data.subtitleLink.url}
            className="font-semibold text-indigo-600 hover:underline"
          >
            {data.subtitleLink.text}
          </Link>{" "}
          {data.subtitleEnd}
        </p>

        {/* Courses Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.courses.map((course) => (
            <div
              key={course.id}
              className="group rounded-lg bg-gray-50 p-6 text-center transition-all hover:bg-gray-100 hover:shadow-md"
            >
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
                {course.icon}
              </div>

              {/* Title */}
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                {course.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {course.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Text */}
        <p className="mx-auto mb-6 max-w-5xl text-center text-gray-600 leading-relaxed">
          {data.footerText}
        </p>

        {/* Bottom Text with link */}
        <p className="mx-auto max-w-5xl text-center text-gray-600 leading-relaxed">
          {data.bottomText}{" "}
          <Link
            href={data.bottomLink.url}
            className="font-semibold text-indigo-600 hover:underline"
          >
            {data.bottomLink.text}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
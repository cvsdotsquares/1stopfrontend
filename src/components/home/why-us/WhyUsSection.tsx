import Link from "next/link";

interface WhyUsData {
  title: string;
  description: string;
  courses: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
  }>;
  footerText: string;
}

export default function WhyUsSection({ data }: { data: WhyUsData }) {
  // Decode multiple levels of HTML entities

  return (
    <section className="bg-white pt-6 pb-8 md:py-16 md:pt-0">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Title */}
        <div
          className="mb-5 text-center"
          dangerouslySetInnerHTML={{ __html: data.title }}
        />


        {/* Description */}
        <div
          className="mx-auto mb-6 md:mb-6 max-w-6xl text-center text-gray-500 leading-relaxed prose prose-lg [&_a]:text-blue-600 [&_a]:hover:text-red-500 [&_p:last-child]:text-xl"
          dangerouslySetInnerHTML={{ __html: data.description }}
        />

        {/* Courses Grid */}
        <div className="flex flex-wrap justify-center gap-5">
          {data.courses.map((course) => (
            <div
              key={course.id}
              className="group rounded-lg bg-white border border-gray-300 p-2 md:p-6 py-4 text-center transition-all hover:bg-gray-100 hover:shadow-md w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)]"
            >
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-[80px] w-[80px] items-center justify-center rounded-xl bg-red-100">
                <img
                  src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${course.icon}`}
                  alt={course.title}
                  className="w-10 h-10 object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-lg font-bold text-black">
                {course.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed">
                {course.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Text */}
        <div
          className="mx-auto max-w-6xl pt-4 text-center text-gray-500 leading-relaxed prose prose-lg [&_a]:text-blue-600 [&_a]:hover:text-red-500"
          dangerouslySetInnerHTML={{ __html: data.footerText }}
        />
      </div>
    </section>
  );
}
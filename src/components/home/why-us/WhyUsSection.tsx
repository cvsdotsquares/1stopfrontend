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
  const decodeHtml = (html: string) => {
    let decoded = html;
    // Decode multiple times for heavily encoded content
    for (let i = 0; i < 5; i++) {
      const txt = document.createElement('textarea');
      txt.innerHTML = decoded;
      decoded = txt.value;
    }
    return decoded;
  };

  return (
    <section className="bg-white py-16 pt-0">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Title */}
        <div 
          className="mb-5 text-center [&_h2]:text-4xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-gray-900"
          dangerouslySetInnerHTML={{ __html: decodeHtml(data.title) }}
        />
        

        {/* Description */}
        <div 
          className="mx-auto mb-12 max-w-6xl text-center text-gray-500 leading-relaxed prose prose-lg [&_a]:text-blue-600 hover:[&_a]:text-red-800"
          dangerouslySetInnerHTML={{ __html: decodeHtml(data.description) }}
        />

        {/* Courses Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.courses.map((course) => (
            <div
              key={course.id}
              className="group rounded-lg bg-white border border-gray-300 p-6 text-center transition-all hover:bg-gray-100 hover:shadow-md"
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
          className="mx-auto max-w-6xl text-center text-gray-500 leading-relaxed prose prose-lg [&_a]:text-blue-600 hover:[&_a]:text-red-600"
          dangerouslySetInnerHTML={{ __html: decodeHtml(data.footerText) }}
        />
      </div>
    </section>
  );
}
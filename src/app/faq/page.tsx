'use client';

import { useEffect, useState } from 'react';

interface FAQCategory {
  id: number;
  category: string;
  questions: Array<{
    id: number;
    question: string;
    answer: string;
  }>;
}

interface FAQData {
  title: string;
  subtitle: string;
  categories: FAQCategory[];
}

export default function FAQPage() {
  const [faqData, setFaqData] = useState<FAQData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + '/faq')
      .then(res => res.json())
      .then(json => {
        if (json.success) setFaqData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center">Loading FAQs...</div>;
  if (!faqData) return <div className="py-20 text-center text-red-600">Failed to load FAQs.</div>;

  return (
    <section className="py-10 lg:py-16 bg-gray-50">

      <div className="max-w-[1400px] mx-auto px-4">

        <div className="py-12">

          <h1 className="text-4xl font-bold mb-2 text-center">
            {faqData.title}
          </h1>

          <p className="text-lg text-gray-600 mb-10 text-center">
            {faqData.subtitle}
          </p>


          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT CONTENT */}
            <div className="lg:w-3/4">

              {faqData.categories.map(category => (

                <div key={category.id} className="mb-12">

                  <h2 className="text-2xl font-semibold mb-6 text-blue-800">
                    {category.category}
                  </h2>

                  <ul className="space-y-6">

                    {category.questions.map(q => (

                      <li key={q.id} className="bg-white rounded-xl shadow p-6">

                        <div className="font-bold text-lg mb-2 text-gray-900">
                          {q.question}
                        </div>

                        <div
                          className="text-gray-700"
                          dangerouslySetInnerHTML={{ __html: q.answer }}
                        />

                      </li>

                    ))}

                  </ul>

                </div>

              ))}

            </div>


            {/* RIGHT SIDEBAR */}
            <div className="lg:w-1/4">

              <section className="bg-blue-50 p-6 space-y-8 rounded-xl">

                {/* About */}
                <div>

                  <h4 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
                    About 1 Stop
                    <span className="flex-1 h-px bg-red-600"></span>
                  </h4>
                  <a href="/">
                    <img
                        className="max-w-[120px] mb-3"
                        src={`${process.env.NEXT_PUBLIC_FILES_URL}/app/webroot/cmImages/images/1-stop-logo-square.jpg`}
                        alt="1-stop-logo"
                    />
                  </a>
                  <p className="text-sm text-gray-700">
                    1 Stop Instruction are Roadcraft Professionals For All Categories Of Driving...
                    So whatever you want to ride or drive on the road, we can help you!
                  </p>

                </div>


                {/* Popular Posts */}
                <div>

                  <h4 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
                    Want to Book a Course?
                    <span className="flex-1 h-px bg-red-600"></span>
                  </h4>

                  <div className="space-y-4">

                    <a href="/bookings" className="block font-semibold hover:text-blue-600 transition">
                      Booking
                    </a>

                  </div>

                </div>


                {/* Social */}
                <div>

                  <h4 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
                    Follow Us
                    <span className="flex-1 h-px bg-red-600"></span>
                  </h4>
                  <a href="https://www.facebook.com/1stopinstruction/">
                    <img
                        src={`${process.env.NEXT_PUBLIC_FILES_URL}/app/webroot/cmImages/images/find-us-on-facebook%283%29.png`}
                        alt="facebook"
                        className="max-w-[180px]"
                    />
                  </a>

                </div>

              </section>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

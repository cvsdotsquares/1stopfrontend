"use client";

import { useState } from "react";

interface FaqsData {
  title: string;
  subtitle: string;
  faqs: Array<{
    id: number;
    question: string;
    answer: string[];
  }>;
}

export default function FaqsSection({ data }: { data: FaqsData }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-6">
        {/* Title */}
        <h2 className="mb-4 text-center text-4xl font-bold text-gray-900">
          {data.title}
        </h2>

        {/* Subtitle */}
        <p className="mb-12 text-center text-gray-600 leading-relaxed">
          {data.subtitle}
        </p>

        {/* FAQ Items */}
        <div className="faq-wrapper">
          {data.faqs.map((faq) => (
            <div
              key={faq.id}
              className="border-t border-b border-gray-200 bg-white"
            >
              {/* Question */}
              <button
                onClick={() => toggleFaq(faq.id)}
                className="flex w-full items-center justify-between p-6 text-left hover:bg-gray-50"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <span className="ml-4 flex-shrink-0 text-2xl text-gray-500">
                  {openFaq === faq.id ? "−" : "+"}
                </span>
              </button>

              {/* Answer */}
              {openFaq === faq.id && (
                <div className="border-t border-gray-200 px-6 pb-6">
                  <div className="pt-4 space-y-3">
                    {faq.answer.map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: paragraph }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import { useState } from "react";

interface FaqsData {
  title: string;
  subtitle: string;
  faqs: Array<{
    id: number;
    category: string;
    questions: Array<{
      id: number;
      question: string;
      answer: string;
    }>;
  }>;
}

export default function FaqsSection({ data }: { data: FaqsData }) {
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleCategory = (categoryId: number) => {
    if (openCategory === categoryId) {
      setOpenCategory(null);
      setOpenQuestion(null);
    } else {
      setOpenCategory(categoryId);
      setOpenQuestion(null);
    }
  };

  const toggleQuestion = (questionId: number) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };

  return (
    <section className="bg-white py-8 md:py-16">
      <div className="mx-auto max-w-[945px] px-6">
        {/* Title */}
        <h2 className="mb-4 text-center">
          {data.title}
        </h2>

        {/* Subtitle */}
        <p className="mb-6 text-center">
          {data.subtitle}
        </p>

        {/* FAQ Categories */}
        <div className="space-y-0">
          {data.faqs.map((category) => (
            <div
              key={category.id}
              className="border-b border-gray-200"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center justify-between py-3 text-left cursor-pointer"
              >
                <h3 className="text-xl font-bold text-gray-900">
                  {category.category}
                </h3>
                <span className="ml-4 flex-shrink-0 text-2xl text-gray-500">
                  {openCategory === category.id ? "−" : "+"}
                </span>
              </button>

              {/* Questions */}
              {openCategory === category.id && (
                <div className="border-t border-gray-200">
                  {category.questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-100 last:border-b-0">
                      {/* Question */}
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className="flex w-full items-center justify-between p-4 pl-8 text-left hover:bg-gray-50"
                      >
                        <h4 className="text-lg font-medium text-gray-800">
                          {question.question}
                        </h4>
                        <span className="ml-4 flex-shrink-0 text-xl text-gray-400">
                          {openQuestion === question.id ? "−" : "+"}
                        </span>
                      </button>

                      {/* Answer */}
                      {openQuestion === question.id && (
                        <div className="px-8 pb-4">
                          <div 
                            className="text-gray-700 leading-relaxed prose prose-sm max-w-none [&_a]:text-blue-600 hover:[&_a]:text-blue-800"
                            dangerouslySetInnerHTML={{ __html: question.answer }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
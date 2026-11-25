import { cmsApi } from '@/services/api';
import { cache } from 'react';

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
  page_ex_rhs: string;
  categories: FAQCategory[];
}

interface FAQPageApiResponse {
  success: boolean;
  data?: FAQData;
}

const getFaqCmsPage = cache(async () => cmsApi.getPage('faq'));

/* ------------------ helpers ------------------ */

const stripHtml = (html?: string) => {
  if (!html) return "";

  return html
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll("&ndash;", "-")
    .replaceAll("&mdash;", "—")
    .replaceAll("&pound;", "£")
    .trim();
};

const extractTitleSubtitleFromPageContent = (html?: string) => {
  if (!html) {
    return { title: "", subtitle: "" };
  }

  const titleMatch = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(html);
  const subtitleMatch = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(html);

  return {
    title: stripHtml(titleMatch?.[1]),
    subtitle: stripHtml(subtitleMatch?.[1])
  };
};


/* ------------------ SEO metadata (SERVER) ------------------ */

export async function generateMetadata() {

  const pageData = await getFaqCmsPage();

  const pageContent = pageData?.data;

  return {
    title:
      stripHtml(pageContent?.meta_title),

    description:
      stripHtml(pageContent?.meta_desc),

    keywords:
      stripHtml(pageContent?.meta_keyword),

    viewport:
      "width=device-width, initial-scale=1, user-scalable=no",
  };
}


/* ------------------ PAGE (SERVER COMPONENT) ------------------ */

export default async function FAQPage() {

  let faqData: FAQData | null = null;
  let cmsTitle = "";
  let cmsSubtitle = "";
  let cmsSidebar = "";

  try {
    const pageData = await getFaqCmsPage();
    const pageContentHtml = pageData?.data?.page_content || "";
    const parsedHeader = extractTitleSubtitleFromPageContent(pageContentHtml);
    const sidebarHtml = (pageData?.data as { page_ex_rhs?: string } | undefined)?.page_ex_rhs || "";
    cmsTitle = parsedHeader.title;
    cmsSubtitle = parsedHeader.subtitle;
    cmsSidebar = sidebarHtml;
  } catch (error) {
    console.error('Error fetching FAQ page metadata content:', error);
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const payload: FAQPageApiResponse = await response.json();
      faqData = payload.data ?? null;
    }
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    faqData = null;
  }

  if (!faqData)
    return (
      <div className="py-20 text-center text-red-600">
        Failed to load FAQs.
      </div>
    );

  return (
    <section className="py-10 lg:py-16 bg-gray-50">

      <div className="max-w-[1400px] mx-auto px-4">

        <div className="py-12">

          <h1 className="text-4xl font-bold mb-2 text-center">
            {cmsTitle || faqData.title}
          </h1>

          <p className="text-lg text-gray-600 mb-10 text-center">
            {cmsSubtitle || faqData.subtitle}
          </p>


          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT CONTENT */}
            <div className="lg:w-3/4">

              {faqData.categories.map((category: FAQCategory) => (

                <div key={category.id} className="mb-12">

                  <h2 className="text-2xl font-semibold mb-6 text-blue-800">
                    {category.category}
                  </h2>

                  <ul className="space-y-6">

                    {category.questions.map((q) => (

                      <li
                        key={q.id}
                        className="bg-white rounded-xl shadow p-6"
                      >

                        <div className="font-bold text-lg mb-2 text-gray-900">
                          {q.question}
                        </div>

                        <div
                          className="text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: q.answer
                          }}
                        />

                      </li>

                    ))}

                  </ul>

                </div>

              ))}

            </div>


            {/* RIGHT SIDEBAR */}
            <div className="lg:w-1/4">
              <div
                dangerouslySetInnerHTML={{ __html: cmsSidebar }}
              />
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

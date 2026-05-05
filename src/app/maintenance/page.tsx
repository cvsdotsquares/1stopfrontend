import type { Metadata } from "next";
import Image from "next/image";

// Always render fresh — the maintenance status comes from middleware so we
// never want a static-cached version of this page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scheduled maintenance — 1Stop Instruction",
  description:
    "We're performing scheduled maintenance on the 1Stop Instruction website. We'll be back shortly.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 px-4 py-12">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="1Stop Instruction"
            width={140}
            height={64}
            priority
          />
        </div>

        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
          We&apos;ll be right back
        </h1>

        <p className="text-base text-gray-600 leading-relaxed mb-8">
          Our website is currently undergoing scheduled maintenance to bring you
          a better experience. Please check back in a little while — we
          appreciate your patience.
        </p>

        <div className="flex justify-center">
          <a
            href="mailto:info@1stopinstruction.com"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-5 py-2.5 transition-colors"
          >
            Contact us
          </a>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          If you keep seeing this page, please email{" "}
          <a
            href="mailto:info@1stopinstruction.com"
            className="underline hover:text-gray-600"
          >
            info@1stopinstruction.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}

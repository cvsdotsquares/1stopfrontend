import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "1Stop Instruction - Motorcycle Training London",
  description: "Leading motorcycle training school in London. CBT, DAS, and advanced riding courses. Book online with instant confirmation.",
  keywords: "CBT training London, motorcycle training, DAS course, direct access scheme, motorbike lessons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script id="mcjs" dangerouslySetInnerHTML={{ __html: `!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/5e0e93ccc447650b65ceb0476/b21db1bd9b38727da5e5dcbe7.js");` }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </QueryProvider>
        {/* reCAPTCHA Script */}
        <script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}`}
          async
          defer
        ></script>
      </body>
    </html>
  );
}

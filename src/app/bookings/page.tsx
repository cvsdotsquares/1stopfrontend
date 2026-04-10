import OnePageBookingCheckout from "@/components/booking/OnePageBookingCheckout";
import { cmsApi } from '@/services/api';

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

export async function generateMetadata() {
  const pageData = await cmsApi.getPage("bookings");
  const pageContent = pageData?.data;

  return {
    title: stripHtml(pageContent?.meta_title),
    description: stripHtml(pageContent?.meta_desc),
    keywords: stripHtml(pageContent?.meta_keyword),
    viewport: "width=device-width, initial-scale=1, user-scalable=no",
    robots: "noindex, nofollow, noarchive, nosnippet"
  };
}

export default function Page() {
  return <OnePageBookingCheckout />;
}
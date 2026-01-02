import React from "react";
import ContactUsClient from "./ContactUsClient";

export const revalidate = 60; // revalidate data periodically

export default async function Page() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "") : "";
    const fetchUrl = apiBase ? `${apiBase}/contactus` : "/api/contactus";
    const res = await fetch(fetchUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    // console.log("Contact Us Page Data:", json);
    const data = json?.data ?? {};

    return (
      <ContactUsClient
        page_title={data.page_title || "Contact us"}
        page_content={data.page_content || ""}
        carousel_static_image={data.carousel_static_image ? (data.carousel_static_image.startsWith("http") ? data.carousel_static_image : process.env.NEXT_PUBLIC_FILES_URL + '/uploads/' + data.carousel_static_image) : undefined}
        contact_offices={data.contact_offices || []}
      />
    );
  } catch (err) {
    console.error("Failed to load contact us data", err);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Contact Us</h1>
        <p>Unable to load page content at the moment.</p>
      </div>
    );
  }
}

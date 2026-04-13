"use client";

import React, { useEffect, useRef, useState } from "react";

type Office = {
  id: number;
  lname: string;
  latitude?: string;
  longitude?: string;
  content?: string;
  weight?: number;
  status?: number;
};

type Props = {
  page_title: string;
  page_content: string;
  contact_offices: Office[];
};

declare global {
  interface Window {
    initMap?: () => void;
    google?: any;
  }
}

export default function ContactUsClient({
  page_title,
  page_content,
  contact_offices,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | "all">("all");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const captchaRef = useRef<HTMLDivElement | null>(null);

  // Check if reCAPTCHA is available
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && typeof window !== "undefined") {
      const checkRecaptcha = () => {
        if ((window as any).grecaptcha && (window as any).grecaptcha.ready) {
          (window as any).grecaptcha.ready(() => {
            setRecaptchaReady(true);
          });
        } else {
          setTimeout(checkRecaptcha, 100);
        }
      };
      checkRecaptcha();
    }
  }, []);

  // Filter and sort offices
  useEffect(() => {
    const filtered = (contact_offices || []).filter((o) => o.status === 1);
    filtered.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
    setOffices(filtered);
  }, [contact_offices]);

  // Load Google Maps script and init
  useEffect(() => {
    const key =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      (typeof window !== "undefined" ? (window as any).__NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : undefined);
    if (!key) {
      console.warn("Google Maps API key not found. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
      return;
    }

    // Promise-based loader so multiple mounts/writes wait on same promise
    const loadGoogleMaps = (): Promise<any> => {
      if (typeof window === "undefined") return Promise.reject(new Error("No window"));
      if ((window as any).google) return Promise.resolve((window as any).google);
      if ((window as any).__gmapsPromise) return (window as any).__gmapsPromise;

      const p = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-google-maps]');
        if (existingScript) {
          // wait a tick for google to be available
          const check = () => {
            if ((window as any).google) return resolve((window as any).google);
            setTimeout(check, 50);
          };
          check();
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
        script.async = true;
        script.defer = true;
        script.setAttribute("data-google-maps", "true");
        script.onload = () => {
          resolve((window as any).google);
        };
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      });

      (window as any).__gmapsPromise = p;
      return p;
    };

    loadGoogleMaps()
      .then(() => {
        // ensure map initializes after script is ready and offices are set
        if (!mapInstance.current) initMap();
        else refreshMarkers();
      })
      .catch((err) => {
        console.warn("Failed to load Google Maps", err);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offices]);

  useEffect(() => {
    // Update markers when selectedOfficeId changes
    refreshMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOfficeId]);

  function initMap() {
    if (!mapRef.current) return;
    const google = (window as any).google;
    if (!google) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 10,
      center: { lat: 51.56, lng: 0.1 },
    });

    refreshMarkers();
  }

  function refreshMarkers() {
    const google = (window as any).google;
    if (!google || !mapInstance.current) return;

    // Clear existing
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const visibleOffices = selectedOfficeId === "all" ? offices : offices.filter((o) => o.id === selectedOfficeId);

    const bounds = new google.maps.LatLngBounds();

    visibleOffices.forEach((o) => {
      const lat = parseFloat(o.latitude || "0");
      const lng = parseFloat(o.longitude || "0");
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: o.lname,
        icon: {
          url: '/logo.png',
          scaledSize: new google.maps.Size(50, 50),
        },
      });

      const info = new google.maps.InfoWindow({ content: `<div style="max-width:300px"><strong>${escapeHtml(o.lname)}</strong></div>` });
      marker.addListener("click", () => info.open({ anchor: marker, map: mapInstance.current }));

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    if (!bounds.isEmpty()) {
      mapInstance.current.fitBounds(bounds, 80);
      // Prevent over-zooming on single markers
      google.maps.event.addListenerOnce(mapInstance.current, 'bounds_changed', () => {
        if (mapInstance.current.getZoom() > 14) {
          mapInstance.current.setZoom(14);
        }
      });
    }
  }

  function escapeHtml(str?: string) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function (tag) {
      const chars: any = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return chars[tag] || tag;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      // Get reCAPTCHA v3 token
      let recaptchaToken = "";
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

      if (siteKey && (window as any).grecaptcha && (window as any).grecaptcha.execute) {
        try {
          recaptchaToken = await (window as any).grecaptcha.execute(siteKey, { action: 'submit' });
        } catch (err) {
          console.warn("Failed to get reCAPTCHA token", err);
        }
      }

      const payload = { name, email, subject, message, recaptchaToken };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setStatusMsg("Message sent successfully");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatusMsg(json?.message || "Failed to send message");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedOffice = offices.find((o) => o.id === selectedOfficeId);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 contact-us-page">


      <h1>{page_title}</h1>

      <div className="prose max-w-none [&_a]:underline [&_a:hover]:text-red-500 mb-8" dangerouslySetInnerHTML={{ __html: page_content }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4 bg-gray-50 p-6 rounded">
          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold mb-1">Your name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Your email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Subject</label>
              <input required value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border rounded px-3 py-2 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Message</label>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded px-3 py-2 h-32  bg-white" />
            </div>

            <div>
              <button disabled={submitting} type="submit" className="min-w-[210px] mt-6 inline-block radius20-left radius20-right-bottom bg-red-600 px-6 py-3 text-center text-lg text-white hover:bg-red-500 cursor-pointer">
                {submitting ? "Sending..." : "Submit"}
              </button>
            </div>

            {statusMsg ? <p className="mt-2 text-sm">{statusMsg}</p> : null}
          </form>
          <div className="flex-1 min-h-[300px]">
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} className="rounded overflow-hidden" />
          </div>
        </div>
        <div>
          <div className="bg-gray-50 p-6 rounded  mb-4">
            <label className="block text-sm font-bold mb-2">Select Site</label>
            <select value={selectedOfficeId} onChange={(e) => setSelectedOfficeId(e.target.value === "all" ? "all" : Number(e.target.value))} className="w-full border bg-white rounded px-3 py-2">
              <option value="all">All Sites</option>
              {offices.map((o) => (
                <option value={o.id} key={o.id}>
                  {o.lname}
                </option>
              ))}
            </select>
          </div>

          {selectedOffice ? (
            <div className="p-6 rounded bg-gray-50  [&_table]:table [&_table]:w-full [&_table]:border [&_table]:border-gray-300 [&_td]:p-3 [&_table]:mb-3" dangerouslySetInnerHTML={{ __html: selectedOffice.content || "" }} />
          ) : (
            <div className="p-6 rounded bg-gray-50 [&_table]:table [&_table]:w-full [&_table]:border [&_table]:border-gray-300">
              <h3 className="font-semibold mb-2">All offices</h3>
              <ul className="list-disc pl-5">
                {offices.map((o) => (
                  <li key={o.id} className="mb-2">
                    <strong>{o.lname}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* <div className="pt-8 pb-3 [&_h3]:font-bold [&_h3]:text-2xl [&_h3]:mb-4">
          <h3><span className="mr-1 md:mr-3 text-red-500 text-large"><i className="fa-solid fa-location-dot"></i></span>
            1 stop Instruction - East London - Beckton{" "}
            <span style={{ color: "#383092" }}>
              (Newham Powerleague)
            </span>
          </h3>
          <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d158717.4599157036!2d0.0130463!3d51.5689611!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a71ae5bb6831%3A0x884a8c0191b39955!2s1%20Stop%20Instruction%20-%20Newham%20CBT%20Test%20Centre!5e0!3m2!1sen!2sin!4v1768303487197!5m2!1sen!2sin" width="100%" height="450" loading="lazy"></iframe>
      </div> */}


    </div>
  );
}

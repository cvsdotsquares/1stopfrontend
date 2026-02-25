import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Mailchimp API credentials
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const DATACENTER = process.env.MAILCHIMP_API_SERVER || "us11"; // Extract from your API key (e.g., "us11")

    if (!API_KEY || !AUDIENCE_ID) {
      console.error("Missing Mailchimp credentials");
      return NextResponse.json(
        { error: "Newsletter service not configured" },
        { status: 500 }
      );
    }

    const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString("base64")}`,
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(
        { message: "Successfully subscribed to newsletter!" },
        { status: 200 }
      );
    } else {
      // Handle Mailchimp errors
      if (data.title === "Member Exists") {
        return NextResponse.json(
          { error: "This email is already subscribed!" },
          { status: 400 }
        );
      }
      
      console.error("Mailchimp API error:", data);
      return NextResponse.json(
        { error: data.detail || "Failed to subscribe" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "An error occurred while subscribing" },
      { status: 500 }
    );
  }
}

"use client";

import { useState, FormEvent } from "react";

export default function NewsLetter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Add your newsletter API call here
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Successfully subscribed!");
        setEmail("");
      } else {
        setMessage("Failed to subscribe. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-0">
        <input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none bg-white border border-white focus:border-red-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-500 disabled:bg-red-400 text-lg text-white px-6 py-3 transition-colors"
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {message && (
        <p className={`mt-3 text-sm ${message.includes("Successfully") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

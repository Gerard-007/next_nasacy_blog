"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

export default function ContactPage() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    // Inject current time into the hidden field before sending
    const timeInput = form.current?.querySelector<HTMLInputElement>("input[name='time']");
    if (timeInput) {
      timeInput.value = new Date().toLocaleString();
    }

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        form.current!,
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
      )
      .then(
        () => {
          setStatus("sent");
          form.current?.reset();
          setTimeout(() => setStatus("idle"), 4000);
        },
        () => {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 4000);
        }
      );
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I become a regular contributor?",
      answer:
        "We look for deep domain expertise and a unique perspective. Submit your first pitch via the \"Editorial\" topic in the contact form above. Our editorial team typically reviews applications within 5-7 business days.",
    },
    {
      question: "What are the content guidelines?",
      answer:
        "We value quality over quantity. Posts should be evidence-based, well-structured, and provide actionable insights for our professional readership. We strictly prohibit AI-generated content without substantial human oversight and original thought.",
    },
    {
      question: "Do you offer paid writing opportunities?",
      answer:
        "Yes, we have a premium writer's program for industry experts who contribute exclusive, high-impact long-form pieces. Eligibility is determined after three successful guest publications that meet our high engagement benchmarks.",
    },
  ];

  return (
    <div className="pt-16">
      {/* Minimalist Hero */}
      <section className="max-w-container-max mx-auto px-gutter pt-8 pb-16 text-center md:text-left">
        <div className="max-w-content-max">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-4">
            We&apos;d love to hear from you.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Whether you have a question about our platform, interest in
            contributing, or just want to say hi, our team is here to help.
          </p>
        </div>
      </section>

      {/* Split Layout: Contact Form & Info */}
      <section className="max-w-container-max mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Side: Contact Form */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0px_4px_20px_rgba(51,65,85,0.05)] border border-outline-variant/20">
          <form ref={form} onSubmit={sendEmail} className="space-y-6">
            <input type="hidden" name="time" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-surface"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="w-full bg-surface border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  type="text"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-surface"
                  htmlFor="user_email"
                >
                  Email
                </label>
                <input
                  className="w-full bg-surface border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface"
                  id="user_email"
                  name="user_email"
                  placeholder="john@example.com"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="font-label-md text-label-md text-on-surface"
                htmlFor="topic"
              >
                Topic
              </label>
              <select
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-on-surface"
                id="topic"
                name="topic"
              >
                <option value="editorial">Editorial</option>
                <option value="technical">Technical Support</option>
                <option value="partnerships">Partnerships</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                className="font-label-md text-label-md text-on-surface"
                htmlFor="message"
              >
                Message
              </label>
              <textarea
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-on-surface"
                id="message"
                name="message"
                placeholder="How can we help you?"
                rows={5}
                required
              />
            </div>

            <button
              className={`w-full md:w-auto px-8 py-4 rounded-full font-label-md text-label-md active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                status === "sent"
                  ? "bg-secondary text-on-secondary"
                  : "bg-primary text-on-primary hover:bg-primary/90"
              }`}
              type="submit"
              disabled={status === "sending"}
            >
              {status === "idle" && "Send Message"}
              {status === "sending" && "Sending..."}
              {status === "sent" && "Message Sent ✓"}
              {status === "error" && "Failed — Retry"}
            </button>
          </form>
        </div>

        {/* Right Side: Contact Info & Visual */}
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Get in Touch
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary">
                    mail
                  </span>
                  <span className="font-body-md text-body-md">
                    hello@nasacy.com
                  </span>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary">
                    location_on
                  </span>
                  <span className="font-body-md text-body-md">
                    Cooperative villas estate Badore, Ajah, Lagos. Nigeria
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest">
                Follow Our Journey
              </h4>
              <div className="flex gap-4">
                <a
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all"
                  href="#"
                >
                  <span className="material-symbols-outlined">public</span>
                </a>
                <a
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all"
                  href="#"
                >
                  <span className="material-symbols-outlined">
                    brand_awareness
                  </span>
                </a>
                <a
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all"
                  href="#"
                >
                  <span className="material-symbols-outlined">share</span>
                </a>
              </div>
            </div>
          </div>

          {/* Office Visual */}
          <div className="relative w-full aspect-square md:aspect-video lg:aspect-square rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full h-full object-cover"
              alt="InsightHub office space"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs1A2DdQSw_fZy-oMK58MzvxeCVR2JUQIJiOV0l6JNC-VsT-fS93CI-G4pSo8khatJJTO0fCF69S-dsuSlfkMaXfML81_OumxPNYOAOq85Fm-gVIyekCsD55C3eJIYTHvgoDoc7cDva9rE0j3TR9wA3Ng3GTGvH9bKsFj7F-bazV_aURPlNabbWLwWyj5Hqh8fwccOfmhz7gp0DrFdZPPlptimrQn0tkUZ8o9KDNz8S4cjcSEcl0jW9A"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/40 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-content-max mx-auto px-gutter mt-24 pb-20">
        <div className="text-center mb-12">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Frequently Asked Questions
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Everything you need to know about joining our writing community.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest"
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-headline-sm text-[18px] text-on-surface">
                  {faq.question}
                </span>
                <span
                  className={`material-symbols-outlined transition-transform duration-300 ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: openFaq === index ? "200px" : "0px",
                }}
              >
                <div className="p-6 pt-0 font-body-md text-body-md text-on-surface-variant">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

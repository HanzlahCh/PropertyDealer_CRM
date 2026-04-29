"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  {
    src: "/images/slide-1.png",
    alt: "CRM Dashboard",
    title: "Smart Lead Management",
    subtitle: "Track, score, and convert leads with powerful analytics",
  },
  {
    src: "/images/slide-2.png",
    alt: "Luxury Property",
    title: "Premium Properties",
    subtitle: "Manage high-value listings across DHA, Bahria & more",
  },
  {
    src: "/images/slide-3.png",
    alt: "Deal Closing",
    title: "Close More Deals",
    subtitle: "Streamlined pipelines that turn prospects into clients",
  },
];

export default function AuthImageCarousel() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setFade(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-indigo-900/40" />
      </div>

      {/* Text overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-10">
        <div
          className="transition-all duration-500 ease-in-out"
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">{slide.title}</h2>
          <p className="text-indigo-200 text-sm">{slide.subtitle}</p>
        </div>

        {/* Dots indicator */}
        <div className="flex gap-2 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setCurrent(i);
                  setFade(true);
                }, 400);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-white"
                  : "w-4 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

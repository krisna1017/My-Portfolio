'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Reveal } from '@/components/reveal';

const CV_IMAGE = '/CV-Krisna Yuda-Web Developer.png';

export function HeroSection() {
  const [showCv, setShowCv] = useState(false);

  useEffect(() => {
    if (showCv) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [showCv]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCv(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="home" className="w-full h-fit scroll-mt-12 px-4 py-10 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl flex flex-col items-center justify-center text-center relative">
        <Reveal>
          <p className="text-md md:text-2xl font-medium uppercase tracking-wider">kadek permana krisna yuda</p>
          <h1 className="mt-2 text-7xl md:text-4xl tracking-wider md:text-[230px] font-anton uppercase text-orange">
            portofolio
          </h1>
          <div className="mt-8 flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowCv(true)}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-anton  uppercase tracking-widest border-2 border-orange transition-colors hover:bg-muted"
            >
              see my cv
            </button>
          </div>
          <div className="relative mt-62 md:mt-0 flex flex-wrap gap-3 justify-start max-w-sm z-9999">
            <h3 className="text-orange uppercase text-xl">web developer</h3>
            <div className="flex flex-col gap-2 text-justify text-[16px]">
              <p>Hi, I'am Krisna Yuda. 6th semester information Systems student of ITB STIKOM BALI with a passion for Software Engineering and Web Development. I enjoy turning ideas and problems into funtional, responsive, and user-focused digital solution.</p>
              <p>I'am continously improving my technical and problem solving skills, and i'm eager to grow, collaborate, and contribute to meaningful digital product as a Software Engineering/Web Developer</p>
            </div>
          </div>

          {/* Hero Image with White Gradient Fade down to thighs */}
          <div className="w-xl absolute md:top-20 md:translate-x-1/2 top-20 left-0 h-full pointer-events-none select-none">
            <img
              src="/hero-img.png"
              alt="hero-img"
              className="md:w-full md:h-full w-100 h-100 object-cover mask-[linear-gradient(to_bottom,black_80%,transparent_50%)] [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent_80%)]"
            />
            <div className="absolute inset-x-0 bottom-0 h-[35%] bg-linear-to-t from-white via-white/80 to-transparent" />
          </div>
        </Reveal>
      </div>

      {/* ============ CV POP-UP MODAL ============ */}
      {showCv && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-hidden"
          onClick={() => setShowCv(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close CV"
              onClick={() => setShowCv(false)}
              className="absolute -top-4 -right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-orange text-white shadow-lg transition-transform hover:scale-110"
            >
              <X className="size-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CV_IMAGE}
              alt="CV Krisna Yuda - Web Developer"
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}

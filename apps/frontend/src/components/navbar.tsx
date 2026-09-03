"use client"
import { useState } from 'react';

const links = [
  { href: '#home', label: 'Profile', icon: 'home' },
  { href: '#about', label: 'Resume', icon: 'resume' },
  { href: '#projects', label: 'Projects', icon: 'projects' },
  { href: '#contact', label: 'Contact', icon: 'contact' },
];

export function Navbar() {
  const [active, setActive] = useState('#home');

  return (
    <>
      {/* =====================================================
          DESKTOP NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur py-5">
        <nav className="mx-auto flex max-w-6xl items-center justify-center px-4 py-3">
          <ul className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
            {links.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setActive(link.href)}
                    className={`
                      inline-block
                      rounded-xl
                      px-3
                      py-1
                      text-sm
                      lg:text-base
                      font-medium
                      uppercase
                      transition-all
                      duration-200
                      hover:scale-105
                      ${isActive
                        ? 'bg-orange text-white'
                        : 'bg-transparent text-black'
                      }
                    `}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}
      <nav
        className="
          fixed
          bottom-3
          left-3
          right-3
          z-50
          md:hidden
        "
      >
        <div
          className="
            mx-auto
            max-w-md
            rounded-[28px]
            bg-white/20 backdrop-blur-2xl
            px-3
            py-3
            shadow-[0_8px_30px_rgba(0,0,0,0.15)]
            ring-1
            ring-black/5
          "
        >
          <ul className="grid grid-cols-4 items-center">
            {links.map((link) => {
              const isActive = active === link.href;

              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setActive(link.href)}
                    className={`
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-1
                      rounded-xl
                      py-1
                      transition-all
                      duration-200
                      ${isActive
                        ? 'bg-transparent text-orange'
                        : 'bg-transparent text-black'
                      }
                    `}
                  >
                    {/* ICON */}
                    <div
                      className={`
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        transition-transform
                        duration-200
                        ${isActive
                          ? 'scale-110'
                          : 'scale-100'
                        }
                      `}
                    >
                      {link.icon === 'home' && (
                        <HomeIcon active={isActive} />
                      )}

                      {link.icon === 'resume' && (
                        <ResumeIcon active={isActive} />
                      )}

                      {link.icon === 'projects' && (
                        <ProjectsIcon active={isActive} />
                      )}

                      {link.icon === 'contact' && (
                        <ContactIcon active={isActive} />
                      )}
                    </div>

                    {/* LABEL */}
                    <span
                      className={`
                        text-[11px]
                        font-medium
                        ${isActive
                          ? 'font-semibold'
                          : ''
                        }
                      `}
                    >
                      {link.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}


/* =====================================================
   ICONS
===================================================== */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-6 w-6 ${active ? 'stroke-orange' : 'stroke-black'
        }`}
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5L12 3l9 7.5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 9.5V21h13V9.5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 21v-6h5v6"
      />
    </svg>
  );
}


function ResumeIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-6 w-6 ${active ? 'stroke-orange' : 'stroke-black'
        }`}
      strokeWidth="1.8"
    >
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M8 8h8"
      />

      <path
        strokeLinecap="round"
        d="M8 12h8"
      />

      <path
        strokeLinecap="round"
        d="M8 16h5"
      />
    </svg>
  );
}


function ProjectsIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-6 w-6 ${active ? 'stroke-orange' : 'stroke-black'
        }`}
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="8" />

      <path
        strokeLinecap="round"
        d="M12 8v8"
      />

      <path
        strokeLinecap="round"
        d="M8 12h8"
      />
    </svg>
  );
}


function ContactIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-6 w-6 ${active ? 'stroke-orange' : 'stroke-black'
        }`}
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.5" />

      <path
        strokeLinecap="round"
        d="M5 21c.8-4 3.2-6 7-6s6.2 2 7 6"
      />
    </svg>
  );
}
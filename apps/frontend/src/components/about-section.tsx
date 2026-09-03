'use client';

import { useEffect, useMemo, useState } from 'react';
import { Reveal } from '@/components/reveal';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// Types
export interface ExperienceItem {
  id?: string;
  number: string;
  period: string;
  role: string;
  company: string;
  description: string;
}

export interface EducationItem {
  id?: string;
  period: string;
  institution: string;
  major: string;
}

type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  imageUrl?: string | null;
};

const CATEGORY_ORDER = ['Frontend', 'Backend', 'DevOps', 'Database', 'Language'];

const defaultExperiences: ExperienceItem[] = [
  {
    number: '01',
    period: 'August 2026 – present',
    role: 'Web Developer',
    company: 'PT Satuvision',
    description: 'Built a Web Application',
  },
  {
    number: '02',
    period: 'Mei 2026 – August 2026',
    role: 'System Implementation Support',
    company: 'PT KBS',
    description: 'Built React component library used across 3 product lines, reduced bundle size by 22%.',
  },
  {
    number: '03',
    period: 'September 2021 – November 2021',
    role: 'Wordpress Developer',
    company: 'PT Mayaloka Digital',
    description: 'Built React component library used across 3 product lines, reduced bundle size by 22%.',
  },
];

const defaultEducations: EducationItem[] = [
  {
    period: '2023 – present',
    institution: 'ITB STIKOM Bali',
    major: 'Sistem Informasi',
  },
  {
    period: '2020 – 2023',
    institution: 'SMK TI BALI GLOBAL DENPASAR',
    major: 'Rekayasa Perangkat Lunak',
  },
  {
    period: '2017 – 2020',
    institution: 'SMP 9 DENPASAR',
    major: 'Mengembangkan ilmu pengetahuan',
  },
  {
    period: '2011 – 2017',
    institution: 'SD 5 SANUR',
    major: 'Membentuk ilmu pengetahuan',
  },
];

export function AboutSection({
  experiences = defaultExperiences,
  educations = defaultEducations,
}: {
  experiences?: ExperienceItem[];
  educations?: EducationItem[];
}) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    api
      .get<Skill[]>('/api/skills')
      .then(setSkills)
      .catch(() => setSkills([]));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const s of skills) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    const ordered = [
      ...CATEGORY_ORDER.filter((c) => map.has(c)),
      ...Array.from(map.keys()).filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
    return ordered.map((category) => ({ category, items: map.get(category)! }));
  }, [skills]);

  const go = (dir: number) =>
    setActive((a) => Math.min(Math.max(a + dir, 0), Math.max(grouped.length - 1, 0)));

  return (
    <section id="about" className="scroll-mt-8 py-10 md:py-16 w-full">
      {/* Top Row: Experience & Skills */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: EXPERIENCE */}
        <div className="lg:col-span-8 flex flex-col">
          <Reveal>
            <h2 className="text-3xl font-anton uppercase tracking-wider text-orange md:text-4xl mb-8">
              Experience
            </h2>
          </Reveal>

          {/* Experience Grid (2x2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {experiences.map((exp, idx) => (
              <Reveal key={idx} delay={idx * 100}>
                <div className="group h-full flex flex-col justify-between p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div>
                    {/* Top Row: Period & Number Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-sm text-muted-foreground">
                        {exp.period}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground px-2.5 py-0.5 rounded-full border">
                        {exp.number}
                      </span>
                    </div>

                    {/* Role Title */}
                    <h3 className="text-base sm:text-lg font-semibold">
                      {exp.role}
                    </h3>

                    {/* Company Name */}
                    <p className="text-sm font-medium text-orange mt-0.5 mb-3">
                      {exp.company}
                    </p>

                    {/* Job Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Right Column: SKILLS Card */}
        <div className="lg:col-span-4 flex flex-col">
          <Reveal delay={150}>
            <h2 className="text-3xl font-anton uppercase tracking-wider text-orange md:text-4xl mb-8">
              Skills
            </h2>
          </Reveal>

          <Reveal delay={250}>
            <div className="p-6 sm:p-7 rounded-xl border bg-card text-card-foreground shadow-sm">
              {grouped.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills yet.</p>
              ) : (
                <>
                  {/* Carousel header */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {grouped[active]?.category}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        aria-label="Previous category"
                        onClick={() => go(-1)}
                        disabled={active === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-full border text-lg leading-none disabled:opacity-40 hover:bg-muted"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        aria-label="Next category"
                        onClick={() => go(1)}
                        disabled={active === grouped.length - 1}
                        className="flex h-7 w-7 items-center justify-center rounded-full border text-lg leading-none disabled:opacity-40 hover:bg-muted"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  {/* Slides */}
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-300 ease-out"
                      style={{ transform: `translateX(-${active * 100}%)` }}
                    >
                      {grouped.map((group) => (
                        <div
                          key={group.category}
                          className="w-full shrink-0"
                          aria-hidden={group !== grouped[active]}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            {group.items.map((skill) => (
                              <div
                                key={skill.id}
                                className="flex items-center gap-3 rounded-lg border bg-background p-3"
                              >
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                                  {skill.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={skill.imageUrl}
                                      alt={skill.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-base font-semibold text-muted-foreground">
                                      {skill.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">
                                    {skill.name}
                                  </p>
                                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${skill.level}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dots */}
                  {grouped.length > 1 && (
                    <div className="mt-4 flex justify-center gap-1.5">
                      {grouped.map((group, i) => (
                        <button
                          key={group.category}
                          type="button"
                          aria-label={`Go to ${group.category}`}
                          onClick={() => setActive(i)}
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            i === active ? 'w-4 bg-primary' : 'w-1.5 bg-muted',
                          )}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Bottom Row: EDUCATION */}
      <div className="mt-16 flex flex-col max-w-6xl mx-auto px-4">
        <Reveal>
          <h2 className="text-3xl font-anton uppercase tracking-wider text-orange md:text-4xl mb-8">
            Education
          </h2>
        </Reveal>

        {/* Education Timeline Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {educations.map((edu, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div className="flex flex-col gap-1.5 group">
                <span className="text-xs font-medium text-muted-foreground tracking-wider">
                  {edu.period}
                </span>

                <h3 className="text-sm sm:text-base font-semibold leading-snug group-hover:text-foreground transition-colors">
                  {edu.institution}
                </h3>

                <p className="text-sm text-muted-foreground mt-0.5">
                  {edu.major}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

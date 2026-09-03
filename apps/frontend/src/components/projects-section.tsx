'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { ProjectCard, type Project } from '@/components/project-card';
import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/utils';

type Skill = {
  name: string;
  imageUrl?: string | null;
};

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [techIcons, setTechIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    api
      .get<Project[]>('/api/projects')
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));

    api
      .get<Skill[]>('/api/skills')
      .then((skills) => {
        const map: Record<string, string> = {};
        skills.forEach((s) => {
          if (s.imageUrl) map[s.name] = s.imageUrl;
        });
        setTechIcons(map);
      })
      .catch(() => setTechIcons({}));
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects],
  );

  const filtered = useMemo(
    () =>
      category === 'all'
        ? projects
        : projects.filter((p) => p.category === category),
    [projects, category],
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors',
              category === c
                ? 'border-orange bg-orange text-brand-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-2xl border border-border bg-muted/50"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">No projects yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 80} className="h-full">
                <ProjectCard project={p} techIcons={techIcons} className="h-full" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

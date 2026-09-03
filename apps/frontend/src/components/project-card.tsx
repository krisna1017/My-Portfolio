import Link from 'next/link';
import { ArrowUpRight, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  tech?: string[];
  imageUrl?: string;
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
};

export function ProjectCard({
  project,
  techIcons,
  className,
}: {
  project: Project;
  techIcons?: Record<string, string>;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No preview
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute left-3 top-3 bg-background/80 backdrop-blur"
        >
          {project.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold leading-snug tracking-tight">
          {project.title}
        </h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {project.description}
        </p>

        {project.tech && project.tech.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {project.tech.map((t) => {
              const icon = techIcons?.[t];
              return (
                <span
                  key={t}
                  title={t}
                  className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-xs font-medium text-muted-foreground"
                >
                  {icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={icon}
                      alt={t}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    t.charAt(0).toUpperCase()
                  )}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex items-center gap-4 pt-4 text-sm">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-orange hover:underline"
            >
              Live <ArrowUpRight className="size-4" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            >
              <Code className="size-4" /> Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

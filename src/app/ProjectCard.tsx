import type { ReactNode } from 'react';
import type { Project } from '../content/profile';
import type { Locale } from '../locales';

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  repositoryLabel: string;
  demoLabel: string;
  problemLabel: string;
  solutionLabel: string;
  roleLabel: string;
  technologyListLabel: string;
  illustration?: ReactNode;
}

export function ProjectCard({
  project,
  locale,
  repositoryLabel,
  demoLabel,
  problemLabel,
  solutionLabel,
  roleLabel,
  technologyListLabel,
  illustration,
}: ProjectCardProps) {
  const headingId = `project-card-${project.slug}`;
  const content = project.content[locale];

  return (
    <article className="project-card" aria-labelledby={headingId}>
      {illustration ? (
        <div className="project-card-art" aria-hidden="true">
          {illustration}
        </div>
      ) : (
        <div className="project-card-art" aria-hidden="true">
          <img src={project.asset} alt="" width={720} height={320} />
        </div>
      )}
      <div className="project-card-content">
        <h3 id={headingId}>{content.name}</h3>
        <p className="project-summary">{content.summary}</p>
        <dl className="project-details">
          <div>
            <dt>{problemLabel}</dt>
            <dd>{content.problem}</dd>
          </div>
          <div>
            <dt>{solutionLabel}</dt>
            <dd>{content.solution}</dd>
          </div>
        </dl>
        <p className="project-role">
          <span>{roleLabel}</span> {content.role}
        </p>
        <ul className="technology-list" aria-label={`${content.name}: ${technologyListLabel}`}>
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        <div className="project-card-actions">
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${repositoryLabel} — ${content.name}`}
          >
            {repositoryLabel}
          </a>
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${demoLabel} — ${content.name}`}
            >
              {demoLabel}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

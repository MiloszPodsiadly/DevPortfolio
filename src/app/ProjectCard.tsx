import type { ReactNode } from 'react';
import type { Project } from '../content/profile';

export type ProjectCardData = Pick<Project, 'slug' | 'name' | 'summary' | 'technologies'> &
  Partial<Pick<Project, 'repositoryUrl' | 'demoUrl'>>;

interface ProjectCardProps {
  project: ProjectCardData;
  repositoryLabel: string;
  demoLabel: string;
  illustration?: ReactNode;
}

export function ProjectCard({
  project,
  repositoryLabel,
  demoLabel,
  illustration,
}: ProjectCardProps) {
  const headingId = `project-card-${project.slug}`;

  return (
    <article className="project-card" aria-labelledby={headingId}>
      {illustration ? (
        <div className="project-card-art" aria-hidden="true">
          {illustration}
        </div>
      ) : null}
      <div className="project-card-content">
        <h3 id={headingId}>{project.name}</h3>
        <p>{project.summary}</p>
        {project.technologies.length > 0 ? (
          <ul className="technology-list" aria-label={`${project.name} technologies`}>
            {project.technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        ) : null}
        {project.repositoryUrl || project.demoUrl ? (
          <div className="project-card-actions">
            {project.repositoryUrl ? (
              <a href={project.repositoryUrl} aria-label={`${repositoryLabel} — ${project.name}`}>
                {repositoryLabel}
              </a>
            ) : null}
            {project.demoUrl ? (
              <a href={project.demoUrl} aria-label={`${demoLabel} — ${project.name}`}>
                {demoLabel}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

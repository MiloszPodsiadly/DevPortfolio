import type { Project } from '../content/profile';
import type { Locale } from '../locales';
import { TechnologyIcon } from './scene/TechnologyIcon';

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  repositoryLabel: string;
  technologyListLabel: string;
}

function TechnologyLabel({ name }: { name: string }) {
  const slash = name.indexOf('/');
  return slash < 0 ? (
    name
  ) : (
    <>
      {name.slice(0, slash + 1)}
      <wbr />
      {name.slice(slash + 1)}
    </>
  );
}

export function ProjectCard({
  project,
  locale,
  repositoryLabel,
  technologyListLabel,
}: ProjectCardProps) {
  const headingId = `project-card-${project.slug}`;
  const content = project.content[locale];

  return (
    <article className="project-card project-card-summary" aria-labelledby={headingId}>
      <div className="project-card-art" aria-hidden="true">
        <img src={project.asset} alt="" width={720} height={320} />
      </div>
      <div className="project-card-content">
        <h3 id={headingId}>{content.name}</h3>
        <p className="project-summary">{content.summary}</p>
        <p className="project-stack-label">{technologyListLabel}</p>
        <ul
          className="technology-list project-stack"
          aria-label={`${content.name}: ${technologyListLabel}`}
        >
          {project.technologies.map((technology) => (
            <li key={technology}>
              <TechnologyIcon name={technology} />
              <span>
                <TechnologyLabel name={technology} />
              </span>
            </li>
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
        </div>
      </div>
    </article>
  );
}

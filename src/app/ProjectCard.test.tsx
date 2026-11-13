import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { projects } from '../content/projects';
import type { Project } from '../content/profile';
import { ProjectCard } from './ProjectCard';

const project = projects[0];

function renderCard(target: Project = project) {
  return render(
    <ProjectCard
      project={target}
      locale="en"
      repositoryLabel="Source code"
      technologyListLabel="Project technologies"
    />,
  );
}

describe('ProjectCard', () => {
  it.each(projects)('renders the new description and complete stack for $slug', (target) => {
    renderCard(target);

    expect(
      screen.getByRole('heading', { level: 3, name: target.content.en.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(target.content.en.summary)).toBeInTheDocument();
    const stack = screen.getByRole('list', {
      name: `${target.content.en.name}: Project technologies`,
    });
    expect(
      within(stack)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(target.technologies);
    expect(document.querySelector('.project-card-art img')).toHaveAttribute('src', target.asset);
  });

  it('renders the repository action with safe external-link attributes', () => {
    renderCard();

    const source = screen.getByRole('link', { name: 'Source code — Fraud Detection Platform' });
    expect(source).toHaveAttribute('href', project.repositoryUrl);
    expect(source).toHaveAttribute('target', '_blank');
    expect(source).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('uses Polish copy when the Polish page is rendered', () => {
    render(
      <ProjectCard
        project={project}
        locale="pl"
        repositoryLabel="Kod źródłowy"
        technologyListLabel="Technologie projektu"
      />,
    );

    expect(screen.getByText(project.content.pl.summary)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Kod źródłowy — Fraud Detection Platform' }),
    ).toBeInTheDocument();
  });
});

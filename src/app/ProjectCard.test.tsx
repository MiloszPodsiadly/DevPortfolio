import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { projects } from '../content/projects';
import { ProjectCard } from './ProjectCard';

const project = projects[0];

function renderCard() {
  return render(
    <ProjectCard
      project={project}
      locale="en"
      repositoryLabel="Source code"
      demoLabel="Live demo"
      problemLabel="Problem space"
      solutionLabel="Project approach"
      roleLabel="Context"
      technologyListLabel="Project technologies"
    />,
  );
}

describe('ProjectCard', () => {
  it('renders localized project detail, evidence-based technologies and local artwork', () => {
    renderCard();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Fraud Detection Platform' }),
    ).toBeInTheDocument();
    expect(screen.getByText(project.content.en.problem)).toBeInTheDocument();
    expect(screen.getByText(project.content.en.solution)).toBeInTheDocument();
    expect(screen.getByText('Apache Kafka')).toBeInTheDocument();
    expect(screen.getByAltText('')).toHaveAttribute('src', '/assets/projects/fraud-signals.svg');
  });

  it('shows the verified repository action and omits an unapproved demo', () => {
    renderCard();

    const source = screen.getByRole('link', { name: 'Source code — Fraud Detection Platform' });
    expect(source).toHaveAttribute('href', project.repositoryUrl);
    expect(source).toHaveAttribute('target', '_blank');
    expect(source).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('link', { name: /Live demo/ })).not.toBeInTheDocument();
  });

  it('uses Polish copy when the Polish page is rendered', () => {
    render(
      <ProjectCard
        project={project}
        locale="pl"
        repositoryLabel="Kod źródłowy"
        demoLabel="Demo na żywo"
        problemLabel="Obszar problemu"
        solutionLabel="Podejście projektu"
        roleLabel="Kontekst"
        technologyListLabel="Technologie projektu"
      />,
    );

    expect(screen.getByText(project.content.pl.summary)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Kod źródłowy — Fraud Detection Platform' }),
    ).toBeInTheDocument();
  });
});

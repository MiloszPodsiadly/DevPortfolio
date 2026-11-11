import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectCard, type ProjectCardData } from './ProjectCard';

const project: ProjectCardData = {
  slug: 'devportfolio',
  name: 'DevPortfolio',
  summary: 'A bilingual static portfolio site.',
  technologies: ['React', 'TypeScript'],
};

describe('ProjectCard', () => {
  it('renders content without inventing repository or demo actions', () => {
    render(<ProjectCard project={project} repositoryLabel="Source code" demoLabel="Live demo" />);

    expect(screen.getByRole('heading', { level: 3, name: 'DevPortfolio' })).toBeInTheDocument();
    expect(screen.getByText('A bilingual static portfolio site.')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows only explicitly supplied verified actions', () => {
    render(
      <ProjectCard
        project={{ ...project, repositoryUrl: 'https://github.com/MiloszPodsiadly/DevPortfolio' }}
        repositoryLabel="Source code"
        demoLabel="Live demo"
      />,
    );

    expect(screen.getByRole('link', { name: 'Source code — DevPortfolio' })).toHaveAttribute(
      'href',
      'https://github.com/MiloszPodsiadly/DevPortfolio',
    );
    expect(screen.queryByRole('link', { name: /Live demo/ })).not.toBeInTheDocument();
  });
});

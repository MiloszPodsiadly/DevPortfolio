import { describe, expect, it } from 'vitest';
import { projects } from './projects';
import { validateProject, validateProjectManifest } from './profile';
import type { Project } from './profile';

describe('PF-003 project manifest', () => {
  it('contains exactly three stable, bilingual projects in the approved order', () => {
    expect(projects.map(({ slug }) => slug)).toEqual([
      'fraud-detection-platform',
      'stockrescue-ai',
      'chess-project',
    ]);
    expect(validateProjectManifest(projects)).toEqual([]);
    expect(JSON.stringify(projects)).not.toMatch(/hop\s*on/i);
    for (const project of projects) {
      expect(Object.keys(project.content).sort()).toEqual(['en', 'pl']);
    }
  });

  it('publishes verified repository URLs and no unapproved demos', () => {
    expect(
      projects.every((project) => project.repositoryUrl.startsWith('https://github.com/')),
    ).toBe(true);
    expect(projects.every((project) => !('demoUrl' in project))).toBe(true);
  });

  it('rejects duplicate slugs and a manifest with a missing project', () => {
    expect(validateProjectManifest([projects[0], projects[0], projects[2]])).toContain(
      'Project slugs must be unique.',
    );
    expect(validateProjectManifest(projects.slice(0, 2))).toContain(
      'Project manifest must contain exactly 3 projects.',
    );
  });

  it('rejects incomplete translations and invalid repository or demo URLs', () => {
    const incomplete = {
      ...projects[0],
      content: {
        en: { ...projects[0].content.en, summary: ' ' },
        pl: projects[0].content.pl,
      },
    } as Project;
    expect(validateProject(incomplete)).toContain(
      'Missing project summary for en: fraud-detection-platform',
    );

    expect(
      validateProject({ ...projects[0], repositoryUrl: 'javascript:alert(1)' } as Project),
    ).toContain('Project repository URL is invalid.');
    expect(validateProject({ ...projects[0], repositoryUrl: '' } as Project)).toContain(
      'Project repository URL is invalid.',
    );
    expect(
      validateProject({ ...projects[0], demoUrl: 'https://example.com' } as Project),
    ).toContain('Project demo URL is invalid.');
    expect(
      validateProject({ ...projects[0], demoUrl: 'https://fraud-demo.app' } as Project),
    ).toContain('Project demo URL lacks owner approval.');
  });
});

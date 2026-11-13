import { describe, expect, it } from 'vitest';
import { projects } from './projects';
import { validateProject, validateProjectManifest } from './profile';
import type { Project } from './profile';

describe('project manifest', () => {
  it('contains four stable, bilingual projects in the approved order', () => {
    expect(projects.map(({ slug }) => slug)).toEqual([
      'fraud-detection-platform',
      'stockrescue-ai',
      'chess-project',
      'library',
    ]);
    expect(validateProjectManifest(projects)).toEqual([]);
    expect(JSON.stringify(projects)).not.toMatch(/hop\s*on/i);
    for (const project of projects) {
      expect(Object.keys(project.content).sort()).toEqual(['en', 'pl']);
    }
  });

  it('publishes GitHub repository URLs', () => {
    expect(
      projects.every((project) => project.repositoryUrl.startsWith('https://github.com/')),
    ).toBe(true);
  });

  it('accepts the full stack and rejects blank or duplicate technology entries', () => {
    expect(projects[0].technologies).toHaveLength(14);
    expect(validateProject(projects[0])).toEqual([]);
    expect(validateProject({ ...projects[0], technologies: ['Java', '', 'React'] })).toContain(
      'Project technologies must contain at least three non-empty values.',
    );
    expect(validateProject({ ...projects[0], technologies: ['Java', 'Java', 'React'] })).toContain(
      'Project technologies must be unique.',
    );
  });

  it('rejects duplicate slugs and a manifest with a missing project', () => {
    expect(validateProjectManifest([projects[0], projects[0], projects[2], projects[3]])).toContain(
      'Project slugs must be unique.',
    );
    expect(validateProjectManifest(projects.slice(0, 2))).toContain(
      'Project manifest must contain exactly 4 projects.',
    );
  });

  it('rejects incomplete translations and invalid repository URLs', () => {
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
  });
});

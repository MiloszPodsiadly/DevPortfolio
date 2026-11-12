import { describe, expect, it } from 'vitest';
import { technologyGroups, validateTechnologyGroups } from './skills';

describe('project technology groups', () => {
  it('keeps one evidence-backed, non-ranked set of technology groups', () => {
    expect(validateTechnologyGroups()).toEqual([]);
    expect(technologyGroups.map((group) => group.id)).toEqual([
      'backend',
      'eventDriven',
      'data',
      'frontend',
      'tooling',
    ]);
    expect(technologyGroups.flatMap((group) => group.technologies)).not.toContain('Scala');
  });
});

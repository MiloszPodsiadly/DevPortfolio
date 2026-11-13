import { describe, expect, it } from 'vitest';
import { technologies, validateTechnologies } from './skills';

describe('technology overview', () => {
  it('keeps the published technology names non-empty and unique', () => {
    expect(validateTechnologies()).toEqual([]);
    expect(technologies).toEqual(
      expect.arrayContaining(['AWS', 'JavaScript', 'Scala', 'Maven', 'Gradle']),
    );
    expect(technologies).not.toContain('FastAPI');
  });
});

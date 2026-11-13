export const technologies = [
  'Java',
  'Python',
  'TypeScript',
  'JavaScript',
  'Spring Boot',
  'Scala',
  'AWS',
  'PostgreSQL',
  'MongoDB',
  'React',
  'Angular',
  'Apache Kafka',
  'Docker',
  'REST',
  'Redis',
  'GitHub Actions',
  'Playwright',
  'Vitest',
  'Maven',
  'Gradle',
] as const;

export function validateTechnologies(): string[] {
  const errors: string[] = [];
  const names: readonly string[] = technologies;
  if (names.length === 0 || names.some((technology) => !technology.trim())) {
    errors.push('Technologies must contain non-empty names.');
  }
  if (new Set(technologies).size !== technologies.length)
    errors.push('Technologies must be unique.');
  return errors;
}

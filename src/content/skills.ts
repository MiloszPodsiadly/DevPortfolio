export const technologyGroups = [
  { id: 'backend', technologies: ['Java', 'Spring Boot', 'Python', 'FastAPI', 'REST'] },
  { id: 'eventDriven', technologies: ['Apache Kafka'] },
  { id: 'data', technologies: ['PostgreSQL', 'MongoDB', 'Redis'] },
  { id: 'frontend', technologies: ['React', 'Angular', 'TypeScript'] },
  { id: 'tooling', technologies: ['Docker', 'GitHub Actions', 'Playwright', 'Vitest'] },
] as const;

export type TechnologyGroupId = (typeof technologyGroups)[number]['id'];

export function validateTechnologyGroups(): string[] {
  const errors: string[] = [];
  const ids = technologyGroups.map((group) => group.id);
  if (new Set(ids).size !== ids.length) errors.push('Technology group IDs must be unique.');
  for (const group of technologyGroups) {
    const items: readonly string[] = group.technologies;
    if (items.length === 0 || items.some((technology) => !technology.trim())) {
      errors.push(`Technology group must not be empty: ${group.id}`);
    }
  }
  return errors;
}

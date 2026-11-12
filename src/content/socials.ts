import { validateExternalUrl } from './profile';

export const socialLinks = [
  { id: 'github', href: 'https://github.com/MiloszPodsiadly' },
  { id: 'linkedin', href: 'https://www.linkedin.com/in/milosz-podsiadly/' },
] as const;

export type SocialLinkId = (typeof socialLinks)[number]['id'];

export function validateSocialLinks(): string[] {
  const errors: string[] = [];
  const ids = socialLinks.map((link) => link.id);
  if (new Set(ids).size !== ids.length) errors.push('Social link IDs must be unique.');
  for (const link of socialLinks) {
    if (!validateExternalUrl(link.href)) {
      errors.push(`Invalid social URL: ${link.id}`);
      continue;
    }
    const url = new URL(link.href);
    if (
      (link.id === 'github' && url.hostname !== 'github.com') ||
      (link.id === 'linkedin' && !['linkedin.com', 'www.linkedin.com'].includes(url.hostname))
    ) {
      errors.push(`Unexpected host for social URL: ${link.id}`);
    }
  }
  return errors;
}

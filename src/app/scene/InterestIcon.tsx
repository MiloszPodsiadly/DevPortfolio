import type { AfterHoursItemId } from '../../locales';

export function InterestIcon({ kind }: { kind: AfterHoursItemId }) {
  return (
    <img
      className="interest-illustration"
      src={`/assets/interests/${kind}.webp`}
      alt=""
      width={384}
      height={384}
      decoding="async"
      aria-hidden="true"
    />
  );
}

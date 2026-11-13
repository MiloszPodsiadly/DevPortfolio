import { technologyIconNames } from './technology-icons';

export function TechnologyIcon({ name }: { name: string }) {
  const icon = technologyIconNames[name];

  return icon ? (
    <img
      className={`technology-icon technology-icon-${icon}`}
      src={`/assets/technologies/${icon}.svg`}
      alt=""
      width={24}
      height={24}
      aria-hidden="true"
    />
  ) : (
    <svg
      className="technology-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="m7 5-5 7 5 7m10-14 5 7-5 7m-3-17-4 20"
        stroke="#71e8ff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

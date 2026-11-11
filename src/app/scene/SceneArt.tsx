export function SceneArt() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <svg viewBox="0 0 640 520" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <radialGradient id="moon-fill" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="var(--color-text-primary)" />
            <stop offset="55%" stopColor="var(--color-lavender)" />
            <stop offset="100%" stopColor="var(--color-ice-blue)" />
          </radialGradient>
          <linearGradient id="ridge-back" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-nebula-violet)" />
            <stop offset="100%" stopColor="var(--color-night-900)" />
          </linearGradient>
          <linearGradient id="ridge-front" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-surface-700)" />
            <stop offset="100%" stopColor="var(--color-night-950)" />
          </linearGradient>
        </defs>

        <g className="scene-stars">
          <circle cx="118" cy="90" r="2" />
          <circle cx="205" cy="52" r="1.5" />
          <circle cx="291" cy="111" r="2" />
          <circle cx="402" cy="51" r="1.5" />
          <circle cx="552" cy="101" r="2" />
          <circle cx="84" cy="187" r="1.5" />
          <circle cx="491" cy="213" r="1.5" />
          <path d="M174 151v8m-4-4h8M548 164v7m-3.5-3.5h7" />
        </g>

        <circle className="scene-moon-halo" cx="414" cy="174" r="119" />
        <circle className="scene-moon" cx="414" cy="174" r="82" />

        <path
          className="scene-cloud"
          d="M295 198c9-18 29-24 46-14 9-17 31-23 48-12 9 6 14 15 15 25H295Z"
        />
        <path
          className="scene-cloud scene-cloud-soft"
          d="M362 226c11-15 31-18 46-7 12-13 32-13 44 0 3 4 6 8 7 13H362Z"
        />

        <path
          className="scene-ridge-back"
          d="m0 366 74-87 47 52 99-119 80 97 74-74 87 99 67-70 112 93v163H0Z"
        />
        <path
          className="scene-ridge-front"
          d="m0 408 94-71 66 41 103-105 81 81 82-63 78 80 68-38 68 63v124H0Z"
        />

        <g className="scene-branch">
          <path d="M78 387c13-40 31-63 59-80m-32 45-20-12m39-15 2-22m-18 47 24-2" />
          <path d="M84 376c-8-6-13-7-18-7m35-38c-2-8-1-14 2-20m20-4c7-3 12-3 18-1" />
        </g>

        <g className="scene-books">
          <path d="M70 448h104v13H70z" />
          <path d="M82 429h97v15H82z" />
          <path d="M91 410h83v15H91z" />
          <path className="scene-book-mark" d="M89 435h31m-18-18h36m-28 39h38" />
        </g>

        <g className="scene-knight">
          <path d="M505 456h77v12h-77zm12-12h52l-4-19-16-15 1-20-15-11-15 5-5 19 9 12-7 11z" />
          <path d="m524 394 17 3-4 9-16-1z" />
        </g>

        <path className="scene-crown" d="m245 394 8-18 12 12 10-21 11 21 12-12 8 18z" />
      </svg>
    </div>
  );
}

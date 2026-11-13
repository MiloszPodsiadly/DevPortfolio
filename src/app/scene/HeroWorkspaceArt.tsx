export function HeroWorkspaceArt() {
  return (
    <img
      className="workspace-illustration"
      src="/assets/scene/workspace-768.webp"
      srcSet="/assets/scene/workspace-768.webp 768w, /assets/scene/workspace-1536.webp 1536w"
      sizes="(max-width: 1100px) 1px, min(29vw, 29rem)"
      alt=""
      width={1536}
      height={1024}
      decoding="async"
      aria-hidden="true"
    />
  );
}

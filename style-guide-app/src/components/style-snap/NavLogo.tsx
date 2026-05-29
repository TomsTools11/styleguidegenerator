import Image from 'next/image';

/**
 * Header wordmark. Renders both the dark-surface ("snap" in white) and
 * light-surface ("snap" in navy) lockups; globals.css shows the one that
 * matches the user's prefers-color-scheme. No JS, so there's no flash.
 */
export function NavLogo() {
  return (
    <>
      <Image
        src="/brand/stylesnap-logo-nav.png"
        alt="StyleSnap"
        width={1159}
        height={307}
        className="ss-brand-logo is-dark"
        priority
      />
      <Image
        src="/brand/stylesnap-logo-nav-light.png"
        alt="StyleSnap"
        width={1159}
        height={307}
        className="ss-brand-logo is-light"
        priority
      />
    </>
  );
}

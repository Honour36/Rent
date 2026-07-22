import Image from "next/image";

interface LogoProps {
  className?: string;
  /** Pixel height to render at - width follows automatically (3:1 wordmark). */
  height?: number;
}

/**
 * Renders the black wordmark on light backgrounds and the white wordmark on
 * dark backgrounds. This app applies dark mode via a `.dark` class (Tailwind
 * v4 `@custom-variant dark`, driven by usePreferencesStore/ThemeSwitcher) -
 * not next-themes - so both images are rendered and toggled with the same
 * `dark:` visibility classes used elsewhere in this codebase (see
 * ThemeSwitcher), rather than detecting theme in JS. This also means there's
 * no post-hydration flash to guard against.
 */
export function Logo({ className, height = 24 }: LogoProps) {
  const width = Math.round(height * 3); // source assets are a fixed 3:1 wordmark
  const style = { height, width: "auto" as const };

  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <Image src="/logo/logoblack.png" alt="Rental" width={width} height={height} priority style={style} className="block dark:hidden" />
      <Image src="/logo/logowhite.png" alt="Rental" width={width} height={height} priority style={style} className="hidden dark:block" />
    </span>
  );
}

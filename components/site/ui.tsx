import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 ${className}`}>{children}</div>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700"
      : "border border-brand-600 text-brand-700 hover:bg-brand-50";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  media,
  heroImage,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  media?: React.ReactNode;
  /** When set, renders a home-hero-style header: the photo bleeds to the right
   *  edge and fades into the background. */
  heroImage?: { src: string; alt: string };
}) {
  const text = (
    <div>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="text-4xl font-semibold leading-tight text-brand-700">
        {title}
      </h1>
      {lead ? <p className="mt-4 text-lg text-ink/80">{lead}</p> : null}
    </div>
  );

  if (heroImage) {
    const mask = "linear-gradient(to right, transparent, #000 34%)";
    return (
      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20 lg:min-h-[460px]">
        <Container className="relative z-10 flex items-center">
          <div className="max-w-xl">
            {text}
            {/* Mobile: full-bleed image below the text */}
            <div className="-mx-6 mt-10 lg:hidden">
              <SiteImage
                src={heroImage.src}
                fallbackAlt={heroImage.alt}
                width={1800}
                height={1142}
                priority
                className="w-full object-cover"
              />
            </div>
          </div>
        </Container>
        {/* Desktop: image bleeds to the right edge and fades into the blue */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] lg:block">
          <SiteImage
            src={heroImage.src}
            fallbackAlt={heroImage.alt}
            fill
            priority
            sizes="56vw"
            className="object-cover object-center"
            style={{ WebkitMaskImage: mask, maskImage: mask }}
          />
        </div>
      </section>
    );
  }

  return (
    <div className="bg-brand-50 py-16 sm:py-20">
      {media ? (
        <Container className="grid items-center gap-10 md:grid-cols-2">
          {text}
          {media}
        </Container>
      ) : (
        <Container className="max-w-3xl">{text}</Container>
      )}
    </div>
  );
}

export function FeatureRow({
  eyebrow,
  heading,
  body,
  points,
  media,
  reverse = false,
}: {
  eyebrow?: string;
  heading: string;
  body: string;
  points?: string[];
  media: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <Container className="grid items-center gap-10 md:grid-cols-2">
      <div className={reverse ? "md:order-2" : ""}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="text-3xl font-semibold text-brand-700">{heading}</h2>
        <p className="mt-4 leading-relaxed text-ink/80">{body}</p>
        {points ? (
          <ul className="mt-5 space-y-2 text-sm text-ink/80">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="text-terracotta-600">✓</span>
                {p}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className={reverse ? "md:order-1" : ""}>{media}</div>
    </Container>
  );
}

/** A feature section whose photo bleeds to the page edge and fades into the
 *  background, with the text in a container on the opposite side. */
export function BleedFeature({
  eyebrow,
  heading,
  body,
  points,
  image,
  side = "right",
  className = "",
  children,
  bleedY = false,
}: {
  eyebrow?: string;
  heading: string;
  body: string;
  points?: string[];
  image: { src: string; alt: string };
  side?: "left" | "right";
  className?: string;
  children?: React.ReactNode;
  /** Also fade the top + bottom and let the photo spill into the neighbouring
   *  sections (experimental). */
  bleedY?: boolean;
}) {
  const right = side === "right";
  const fade = right ? "to right" : "to left";
  const horiz = `linear-gradient(${fade}, transparent, #000 36%)`;
  const vert =
    "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)";
  const maskImage = bleedY ? `${horiz}, ${vert}` : horiz;
  const maskStyle = (
    bleedY
      ? {
          WebkitMaskImage: maskImage,
          maskImage,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }
      : { WebkitMaskImage: maskImage, maskImage }
  ) as React.CSSProperties;

  return (
    <section
      className={`relative overflow-hidden lg:min-h-[480px] ${
        bleedY ? "" : "border-t border-brand-100"
      } ${className}`}
    >
      <Container className="relative z-10 flex items-center py-16 sm:py-20">
        <div className={`max-w-xl ${right ? "" : "lg:ml-auto"}`}>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="text-3xl font-semibold text-brand-700">{heading}</h2>
          <p className="mt-4 leading-relaxed text-ink/80">{body}</p>
          {points ? (
            <ul className="mt-5 space-y-2 text-sm text-ink/80">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="text-terracotta-600">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          ) : null}

          {children}

          {/* Mobile: full-bleed image below the text */}
          <div className="-mx-6 mt-10 lg:hidden">
            <SiteImage
              src={image.src}
              fallbackAlt={image.alt}
              width={1600}
              height={900}
              className="w-full object-cover"
            />
          </div>
        </div>
      </Container>

      {/* Desktop: image bleeds to the edge and fades into the background */}
      <div
        className={`pointer-events-none absolute inset-y-0 z-0 hidden w-[56%] lg:block ${
          right ? "right-0" : "left-0"
        }`}
      >
        <SiteImage
          src={image.src}
          fallbackAlt={image.alt}
          fill
          sizes="56vw"
          className="object-cover"
          style={maskStyle}
        />
      </div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
      {children}
    </p>
  );
}

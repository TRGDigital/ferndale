// Injects one or more JSON-LD objects as <script type="application/ld+json">.
// Server component — safe to render in layouts and pages.
//
// Usage: <JsonLd data={organizationSchema()} />
//        <JsonLd data={[webSiteSchema(), siteNavigationSchema(nav)]} />

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify output is safe; escape "<" to avoid breaking out of the tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}

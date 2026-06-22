import { Container } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { siteConfig } from "@/lib/site-config";

// Full-width OpenStreetMap embed (no API key, no cookies) with a floating
// "Find us" card. Same as the home + contact pages.
export function LocationMap() {
  const { latitude: lat, longitude: lon } = siteConfig.geo;
  const bbox = [lon - 0.012, lat - 0.006, lon + 0.012, lat + 0.006].join("%2C");
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lon}`;
  const { address } = siteConfig;

  return (
    <section className="relative" aria-label="Find us on the map">
      <iframe
        title="Map showing Ferndale Nursing Home, Crawley"
        src={mapSrc}
        loading="lazy"
        className="block h-[520px] w-full border-0"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center py-8">
        <Container className="w-full">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl bg-cream/95 p-6 shadow-xl ring-1 ring-brand-100 backdrop-blur">
            <h2 className="font-serif text-2xl text-brand-700">Find us</h2>
            <p className="mt-1 text-sm text-ink/80">
              In Southgate, Crawley, close to the town centre and Gatwick.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink/80">
              <li>
                <a
                  href={`tel:${siteConfig.telephoneE164}`}
                  className="flex items-center gap-2 hover:text-brand-700"
                >
                  <Icon name="phone" className="h-4 w-4 text-brand-600" />
                  {siteConfig.telephone}
                </a>
              </li>
              <li className="text-muted">
                {address.streetAddress}, {address.addressLocality},{" "}
                {address.addressRegion} {address.postalCode}
              </li>
            </ul>
            <div className="mt-5">
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                Get directions →
              </a>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

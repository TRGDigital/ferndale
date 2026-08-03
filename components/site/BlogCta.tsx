import { EnquiryButton } from "@/components/site/EnquiryDialog";

// A single mid-article call to action for blog posts. The button opens the shared enquiry modal
// (reuses the site ContactForm, posts to /api/public/leads) rather than navigating away.
export function BlogCta() {
  return (
    <div className="my-10 rounded-2xl border border-brand-100 bg-brand-50 px-6 py-8 text-center">
      <p className="font-serif text-2xl text-brand-700">
        Considering care for a loved one?
      </p>
      <p className="mx-auto mt-2 max-w-md leading-relaxed text-ink/80">
        Ferndale is a warm, family-run nursing home in Crawley. Get in touch and we
        will help however we can, with no pressure.
      </p>
      <div className="mt-5 flex justify-center">
        <EnquiryButton variant="solid">Get in touch</EnquiryButton>
      </div>
    </div>
  );
}

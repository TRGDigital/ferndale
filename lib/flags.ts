// Build-time feature flags.

// While the site is being populated with real Ferndale photography, render every
// photo/logo as a labelled placeholder (using the image's alt text) so it's clear
// what imagery is required on each page. Flip to false once real images are in
// Ferndale's own storage and the content URLs are repointed.
export const SHOW_IMAGE_PLACEHOLDERS = true;

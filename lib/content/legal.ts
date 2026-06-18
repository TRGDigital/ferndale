// Default legal-page content. The public route renders the DB override (edited
// in the admin "Legal" tab) when present, otherwise these code defaults, so the
// pages never break. Content is HTML.
//
// Provenance: Privacy Policy is the original crosswayscarehome.co.uk text with
// the obfuscated email restored. Cookie Policy is tidied from the original
// (which was an unfinished template). Terms & Conditions is authored from the
// company's real registration details (the original site has no terms page).

const EMAIL = "enquiries@ferndalenursinghome.co.uk";

export type LegalDefault = { title: string; content: string };

export const legalSlugs = [
  "privacy-policy",
  "cookie-policy",
  "terms-and-conditions",
] as const;

export type LegalSlug = (typeof legalSlugs)[number];

export const legalDefaults: Record<LegalSlug, LegalDefault> = {
  "privacy-policy": {
    title: "Privacy Policy",
    content: `
<h2>Introduction</h2>
<p>This is a notice to inform you of our policy about all information that we record about you. It sets out the conditions under which we may process any information that we collect from you, or that you provide to us. It covers information that could identify you (“personal information”) and information that could not. In the context of the law and this notice, “process” means collect, store, transfer, use or otherwise act on information.</p>
<p>We take seriously the protection of your privacy and confidentiality. We understand that all visitors to our website are entitled to know that their personal data will not be used for any purpose unintended by them, and will not accidentally fall into the hands of a third party. We undertake to preserve the confidentiality of all information you provide to us, and hope that you reciprocate.</p>
<p>Our policy complies with UK law, including the UK General Data Protection Regulation (UK GDPR). Except as set out below, we do not share, sell, or disclose to a third party any information collected through our website.</p>

<h2>The bases on which we process information about you</h2>
<p>The law requires us to determine under which of six defined bases we process different categories of your personal information, and to notify you of the basis for each category. If a basis on which we process your personal information is no longer relevant then we shall immediately stop processing your data.</p>

<h3>1. Information we process with your consent</h3>
<p>When you browse our website or ask us to provide you more information about our home, including job opportunities and our services, you provide your consent to us to process information that may be personal information. Wherever possible, we aim to obtain your explicit consent, for example by asking you to agree to our use of cookies. You may withdraw your consent at any time by contacting us at <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>

<h3>2. Information we process because we have a legal obligation</h3>
<p>Sometimes we must process your information in order to comply with a statutory obligation. For example, we may be required to give information to legal authorities if they so request and have the proper authorisation, such as a search warrant or court order.</p>

<h3>3. Information relating to your method of payment</h3>
<p>Payment information is never taken by us or through our website, and our employees and contractors never have access to it. No payment information is stored on the Ferndale website.</p>

<h3>4. Sending a message to our team</h3>
<p>When you contact us, whether by telephone, through our website or by email, we collect the data you have given to us in order to reply with the information you need. We keep personally identifiable information associated with your message, such as your name and email address, so as to track our communications with you and provide a high quality service.</p>

<h3>5. Complaints</h3>
<p>When we receive a complaint, we record the information you have given to us and use it to resolve your complaint. If your complaint reasonably requires us to contact another person, we may decide to share some of the information contained in your complaint with that person.</p>

<h2>Information we collect when you visit our website</h2>
<h3>6. Cookies</h3>
<p>Please see our dedicated <a href="/cookie-policy/">Cookie Policy</a> for details of the cookies we use.</p>
<h3>7. Personal identifiers from your browsing activity</h3>
<p>Requests by your web browser to our servers for web pages and other content are recorded. We record information such as your approximate geographical location, your internet service provider and your IP address, and information about the software you are using to browse our website. We use this information in aggregate to assess how our website performs.</p>

<h2>Access to your own information</h2>
<h3>8. Removal of your information</h3>
<p>If you wish us to remove personally identifiable information from our website, you may contact us at <a href="mailto:${EMAIL}">${EMAIL}</a>. This may limit the service we can provide to you.</p>
<h3>9. Verification of your information</h3>
<p>When we receive any request to access, edit or delete personally identifiable information, we shall first take reasonable steps to verify your identity before granting access or taking any action, to safeguard your information.</p>
<h3>10. Encryption of data sent between us</h3>
<p>We use Secure Sockets Layer (SSL) certificates to verify our identity to your browser and to encrypt any data you give us.</p>

<h2>How you can complain</h2>
<ul>
<li>If you are not happy with our privacy policy, or if you have any complaint, please tell us by email at <a href="mailto:${EMAIL}">${EMAIL}</a>.</li>
<li>If you are dissatisfied about how we process your personal information, you have a right to lodge a complaint with the Information Commissioner's Office at <a href="https://ico.org.uk/concerns/" rel="noopener" target="_blank">ico.org.uk/concerns</a>.</li>
</ul>

<h2>Retention and review</h2>
<p>Except as otherwise mentioned in this notice, we keep your personal information only for as long as required to provide you with the services you have requested, to comply with the law (including for the period demanded by our tax authorities), or to support a claim or defence in court.</p>
<p>We may update this privacy notice from time to time as necessary. The terms that apply to you are those posted here on the day you use our website.</p>
`,
  },

  "cookie-policy": {
    title: "Cookie Policy",
    content: `
<p>This cookie policy explains how Ferndale Nursing Home, operated by Ferndale Healthcare Limited, uses cookies on this website.</p>
<p>Ferndale Healthcare Limited. Registered in England &amp; Wales. [TODO: confirm Ferndale registered office, company number and data protection registration number.]</p>

<h2>What are cookies?</h2>
<p>Cookies are small text files that a website places on your device when you visit. They allow the website to recognise your device and remember information about your visit, such as your preferences, to make the site work better for you.</p>

<h2>How we use cookies</h2>
<p>When you first visit our website you are shown a cookie banner where you can accept or decline non-essential cookies. Essential cookies, which are needed for the website to function, are always set. You can withdraw or change your consent at any time by clearing the cookies stored by your browser.</p>

<h2>Analytics cookies</h2>
<p>With your consent, we use Google Analytics, a web analytics service provided by Google, to help us understand how visitors use the site. The information generated about your use of the site is anonymised and used in aggregate. You can read Google's privacy policy at <a href="https://policies.google.com/privacy" rel="noopener" target="_blank">policies.google.com/privacy</a>.</p>

<h2>Third-party cookies</h2>
<p>Some pages may include content from third parties (for example embedded maps), which may set their own cookies. We have no control over these cookies, so please review the relevant third party's own cookie and privacy policies.</p>

<h2>Managing cookies</h2>
<p>You can control and delete cookies through your browser settings. Please note that blocking some types of cookies may affect how the website works for you.</p>
<p>For more about how we handle your personal data, please see our <a href="/privacy-policy/">Privacy Policy</a>.</p>
`,
  },

  "terms-and-conditions": {
    title: "Terms & Conditions",
    content: `
<p>These terms govern your use of the Ferndale Nursing Home website ("the website"), operated by Ferndale Healthcare Limited ("we", "us", "our"). By accessing or using the website you agree to these terms. If you do not agree, please do not use the website.</p>

<h2>About us</h2>
<p>Ferndale Healthcare Limited. Registered in England &amp; Wales. The care home is located at 124 Malthouse Road, Crawley, West Sussex, RH10 6BH. [TODO: confirm Ferndale registered office and company number.]</p>

<h2>Use of the website</h2>
<ul>
<li>You may use the website for lawful purposes only, and must not use it in any way that is fraudulent or harmful, or that could damage or impair the website.</li>
<li>You must not attempt to gain unauthorised access to the website, the server on which it is stored, or any server, computer or database connected to it.</li>
</ul>

<h2>Information on the website</h2>
<p>The content on this website is provided for general information about our home and services. While we make every effort to keep it accurate and up to date, we give no warranty that it is complete, current or error-free, and it should not be relied upon as advice. Fees, availability and services may change.</p>

<h2>Enquiries and applications</h2>
<p>Submitting an enquiry, brochure request or job application through the website does not create any contract between us. Any care or employment arrangement is subject to a separate written agreement.</p>

<h2>Intellectual property</h2>
<p>The content, design, logos and images on this website are owned by or licensed to us and are protected by copyright. You may view and print pages for your own personal use, but you must not reproduce, distribute or use them for any commercial purpose without our written permission.</p>

<h2>Links to other websites</h2>
<p>Where our website contains links to other sites and resources provided by third parties, these links are provided for your information only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.</p>

<h2>Limitation of liability</h2>
<p>To the extent permitted by law, we exclude all liability for any loss or damage arising from your use of, or inability to use, the website, or from reliance on any content on it. Nothing in these terms limits our liability for death or personal injury caused by negligence, or for fraud.</p>

<h2>Privacy</h2>
<p>Your use of the website is also governed by our <a href="/privacy-policy/">Privacy Policy</a> and <a href="/cookie-policy/">Cookie Policy</a>.</p>

<h2>Governing law</h2>
<p>These terms are governed by the law of England and Wales, and any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

<h2>Contact</h2>
<p>If you have any questions about these terms, please contact us at <a href="mailto:${EMAIL}">${EMAIL}</a> or call 01444 416 841.</p>

<h2>Changes to these terms</h2>
<p>We may update these terms from time to time. The terms that apply to you are those posted on the website on the day you use it.</p>
`,
  },
};

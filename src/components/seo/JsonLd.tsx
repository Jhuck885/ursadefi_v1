'use client';

/**
 * JSON-LD structured data for Generative Engine Optimization (GEO).
 * Helps AI systems (ChatGPT, Perplexity, Grok, Gemini, etc.) extract
 * accurate facts about UrsaDeFi.
 */
export default function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://ursadefi.com/#organization',
        name: 'UrsaDeFi',
        url: 'https://ursadefi.com',
        logo: 'https://ursadefi.com/ursa-logo.png',
        description:
          'UrsaDeFi is a non-custodial XRPL-native invoicing platform. Freelancers and small businesses bill in USD, settle in XRP, and keep full control of their keys via Xaman.',
        sameAs: [],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://ursadefi.com/#app',
        name: 'UrsaDeFi',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: 'https://ursadefi.com',
        description:
          'Non-custodial XRPL invoicing. Create invoices, activate them for a 0.15% platform fee (minimum $0.25), optionally mint as XRPL NFTs, and export tax-ready CSVs. Keys stay in the user\'s Xaman wallet.',
        offers: {
          '@type': 'Offer',
          price: '0.15',
          priceCurrency: 'USD',
          description: 'Platform fee of 0.15% of service amount (minimum $0.25) charged to the invoice creator on activation. Draft invoices are free.',
        },
        featureList: [
          'Non-custodial XRPL invoicing',
          'Bill in USD, settle in XRP',
          '0.15% platform fee (min $0.25)',
          'Optional XRPL NFT minting of invoices',
          'Tax / IRIS oriented CSV export',
          'Xaman wallet integration',
          'No passwords or custodial keys',
        ],
        provider: { '@id': 'https://ursadefi.com/#organization' },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://ursadefi.com/#website',
        url: 'https://ursadefi.com',
        name: 'UrsaDeFi',
        description: 'Non-custodial XRPL invoicing for freelancers and small businesses.',
        publisher: { '@id': 'https://ursadefi.com/#organization' },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://ursadefi.com/help#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is UrsaDeFi custodial?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. UrsaDeFi is 100% non-custodial. User private keys stay in the Xaman wallet. UrsaDeFi never holds funds or seed phrases.',
            },
          },
          {
            '@type': 'Question',
            name: 'What does UrsaDeFi cost?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The platform fee is 0.15% of the service amount with a minimum of $0.25 per activated invoice. Draft invoices are free. The fee is paid by the invoice creator when the invoice is activated.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do users sign in to UrsaDeFi?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Users connect with the Xaman XRPL wallet. There are no passwords. A Demo mode is also available for exploring the interface without a real wallet.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is UrsaDeFi?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'UrsaDeFi is an XRPL-native, non-custodial invoicing platform. It lets freelancers and small businesses create invoices in USD, settle in XRP, optionally mint invoices as XRPL NFTs, and export accountant-ready reports while keeping full control of their keys.',
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

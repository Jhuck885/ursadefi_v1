'use client';

/**
 * JSON-LD structured data for Generative Engine Optimization (GEO).
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
          'UrsaDeFi is a non-custodial XRPL-native invoicing platform built in Dallas, TX. Freelancers and small businesses bill in USD, settle in XRP, and keep full control of their keys via Xaman. No monthly fee.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Dallas',
          addressRegion: 'TX',
          addressCountry: 'US',
        },
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
          'Non-custodial XRPL invoicing. Free drafts. Platform fee 0.15% (minimum $0.25) only when an invoice is paid — no monthly subscription. Tax CSV for US, Europe, and Japan and NFT mint unlock after the platform fee is paid. Keys stay in Xaman.',
        offers: {
          '@type': 'Offer',
          price: '0.15',
          priceCurrency: 'USD',
          description:
            'Platform fee of 0.15% of service amount (minimum $0.25) when the invoice is paid. Drafts are free. No monthly fee. Tax export and mint unlock only after fee is paid.',
        },
        featureList: [
          'Non-custodial XRPL invoicing',
          'Free drafts — no monthly fee',
          '0.15% platform fee when invoice is paid (min $0.25)',
          'Tax CSV unlock after platform fee: US · Europe · Japan',
          'Optional XRPL NFT minting after settled',
          'Xaman wallet integration',
        ],
        provider: { '@id': 'https://ursadefi.com/#organization' },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://ursadefi.com/#website',
        url: 'https://ursadefi.com',
        name: 'UrsaDeFi',
        description:
          'Non-custodial XRPL invoicing for freelancers. Free drafts. 0.15% when paid. No monthly fee. Built in Dallas, TX.',
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
              text: 'No monthly fee. Draft invoices are free. When an invoice is paid, the platform fee is 0.15% of the service amount (minimum $0.25), paid by the invoice creator in Xaman. Tax CSV export and NFT mint unlock only after that fee is paid.',
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
              text: 'UrsaDeFi is an XRPL-native, non-custodial invoicing platform built in Dallas, Texas. It lets freelancers create invoices in USD, settle in XRP, export tax-oriented CSVs for US, Europe, and Japan after the platform fee, and optionally mint invoices as XRPL NFTs while keeping full control of their keys.',
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

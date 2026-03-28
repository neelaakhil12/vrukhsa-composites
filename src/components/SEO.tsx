import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  productData?: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    availability: string;
    rating?: number;
    reviewCount?: number;
  };
}

const SEO = ({ title, description, image, url, type = 'website', productData }: SEOProps) => {
  const siteName = 'Vruksha Composites';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const canonicalUrl = url || 'https://vrukshacomposites.com';
  const defaultImage = 'https://vrukshacomposites.com/logo.jpeg';
  const metaImage = image || defaultImage;
  const metaDescription = description || 'Vruksha Composites - Leading supplier of industrial composites and chemicals in India.';

  // JSON-LD Schema for Local Business
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Vruksha Composites",
    "image": defaultImage,
    "@id": "https://vrukshacomposites.com",
    "url": "https://vrukshacomposites.com",
    "telephone": "+91-XXXXXXXXXX", // User should update this
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Nizamabad",
      "addressLocality": "Nizamabad",
      "addressRegion": "Telangana",
      "postalCode": "503001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 18.6725,
      "longitude": 78.0941
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://www.facebook.com/vrukshacomposites",
      "https://twitter.com/VrukshaComposites"
    ]
  };

  // JSON-LD Schema for Product
  const productSchema = productData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.name,
    "image": productData.image,
    "description": productData.description.replace(/<[^>]*>?/gm, '').substring(0, 160),
    "brand": {
      "@type": "Brand",
      "name": siteName
    },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": productData.currency,
      "price": productData.price,
      "availability": productData.availability === 'in stock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": siteName
      }
    },
    ...(productData.rating && productData.reviewCount ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": productData.rating,
        "reviewCount": productData.reviewCount
      }
    } : {})
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* JSON-LD Schemas */}
      {!productData && (
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      )}
      {productData && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

// The registry (code, slug, name, warranty length) lives in functions/ because
// the warranty function validates against it and only that folder is deployed
// with it. Everything a page needs beyond that is added here, keyed by code.
import type { ImageMetadata } from 'astro';
import registry from '../../functions/products.json';
// Product photos live in products/<slug>/ at the project root.
import butterflyPlanter from '../../products/butterfly-wall-planter/1.jpeg';

interface ProductContent {
  summary: string;
  description: string[];
  // Amazon listing URL. Leave null until the listing is live; the button
  // shows "Coming soon to Amazon" in the meantime.
  amazonUrl: string | null;
  image: ImageMetadata | null;
  imageAlt: string;
  details: { label: string; value: string }[];
  // Shown at /install/<slug>. With no steps the page says the guide is coming.
  install: { intro: string; tools: string[]; steps: { title: string; body: string }[] };
}

const content: Record<string, ProductContent> = {
  'wp-butterfly': {
    summary: 'Carved wooden butterflies that each hold a glass tube, for a fresh cutting or a few stems on the wall.',
    description: [
      'Fill a tube with water, drop in a cutting or a flower, and the butterfly carries it. Sizes and materials go up here as soon as the Amazon listing is live.',
    ],
    amazonUrl: null,
    image: butterflyPlanter,
    imageAlt:
      'Three carved wooden butterflies mounted on a wall, each holding a glass tube with a plant cutting or flower.',
    details: [],
    install: { intro: '', tools: [], steps: [] },
  },
};

export const products = registry.map((entry) => ({ ...entry, ...content[entry.code] }));

export type Product = (typeof products)[number];

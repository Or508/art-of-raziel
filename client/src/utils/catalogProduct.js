import { mediaUrl } from './api';
import mezuzahLargeImg from '../assets/mezuzah-large.png';
import mezuzahMediumImg from '../assets/mezuzah-medium.png';
import sealOfSolomonImg from '../assets/seal-of-solomon.png';
import amuletIllustrationImg from '../assets/amulet-illustration.jpg';

export function catalogGroupFor(category, title, sourceCategory = '') {
  const text = title || '';
  const lower = text.toLowerCase();
  const isSeal = sourceCategory === 'חותמים'
    || text.includes('חותם')
    || text.includes('שלמה')
    || lower.includes('seal')
    || lower.includes('solomon');
  if (category === 'mezuzah') return 'mezuzah';
  if (isSeal) return 'seal';
  if (category === 'amulet') return 'amulet';
  return 'other';
}

function isSealOfSolomonTitle(title) {
  const text = title || '';
  return text.includes('שלמה') || text.toLowerCase().includes('solomon');
}

export function productVisuals({ uploadedUrl, category, sourceCategory, title }) {
  const uploaded = mediaUrl(uploadedUrl);
  if (uploaded) {
    return { image: uploaded, image_url: uploaded, imageIsIllustration: false };
  }

  const text = title || '';
  const lower = text.toLowerCase();
  const group = catalogGroupFor(category, text, sourceCategory);
  const isLargeMezuzah = category === 'mezuzah' && (
    text.includes('גדולה') || text.includes('גדול') || lower.includes('large')
  );
  const isMediumMezuzah = category === 'mezuzah' && (
    text.includes('בינונית') || text.includes('בינוני') || lower.includes('medium')
  );

  if (isLargeMezuzah) {
    return { image: mezuzahLargeImg, image_url: null, imageIsIllustration: false };
  }
  if (isMediumMezuzah) {
    return { image: mezuzahMediumImg, image_url: null, imageIsIllustration: false };
  }
  if (isSealOfSolomonTitle(text)) {
    return { image: sealOfSolomonImg, image_url: null, imageIsIllustration: false };
  }
  if (group === 'amulet') {
    return { image: amuletIllustrationImg, image_url: null, imageIsIllustration: true };
  }
  return { image: null, image_url: null, imageIsIllustration: false };
}

export function normalizeProductFromDB(dbProduct, matchingMock) {
  const category = dbProduct.category === 'מזוזות' ? 'mezuzah'
    : dbProduct.category === 'קמיעות' ? 'amulet'
    : dbProduct.category === 'חותמים' ? 'amulet'
    : 'other';
  const title = dbProduct.title || '';
  const price = Number(dbProduct.price_usd ?? dbProduct.price ?? 0) || 0;
  const stockNumber = Number(dbProduct.stock);
  const isActive = dbProduct.is_active === undefined || dbProduct.is_active === null
    ? true
    : Boolean(Number(dbProduct.is_active));
  const visuals = productVisuals({
    uploadedUrl: dbProduct.image_url,
    category,
    sourceCategory: dbProduct.category,
    title,
  });

  return {
    _id: dbProduct.id,
    id: dbProduct.id,
    nameHe: title,
    nameEn: dbProduct.title_en || matchingMock?.nameEn || title,
    descriptionHe: dbProduct.description || matchingMock?.descriptionHe || '',
    descriptionEn: dbProduct.description_en || matchingMock?.descriptionEn || dbProduct.description || '',
    price,
    priceDisplay: `$${price}`,
    category,
    sourceCategory: dbProduct.category,
    catalogGroup: catalogGroupFor(category, title, dbProduct.category),
    ...visuals,
    stock: Number.isFinite(stockNumber) ? stockNumber : 0,
    allow_preorder: !!dbProduct.allow_preorder,
    is_active: isActive,
  };
}

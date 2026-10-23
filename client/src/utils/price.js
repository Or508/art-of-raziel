// Catalog prices are stored in USD. Hebrew shows shekels at one shared rate.
export const USD_TO_ILS = 3.7;

export function formatStorePrice(amountUsd, language) {
  const amount = Number(amountUsd) || 0;
  if (language === 'he') {
    const shekels = Math.round(amount * USD_TO_ILS);
    return `${shekels.toLocaleString('he-IL')} ₪`;
  }
  return `$${amount.toLocaleString('en-US')}`;
}

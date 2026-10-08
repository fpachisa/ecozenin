const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 24 * 60 * 60 * 1000;

function addMonths(isoDate, months) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  // Clamp to the end of the month: Feb 29 plus 12 months is Feb 28.
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

// Checks a submitted registration against the product registry. Returns
// { ok: true, value } with the record to store, or { ok: false, errors } with
// one message per field, worded for the customer.
export function validateRegistration(input, products, now = new Date()) {
  const errors = {};

  const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
  if (!name) errors.name = 'Enter your name.';
  else if (name.length > 100) errors.name = 'Shorten your name to 100 characters or fewer.';

  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (!email) errors.email = 'Enter your email address.';
  else if (email.length > 254 || !EMAIL.test(email)) {
    errors.email = 'Enter an email address like name@example.com.';
  }

  const product = products.find((entry) => entry.code === input.product);
  if (!product) errors.product = 'Choose your product.';

  const purchaseDate = typeof input.purchaseDate === 'string' ? input.purchaseDate : '';
  const purchased = ISO_DATE.test(purchaseDate) ? new Date(`${purchaseDate}T00:00:00Z`) : null;
  if (!purchaseDate) {
    errors.purchaseDate = 'Enter the date you bought it.';
  } else if (!purchased || Number.isNaN(purchased.getTime()) || purchased.toISOString().slice(0, 10) !== purchaseDate) {
    errors.purchaseDate = 'Enter a real date.';
  } else if (purchased.getTime() > now.getTime() + DAY) {
    // A day of slack because the customer's "today" can be ahead of UTC.
    errors.purchaseDate = "The purchase date can't be in the future.";
  } else if (purchased.getTime() < now.getTime() - 5 * 365 * DAY) {
    errors.purchaseDate = 'Check the year of your purchase date.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const optIn = input.marketingOptIn;
  const source = typeof input.source === 'string' ? input.source.replace(/[^a-z0-9_-]/gi, '').slice(0, 40) : '';

  return {
    ok: true,
    value: {
      name,
      email,
      productCode: product.code,
      productName: product.name,
      purchaseDate,
      warrantyExpires: addMonths(purchaseDate, product.warrantyMonths),
      marketingOptIn: optIn === true || optIn === 'yes' || optIn === 'on',
      source,
    },
  };
}

/**
 * Centralized branding & business configuration.
 * Replace these values to rebrand the product — nothing else in the
 * codebase hard-codes them.
 */
export const BRAND = {
  /** Temporary working name — replace before launch. */
  productName: 'Demo',
  productNameAr: 'ديمو',
  /** Placeholder contact details — replace with real company info before launch. */
  supportEmail: '[support@company-placeholder.example]',
  legalBusinessName: '[Legal Business Name — placeholder]',
  commercialRegistration: '[Commercial Registration Number, if applicable — placeholder]',
  registeredAddress: '[Registered Address — placeholder]',
  vatNumber: '[VAT Number, if applicable — placeholder]',
  customerServiceContact: '[Customer Service Contact — placeholder]',
} as const;

/** Marks the entire app as a demo. Drives demo banners & simulated flows. */
export const IS_DEMO = true;

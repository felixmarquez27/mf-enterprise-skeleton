const brandName =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_BRAND_NAME) || "Admin";

const appName =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_APP_NAME) || `${brandName} Platform`;

const appSubtitle =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_APP_SUBTITLE) || "Shell Microfrontends";

const supportEmail =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_SUPPORT_EMAIL) ||
  `admin@${brandName.toLowerCase().replace(/\s+/g, "")}.com`;

const copyrightText =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_COPYRIGHT_TEXT) ||
  `© ${new Date().getFullYear()} ${brandName}. Todos los derechos reservados.`;

export const brandConfig = {
  name: brandName,
  appName,
  appSubtitle,
  supportEmail,
  copyrightText,
};

export default brandConfig;

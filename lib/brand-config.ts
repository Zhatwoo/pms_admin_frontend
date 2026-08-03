export interface BrandConfig {
  companyName: string;
  shortCompanyName: string;
  companyLogo: string;
  loginLogo: string;
  sidebarLogo: string;
  favicon: string;

  // Theme Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;

  // Contact Info
  phone: string;
  email: string;
  website: string;
  address: string;

  // Additional
  footerText: string;
  welcomeMessage: string;
  tagline: string;
}

export const BRAND_CONFIG: BrandConfig = {
  companyName: "QuickPawn SaaS Admin Portal",
  shortCompanyName: "Admin Portal",
  companyLogo: "/PMS_logo.svg",
  loginLogo: "/PMS_logo.svg",
  sidebarLogo: "/PMS_logo.svg",
  favicon: "/favicon.ico",
  primaryColor: "#0B5D3B",
  secondaryColor: "#E8C547",
  accentColor: "#E8C547",
  backgroundColor: "#ffffff",
  phone: "",
  email: "admin@quickpawn.com",
  website: "www.quickpawn.com",
  address: "",
  footerText: "QuickPawn SaaS Administration Portal",
  welcomeMessage: "Welcome to QuickPawn Admin Portal",
  tagline: "PAWNSHOP MANAGEMENT SYSTEM",
};

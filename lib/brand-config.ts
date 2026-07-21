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
  companyName: "SaaS Admin Portal",
  shortCompanyName: "Admin Portal",
  companyLogo: "/logo.png",
  loginLogo: "/logo.png",
  sidebarLogo: "/logo.png",
  favicon: "/favicon.ico",
  primaryColor: "#0B5D3B",
  secondaryColor: "#E8C547",
  accentColor: "#d4a843",
  backgroundColor: "#ffffff",
  phone: "",
  email: "admin@example.com",
  website: "www.example.com",
  address: "",
  footerText: "SaaS Admin Portal",
  welcomeMessage: "Welcome to the Admin Portal",
  tagline: "ADMIN PORTAL",
};

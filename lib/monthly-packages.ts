export interface MonthlyPackage {
  id: string;
  name: string;
  price: string;
  priceInr: number;
  description: string;
  features: string[];
  sortOrder: number;
  createdAt: string | null;
  offerPriceInr: number | null;
  offerLabel: string;
  isBestValue: boolean;
  isFeatured: boolean;
}

export const MONTHLY_PACKAGES: MonthlyPackage[] = [
  {
    id: "starter",
    name: "Starter Plan",
    price: "₹9,999",
    priceInr: 9999,
    description: "For new businesses starting their social media journey.",
    features: [
      "5 high-quality reels",
      "Professional shoot + editing",
      "Complete Instagram page management",
      "Basic growth strategy",
      "Page optimization + content planning",
    ],
    sortOrder: 0,
    createdAt: null,
    offerPriceInr: null,
    offerLabel: "",
    isBestValue: false,
    isFeatured: true,
  },
  {
    id: "professional",
    name: "Professional Plan",
    price: "₹19,999",
    priceInr: 19999,
    description: "For consistent content and professional page management.",
    features: [
      "10 high-quality reels",
      "Creative posters",
      "Complete Instagram page management",
      "Professional shoot + editing",
      "Growth-focused content strategy",
      "Monthly performance tracking",
      "Regular content + page optimization",
    ],
    sortOrder: 1,
    createdAt: null,
    offerPriceInr: null,
    offerLabel: "",
    isBestValue: false,
    isFeatured: true,
  },
  {
    id: "premium-growth",
    name: "Premium Growth Plan",
    price: "₹24,999",
    priceInr: 24999,
    description: "For businesses pursuing aggressive, consistent social growth.",
    features: [
      "15 high-quality reels",
      "High-quality creative posters",
      "Complete Instagram page management",
      "Growth-focused marketing strategy",
      "Professional shoot + editing",
      "Monthly performance + growth tracking",
      "Consistent content + audience engagement",
      "3-month growth roadmap",
    ],
    sortOrder: 2,
    createdAt: null,
    offerPriceInr: null,
    offerLabel: "",
    isBestValue: true,
    isFeatured: true,
  },
];

export type MonthlyPackageId = string;

export function formatMonthlyPrice(priceInr: number) {
  return `₹${priceInr.toLocaleString("en-IN")}`;
}

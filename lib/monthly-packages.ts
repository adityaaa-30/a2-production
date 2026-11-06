export const MONTHLY_PACKAGES = [
  {
    id: "starter",
    name: "Starter Plan",
    price: "₹9,999",
    description: "For new businesses starting their social media journey.",
    features: [
      "5 high-quality reels",
      "Professional shoot + editing",
      "Complete Instagram page management",
      "Basic growth strategy",
      "Page optimization + content planning",
    ],
  },
  {
    id: "professional",
    name: "Professional Plan",
    price: "₹19,999",
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
  },
  {
    id: "premium-growth",
    name: "Premium Growth Plan",
    price: "₹24,999",
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
  },
] as const;

export type MonthlyPackageId = (typeof MONTHLY_PACKAGES)[number]["id"];

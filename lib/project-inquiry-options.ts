export const BUSINESS_TYPES = [
  "Gym", "Restaurant", "Cafe", "Hotel", "Clothing Brand", "Fitness Brand",
  "Healthcare", "Medical Clinic", "Real Estate", "Construction",
  "Photography", "Videography", "Salon", "Barbershop", "Jewellery",
  "Education", "Coaching Institute", "School", "College",
  "YouTube Channel", "Influencer", "Personal Brand", "Event Management",
  "Wedding", "Automobile", "E-Commerce", "Technology", "Startup",
  "Finance", "Interior Design", "Travel", "NGO", "Other",
] as const;

export const PROJECT_TIMELINES = [
  "Urgent",
  "Within 1 Week",
  "Within 2 Weeks",
  "Within 1 Month",
  "Flexible",
] as const;

export const PHONE_CODES = [
  "+91", "+1", "+44", "+971", "+61", "+49", "+33", "+81",
  "+86", "+966", "+65", "+60", "+977", "+880", "+94", "+92",
] as const;

export const PHONE_COUNTRIES = [
  { code: "+91", flag: "🇮🇳", country: "India" },
  { code: "+1", flag: "🇺🇸", country: "US" },
  { code: "+44", flag: "🇬🇧", country: "UK" },
  { code: "+971", flag: "🇦🇪", country: "UAE" },
  { code: "+61", flag: "🇦🇺", country: "Australia" },
  { code: "+49", flag: "🇩🇪", country: "Germany" },
  { code: "+33", flag: "🇫🇷", country: "France" },
  { code: "+81", flag: "🇯🇵", country: "Japan" },
  { code: "+86", flag: "🇨🇳", country: "China" },
  { code: "+966", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "+65", flag: "🇸🇬", country: "Singapore" },
  { code: "+60", flag: "🇲🇾", country: "Malaysia" },
  { code: "+977", flag: "🇳🇵", country: "Nepal" },
  { code: "+880", flag: "🇧🇩", country: "Bangladesh" },
  { code: "+94", flag: "🇱🇰", country: "Sri Lanka" },
  { code: "+92", flag: "🇵🇰", country: "Pakistan" },
] as const;

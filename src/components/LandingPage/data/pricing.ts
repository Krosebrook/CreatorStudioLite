export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  badge?: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for individual creators just starting out",
    features: [
      "Up to 5 social accounts",
      "100 posts per month",
      "Basic analytics",
      "AI content suggestions",
      "Email support"
    ],
    cta: "Start Free Trial"
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "For growing creators who need more power",
    features: [
      "Unlimited social accounts",
      "Unlimited posts",
      "Advanced analytics & insights",
      "AI content generation",
      "Priority support",
      "Brand partnership matching",
      "Revenue optimization"
    ],
    highlighted: true,
    cta: "Start Free Trial",
    badge: "Most Popular"
  },
  {
    name: "Agency",
    price: "$199",
    period: "/month",
    description: "For agencies managing multiple creators",
    features: [
      "Everything in Professional",
      "Team collaboration tools",
      "White-label reports",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee"
    ],
    cta: "Contact Sales"
  }
];

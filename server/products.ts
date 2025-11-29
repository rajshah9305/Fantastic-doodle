/**
 * Stripe Product and Price Configuration
 * Define all subscription tiers and their pricing here
 * These IDs should be created in your Stripe dashboard
 */

export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    features: [
      "5 app generations per month",
      "Basic AI models",
      "Community support",
      "Standard export options",
    ],
  },
  BASIC: {
    id: "basic",
    name: "Basic",
    description: "For individuals and small projects",
    price: 2999, // $29.99 in cents
    interval: "month",
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || "price_basic",
    features: [
      "Unlimited app generations",
      "Advanced AI models",
      "Email support",
      "Priority processing",
      "Custom exports",
      "API access",
    ],
  },
  PRO: {
    id: "pro",
    name: "Pro",
    description: "For professionals and teams",
    price: 7999, // $79.99 in cents
    interval: "month",
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro",
    features: [
      "Everything in Basic",
      "Team collaboration",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Webhook integrations",
      "Advanced API access",
    ],
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    price: null, // Custom pricing
    interval: "month",
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "On-premise deployment",
      "Advanced security features",
      "Custom AI model training",
    ],
  },
};

export const getPricingTier = (tierId: string) => {
  const tier = Object.values(SUBSCRIPTION_TIERS).find((t) => t.id === tierId);
  if (!tier) {
    throw new Error(`Unknown pricing tier: ${tierId}`);
  }
  return tier;
};

export const getAllTiers = () => {
  return Object.values(SUBSCRIPTION_TIERS).filter((t) => t.id !== "free");
};

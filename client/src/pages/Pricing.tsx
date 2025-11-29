import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const currentTier = "free";
  const pricingTiers = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for getting started",
      price: 9,
      interval: "month",
      features: ["10 AI generations per month", "Basic templates", "Email support"]
    },
    {
      id: "pro", 
      name: "Pro",
      description: "For power users",
      price: 29,
      interval: "month",
      features: ["Unlimited AI generations", "Premium templates", "Priority support", "Custom branding"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Button>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold text-foreground">Pricing</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start building amazing apps with AI. Upgrade anytime to unlock more features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="relative border-2 border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Free</CardTitle>
                {currentTier === "free" && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </div>
              <CardDescription>Perfect for trying out the platform</CardDescription>
              <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">3 AI generations per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Basic templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Community support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={currentTier === "free" ? "secondary" : "outline"}
                disabled={currentTier === "free"}
              >
                {currentTier === "free" ? "Current Plan" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>

          {/* Paid Tiers */}
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative border-2 ${
                tier.id === "pro" ? "border-primary shadow-lg" : "border-border"
              }`}
            >
              {tier.id === "pro" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {tier.name}
                    {tier.id === "basic" && <Zap className="w-4 h-4 text-accent" />}
                    {tier.id === "pro" && <Crown className="w-4 h-4 text-primary" />}
                  </CardTitle>
                  {currentTier === tier.id && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                <CardDescription>{tier.description}</CardDescription>
                <div className="text-3xl font-bold">
                  ${tier.price}
                  <span className="text-sm font-normal text-muted-foreground">/{tier.interval}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${
                    tier.id === "pro" 
                      ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" 
                      : ""
                  }`}
                  disabled={true}
                >
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div className="space-y-2">
              <h3 className="font-semibold">Can I change plans anytime?</h3>
              <p className="text-sm text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">What happens to my apps if I downgrade?</h3>
              <p className="text-sm text-muted-foreground">Your existing apps remain accessible, but you'll be limited by your new plan's generation limits.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">We offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">Yes! The free plan lets you try the platform with 3 generations per month.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
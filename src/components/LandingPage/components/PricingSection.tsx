import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { CheckCircle, Zap } from 'lucide-react';
import { PricingTier } from '../data/pricing';
import { cn } from '../../../design-system/utils/cn';

interface PricingSectionProps {
  pricingTiers: PricingTier[];
  onSelectPlan: (tierName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ pricingTiers, onSelectPlan }) => {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Choose the perfect plan for your creator journey. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <Card
              key={index}
              className={cn(
                "p-8 relative",
                tier.highlighted && "border-2 border-primary-500 shadow-xl"
              )}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-500 to-success-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>{tier.badge}</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-neutral-900">{tier.price}</span>
                  <span className="text-neutral-600 ml-1">{tier.period}</span>
                </div>
                <p className="text-neutral-600">{tier.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.highlighted ? "primary" : "secondary"}
                fullWidth
                size="lg"
                onClick={() => onSelectPlan(tier.name)}
              >
                {tier.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

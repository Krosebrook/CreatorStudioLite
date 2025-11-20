import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { CheckCircle } from 'lucide-react';
import { Feature } from '../data/features';

interface FeaturesSectionProps {
  features: Feature[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Powerful features designed specifically for content creators who want to grow faster and earn more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-success-100 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-neutral-600 mb-6">
                {feature.description}
              </p>

              <ul className="space-y-3">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

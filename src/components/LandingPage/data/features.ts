import React from 'react';
import { Brain, BarChart3, Rocket, DollarSign } from 'lucide-react';

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  demo?: React.ReactNode;
}

export const features: Feature[] = [
  {
    icon: React.createElement(Brain, { className: "w-8 h-8" }),
    title: "AI-Powered Content Creation",
    description: "Generate viral content ideas, captions, and hashtags using advanced AI that understands your niche and audience.",
    benefits: [
      "10x faster content creation",
      "Viral prediction algorithm",
      "Brand voice consistency",
      "Multi-platform optimization"
    ]
  },
  {
    icon: React.createElement(BarChart3, { className: "w-8 h-8" }),
    title: "Real-Time Analytics Dashboard",
    description: "Track performance across all platforms with actionable insights and revenue attribution.",
    benefits: [
      "Cross-platform analytics",
      "Revenue tracking",
      "Audience insights",
      "Performance predictions"
    ]
  },
  {
    icon: React.createElement(Rocket, { className: "w-8 h-8" }),
    title: "Smart Publishing Engine",
    description: "Schedule and publish content across all major platforms with optimal timing suggestions.",
    benefits: [
      "Multi-platform publishing",
      "Optimal timing AI",
      "Bulk scheduling",
      "Auto-optimization"
    ]
  },
  {
    icon: React.createElement(DollarSign, { className: "w-8 h-8" }),
    title: "Revenue Optimization",
    description: "Maximize earnings with brand partnership matching, pricing optimization, and revenue forecasting.",
    benefits: [
      "Brand partnership matching",
      "Revenue forecasting",
      "Pricing optimization",
      "Tax reporting"
    ]
  }
];

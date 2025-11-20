import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Star, TrendingUp } from 'lucide-react';
import { Testimonial } from '../data/testimonials';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-neutral-50 to-primary-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Trusted by Successful Creators
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Join thousands of creators who have transformed their content business with SparkLabs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning-400 text-warning-400" />
                ))}
              </div>

              <p className="text-neutral-700 mb-6 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-neutral-200">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                  <div className="text-sm text-neutral-600">{testimonial.role}</div>
                  <div className="text-xs text-primary-600">{testimonial.company}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-success-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {testimonial.metrics.growth}
                  </div>
                  <div className="text-xs text-neutral-600">Growth</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {testimonial.metrics.revenue}
                  </div>
                  <div className="text-xs text-neutral-600">Revenue</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {testimonial.metrics.followers}
                  </div>
                  <div className="text-xs text-neutral-600">Followers</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

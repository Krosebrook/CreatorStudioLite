import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { stripeService } from '../../services/payments';
import type { SubscriptionPlan, Subscription } from '../../services/payments';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlansAndSubscription();
  }, [user]);

  const loadPlansAndSubscription = async () => {
    try {
      setIsLoading(true);

      const availablePlans = await stripeService.getSubscriptionPlans();
      setPlans(availablePlans);

      if (user) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscription) {
          setCurrentSubscription({
            id: subscription.stripe_subscription_id,
            userId: subscription.user_id,
            planId: subscription.plan_id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start),
            currentPeriodEnd: new Date(subscription.current_period_end),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    try {
      setSelectedPlan(planId);
      console.log('Subscribe to plan:', planId);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? Your access will continue until the end of the billing period.'
    );

    if (!confirmed) return;

    try {
      await stripeService.cancelSubscription(currentSubscription.id, false);
      await loadPlansAndSubscription();
      alert('Subscription canceled. You will retain access until the end of your billing period.');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!currentSubscription) return;

    try {
      await stripeService.updateSubscription(currentSubscription.id, planId);
      await loadPlansAndSubscription();
      alert('Subscription updated successfully!');
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      alert('Failed to upgrade subscription. Please try again.');
    }
  };

  const getPlanBadge = (planId: string) => {
    if (currentSubscription?.planId === planId) {
      return (
        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
          Current Plan
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
        <p className="text-gray-600">Choose the plan that works best for you</p>
      </div>

      {currentSubscription && (
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Status: <span className="font-medium capitalize">{currentSubscription.status}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Billing period ends: {currentSubscription.currentPeriodEnd.toLocaleDateString()}
                </p>
                {currentSubscription.cancelAtPeriodEnd && (
                  <p className="text-sm text-red-600 mt-1">
                    Your subscription will be canceled at the end of the current period
                  </p>
                )}
              </div>
              {!currentSubscription.cancelAtPeriodEnd && (
                <Button variant="secondary" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={currentSubscription?.planId === plan.id ? 'border-2 border-blue-600' : ''}>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  {getPlanBadge(plan.id)}
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.interval}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {currentSubscription?.planId === plan.id ? (
                <Button variant="secondary" disabled fullWidth>
                  Current Plan
                </Button>
              ) : currentSubscription ? (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plans.findIndex(p => p.id === currentSubscription.planId) < plans.findIndex(p => p.id === plan.id)
                    ? 'Upgrade'
                    : 'Downgrade'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={selectedPlan === plan.id}
                >
                  {selectedPlan === plan.id ? 'Processing...' : 'Subscribe'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

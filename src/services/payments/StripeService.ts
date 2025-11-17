import { z } from 'zod';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { supabase } from '../../lib/supabase';

const StripeConfigSchema = z.object({
  secretKey: z.string().optional(),
  webhookSecret: z.string().optional(),
});

type StripeConfig = z.infer<typeof StripeConfigSchema>;

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    posts: number;
    storage: number;
    aiCredits: number;
    teamMembers: number;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

class StripeService {
  private static instance: StripeService;
  private config: StripeConfig;
  private baseUrl = 'https://api.stripe.com/v1';

  private constructor() {
    this.config = StripeConfigSchema.parse({
      secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY,
      webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET,
    });
  }

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      if (!this.config.secretKey) {
        throw new AppError('Stripe secret key not configured', 'MISSING_API_KEY');
      }

      logger.info('Creating payment intent', { amount, currency });

      const body = new URLSearchParams({
        amount: amount.toString(),
        currency,
        'metadata[workspace_id]': metadata?.workspace_id || '',
      });

      const response = await fetch(`${this.baseUrl}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AppError(`Stripe error: ${error.error?.message}`, 'STRIPE_ERROR');
      }

      const data = await response.json();

      return {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        clientSecret: data.client_secret,
      };
    } catch (error) {
      logger.error('Failed to create payment intent', { error });
      throw error;
    }
  }

  async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId: string
  ): Promise<Subscription> {
    try {
      if (!this.config.secretKey) {
        throw new AppError('Stripe secret key not configured', 'MISSING_API_KEY');
      }

      logger.info('Creating subscription', { userId, planId });

      let customerId = await this.getOrCreateCustomer(userId);

      await this.attachPaymentMethod(paymentMethodId, customerId);

      const body = new URLSearchParams({
        customer: customerId,
        'items[0][price]': planId,
        'payment_behavior': 'default_incomplete',
        'payment_settings[save_default_payment_method]': 'on_subscription',
        'expand[]': 'latest_invoice.payment_intent',
      });

      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AppError(`Stripe error: ${error.error?.message}`, 'STRIPE_ERROR');
      }

      const data = await response.json();

      const subscription: Subscription = {
        id: data.id,
        userId,
        planId,
        status: data.status,
        currentPeriodStart: new Date(data.current_period_start * 1000),
        currentPeriodEnd: new Date(data.current_period_end * 1000),
        cancelAtPeriodEnd: data.cancel_at_period_end,
      };

      await this.saveSubscriptionToDatabase(subscription);

      return subscription;
    } catch (error) {
      logger.error('Failed to create subscription', { error });
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<void> {
    try {
      if (!this.config.secretKey) {
        throw new AppError('Stripe secret key not configured', 'MISSING_API_KEY');
      }

      logger.info('Canceling subscription', { subscriptionId, immediate });

      const body = new URLSearchParams();
      if (!immediate) {
        body.append('cancel_at_period_end', 'true');
      }

      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: immediate ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: immediate ? undefined : body.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AppError(`Stripe error: ${error.error?.message}`, 'STRIPE_ERROR');
      }

      await supabase
        .from('subscriptions')
        .update({
          status: immediate ? 'canceled' : 'active',
          cancel_at_period_end: !immediate,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);
    } catch (error) {
      logger.error('Failed to cancel subscription', { error });
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, newPlanId: string): Promise<void> {
    try {
      if (!this.config.secretKey) {
        throw new AppError('Stripe secret key not configured', 'MISSING_API_KEY');
      }

      logger.info('Updating subscription', { subscriptionId, newPlanId });

      const subscription = await this.getSubscriptionFromStripe(subscriptionId);

      const body = new URLSearchParams({
        'items[0][id]': subscription.items.data[0].id,
        'items[0][price]': newPlanId,
      });

      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AppError(`Stripe error: ${error.error?.message}`, 'STRIPE_ERROR');
      }

      await supabase
        .from('subscriptions')
        .update({
          plan_id: newPlanId,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);
    } catch (error) {
      logger.error('Failed to update subscription', { error });
      throw error;
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return [
      {
        id: 'price_starter',
        name: 'Starter',
        price: 9.99,
        interval: 'month',
        features: [
          'Up to 10 posts per month',
          '5GB storage',
          'Basic analytics',
          '100 AI credits',
          '1 team member',
        ],
        limits: {
          posts: 10,
          storage: 5 * 1024 * 1024 * 1024,
          aiCredits: 100,
          teamMembers: 1,
        },
      },
      {
        id: 'price_professional',
        name: 'Professional',
        price: 29.99,
        interval: 'month',
        features: [
          'Unlimited posts',
          '50GB storage',
          'Advanced analytics',
          '500 AI credits',
          '5 team members',
          'Priority support',
        ],
        limits: {
          posts: -1,
          storage: 50 * 1024 * 1024 * 1024,
          aiCredits: 500,
          teamMembers: 5,
        },
      },
      {
        id: 'price_enterprise',
        name: 'Enterprise',
        price: 99.99,
        interval: 'month',
        features: [
          'Unlimited posts',
          '500GB storage',
          'Custom analytics',
          '2000 AI credits',
          'Unlimited team members',
          'Dedicated support',
          'Custom integrations',
        ],
        limits: {
          posts: -1,
          storage: 500 * 1024 * 1024 * 1024,
          aiCredits: 2000,
          teamMembers: -1,
        },
      },
    ];
  }

  private async getOrCreateCustomer(userId: string): Promise<string> {
    const { data: existing } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing?.stripe_customer_id) {
      return existing.stripe_customer_id;
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      .maybeSingle();

    const body = new URLSearchParams({
      'metadata[user_id]': userId,
    });

    if (userProfile?.display_name) {
      body.append('name', userProfile.display_name);
    }

    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new AppError('Failed to create Stripe customer', 'CUSTOMER_CREATION_FAILED');
    }

    const customer = await response.json();

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', userId);

    return customer.id;
  }

  private async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<void> {
    const body = new URLSearchParams({
      customer: customerId,
    });

    const response = await fetch(`${this.baseUrl}/payment_methods/${paymentMethodId}/attach`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new AppError('Failed to attach payment method', 'PAYMENT_METHOD_ATTACH_FAILED');
    }
  }

  private async getSubscriptionFromStripe(subscriptionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.secretKey}`,
      },
    });

    if (!response.ok) {
      throw new AppError('Failed to fetch subscription', 'SUBSCRIPTION_FETCH_FAILED');
    }

    return await response.json();
  }

  private async saveSubscriptionToDatabase(subscription: Subscription): Promise<void> {
    await supabase.from('subscriptions').insert({
      user_id: subscription.userId,
      stripe_subscription_id: subscription.id,
      plan_id: subscription.planId,
      status: subscription.status,
      current_period_start: subscription.currentPeriodStart.toISOString(),
      current_period_end: subscription.currentPeriodEnd.toISOString(),
      cancel_at_period_end: subscription.cancelAtPeriodEnd,
    });
  }
}

export const stripeService = StripeService.getInstance();

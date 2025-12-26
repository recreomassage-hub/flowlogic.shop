import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SubscriptionModel, SubscriptionTier } from '../../db/models/Subscription';
import { UserModel } from '../../db/models/User';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Get current subscription
 */
export async function getCurrentSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const subscription = await SubscriptionModel.getByUserId(req.user.sub);

    if (!subscription) {
      // Free tier - no subscription
      res.status(404).json({
        error: 'Not Found',
        message: 'No subscription found (Free tier)',
      });
      return;
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get subscription',
    });
  }
}

/**
 * Create subscription (upgrade)
 */
export async function createSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { tier, payment_method_id } = req.body;

    if (!tier || !payment_method_id) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Tier and payment_method_id are required',
      });
      return;
    }

    if (!['basic', 'pro', 'proplus'].includes(tier)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid tier. Must be: basic, pro, or proplus',
      });
      return;
    }

    const user = await UserModel.getById(req.user.sub);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.email; // Placeholder - should be stored in user model
    let customer: Stripe.Customer;

    try {
      customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
    } catch {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.user_id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Attach payment method
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: process.env[`STRIPE_PRICE_${tier.toUpperCase()}`] || '', // e.g., STRIPE_PRICE_BASIC
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Create subscription in DynamoDB
    const subscription = await SubscriptionModel.create({
      user_id: user.user_id,
      subscription_id: stripeSubscription.id,
      stripe_customer_id: stripeCustomerId,
      tier: tier as SubscriptionTier,
      status: 'active',
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: false,
    });

    // Update user tier
    await UserModel.update(user.user_id, { tier: tier as SubscriptionTier });

    res.status(201).json(subscription);
  } catch (error: any) {
    console.error('Create subscription error:', error);
    if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create subscription',
    });
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const subscription = await SubscriptionModel.getByUserId(req.user.sub);

    if (!subscription) {
      res.status(404).json({
        error: 'Not Found',
        message: 'No subscription found',
      });
      return;
    }

    // Cancel in Stripe
    await stripe.subscriptions.update(subscription.subscription_id, {
      cancel_at_period_end: true,
    });

    // Update in DynamoDB
    const updated = await SubscriptionModel.update(
      req.user.sub,
      subscription.subscription_id,
      {
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
        status: 'canceled',
      }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to cancel subscription',
    });
  }
}



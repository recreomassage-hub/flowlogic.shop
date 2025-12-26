export type SubscriptionTier = 'basic' | 'pro' | 'proplus';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'expired';
export interface Subscription {
    user_id: string;
    subscription_id: string;
    stripe_customer_id: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    canceled_at?: string;
    created_at: string;
    updated_at: string;
}
export declare class SubscriptionModel {
    /**
     * Create a new subscription
     */
    static create(subscription: Omit<Subscription, 'created_at' | 'updated_at'>): Promise<Subscription>;
    /**
     * Get subscription by user ID (most recent active)
     */
    static getByUserId(userId: string): Promise<Subscription | null>;
    /**
     * Get subscription by Stripe customer ID (using GSI)
     */
    static getByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null>;
    /**
     * Get subscription by subscription ID
     */
    static getBySubscriptionId(userId: string, subscriptionId: string): Promise<Subscription | null>;
    /**
     * Update subscription
     */
    static update(userId: string, subscriptionId: string, updates: Partial<Omit<Subscription, 'user_id' | 'subscription_id' | 'created_at'>>): Promise<Subscription>;
    /**
     * Delete subscription
     */
    static delete(userId: string, subscriptionId: string): Promise<void>;
}
//# sourceMappingURL=Subscription.d.ts.map
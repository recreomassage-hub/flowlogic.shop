import { apiClient } from './client';

export interface Subscription {
  user_id: string;
  subscription_id: string;
  stripe_customer_id: string;
  tier: 'basic' | 'pro' | 'proplus';
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionRequest {
  tier: 'basic' | 'pro' | 'proplus';
  payment_method_id: string;
}

export const subscriptionsApi = {
  getCurrentSubscription: async (): Promise<Subscription | null> => {
    try {
      const response = await apiClient.get<Subscription>('/subscriptions');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Free tier
      }
      throw error;
    }
  },

  createSubscription: async (data: CreateSubscriptionRequest): Promise<Subscription> => {
    const response = await apiClient.post<Subscription>('/subscriptions', data);
    return response.data;
  },

  cancelSubscription: async (): Promise<Subscription> => {
    const response = await apiClient.post<Subscription>('/subscriptions/cancel');
    return response.data;
  },
};






import { useEffect, useState } from 'react';
import { subscriptionsApi } from '../api/subscriptions';
import { Subscription } from '../api/subscriptions';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    tests: '3 tests/month',
    features: ['3 tests per month', 'Basic results'],
  },
  {
    name: 'Basic',
    price: '$4.99/month',
    tests: '10 tests/month',
    features: ['10 tests per month', 'AI correction plan', 'Calendar'],
  },
  {
    name: 'Pro',
    price: '$9.99/month',
    tests: '30 tests/month',
    features: ['30 tests per month', 'AI correction plan', 'Calendar', 'Progress charts'],
  },
  {
    name: 'Pro+',
    price: '$19.99/month',
    tests: 'Unlimited',
    features: ['Unlimited tests', 'AI correction plan', 'Calendar', 'Progress charts', 'Priority support'],
  },
];

export function TiersPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await subscriptionsApi.getCurrentSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Tiers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TIERS.map((tier) => (
          <div key={tier.name} className="card">
            <h2 className="text-2xl font-bold mb-2">{tier.name}</h2>
            <p className="text-3xl font-bold text-primary-600 mb-4">{tier.price}</p>
            <p className="text-sm text-gray-600 mb-4">{tier.tests}</p>
            <ul className="space-y-2 mb-6">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  ✓ {feature}
                </li>
              ))}
            </ul>
            {subscription?.tier === tier.name.toLowerCase() ? (
              <button disabled className="btn btn-secondary w-full">
                Current Plan
              </button>
            ) : (
              <button className="btn btn-primary w-full">
                {tier.name === 'Free' ? 'Current' : 'Upgrade'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}



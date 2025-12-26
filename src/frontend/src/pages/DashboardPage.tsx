import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '../api/users';

export function DashboardPage() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await usersApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, [setUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Current Tier</h2>
          <p className="text-2xl font-bold text-primary-600 capitalize">{user?.tier || 'Free'}</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/assessments" className="block btn btn-primary text-center">
              Start Assessment
            </Link>
            <Link to="/tiers" className="block btn btn-secondary text-center">
              View Tiers
            </Link>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <p className="text-sm text-gray-600">{user?.email}</p>
          {user?.name && <p className="text-sm text-gray-600">{user.name}</p>}
        </div>
      </div>
    </div>
  );
}



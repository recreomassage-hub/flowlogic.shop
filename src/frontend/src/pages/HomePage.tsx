import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Flow Logic
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Movement Quality Assessment Platform
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Assess your movement quality through MediaPipe analysis and get personalized correction plans.
        </p>
        {!isAuthenticated && (
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}


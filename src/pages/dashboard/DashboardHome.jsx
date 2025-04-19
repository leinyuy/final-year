import { useAuth } from '../../hooks/useAuth';

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Welcome back!</h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your account today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

const PaymentHistory = ({ projectId }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(paymentsQuery);
        const paymentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? new Date(doc.data().createdAt) : null,
          completedAt: doc.data().completedAt ? new Date(doc.data().completedAt) : null,
        }));

        setPayments(paymentsData);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [projectId]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No payment history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {payments.map((payment) => (
          <li key={payment.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    Payment #{payment.id.slice(-6)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {payment.description || 'Project Payment'}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {formatAmount(payment.amount)}
                  </p>
                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                    {payment.provider.toUpperCase()}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    {payment.completedAt
                      ? `Completed ${format(payment.completedAt, 'MMM d, yyyy HH:mm')}`
                      : `Initiated ${format(payment.createdAt, 'MMM d, yyyy HH:mm')}`}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentHistory; 
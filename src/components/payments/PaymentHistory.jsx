import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { format, subMonths } from 'date-fns';
import { campayService } from '../../services/campayService';
import toast from 'react-hot-toast';
import WithdrawalForm from './WithdrawalForm';

const PaymentHistory = ({ projectId }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Get payments from Firestore
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(paymentsQuery);
        const firestorePayments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? new Date(doc.data().createdAt) : null,
          completedAt: doc.data().completedAt ? new Date(doc.data().completedAt) : null,
        }));

        // Get payments from Campay API for the last 30 days
        const endDate = format(new Date(), 'yyyy-MM-dd');
        const startDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
        
        const campayPayments = await campayService.getPaymentHistory(startDate, endDate);
        
        // Combine and sort all payments
        const allPayments = [
          ...firestorePayments,
          ...campayPayments.map(payment => ({
            id: payment.reference,
            amount: payment.amount,
            status: payment.status.toLowerCase(),
            provider: payment.provider,
            createdAt: new Date(payment.created_at),
            completedAt: payment.completed_at ? new Date(payment.completed_at) : null,
            description: payment.description,
            operator: payment.operator,
            operatorReference: payment.operator_reference
          }))
        ].sort((a, b) => b.createdAt - a.createdAt);

        setPayments(allPayments);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payment history');
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [projectId]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'successful':
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

  const handleWithdraw = (payment) => {
    setSelectedPayment(payment);
    setShowWithdrawalForm(true);
  };

  const handleWithdrawalSuccess = async (withdrawalResponse) => {
    try {
      // Update payment record with withdrawal information
      await updateDoc(doc(db, 'payments', selectedPayment.id), {
        withdrawalStatus: 'pending',
        withdrawalReference: withdrawalResponse.reference,
        withdrawalRequestedAt: new Date().toISOString()
      });

      // Refresh payments list
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(paymentsQuery);
      const updatedPayments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt) : null,
        completedAt: doc.data().completedAt ? new Date(doc.data().completedAt) : null,
      }));

      setPayments(updatedPayments);
      setShowWithdrawalForm(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error updating payment with withdrawal info:', error);
      toast.error('Failed to update payment with withdrawal information');
    }
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
                <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </p>
                  {!isClient && payment.status === 'successful' && !payment.withdrawalStatus && (
                    <button
                      onClick={() => handleWithdraw(payment)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Withdraw
                    </button>
                  )}
                  {payment.withdrawalStatus && (
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.withdrawalStatus)}`}>
                      Withdrawal {payment.withdrawalStatus}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {formatAmount(payment.amount)}
                  </p>
                  {payment.provider && (
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {payment.provider.toUpperCase()}
                    </p>
                  )}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    {payment.completedAt
                      ? `Completed ${format(payment.completedAt, 'MMM d, yyyy HH:mm')}`
                      : `Initiated ${format(payment.createdAt, 'MMM d, yyyy HH:mm')}`}
                  </p>
                </div>
              </div>
              {payment.operator && payment.operatorReference && (
                <div className="mt-2 text-sm text-gray-500">
                  <p>Operator: {payment.operator}</p>
                  <p>Reference: {payment.operatorReference}</p>
                </div>
              )}
              {payment.withdrawalReference && (
                <div className="mt-2 text-sm text-gray-500">
                  <p>Withdrawal Reference: {payment.withdrawalReference}</p>
                  <p>Requested: {format(new Date(payment.withdrawalRequestedAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {showWithdrawalForm && selectedPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Request Withdrawal
            </h3>
            <WithdrawalForm
              paymentId={selectedPayment.id}
              amount={selectedPayment.amount}
              onSuccess={handleWithdrawalSuccess}
            />
            <button
              onClick={() => {
                setShowWithdrawalForm(false);
                setSelectedPayment(null);
              }}
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory; 
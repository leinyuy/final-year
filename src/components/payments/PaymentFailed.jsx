import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleFailedPayment = async () => {
      try {
        const externalReference = searchParams.get('external_reference');
        if (!externalReference) {
          throw new Error('Missing payment reference');
        }

        // Get payment record from Firestore
        const paymentDoc = await getDoc(doc(db, 'payments', externalReference));
        if (!paymentDoc.exists()) {
          throw new Error('Payment record not found');
        }

        const paymentData = paymentDoc.data();

        // Update payment record with failed status
        await updateDoc(doc(db, 'payments', externalReference), {
          status: 'failed',
          failedAt: new Date().toISOString()
        });

        toast.error('Payment was not successful. Please try again.');
      } catch (error) {
        console.error('Error handling failed payment:', error);
        toast.error(error.message || 'Error processing payment status');
      }
    };

    handleFailedPayment();
  }, [searchParams]);

  const handleTryAgain = () => {
    const externalReference = searchParams.get('external_reference');
    if (externalReference) {
      navigate(`/payments/${externalReference}/retry`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Payment Failed
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We couldn't process your payment. This could be due to:
          </p>
          <ul className="mt-4 text-sm text-gray-600 list-disc list-inside">
            <li>Insufficient funds in your mobile money account</li>
            <li>Transaction was cancelled</li>
            <li>Network issues</li>
            <li>Other technical difficulties</li>
          </ul>
          <div className="mt-6 space-y-4">
            <button
              onClick={handleTryAgain}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 
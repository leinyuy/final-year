import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { campayService } from '../../services/campayService';
import toast from 'react-hot-toast';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const handlePaymentStatus = async () => {
      try {
        const reference = searchParams.get('reference');
        const status = searchParams.get('status');
        const externalReference = searchParams.get('external_reference');
        const amount = searchParams.get('amount');
        const operator = searchParams.get('operator');
        const operatorReference = searchParams.get('operator_reference');

        if (!reference || !status || !externalReference) {
          throw new Error('Missing payment information');
        }

        // Get payment record from Firestore
        const paymentDoc = await getDoc(doc(db, 'payments', externalReference));
        if (!paymentDoc.exists()) {
          throw new Error('Payment record not found');
        }

        const paymentData = paymentDoc.data();

        // Update payment record with final status
        await updateDoc(doc(db, 'payments', externalReference), {
          status: status.toLowerCase(),
          operator,
          operatorReference,
          completedAt: new Date().toISOString(),
          finalAmount: amount
        });

        // If payment was successful and there are milestone IDs, update their status
        if (status === 'SUCCESSFUL' && paymentData.milestoneIds?.length > 0) {
          const projectDoc = await getDoc(doc(db, 'projects', paymentData.projectId));
          if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            const updatedMilestones = projectData.milestones.map(milestone => {
              if (paymentData.milestoneIds.includes(milestone.id)) {
                return {
                  ...milestone,
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                  completedBy: paymentData.clientId,
                  paymentId: externalReference
                };
              }
              return milestone;
            });

            await updateDoc(doc(db, 'projects', paymentData.projectId), {
              milestones: updatedMilestones
            });
          }
        }

        setPaymentDetails({
          status,
          amount,
          operator,
          operatorReference,
          projectId: paymentData.projectId
        });

        if (status === 'SUCCESSFUL') {
          toast.success('Payment completed successfully!');
        } else {
          toast.error('Payment was not successful');
        }
      } catch (error) {
        console.error('Error handling payment status:', error);
        toast.error(error.message || 'Error processing payment status');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentStatus();
  }, [searchParams]);

  const handleBackToProject = () => {
    if (paymentDetails?.projectId) {
      navigate(`/projects/${paymentDetails.projectId}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Payment {paymentDetails?.status === 'SUCCESSFUL' ? 'Successful' : 'Failed'}
          </h2>
          {paymentDetails && (
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Payment Details
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {paymentDetails.status}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Intl.NumberFormat('fr-CM', {
                        style: 'currency',
                        currency: 'XAF',
                        minimumFractionDigits: 0,
                      }).format(paymentDetails.amount)}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Operator</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {paymentDetails.operator}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Reference</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {paymentDetails.operatorReference}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={handleBackToProject}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus; 
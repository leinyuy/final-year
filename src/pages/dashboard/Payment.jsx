import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed, HiOutlineShieldCheck } from 'react-icons/hi';

const Payment = () => {
  const { projectId, developerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch project details
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          setProject(projectDoc.data());
        }

        // Fetch developer details
        const developerDoc = await getDoc(doc(db, 'users', developerId));
        if (developerDoc.exists()) {
          setDeveloper(developerDoc.data());
        }
      } catch (error) {
        toast.error('Error fetching details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [projectId, developerId]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      // Here you would integrate with your payment gateway
      // For now, we'll simulate a successful payment
      await updateDoc(doc(db, 'projects', projectId), {
        status: 'in_progress',
        payment: {
          amount: Number(paymentAmount),
          status: 'completed',
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Payment processed successfully');
      navigate('/dashboard/projects');
    } catch (error) {
      toast.error('Error processing payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">Make Payment</h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete the payment to start the project
          </p>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="space-y-6">
            {/* Project Details */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">Project Details</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Title</p>
                  <p className="mt-1 text-gray-900">{project?.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Developer</p>
                  <p className="mt-1 text-gray-900">{developer?.fullName}</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Payment Amount (FCFA)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="block w-full pr-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">FCFA</span>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <HiOutlineShieldCheck className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Secure Payment</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your payment information is encrypted and secure. We never store your payment details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <HiOutlineLockClosed className="h-5 w-5 mr-2" />
                      Pay Securely
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 
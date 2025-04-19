import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const PaymentForm = ({ projectId, developerId, amount, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    provider: 'mtn', // Default to MTN
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, you would integrate with the mobile money API here
      // For now, we'll simulate a successful payment

      // Create a payment record
      const paymentRef = await addDoc(collection(db, 'payments'), {
        projectId,
        clientId: user.uid,
        developerId,
        amount: Number(amount),
        provider: formData.provider,
        phoneNumber: formData.phoneNumber,
        status: 'pending',
        type: 'milestone',
        createdAt: new Date().toISOString(),
        transactionId: `MOCK-${Date.now()}`
      });

      // Simulate payment processing
      setTimeout(async () => {
        // Update payment status to completed
        await updateDoc(doc(db, 'payments', paymentRef.id), {
          status: 'completed',
          completedAt: new Date().toISOString()
        });

        toast.success('Payment processed successfully!');
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (error) {
      toast.error('Error processing payment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Make Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Payment Provider
          </label>
          <select
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="mtn">MTN Mobile Money</option>
            <option value="orange">Orange Money</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g., 677123456"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              FCFA
            </span>
            <input
              type="text"
              value={amount}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 bg-gray-100 text-gray-500 sm:text-sm"
              disabled
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 
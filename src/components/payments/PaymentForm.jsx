import { useState } from 'react';
import { doc, updateDoc, getDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { campayService } from '../../services/campayService';
import toast from 'react-hot-toast';

const PaymentForm = ({ projectId, developerId, amount, onSuccess, isPayingAll = false, milestoneIds = [] }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('mtn');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate amount for demo environment
      if (amount < 5) {
        throw new Error('Minimum payment amount is 5 XAF');
      }
      if (amount > 100) {
        throw new Error('Demo environment only allows payments up to 100 XAF. Please contact support for production payments.');
      }

      // Validate phone number
      if (!phoneNumber || phoneNumber.length < 9) {
        throw new Error('Please enter a valid phone number');
      }

      // Get project details
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();

      // Create payment record first to get the ID
      const paymentRef = doc(collection(db, 'payments'));
      const paymentData = {
        projectId,
        developerId,
        clientId: user.uid,
        amount,
        phoneNumber,
        provider,
        status: 'pending',
        createdAt: new Date().toISOString(),
        isPayingAll,
        milestoneIds: isPayingAll ? milestoneIds : [],
        description: isPayingAll 
          ? `Payment for all pending milestones in project: ${projectData.title}`
          : `Payment for milestone in project: ${projectData.title}`,
        firstName,
        lastName,
        email
      };

      // Create payment record in Firestore
      await setDoc(paymentRef, paymentData);

      // Get payment link from Campay
      const paymentResponse = await campayService.getPaymentLink({
        amount: amount.toString(),
        description: paymentData.description,
        externalId: paymentRef.id,
        phoneNumber,
        firstName,
        lastName,
        email
      });

      if (!paymentResponse || !paymentResponse.payment_url) {
        throw new Error('Failed to get payment URL from Campay');
      }

      // Update payment record with payment URL and status
      const updateData = {
        paymentUrl: paymentResponse.payment_url,
        status: paymentResponse.status || 'pending'
      };

      // Only add reference if it exists
      if (paymentResponse.reference) {
        updateData.paymentReference = paymentResponse.reference;
      }

      await updateDoc(paymentRef, updateData);

      // Open payment URL in new window
      window.open(paymentResponse.payment_url, '_blank');

      toast.success('Payment initiated successfully. Please complete the payment in the new window.');
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
  };

  const getPhoneNumberPlaceholder = () => {
    if (provider === 'mtn') {
      return '677123456';
    } else if (provider === 'orange') {
      return '691234567';
    }
    return '';
  };

  const getPhoneNumberHelpText = () => {
    if (provider === 'mtn') {
      return 'Enter your MTN number starting with 6 (e.g., 677123456)';
    } else if (provider === 'orange') {
      return 'Enter your Orange number starting with 6 or 9 (e.g., 691234567)';
    }
    return '';
  };

  const getAmountWarning = () => {
    if (amount < 5) {
      return 'Minimum payment amount is 5 XAF';
    }
    if (amount > 100) {
      return 'Demo environment only allows payments up to 100 XAF. Please contact support for production payments.';
    }
    return null;
  };

  const isAmountValid = amount >= 5 && amount <= 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          Mobile Money Provider
        </label>
        <select
          id="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          required
        >
          <option value="mtn">MTN Mobile Money</option>
          <option value="orange">Orange Money</option>
        </select>
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">+237</span>
          </div>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className="block w-full pl-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
            placeholder={getPhoneNumberPlaceholder()}
            required
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {getPhoneNumberHelpText()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name (Optional)
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name (Optional)
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email (Optional)
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount to Pay
        </label>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
          }).format(amount)}
        </p>
        {!isAmountValid && (
          <p className="mt-2 text-sm text-red-600">
            {getAmountWarning()}
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Demo environment limits: 5 XAF - 100 XAF
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !isAmountValid}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Make Payment'}
      </button>
    </form>
  );
};

export default PaymentForm; 
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { campayService } from '../../services/campayService';
import toast from 'react-hot-toast';

const WithdrawalForm = ({ paymentId, amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('mtn');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const externalReference = uuidv4();
      const response = await campayService.withdraw({
        amount,
        phoneNumber,
        provider,
        description: description || `Withdrawal for payment ${paymentId}`,
        externalReference
      });

      toast.success('Withdrawal request submitted successfully');
      onSuccess(response);
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || 'Failed to process withdrawal request');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount to Withdraw
        </label>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
          }).format(amount)}
        </p>
      </div>

      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          Mobile Money Provider
        </label>
        <select
          id="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="mtn">MTN Mobile Money</option>
          <option value="orange">Orange Money</option>
        </select>
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={getPhoneNumberPlaceholder()}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
        <p className="mt-1 text-sm text-gray-500">{getPhoneNumberHelpText()}</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter withdrawal description"
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !phoneNumber}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Request Withdrawal'}
      </button>
    </form>
  );
};

export default WithdrawalForm; 
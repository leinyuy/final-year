import axios from 'axios';

class CampayService {
  constructor() {
    this.baseURL = 'https://demo.campay.net/api';
    this.accessToken = '39e5b285f9e7c9e105e9f836258c6d4cb46f0ed2';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Token ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  validatePhoneNumber(phoneNumber, provider) {
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Remove country code if present
    const numberWithoutCountryCode = cleanNumber.startsWith('237') ? cleanNumber.slice(3) : cleanNumber;
    
    // Validate based on provider
    if (provider === 'mtn') {
      // MTN numbers start with 6 and are 9 digits
      if (!numberWithoutCountryCode.startsWith('6') || numberWithoutCountryCode.length !== 9) {
        throw new Error('Invalid MTN number. Must start with 6 and be 9 digits long');
      }
    } else if (provider === 'orange') {
      // Orange numbers start with 6 or 9 and are 9 digits
      if ((!numberWithoutCountryCode.startsWith('6') && !numberWithoutCountryCode.startsWith('9')) || 
          numberWithoutCountryCode.length !== 9) {
        throw new Error('Invalid Orange number. Must start with 6 or 9 and be 9 digits long');
      }
    }

    // Return formatted number with country code
    return `237${numberWithoutCountryCode}`;
  }

  async initiatePayment({ amount, phoneNumber, provider, description, externalId }) {
    try {
      // Validate input parameters
      if (!amount || !phoneNumber || !provider || !description || !externalId) {
        throw new Error('Missing required payment parameters');
      }

      // Validate amount for demo environment
      const amountInXAF = parseFloat(amount);
      if (amountInXAF < 5) {
        throw new Error('Minimum payment amount is 5 XAF');
      }
      if (amountInXAF > 100) {
        throw new Error('Demo environment only allows payments up to 100 XAF');
      }

      // Format amount to match Campay's requirements (in smallest currency unit)
      const formattedAmount = Math.round(amountInXAF * 100).toString();

      // Validate and format phone number
      const formattedPhone = this.validatePhoneNumber(phoneNumber, provider);

      const response = await this.client.post('/collect/', {
        amount: formattedAmount,
        from: formattedPhone,
        description,
        external_id: externalId,
        provider
      });

      if (!response.data || !response.data.reference) {
        throw new Error('Invalid response from Campay payment initiation');
      }

      return response.data;
    } catch (error) {
      console.error('Error initiating Campay payment:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to initiate payment');
    }
  }

  async getPaymentLink({ amount, description, externalId, phoneNumber, firstName, lastName, email }) {
    try {
      // Validate amount for demo environment
      const amountInXAF = parseFloat(amount);
      if (amountInXAF < 5) {
        throw new Error('Minimum payment amount is 5 XAF');
      }
      if (amountInXAF > 100) {
        throw new Error('Demo environment only allows payments up to 100 XAF');
      }

      const response = await this.client.post('/get_payment_link/', {
        amount: amount.toString(),
        currency: 'XAF',
        from: phoneNumber ? this.validatePhoneNumber(phoneNumber, 'mtn') : undefined,
        description: description || 'Payment for milestone',
        first_name: firstName,
        last_name: lastName,
        email: email,
        external_reference: externalId || '',
        redirect_url: window.location.origin + '/payments/status',
        failure_redirect_url: window.location.origin + '/payments/failed',
        payment_options: 'MOMO',
        payer_can_pay_more: 'no'
      });

      if (!response.data || !response.data.link) {
        throw new Error('Failed to get payment link from Campay');
      }

      // Return both the payment link and reference for tracking
      return {
        payment_url: response.data.link,
        reference: response.data.reference,
        status: 'PENDING' // Initial status as per docs
      };
    } catch (error) {
      console.error('Error generating payment link:', error.response?.data || error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to generate payment link');
    }
  }

  async checkPaymentStatus(reference) {
    try {
      const response = await this.client.get(`/transaction/${reference}/`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check payment status');
    }
  }

  async getBalance() {
    try {
      const response = await this.client.get('/balance/');
      return response.data;
    } catch (error) {
      console.error('Error getting balance:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to get balance');
    }
  }

  async getPaymentHistory(startDate, endDate) {
    try {
      const response = await this.client.post('/history/', {
        start_date: startDate,
        end_date: endDate
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch payment history');
    }
  }

  async withdraw({ amount, phoneNumber, provider, description }) {
    try {
      // Validate input parameters
      if (!amount || !phoneNumber || !provider || !description) {
        throw new Error('Missing required withdrawal parameters');
      }

      // Validate amount for demo environment
      const amountInXAF = parseFloat(amount);
      if (amountInXAF < 5) {
        throw new Error('Minimum payment amount is 5 XAF');
      }
      if (amountInXAF > 100) {
        throw new Error('Demo environment only allows withdrawals up to 100 XAF');
      }

      // Format amount to match Campay's requirements (in smallest currency unit)
      const formattedAmount = Math.round(amountInXAF * 100).toString();

      // Validate and format phone number
      const formattedPhone = this.validatePhoneNumber(phoneNumber, provider);

      const response = await this.client.post('/withdraw/', {
        amount: formattedAmount,
        to: formattedPhone,
        description,
        provider
      });
      return response.data;
    } catch (error) {
      console.error('Error initiating withdrawal:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to initiate withdrawal');
    }
  }
}

export const campayService = new CampayService(); 
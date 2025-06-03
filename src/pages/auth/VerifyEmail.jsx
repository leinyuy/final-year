import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { onAuthStateChanged, reload, sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user is already verified in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().isVerified) {
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking user verification:', error);
      }

      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  const checkVerification = async () => {
    try {
      await reload(user);
      if (user.emailVerified) {
        // Update user document in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          isVerified: true
        });
        toast.success('Email verified successfully!');
        navigate('/dashboard');
      } else {
        toast.error('Email not verified yet. Please check your inbox.');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resendVerification = async () => {
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent again!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verify your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a verification email to {user.email}
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <button
              onClick={checkVerification}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              I've verified my email
            </button>
            <button
              onClick={resendVerification}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Resend verification email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 
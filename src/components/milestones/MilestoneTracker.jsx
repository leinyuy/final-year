import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import PaymentForm from '../payments/PaymentForm';
import AddMilestoneForm from './AddMilestoneForm';
import toast from 'react-hot-toast';
import { HiCheckCircle, HiOutlineCheckCircle, HiPlus, HiCurrencyDollar } from 'react-icons/hi';

const MilestoneTracker = ({ projectId, isClient }) => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [isPayingAll, setIsPayingAll] = useState(false);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          setMilestones(projectData.milestones || []);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
        toast.error('Failed to load milestones');
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  const handleMilestoneComplete = async (milestoneId) => {
    try {
      const updatedMilestones = milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return {
            ...milestone,
            status: 'completed',
            completedAt: new Date().toISOString(),
            completedBy: user.uid
          };
        }
        return milestone;
      });

      await updateDoc(doc(db, 'projects', projectId), {
        milestones: updatedMilestones
      });

      setMilestones(updatedMilestones);
      toast.success('Milestone marked as completed');
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  const handleMilestonePayment = (milestone) => {
    setSelectedMilestone(milestone);
    setIsPayingAll(false);
    setShowPaymentForm(true);
  };

  const handlePayAll = () => {
    const pendingMilestones = milestones.filter(m => m.status === 'pending');
    if (pendingMilestones.length === 0) {
      toast.error('No pending milestones to pay');
      return;
    }

    const totalAmount = pendingMilestones.reduce((sum, m) => sum + m.amount, 0);
    setSelectedMilestone({
      title: 'All Pending Milestones',
      amount: totalAmount,
      isAllMilestones: true,
      milestoneIds: pendingMilestones.map(m => m.id)
    });
    setIsPayingAll(true);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedMilestone(null);
    setIsPayingAll(false);
    toast.success('Payment processed successfully');
  };

  const handleAddMilestoneSuccess = () => {
    setShowAddMilestone(false);
    // Refresh milestones
    const fetchMilestones = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          setMilestones(projectData.milestones || []);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };
    fetchMilestones();
  };

  const pendingMilestones = milestones.filter(m => m.status === 'pending');
  const totalPendingAmount = pendingMilestones.reduce((sum, m) => sum + m.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Project Milestones</h3>
          <p className="mt-1 text-sm text-gray-500">Track and manage project milestones</p>
        </div>
        <div className="flex items-center space-x-4">
          {isClient && pendingMilestones.length > 0 && (
            <button
              onClick={handlePayAll}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <HiCurrencyDollar className="h-5 w-5 mr-2" />
              Pay All ({new Intl.NumberFormat('fr-CM', {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 0,
              }).format(totalPendingAmount)})
            </button>
          )}
          {isClient && (
            <button
              onClick={() => setShowAddMilestone(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <HiPlus className="h-5 w-5 mr-2" />
              Add Milestone
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {milestones.map((milestone) => (
            <li key={milestone.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {milestone.status === 'completed' ? (
                      <HiCheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <HiOutlineCheckCircle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                    <p className="text-sm text-gray-500">{milestone.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Amount: {new Intl.NumberFormat('fr-CM', {
                        style: 'currency',
                        currency: 'XAF',
                        minimumFractionDigits: 0,
                      }).format(milestone.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {milestone.status === 'completed' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  ) : isClient ? (
                    <button
                      onClick={() => handleMilestonePayment(milestone)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Make Payment
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMilestoneComplete(milestone.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showPaymentForm && selectedMilestone && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isPayingAll ? 'Pay All Pending Milestones' : `Make Payment for ${selectedMilestone.title}`}
            </h3>
            <PaymentForm
              projectId={projectId}
              developerId={user.uid}
              amount={selectedMilestone.amount}
              onSuccess={handlePaymentSuccess}
              isPayingAll={isPayingAll}
              milestoneIds={selectedMilestone.milestoneIds}
            />
            <button
              onClick={() => setShowPaymentForm(false)}
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showAddMilestone && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Milestone</h3>
            <AddMilestoneForm
              projectId={projectId}
              onSuccess={handleAddMilestoneSuccess}
            />
            <button
              onClick={() => setShowAddMilestone(false)}
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

export default MilestoneTracker; 
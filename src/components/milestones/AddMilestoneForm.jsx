import { useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const AddMilestoneForm = ({ projectId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.amount || !formData.dueDate) {
        throw new Error('Please fill in all fields');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Please enter a valid due date');
      }

      // Get current project data
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();
      const currentMilestones = projectData.milestones || [];

      // Create new milestone
      const newMilestone = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        amount: amount,
        dueDate: dueDate.toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Update project with new milestone
      await updateDoc(doc(db, 'projects', projectId), {
        milestones: [...currentMilestones, newMilestone],
      });

      toast.success('Milestone added successfully');
      onSuccess();
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast.error(error.message || 'Failed to add milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          placeholder="Enter milestone title"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          placeholder="Enter milestone description"
          required
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount (XAF)
        </label>
        <input
          type="number"
          name="amount"
          id="amount"
          value={formData.amount}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          placeholder="Enter milestone amount"
          min="7"
          step="1"
          required
        />
        <p className="mt-2 text-sm text-gray-500">
          Minimum amount: 7 XAF
        </p>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          name="dueDate"
          id="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add Milestone'}
      </button>
    </form>
  );
};

export default AddMilestoneForm; 
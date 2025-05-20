import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const CreateProjectForm = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budgetMin: '',
    budgetMax: '',
    duration: '',
    durationUnit: 'days',
    skills: '',
    category: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        clientId: user.uid,
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.split(',').map(req => req.trim()),
        budget: {
          min: Number(formData.budgetMin),
          max: Number(formData.budgetMax),
          type: 'fixed'
        },
        duration: {
          timeframe: Number(formData.duration),
          unit: formData.durationUnit
        },
        skills: formData.skills.split(',').map(skill => skill.trim()),
        category: formData.category,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: 'public'
      };

      await addDoc(collection(db, 'projects'), projectData);
      toast.success('Project created successfully!');
      onClose();
      navigate('/dashboard/projects');
    } catch (error) {
      toast.error('Error creating project');
    }
  };

  return (
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 text-gray-600 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block text-gray-600 bg-white w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Requirements (comma-separated)</label>
          <textarea
            name="requirements"
            rows={3}
            value={formData.requirements}
            onChange={handleChange}
            className="mt-1 block text-gray-600 bg-white w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., React experience, API integration, Mobile responsive"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Budget (FCFA)</label>
            <input
              type="number"
              name="budgetMin"
              required
              value={formData.budgetMin}
              onChange={handleChange}
              className="mt-1 block text-gray-600 bg-white w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Budget (FCFA)</label>
            <input
              type="number"
              name="budgetMax"
              required
              value={formData.budgetMax}
              onChange={handleChange}
              className="mt-1 block text-gray-600 bg-white w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <input
              type="number"
              name="duration"
              required
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block text-gray-600 bg-white w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration Unit</label>
            <select
              name="durationUnit"
              value={formData.durationUnit}
              onChange={handleChange}
              className="mt-1 block text-gray-600 bg-white w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Required Skills (comma-separated)</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="mt-1 block text-gray-600 bg-white w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., React, Node.js, MongoDB"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block text-gray-600 bg-white w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            <option value="web">Web Development</option>
            <option value="mobile">Mobile Development</option>
            <option value="desktop">Desktop Development</option>
            <option value="design">UI/UX Design</option>
            <option value="database">Database</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectForm; 
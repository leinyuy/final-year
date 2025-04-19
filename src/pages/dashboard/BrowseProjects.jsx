import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Link } from 'react-router-dom';
import { HiSearch, HiFilter } from 'react-icons/hi';

const BrowseProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minBudget: '',
    maxBudget: '',
    duration: '',
    skills: []
  });
  const [applicationForm, setApplicationForm] = useState({
    proposal: '',
    bidAmount: '',
    estimatedDuration: '',
    durationUnit: 'days'
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(
          collection(db, 'projects'),
          where('status', '==', 'active'),
          where('visibility', '==', 'public')
        );
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsData);
      } catch (error) {
        toast.error('Error fetching projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBudget = (!filters.minBudget || project.budget.min >= Number(filters.minBudget)) &&
                         (!filters.maxBudget || project.budget.max <= Number(filters.maxBudget));
    
    const matchesDuration = !filters.duration || 
                          project.duration.timeframe <= Number(filters.duration);
    
    const matchesSkills = filters.skills.length === 0 ||
                         filters.skills.every(skill => project.skills.includes(skill));
    
    return matchesSearch && matchesBudget && matchesDuration && matchesSkills;
  });

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const application = {
        projectId: selectedProject.id,
        developerId: user.uid,
        proposal: applicationForm.proposal,
        bidAmount: Number(applicationForm.bidAmount),
        estimatedDuration: {
          timeframe: Number(applicationForm.estimatedDuration),
          unit: applicationForm.durationUnit
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'applications'), application);
      toast.success('Application submitted successfully');
      setIsApplyModalOpen(false);
      setApplicationForm({
        proposal: '',
        bidAmount: '',
        estimatedDuration: '',
        durationUnit: 'days'
      });
    } catch (error) {
      toast.error('Error submitting application');
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Browse Projects</h1>
        <Link
          to="/dashboard/my-applications"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View My Applications
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {/* Implement filter modal */}}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <HiFilter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-medium text-gray-900">{project.title}</h2>
                  <p className="mt-2 text-gray-600 line-clamp-3">{project.description}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Budget:</span>
                  <span className="ml-2 text-gray-900">
                    {project.budget.min} - {project.budget.max} FCFA
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Duration:</span>
                  <span className="ml-2 text-gray-900">
                    {project.duration.timeframe} {project.duration.unit}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-medium text-gray-500">Required Skills:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setIsApplyModalOpen(true);
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Project"
      >
        <form onSubmit={handleApply} className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Proposal
            </label>
            <textarea
              name="proposal"
              rows={4}
              required
              value={applicationForm.proposal}
              onChange={(e) => setApplicationForm(prev => ({
                ...prev,
                proposal: e.target.value
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe why you're the best fit for this project..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bid Amount (FCFA)
            </label>
            <input
              type="number"
              required
              value={applicationForm.bidAmount}
              onChange={(e) => setApplicationForm(prev => ({
                ...prev,
                bidAmount: e.target.value
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estimated Duration
              </label>
              <input
                type="number"
                required
                value={applicationForm.estimatedDuration}
                onChange={(e) => setApplicationForm(prev => ({
                  ...prev,
                  estimatedDuration: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration Unit
              </label>
              <select
                value={applicationForm.durationUnit}
                onChange={(e) => setApplicationForm(prev => ({
                  ...prev,
                  durationUnit: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BrowseProjects; 
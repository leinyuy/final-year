import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlineExternalLink, HiOutlinePencil } from 'react-icons/hi';
import Modal from '../../components/common/Modal';

const Portfolio = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    link: '',
    technologies: [],
    imageUrl: '',
    startDate: '',
    endDate: '',
    isOngoing: false
  });
  const [newTechnology, setNewTechnology] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'developerProfiles', user.uid));
        if (profileDoc.exists()) {
          setPortfolio(profileDoc.data().portfolio || []);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        toast.error('Error loading portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [user]);

  const handleAddTechnology = () => {
    if (newTechnology && !newItem.technologies.includes(newTechnology)) {
      setNewItem(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology]
      }));
      setNewTechnology('');
    }
  };

  const handleRemoveTechnology = (tech) => {
    setNewItem(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.link) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedPortfolio = [...portfolio, { ...newItem, id: Date.now().toString() }];
      await setDoc(doc(db, 'developerProfiles', user.uid), {
        portfolio: updatedPortfolio
      }, { merge: true });
      
      setPortfolio(updatedPortfolio);
      setIsAddModalOpen(false);
      setNewItem({
        title: '',
        description: '',
        link: '',
        technologies: [],
        imageUrl: '',
        startDate: '',
        endDate: '',
        isOngoing: false
      });
      toast.success('Portfolio item added successfully');
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      toast.error('Error adding portfolio item');
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem.title || !selectedItem.description || !selectedItem.link) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedPortfolio = portfolio.map(item =>
        item.id === selectedItem.id ? selectedItem : item
      );
      await setDoc(doc(db, 'developerProfiles', user.uid), {
        portfolio: updatedPortfolio
      }, { merge: true });
      
      setPortfolio(updatedPortfolio);
      setIsEditModalOpen(false);
      setSelectedItem(null);
      toast.success('Portfolio item updated successfully');
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast.error('Error updating portfolio item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const updatedPortfolio = portfolio.filter(item => item.id !== itemId);
      await setDoc(doc(db, 'developerProfiles', user.uid), {
        portfolio: updatedPortfolio
      }, { merge: true });
      
      setPortfolio(updatedPortfolio);
      toast.success('Portfolio item deleted successfully');
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast.error('Error deleting portfolio item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Portfolio</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <HiOutlinePlus className="h-5 w-5 mr-2" />
          Add Project
        </button>
      </div>

      {portfolio.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolio items</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first project to your portfolio.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <HiOutlinePlus className="h-5 w-5 mr-2" />
              Add Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              {item.imageUrl && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="object-cover w-full h-48"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsEditModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <HiOutlinePencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <HiOutlineX className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-3">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {item.startDate && (
                    <p>
                      {new Date(item.startDate).toLocaleDateString()} - 
                      {item.isOngoing ? 'Present' : new Date(item.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View Project
                    <HiOutlineExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Project to Portfolio"
      >
        <div className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Title</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Project URL</label>
            <input
              type="url"
              value={newItem.link}
              onChange={(e) => setNewItem(prev => ({ ...prev, link: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTechnology();
                  }
                }}
                className="block w-full rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Add a technology"
              />
              <button
                type="button"
                onClick={handleAddTechnology}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <HiOutlinePlus className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {newItem.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnology(tech)}
                    className="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                  >
                    <HiOutlineX className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Project Image URL</label>
            <input
              type="url"
              value={newItem.imageUrl}
              onChange={(e) => setNewItem(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={newItem.startDate}
                onChange={(e) => setNewItem(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={newItem.endDate}
                onChange={(e) => setNewItem(prev => ({ ...prev, endDate: e.target.value }))}
                disabled={newItem.isOngoing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOngoing"
              checked={newItem.isOngoing}
              onChange={(e) => setNewItem(prev => ({ ...prev, isOngoing: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isOngoing" className="ml-2 block text-sm text-gray-900">
              This is an ongoing project
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Add Project
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
      >
        {selectedItem && (
          <div className="space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Title</label>
              <input
                type="text"
                value={selectedItem.title}
                onChange={(e) => setSelectedItem(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={selectedItem.description}
                onChange={(e) => setSelectedItem(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Project URL</label>
              <input
                type="url"
                value={selectedItem.link}
                onChange={(e) => setSelectedItem(prev => ({ ...prev, link: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechnology();
                    }
                  }}
                  className="block w-full rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add a technology"
                />
                <button
                  type="button"
                  onClick={handleAddTechnology}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <HiOutlinePlus className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedItem.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnology(tech)}
                      className="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                    >
                      <HiOutlineX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Project Image URL</label>
              <input
                type="url"
                value={selectedItem.imageUrl}
                onChange={(e) => setSelectedItem(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={selectedItem.startDate}
                  onChange={(e) => setSelectedItem(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={selectedItem.endDate}
                  onChange={(e) => setSelectedItem(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={selectedItem.isOngoing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOngoingEdit"
                checked={selectedItem.isOngoing}
                onChange={(e) => setSelectedItem(prev => ({ ...prev, isOngoing: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isOngoingEdit" className="ml-2 block text-sm text-gray-900">
                This is an ongoing project
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditItem}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Portfolio; 
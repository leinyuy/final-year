import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import CreateProjectForm from '../../components/projects/CreateProjectForm';
import { Link } from 'react-router-dom';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(
          collection(db, 'projects'),
          where('clientId', '==', user.uid)
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

    if (user) {
      fetchProjects();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Project
        </button>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <CreateProjectForm onClose={() => setIsCreateModalOpen(false)} />
      </Modal>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {projects.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No projects found. Create your first project!
            </li>
          ) : (
            projects.map((project) => (
              <li key={project.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link 
                      to={`/dashboard/projects/${project.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {project.title}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      {project.description}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {project.status}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        Budget: {project.budget.min} - {project.budget.max} FCFA
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/dashboard/projects/${project.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Projects; 
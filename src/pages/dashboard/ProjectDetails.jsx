import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineUser } from 'react-icons/hi';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          setProject(projectData);

          // Fetch client details
          const clientDoc = await getDoc(doc(db, 'users', projectData.clientId));
          if (clientDoc.exists()) {
            setClient(clientDoc.data());
          }

          // Fetch applications if user is the client
          if (user?.uid === projectData.clientId) {
            const q = query(
              collection(db, 'applications'),
              where('projectId', '==', projectId)
            );
            const querySnapshot = await getDocs(q);
            const applicationsData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setApplications(applicationsData);
          }
        }
      } catch (error) {
        toast.error('Error fetching project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Project not found</h2>
        <p className="mt-2 text-gray-600">The project you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/dashboard/browse-projects"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Browse Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <HiOutlineUser className="h-5 w-5 mr-1" />
                <span>Posted by {client?.fullName || 'Client'}</span>
                <span className="mx-2">•</span>
                <HiOutlineCalendar className="h-5 w-5 mr-1" />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Project Details</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-900">{project.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Requirements</h3>
                  <ul className="mt-1 list-disc list-inside text-gray-900">
                    {project.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900">Project Information</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <HiOutlineCurrencyDollar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Budget Range</p>
                    <p className="text-gray-900">{project.budget.min} - {project.budget.max} FCFA</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <HiOutlineClock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-gray-900">{project.duration.timeframe} {project.duration.unit}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Required Skills</p>
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
              </div>
            </div>
          </div>
        </div>

        {user?.uid === project.clientId ? (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Applications ({applications.length})</h2>
              <Link
                to={`/dashboard/projects/${projectId}/applications`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View All Applications
              </Link>
            </div>
            {applications.length > 0 ? (
              <div className="mt-4 space-y-4">
                {applications.slice(0, 3).map((application) => (
                  <div key={application.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Developer Application</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Bid: {application.bidAmount} FCFA • Duration: {application.estimatedDuration.timeframe} {application.estimatedDuration.unit}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : application.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">No applications yet</p>
            )}
          </div>
        ) : (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex justify-end">
              <Link
                to={`/dashboard/browse-projects/${projectId}/apply`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Apply for Project
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails; 
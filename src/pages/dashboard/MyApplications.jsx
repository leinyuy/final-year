import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Fetch all applications by the developer
        const q = query(
          collection(db, 'applications'),
          where('developerId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const applicationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(applicationsData);

        // Fetch project details for each application
        const projectIds = [...new Set(applicationsData.map(app => app.projectId))];
        const projectsData = {};
        
        for (const projectId of projectIds) {
          const projectDoc = await getDocs(query(collection(db, 'projects'), where('id', '==', projectId)));
          if (!projectDoc.empty) {
            projectsData[projectId] = projectDoc.docs[0].data();
          }
        }
        
        setProjects(projectsData);
      } catch (error) {
        toast.error('Error fetching applications');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Applications</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {applications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>You haven't applied to any projects yet.</p>
            <Link 
              to="/dashboard/browse-projects" 
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => (
              <li key={application.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900">
                      {projects[application.projectId]?.title || 'Project'}
                    </h2>
                    <div className="mt-2 flex items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                        {application.status}
                      </span>
                      <span className="ml-4 text-sm text-gray-500">
                        Applied on {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Your Bid</p>
                        <p className="mt-1 text-sm text-gray-900">{application.bidAmount} FCFA</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estimated Duration</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {application.estimatedDuration.timeframe} {application.estimatedDuration.unit}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Your Proposal</p>
                      <p className="mt-1 text-sm text-gray-900">{application.proposal}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3 lg:w-48">
                    <Link
                      to={`/dashboard/browse-projects/${application.projectId}`}
                      className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Project
                    </Link>
                    {application.status === 'accepted' && (
                      <Link
                        to={`/dashboard/messages/${projects[application.projectId]?.clientId}`}
                        className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Message Client
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyApplications; 
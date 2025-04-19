import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ProjectApplications = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState({});

  useEffect(() => {
    const fetchApplications = async () => {
      try {
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

        // Fetch developer details for each application
        const developerIds = [...new Set(applicationsData.map(app => app.developerId))];
        const developersData = {};
        
        for (const devId of developerIds) {
          const devDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', devId)));
          if (!devDoc.empty) {
            developersData[devId] = devDoc.docs[0].data();
          }
        }
        
        setDevelopers(developersData);
      } catch (error) {
        toast.error('Error fetching applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [projectId]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      // Create notification for the developer
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        await addDoc(collection(db, 'notifications'), {
          userId: application.developerId,
          type: 'application_update',
          title: `Application ${newStatus}`,
          message: `Your application for the project has been ${newStatus}.`,
          read: false,
          timestamp: serverTimestamp(),
          link: `/dashboard/my-applications`
        });
      }

      toast.success(`Application ${newStatus} successfully`);
    } catch (error) {
      toast.error('Error updating application status');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Project Applications</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {applications.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No applications yet</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => (
              <li key={application.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h2 className="text-lg font-medium text-gray-900">
                        {developers[application.developerId]?.fullName || 'Developer'}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Bid: {application.bidAmount} FCFA | Duration: {application.estimatedDuration.timeframe} {application.estimatedDuration.unit}
                      </p>
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-900">Proposal</h3>
                        <p className="mt-2 text-sm text-gray-600">{application.proposal}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col lg:items-end space-y-4 lg:w-48">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : application.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    } self-start sm:self-center`}>
                      {application.status}
                    </span>
                    {application.status === 'pending' && (
                      <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'accepted')}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 w-full"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 w-full"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {application.status === 'accepted' && (
                      <Link
                        to={`/dashboard/payment/${projectId}/${application.developerId}`}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 w-full text-center"
                      >
                        Make Payment
                      </Link>
                    )}
                    <Link
                      to={`/dashboard/messages/${application.developerId}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 text-center block w-full"
                    >
                      Message Developer
                    </Link>
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

export default ProjectApplications; 
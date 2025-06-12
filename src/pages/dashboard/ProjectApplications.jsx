import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const ProjectApplications = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState({});
  const [project, setProject] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project details
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          setProject(projectDoc.data());
        }

        // Fetch applications
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

        // Fetch developer details
        const developerIds = [...new Set(applicationsData.map(app => app.developerId))];
        const developersData = {};
        
        for (const devId of developerIds) {
          const devDoc = await getDoc(doc(db, 'users', devId));
          if (devDoc.exists()) {
            developersData[devId] = devDoc.data();
          }
        }
        
        setDevelopers(developersData);
      } catch (error) {
        toast.error('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleAcceptApplication = async (application) => {
    setSelectedApplication(application);
    setIsConfirmModalOpen(true);
  };

  const confirmAcceptApplication = async () => {
    try {
      // Update application status
      await updateDoc(doc(db, 'applications', selectedApplication.id), {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });

      // Update project status and assign developer
      await updateDoc(doc(db, 'projects', projectId), {
        status: 'in-progress',
        assignedDeveloper: selectedApplication.developerId,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Reject all other applications
      const otherApplications = applications.filter(app => app.id !== selectedApplication.id);
      for (const app of otherApplications) {
        await updateDoc(doc(db, 'applications', app.id), {
          status: 'rejected',
          updatedAt: new Date().toISOString()
        });
      }

      // Create notifications
      await addDoc(collection(db, 'notifications'), {
        userId: selectedApplication.developerId,
        type: 'application_accepted',
        title: 'Application Accepted',
        message: `Your application for "${project?.title}" has been accepted.`,
        read: false,
        timestamp: serverTimestamp(),
        link: `/dashboard/projects/${projectId}`
      });

      // Notify other developers
      for (const app of otherApplications) {
        await addDoc(collection(db, 'notifications'), {
          userId: app.developerId,
          type: 'application_rejected',
          title: 'Application Status Update',
          message: `Your application for "${project?.title}" was not selected.`,
          read: false,
          timestamp: serverTimestamp(),
          link: `/dashboard/my-applications`
        });
      }

      toast.success('Developer assigned successfully');
      setIsConfirmModalOpen(false);
      navigate(`/dashboard/projects/${projectId}`);
    } catch (error) {
      toast.error('Error updating application status');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: 'rejected' } : app
        )
      );

      // Create notification
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        await addDoc(collection(db, 'notifications'), {
          userId: application.developerId,
          type: 'application_rejected',
          title: 'Application Rejected',
          message: `Your application for "${project?.title}" has been rejected.`,
          read: false,
          timestamp: serverTimestamp(),
          link: `/dashboard/my-applications`
        });
      }

      toast.success('Application rejected');
    } catch (error) {
      toast.error('Error updating application status');
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
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Project Applications</h1>
      
      {/* Project Status Warning */}
      {project?.status !== 'active' && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This project is no longer accepting new applications.
              </p>
            </div>
          </div>
        </div>
      )}

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
                    {application.status === 'pending' && project?.status === 'active' && (
                      <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                        <button
                          onClick={() => handleAcceptApplication(application)}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 w-full"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectApplication(application.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 w-full"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Developer Assignment"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to assign this developer to your project? This action will:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li>Accept this developer's application</li>
            <li>Reject all other applications</li>
            <li>Update the project status to "In Progress"</li>
            <li>Notify all applicants about the decision</li>
          </ul>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmAcceptApplication}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectApplications; 
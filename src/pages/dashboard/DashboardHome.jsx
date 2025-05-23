import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineChat, HiOutlineClock, HiOutlineCurrencyDollar } from 'react-icons/hi';

const DashboardHome = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalApplications: 0,
    unreadMessages: 0,
    recentProjects: [],
    recentApplications: [],
    totalSpent: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            setUserRole(userData.role);

            if (userData.role === 'client') {
              // Fetch client stats
              const projectsQuery = query(
                collection(db, 'projects'),
                where('clientId', '==', user.uid),
                where('status', '==', 'active'),
                limit(5)
              );
              const projectsSnapshot = await getDocs(projectsQuery);
              
              // Fetch total spent from payments collection
              const paymentsQuery = query(
                collection(db, 'payments'),
                where('clientId', '==', user.uid),
                where('status', '==', 'completed')
              );
              const paymentsSnapshot = await getDocs(paymentsQuery);
              const totalSpent = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

              setStats(prev => ({
                ...prev,
                activeProjects: projectsSnapshot.size,
                recentProjects: projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                totalSpent
              }));
            } else {
              // Fetch developer stats
              const applicationsQuery = query(
                collection(db, 'applications'),
                where('developerId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(5)
              );
              const applicationsSnapshot = await getDocs(applicationsQuery);
              
              // Fetch total earnings from payments collection
              const paymentsQuery = query(
                collection(db, 'payments'),
                where('developerId', '==', user.uid),
                where('status', '==', 'completed')
              );
              const paymentsSnapshot = await getDocs(paymentsQuery);
              const totalEarnings = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

              setStats(prev => ({
                ...prev,
                totalApplications: applicationsSnapshot.size,
                recentApplications: applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                totalEarnings
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {userRole === 'client' ? (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HiOutlineBriefcase className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Projects
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.activeProjects}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/dashboard/projects" className="font-medium text-indigo-600 hover:text-indigo-500">
                    View all projects
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HiOutlineCurrencyDollar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Spent
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.totalSpent.toLocaleString()} FCFA
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/dashboard/payments" className="font-medium text-indigo-600 hover:text-indigo-500">
                    View payment history
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HiOutlineBriefcase className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Applications
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.totalApplications}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/dashboard/my-applications" className="font-medium text-indigo-600 hover:text-indigo-500">
                    View applications
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HiOutlineCurrencyDollar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Earnings
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.totalEarnings.toLocaleString()} FCFA
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/dashboard/payments" className="font-medium text-indigo-600 hover:text-indigo-500">
                    View earnings
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HiOutlineChat className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Unread Messages
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.unreadMessages}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/messages" className="font-medium text-indigo-600 hover:text-indigo-500">
                View messages
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {userRole === 'client' ? (
              stats.recentProjects.map((project) => (
                <li key={project.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-indigo-600 truncate">
                      {project.title}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <HiOutlineClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        Posted {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Link
                        to={`/dashboard/projects/${project.id}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              stats.recentApplications.map((application) => (
                <li key={application.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-indigo-600 truncate">
                      {application.projectTitle}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : application.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <HiOutlineClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Link
                        to={`/dashboard/my-applications/${application.id}`}
                        className="text-indigo-600 hover:text-indigo-500"
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

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {userRole === 'client' ? (
              <>
                <Link
                  to="/dashboard/projects/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create New Project
                </Link>
                <Link
                  to="/dashboard/developers"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Find Developers
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard/browse-projects"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Browse Projects
                </Link>
                <Link
                  to="/dashboard/portfolio"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update Portfolio
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineChat, HiOutlineClock } from 'react-icons/hi';

const DashboardHome = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalDevelopers: 0,
    activeApplications: 0,
    pendingReviews: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);

            if (userData.role === 'client') {
              // Fetch active projects for client
              const projectsQuery = query(
                collection(db, 'projects'),
                where('clientId', '==', user.uid),
                where('status', 'in', ['active', 'in-progress', 'review', 'accepted'])
              );
              const projectsSnapshot = await getDocs(projectsQuery);
              const activeProjects = projectsSnapshot.size;

              // Fetch total developers
              const developersQuery = query(
                collection(db, 'users'),
                where('role', '==', 'developer')
              );
              const developersSnapshot = await getDocs(developersQuery);
              const totalDevelopers = developersSnapshot.size;

              setStats({
                activeProjects,
                totalDevelopers,
                activeApplications: 0,
                pendingReviews: 0,
                unreadMessages: 0
              });
            } else {
              // Fetch active applications for developer
              const applicationsQuery = query(
                collection(db, 'applications'),
                where('developerId', '==', user.uid),
                where('status', '==', 'pending')
              );
              const applicationsSnapshot = await getDocs(applicationsQuery);
              const activeApplications = applicationsSnapshot.size;

              // Fetch projects that need review
              const projectsQuery = query(
                collection(db, 'projects'),
                where('assignedDeveloper', '==', user.uid),
                where('status', '==', 'review')
              );
              const projectsSnapshot = await getDocs(projectsQuery);
              const pendingReviews = projectsSnapshot.size;

              setStats({
                activeProjects: 0,
                totalDevelopers: 0,
                activeApplications,
                pendingReviews,
                unreadMessages: 0
              });
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
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
                    <HiOutlineBriefcase className="h-6 w-6 text-indigo-600" />
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
                    <HiOutlineUserGroup className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Available Developers
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.totalDevelopers}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/dashboard/developers" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Find developers
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
                    <HiOutlineBriefcase className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Applications
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.activeApplications}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/dashboard/applications" className="font-medium text-indigo-600 hover:text-indigo-500">
                    View applications
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HiOutlineClock className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Reviews
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.pendingReviews}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/dashboard/projects" className="font-medium text-indigo-600 hover:text-indigo-500">
                    View projects
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
                <HiOutlineChat className="h-6 w-6 text-indigo-600" />
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
    </div>
  );
};

export default DashboardHome; 
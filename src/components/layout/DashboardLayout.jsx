import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { logout } from '../../store/slices/authSlice';
import { HiMenu, HiX, HiHome, HiUser, HiBriefcase, HiChat, HiBell, HiSearch, HiOutlineUserGroup, HiOutlineCode } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import NotificationBell from '../notifications/NotificationBell';
import { toast } from 'react-hot-toast';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role);
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      setUserRole(null);
      setUserData(null);
      setSidebarOpen(false);
      await signOut(auth);
      dispatch(logout());
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out. Please try again.');
    }
  };

  const clientNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HiHome },
    { name: 'My Projects', href: '/dashboard/projects', icon: HiBriefcase },
    { name: 'Find Developers', href: '/dashboard/developers', icon: HiOutlineUserGroup },
    { name: 'Messages', href: '/dashboard/messages', icon: HiChat },
    { name: 'Profile', href: '/dashboard/profile', icon: HiUser },
  ];

  const developerNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HiHome },
    { name: 'Browse Projects', href: '/dashboard/browse-projects', icon: HiSearch },
    { name: 'My Applications', href: '/dashboard/my-applications', icon: HiBriefcase },
    { name: 'My Portfolio', href: '/dashboard/portfolio', icon: HiOutlineCode },
    { name: 'Messages', href: '/dashboard/messages', icon: HiChat },
    { name: 'Profile', href: '/dashboard/profile', icon: HiUser },
  ];

  const navigation = userRole === 'client' ? clientNavigation : developerNavigation;

  return (
    <div className="min-h-screen min-w-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              FreelanceCM
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <HiX className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-base rounded-md`}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:shadow-xl">
        <div className="flex items-center h-16 px-4 border-b">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            FreelanceCM
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                location.pathname === item.href
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              } group flex items-center px-2 py-2 text-sm rounded-md`}
            >
              <item.icon className="mr-3 h-6 w-6" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <HiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.photoURL || 'https://via.placeholder.com/32'}
                  alt=""
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Role-specific welcome message */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Welcome back, {user?.displayName || 'User'}!
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      {userRole === 'client' 
                        ? 'Manage your projects and find talented developers.'
                        : 'Browse projects and showcase your skills.'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      userRole === 'client' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {userRole === 'client' ? 'Client' : 'Developer'}
                    </span>
                  </div>
                </div>
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import ProjectCard from '../components/projects/ProjectCard';
import { HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineDocumentText, HiOutlineChat, HiOutlineCurrencyDollar } from 'react-icons/hi';
import heroImage from '../assets/hero-image.jpg';

const Home = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(
          collection(db, 'projects'),
          where('status', '==', 'active'),
          where('visibility', '==', 'public'),
          limit(6)
        );
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen min-w-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                FreelanceCM
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <img src={heroImage} alt="Hero Image" className="w-full h-full object-cover absolute inset-0 z-0" />
        <div className="text-left relative z-10 ">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Connect with Top</span>
            <span className="block text-indigo-600">Cameroonian Developers</span>
          </h1>
          <p className="mt-3 max-w-md text-base text-white sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Find the perfect developer for your project or get hired for your skills. 
            A platform built for Cameroonian freelancers and businesses.
          </p>
          <div className="mt-5 max-w-md sm:flex sm:justify-start md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-800 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Simple steps to get started with FreelanceCM
            </p>
          </div>

          <div className="mt-12">
            <div className="relative">
              {/* Progress Line */}
              {/* <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div> */}
              
              {/* Steps */}
              <div className="relative flex justify-between">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full mt-3">
                    <HiOutlineDocumentText className="w-6 h-6 text-white" />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900">Post a Project</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Describe your project and set your budget
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full mt-3">
                    <HiOutlineChat className="w-6 h-6 text-white" />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900">Review Proposals</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Evaluate developer proposals and chat with candidates
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full mt-3">
                    <HiOutlineCheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900">Hire & Collaborate</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Select the best developer and start working together
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full mt-3">
                    <HiOutlineCurrencyDollar className="w-6 h-6 text-white" />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900">Pay Securely</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Release payments through our secure escrow system
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Projects Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Projects
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Browse through some of our latest projects
            </p>
          </div>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View All Projects
              <HiOutlineArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
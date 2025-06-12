import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineStar, HiOutlineBriefcase, HiOutlineClock } from 'react-icons/hi';

const FindDevelopers = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    minRating: 0,
    availability: 'all',
    hourlyRate: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        // Get all users with developer role
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'developer')
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        // Get developer profiles
        const developersData = await Promise.all(
          usersSnapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            const profileQuery = query(
              collection(db, 'developerProfiles'),
              where('uid', '==', userDoc.id)
            );
            const profileSnapshot = await getDocs(profileQuery);
            const profileData = profileSnapshot.docs[0]?.data() || {};
            
            return {
              id: userDoc.id,
              ...userData,
              ...profileData
            };
          })
        );

        setDevelopers(developersData);
      } catch (error) {
        console.error('Error fetching developers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  const filteredDevelopers = developers.filter(developer => {
    const matchesSearch = developer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         developer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSkills = filters.skills.length === 0 ||
                         filters.skills.every(skill => developer.skills?.includes(skill));
    
    const matchesRating = developer.rating >= filters.minRating;
    
    const matchesAvailability = filters.availability === 'all' ||
                               developer.availability === filters.availability;
    
    const matchesRate = filters.hourlyRate === 'all' ||
                       (filters.hourlyRate === 'low' && developer.hourlyRate <= 5000) ||
                       (filters.hourlyRate === 'medium' && developer.hourlyRate > 5000 && developer.hourlyRate <= 15000) ||
                       (filters.hourlyRate === 'high' && developer.hourlyRate > 15000);

    return matchesSearch && matchesSkills && matchesRating && matchesAvailability && matchesRate;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Find Developers</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <HiOutlineFilter className="h-5 w-5 mr-2 text-gray-700" />
          Filters
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md text-gray-900"
            placeholder="Search by name or skills..."
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Skills</label>
              <select
                multiple
                value={filters.skills}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  skills: Array.from(e.target.selectedOptions, option => option.value)
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="react">React</option>
                <option value="node">Node.js</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="csharp">C#</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Minimum Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minRating: Number(e.target.value)
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900"
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  availability: e.target.value
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900"
              >
                <option value="all">All</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Hourly Rate</label>
              <select
                value={filters.hourlyRate}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  hourlyRate: e.target.value
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900"
              >
                <option value="all">All Rates</option>
                <option value="low">Under 5,000 FCFA</option>
                <option value="medium">5,000 - 15,000 FCFA</option>
                <option value="high">Over 15,000 FCFA</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Developers Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDevelopers.map((developer) => (
          <div key={developer.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={developer.avatar || `https://ui-avatars.com/api/?name=${developer.fullName}&background=random`}
                    alt={developer.fullName}
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {developer.fullName}
                  </h3>
                  <div className="flex items-center mt-1">
                    <HiOutlineStar className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-700">
                      {developer.rating?.toFixed(1) || 'New'} ({developer.totalProjects || 0} projects)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {developer.skills?.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {developer.skills?.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{developer.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-700">
                  <HiOutlineBriefcase className="h-5 w-5 mr-2 text-gray-500" />
                  {developer.experience?.length || 0} years experience
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <HiOutlineClock className="h-5 w-5 mr-2 text-gray-500" />
                  {developer.availability || 'Not specified'}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {developer.hourlyRate?.toLocaleString()} FCFA/hour
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to={`/dashboard/developers/${developer.id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDevelopers.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No developers found</h3>
          <p className="mt-1 text-sm text-gray-700">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default FindDevelopers; 
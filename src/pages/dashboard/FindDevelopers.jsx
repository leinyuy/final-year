import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineStar, HiOutlineBriefcase } from 'react-icons/hi';

const FindDevelopers = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    minRating: 0,
    availability: 'all',
  });

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        let developersQuery = query(collection(db, 'users'), where('role', '==', 'developer'));
        
        // Apply filters
        if (filters.minRating > 0) {
          developersQuery = query(developersQuery, where('rating', '>=', filters.minRating));
        }
        
        const developersSnapshot = await getDocs(developersQuery);
        const developersData = developersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Apply search and additional filters
        const filteredDevelopers = developersData.filter(dev => {
          const matchesSearch = dev.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              dev.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
          
          const matchesSkills = filters.skills.length === 0 || 
                              filters.skills.every(skill => dev.skills?.includes(skill));
          
          const matchesAvailability = filters.availability === 'all' || 
                                    dev.availability === filters.availability;
          
          return matchesSearch && matchesSkills && matchesAvailability;
        });
        
        setDevelopers(filteredDevelopers);
      } catch (error) {
        console.error('Error fetching developers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, [searchTerm, filters]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search developers by name or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
              >
                <option value={0}>All Ratings</option>
                <option value={4}>4+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={2}>2+ Stars</option>
              </select>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              >
                <option value="all">All Availability</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Developers List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Available Developers
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : developers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No developers found matching your criteria.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {developers.map((developer) => (
                <li key={developer.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={developer.avatar || 'https://via.placeholder.com/48'}
                          alt={developer.fullName}
                        />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          {developer.fullName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {developer.skills?.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <HiOutlineStar className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-500">
                          {developer.rating || 'No rating'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <HiOutlineBriefcase className="h-5 w-5 text-gray-400" />
                        <span className="ml-1 text-sm text-gray-500">
                          {developer.availability || 'Not specified'}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindDevelopers; 
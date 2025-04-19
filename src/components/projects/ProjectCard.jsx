import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineCurrencyDollar } from 'react-icons/hi';

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
              {project.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 line-clamp-3">
              {project.description}
            </p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <HiOutlineCurrencyDollar className="h-5 w-5 text-gray-400 mr-1" />
            <span className="text-gray-900">
              {project.budget.min} - {project.budget.max} FCFA
            </span>
          </div>
          <div className="flex items-center">
            <HiOutlineClock className="h-5 w-5 text-gray-400 mr-1" />
            <span className="text-gray-900">
              {project.duration.timeframe} {project.duration.unit}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {project.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {skill}
              </span>
            ))}
            {project.skills.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{project.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/login"
            className="w-full block text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 
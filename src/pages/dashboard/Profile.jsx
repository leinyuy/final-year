import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX } from 'react-icons/hi';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [addingExperience, setAddingExperience] = useState(false);
  const [addingEducation, setAddingEducation] = useState(false);
  const [addingPortfolio, setAddingPortfolio] = useState(false);
  const [addingCertification, setAddingCertification] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    hourlyRate: '',
    availability: 'full-time',
    portfolio: [],
    certifications: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    duration: '',
    description: ''
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    year: '',
    field: ''
  });
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    link: ''
  });
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    year: '',
    link: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        // Fetch developer profile
        const profileDoc = await getDoc(doc(db, 'developerProfiles', user.uid));
        const profileData = profileDoc.data();

        setProfile({
          ...profile,
          ...userData,
          ...profileData
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = async () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setAddingSkill(true);
      try {
        setProfile(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
        setNewSkill('');
      } finally {
        setAddingSkill(false);
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddExperience = async () => {
    if (newExperience.title && newExperience.company) {
      setAddingExperience(true);
      try {
        setProfile(prev => ({
          ...prev,
          experience: [...prev.experience, { ...newExperience }]
        }));
        setNewExperience({
          title: '',
          company: '',
          duration: '',
          description: ''
        });
      } finally {
        setAddingExperience(false);
      }
    }
  };

  const handleRemoveExperience = (index) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleAddEducation = async () => {
    if (newEducation.degree && newEducation.institution) {
      setAddingEducation(true);
      try {
        setProfile(prev => ({
          ...prev,
          education: [...prev.education, { ...newEducation }]
        }));
        setNewEducation({
          degree: '',
          institution: '',
          year: '',
          field: ''
        });
      } finally {
        setAddingEducation(false);
      }
    }
  };

  const handleRemoveEducation = (index) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleAddPortfolio = async () => {
    if (newPortfolio.title && newPortfolio.link) {
      setAddingPortfolio(true);
      try {
        setProfile(prev => ({
          ...prev,
          portfolio: [...prev.portfolio, { ...newPortfolio }]
        }));
        setNewPortfolio({
          title: '',
          description: '',
          link: ''
        });
      } finally {
        setAddingPortfolio(false);
      }
    }
  };

  const handleRemovePortfolio = (index) => {
    setProfile(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

  const handleAddCertification = async () => {
    if (newCertification.name && newCertification.issuer) {
      setAddingCertification(true);
      try {
        setProfile(prev => ({
          ...prev,
          certifications: [...prev.certifications, { ...newCertification }]
        }));
        setNewCertification({
          name: '',
          issuer: '',
          year: '',
          link: ''
        });
      } finally {
        setAddingCertification(false);
      }
    }
  };

  const handleRemoveCertification = (index) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update user document
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        role: 'developer'
      });

      // Update or create developer profile
      await setDoc(doc(db, 'developerProfiles', user.uid), {
        uid: user.uid,
        bio: profile.bio,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        hourlyRate: Number(profile.hourlyRate),
        availability: profile.availability,
        portfolio: profile.portfolio,
        certifications: profile.certifications,
        rating: profile.rating || 0,
        totalProjects: profile.totalProjects || 0,
        successRate: profile.successRate || 0
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Developer Profile</h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                rows={4}
                value={profile.bio}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="block w-full rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={addingSkill}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {addingSkill ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <HiOutlinePlus className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                    >
                      <HiOutlineX className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <div className="mt-1 space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{exp.title}</h4>
                      <p className="text-sm text-gray-500">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                      <p className="mt-1 text-sm text-gray-700">{exp.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(index)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <HiOutlineX className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={newExperience.title}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Job Title"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <input
                    type="text"
                    value={newExperience.duration}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Duration (e.g., 2 years)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <textarea
                    value={newExperience.description}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  disabled={addingExperience}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {addingExperience ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
                  ) : (
                    <HiOutlinePlus className="h-5 w-5 mr-2" />
                  )}
                  Add Experience
                </button>
              </div>
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Education</label>
              <div className="mt-1 space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-sm text-gray-500">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                      <p className="mt-1 text-sm text-gray-700">{edu.field}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(index)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <HiOutlineX className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="Degree"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="Institution"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <input
                    type="text"
                    value={newEducation.year}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="Year"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <input
                    type="text"
                    value={newEducation.field}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
                    placeholder="Field of Study"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  disabled={addingEducation}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {addingEducation ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
                  ) : (
                    <HiOutlinePlus className="h-5 w-5 mr-2" />
                  )}
                  Add Education
                </button>
              </div>
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Portfolio</label>
              <div className="mt-1 space-y-4">
                {profile.portfolio.map((item, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                      <p className="mt-1 text-sm text-gray-700">{item.description}</p>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        View Project
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolio(index)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <HiOutlineX className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Project Title"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <textarea
                    value={newPortfolio.description}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Project Description"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <input
                    type="url"
                    value={newPortfolio.link}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="Project URL"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPortfolio}
                  disabled={addingPortfolio}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {addingPortfolio ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
                  ) : (
                    <HiOutlinePlus className="h-5 w-5 mr-2" />
                  )}
                  Add Portfolio Item
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Certifications</label>
              <div className="mt-1 space-y-4">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-500">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">{cert.year}</p>
                      {cert.link && (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          View Certificate
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <HiOutlineX className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Certification Name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <input
                    type="text"
                    value={newCertification.issuer}
                    onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder="Issuing Organization"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <input
                    type="text"
                    value={newCertification.year}
                    onChange={(e) => setNewCertification(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="Year Obtained"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                  <input
                    type="url"
                    value={newCertification.link}
                    onChange={(e) => setNewCertification(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="Certificate URL (optional)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCertification}
                  disabled={addingCertification}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {addingCertification ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
                  ) : (
                    <HiOutlinePlus className="h-5 w-5 mr-2" />
                  )}
                  Add Certification
                </button>
              </div>
            </div>

            {/* Work Preferences */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate (FCFA)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={profile.hourlyRate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <select
                  name="availability"
                  value={profile.availability}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
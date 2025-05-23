import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardHome from './DashboardHome';
import Profile from './Profile';
import Projects from './Projects';
import ProjectDetails from './ProjectDetails';
import BrowseProjects from './BrowseProjects';
import ProjectApplications from './ProjectApplications';
import Messages from './Messages';
import Chat from './Chat';
import Payment from './Payment';
import MyApplications from './MyApplications';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="projects/:projectId/applications" element={<ProjectApplications />} />
        <Route path="browse-projects" element={<BrowseProjects />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:userId" element={<Chat />} />
        <Route path="payment/:projectId/:developerId" element={<Payment />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard; 
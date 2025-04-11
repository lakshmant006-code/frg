import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { FinalLogin } from "./screens/FinalLogin";
import { AdminDashboard } from "./screens/AdminDashboard";
import { ClientList } from "./screens/ClientList";
import { RegisterClient } from "./screens/RegisterClient";
import { RegisterProject } from "./screens/RegisterProject";
import { UserList } from "./screens/UserList";
import { RegisterUser } from "./screens/RegisterUser";
import { ViewActivities } from "./screens/ViewActivities";
import { CreateActivity } from "./screens/CreateActivity";
import { ProjectList } from "./screens/ProjectList";
import { Teams } from "./screens/Teams";
import { CreateTeam } from "./screens/CreateTeam";
import { ManageClients } from "./screens/ManageClients";
import { ManageUsers } from "./screens/ManageUsers";
import { ManageProjects } from "./screens/ManageProjects";
import { ManageTeams } from "./screens/ManageTeams";
import { Reports } from "./screens/Reports";
import { ClientReports } from "./screens/ClientReports";
import { TimeTracking } from "./screens/TimeTracking";
import { Roles } from "./screens/Roles";
import { CreateRole } from "./screens/CreateRole";
import { Organization } from "./screens/Organization";
import { Skills } from "./screens/Skills";
import { CreateSkill } from "./screens/CreateSkill/CreateSkill";
import { Profile } from "./screens/Profile";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
      <OrganizationProvider>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<FinalLogin />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/manage-clients" element={<ManageClients />} />
            <Route path="/manage-projects" element={<ManageProjects />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/register-client" element={<RegisterClient />} />
            <Route path="/register-project" element={<RegisterProject />} />
            <Route path="/user-list" element={<UserList />} />
            <Route path="/register-user" element={<RegisterUser />} />
            <Route path="/view-activities" element={<ViewActivities />} />
            <Route path="/create-activity" element={<CreateActivity />} />
            <Route path="/project-list" element={<ProjectList />} />
            <Route path="/manage-teams" element={<ManageTeams />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/create-team" element={<CreateTeam />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/client-reports" element={<ClientReports />} />
            <Route path="/time-tracking" element={<TimeTracking />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/create-role" element={<CreateRole />} />
            <Route path="/organization" element={<Organization />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/create-skill" element={<CreateSkill />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </AnimatePresence>
      </OrganizationProvider>
    </Router>
  </StrictMode>
);
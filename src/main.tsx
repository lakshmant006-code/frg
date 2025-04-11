import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { initializeDatabase } from './lib/db';
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
import { TeamList } from "./screens/TeamList";
import { ManageClients } from "./screens/ManageClients";
import { ManageUsers } from "./screens/ManageUsers";
import { ManageProjects } from "./screens/ManageProjects";

// Initialize the database when the app starts
initializeDatabase().catch(console.error);

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
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
          <Route path="/manage-teams" element={<TeamList />} />
          <Route path="/manage-users" element={<ManageUsers />} />
        </Routes>
      </AnimatePresence>
    </Router>
  </StrictMode>
);
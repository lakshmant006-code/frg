import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";

export const AdminDashboard = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="w-full h-20 bg-[#1900ff] flex items-center justify-center">
        <h1 className="font-bold text-white text-xl tracking-[-0.23px] leading-5 [font-family:'Helvetica_Rounded-Bold',Helvetica]">
          TIME MANAGEMENT
        </h1>
      </header>

      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-2">User Dashboard</h2>
          <p className="text-gray-600 mb-8">Welcome to Time Management user dashboard</p>

          <div className="grid grid-cols-3 gap-8">
            {/* Clients Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Clients</h3>
                  <p className="text-gray-600">Manage your client accounts and registrations.</p>
                </div>
                <div className="flex justify-center mt-4 pt-4 border-t">
                  <button 
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full"
                    onClick={() => navigate('/register-client')}
                  >
                    Register New Client
                  </button>
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Projects</h3>
                  <p className="text-gray-600">All the projects to be shown</p>
                </div>
                <div className="flex justify-center mt-4 pt-4 border-t">
                  <button 
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full"
                    onClick={() => navigate('/register-project')}
                  >
                    Register New Project
                  </button>
                </div>
              </div>
            </div>

            {/* Users Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Users</h3>
                  <p className="text-gray-600">All the working users in the company.</p>
                </div>
                <div className="flex justify-center mt-4 pt-4 border-t">
                  <button 
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full"
                    onClick={() => navigate('/register-user')}
                  >
                    Register New User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-600">
        <p>Contact Support</p>
        <p>2025 Time Management. All rights reserved.</p>
      </footer>
    </div>
  );
};
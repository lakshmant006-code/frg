import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { AnimatedPage } from "../../components/AnimatedPage";
import { AnimatedCard } from "../../components/AnimatedCard";

export const Reports = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="w-full h-20 bg-[#1900ff] flex items-center justify-center">
        <h1 className="font-bold text-white text-xl tracking-[-0.23px] leading-5">
          TIME MANAGEMENT
        </h1>
      </header>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <AnimatedPage>
            <h2 className="text-2xl font-bold mb-2">Reports</h2>
            <p className="text-gray-600 mb-8">Generate and view reports for different entities</p>

            <div className="grid grid-cols-3 gap-8">
              <AnimatedCard delay={0.1}>
                <div className="bg-white p-6 rounded-lg shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Client Reports</h3>
                      <p className="text-gray-600">View reports and analytics for clients.</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        <li>• Client activity summary</li>
                        <li>• Project distribution</li>
                        <li>• Billing reports</li>
                      </ul>
                    </div>
                    <div className="flex justify-center mt-4 pt-4 border-t">
                      <button 
                        className="bg-black text-white px-4 py-2 rounded w-full"
                        onClick={() => navigate('/client-reports')}
                      >
                        View Client Reports
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.2}>
                <div className="bg-white p-6 rounded-lg shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Project Reports</h3>
                      <p className="text-gray-600">View reports and analytics for projects.</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        <li>• Project progress tracking</li>
                        <li>• Resource allocation</li>
                        <li>• Timeline analysis</li>
                      </ul>
                    </div>
                    <div className="flex justify-center mt-4 pt-4 border-t">
                      <button 
                        className="bg-black text-white px-4 py-2 rounded w-full"
                        onClick={() => navigate('/project-reports')}
                      >
                        View Project Reports
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.3}>
                <div className="bg-white p-6 rounded-lg shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Team Reports</h3>
                      <p className="text-gray-600">View reports and analytics for teams.</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        <li>• Team performance metrics</li>
                        <li>• Workload distribution</li>
                        <li>• Activity tracking</li>
                      </ul>
                    </div>
                    <div className="flex justify-center mt-4 pt-4 border-t">
                      <button 
                        className="bg-black text-white px-4 py-2 rounded w-full"
                        onClick={() => navigate('/team-reports')}
                      >
                        View Team Reports
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </AnimatedPage>
        </main>
      </div>

      <footer className="text-center py-4 text-sm text-gray-600">
        <p>Contact Support</p>
        <p>2025 Time Management. All rights reserved.</p>
      </footer>
    </div>
  );
};
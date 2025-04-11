import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { AnimatedPage } from "../../components/AnimatedPage";
import { AnimatedCard } from "../../components/AnimatedCard";

export const ManageClients = (): JSX.Element => {
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
            <h2 className="text-2xl font-bold mb-2">Manage Clients</h2>
            <p className="text-gray-600 mb-8">Manage your client accounts and registrations</p>

            <div className="grid grid-cols-2 gap-8">
              <AnimatedCard delay={0.1}>
                <div className="bg-white p-6 rounded-lg shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Client List</h3>
                      <p className="text-gray-600">View and manage all client accounts.</p>
                    </div>
                    <div className="flex justify-center mt-4 pt-4 border-t">
                      <button 
                        className="bg-black text-white px-4 py-2 rounded w-full"
                        onClick={() => navigate('/clients')}
                      >
                        View Client List
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.2}>
                <div className="bg-white p-6 rounded-lg shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Register Client</h3>
                      <p className="text-gray-600">Add a new client to the system.</p>
                    </div>
                    <div className="flex justify-center mt-4 pt-4 border-t">
                      <button 
                        className="bg-black text-white px-4 py-2 rounded w-full"
                        onClick={() => navigate('/register-client')}
                      >
                        Register New Client
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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

interface ProjectStats {
  client_id: string;
  client_name: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_hours: number;
  billable_hours: number;
}

export const ClientReports = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");

  useEffect(() => {
    fetchProjectStats();
  }, []);

  const fetchProjectStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: clientStats, error: statsError } = await supabase
        .from('projects')
        .select(`
          client_id,
          clients (
            name
          )
        `)
        .eq('active', true);

      if (statsError) throw statsError;

      if (clientStats) {
        const stats = clientStats.reduce<Record<string, ProjectStats>>((acc, project) => {
          const clientId = project.client_id;
          const clientName = project.clients?.name || 'Unknown Client';

          if (!acc[clientId]) {
            acc[clientId] = {
              client_id: clientId,
              client_name: clientName,
              total_projects: 0,
              active_projects: 0,
              completed_projects: 0,
              total_hours: 0,
              billable_hours: 0
            };
          }

          acc[clientId].total_projects++;
          return acc;
        }, {});

        setProjectStats(Object.values(stats));
      }
    } catch (err: any) {
      console.error('Error fetching project stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const projectDistributionData = {
    labels: projectStats.map(stat => stat.client_name),
    datasets: [
      {
        data: projectStats.map(stat => stat.total_projects),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Project Distribution by Client'
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading reports...</div>
      </div>
    );
  }

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
          <button 
            onClick={() => navigate('/reports')}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← Back to Reports
          </button>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Client Reports</h2>
                <p className="text-gray-500">View detailed reports and analytics for clients</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-8">
              {/* Project Distribution Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Project Distribution</h3>
                <div className="h-[400px] flex items-center justify-center">
                  <Pie data={projectDistributionData} options={chartOptions} />
                </div>
              </div>

              {/* Client Statistics */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Client Statistics</h3>
                <div className="space-y-4">
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                  >
                    <option value="">Select a client</option>
                    {projectStats.map(stat => (
                      <option key={stat.client_id} value={stat.client_id}>
                        {stat.client_name}
                      </option>
                    ))}
                  </select>

                  {selectedClient && (
                    <div className="space-y-4">
                      {projectStats
                        .filter(stat => stat.client_id === selectedClient)
                        .map(stat => (
                          <div key={stat.client_id} className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span>Total Projects</span>
                              <span className="font-semibold">{stat.total_projects}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span>Active Projects</span>
                              <span className="font-semibold">{stat.active_projects}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span>Completed Projects</span>
                              <span className="font-semibold">{stat.completed_projects}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="text-center py-4 text-sm text-gray-600">
        <p>Contact Support</p>
        <p>2025 Time Management. All rights reserved.</p>
      </footer>
    </div>
  );
};
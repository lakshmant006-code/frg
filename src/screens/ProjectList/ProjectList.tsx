import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface Project {
  Project_ID: number;
  Proj_Name: string;
  Proj_Descr: string;
  Client_ID: string;
  Org_ID: number;
  Proj_Start_Date: string;
  Proj_Planned_End_Date: string;
  Proj_Actual_End_date: string | null;
  Proj_Status: boolean;
  Proj_Progress_Status: string;
  client?: {
    Client_name: string;
  };
}

interface Client {
  Client_ID: string;
  Client_name: string;
  Client_Status: boolean;
}

export const ProjectList = (): JSX.Element => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchProjects();
    }
  }, [selectedClient, statusFilter]);

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Projects'
        },
        (payload) => {
          console.log('Real-time change:', payload);
          fetchProjects(); // Refetch to get the latest data with client info
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Clients')
        .select('Client_ID, Client_name, Client_Status')
        .eq('Client_Status', true)
        .order('Client_name');

      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        setClients(data);
        // Set the first client as default
        setSelectedClient(data[0].Client_ID);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('Projects')
        .select(`
          *,
          client:Client_ID (
            Client_name
          )
        `)
        .eq('Client_ID', selectedClient);

      if (statusFilter !== 'all') {
        query = query.eq('Proj_Status', statusFilter === 'active');
      }

      const { data, error: fetchError } = await query.order('Project_ID');

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    navigate('/register-project', { 
      state: { 
        isEditing: true,
        projectData: project 
      }
    });
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setError(null);
      const project = projects.find(p => p.Project_ID === id);
      if (!project) return;

      const { error: updateError } = await supabase
        .from('Projects')
        .update({ Proj_Status: !project.Proj_Status })
        .eq('Project_ID', id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Error toggling project status:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('Projects')
        .delete()
        .eq('Project_ID', id);

      if (deleteError) throw deleteError;
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !projects.length) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading projects...</div>
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
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Projects</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    realtimeStatus === 'connected' ? 'bg-green-500' : 
                    realtimeStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <p className="text-sm text-gray-500">
                    {realtimeStatus === 'connected' ? 'Live updates enabled' :
                     realtimeStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  HR Only
                </div>
                <button
                  onClick={() => navigate('/register-project')}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  Create Project
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="mb-6 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {clients.map(client => (
                    <option key={client.Client_ID} value={client.Client_ID}>
                      {client.Client_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Projects</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                <div className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,1fr] gap-4 bg-gray-50 p-4 rounded-lg font-medium mb-4">
                  <div>Project ID</div>
                  <div>Project Name</div>
                  <div>Start Date</div>
                  <div>End Date</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.Project_ID} className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,1fr] gap-4 bg-gray-100 p-4 rounded-lg items-center">
                      <div className="truncate font-mono text-sm">#{project.Project_ID}</div>
                      <div className="truncate">{project.Proj_Name}</div>
                      <div>{formatDate(project.Proj_Start_Date)}</div>
                      <div>{formatDate(project.Proj_Planned_End_Date)}</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-12 h-6 ${project.Proj_Status ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors duration-200`}
                          onClick={() => handleToggleStatus(project.Project_ID)}
                        >
                          <div className={`absolute ${project.Proj_Status ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {project.Proj_Progress_Status}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors duration-200"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </button>
                        {showDeleteConfirm === project.Project_ID ? (
                          <div className="flex items-center gap-1">
                            <button 
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
                              onClick={() => handleDelete(project.Project_ID)}
                            >
                              Confirm
                            </button>
                            <button 
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200"
                              onClick={() => setShowDeleteConfirm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors duration-200"
                            onClick={() => setShowDeleteConfirm(project.Project_ID)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {projects.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No projects found for the selected client and status.
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
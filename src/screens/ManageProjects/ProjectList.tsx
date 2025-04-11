import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";

interface Project {
  Project_ID: string;
  Project_Name: string;
  Client_ID: string;
  Client_Name: string;
  Project_Manager_ID: string;
  Project_Manager_Name: string;
  Start_Date: string;
  End_Date: string;
  Project_Status: string;
  Project_Description: string;
  Budget: number;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ProjectList = (): JSX.Element => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Projects')
        .select(`
          *,
          Clients (Client_Name),
          Employees (Employee_Name)
        `)
        .order('Project_Name');

      if (error) throw error;

      const formattedProjects = data?.map(project => ({
        ...project,
        Client_Name: project.Clients?.Client_Name,
        Project_Manager_Name: project.Employees?.Employee_Name
      })) || [];

      setProjects(formattedProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Update Project Status?`,
      description: `Are you sure you want to change the project status to ${newStatus}?`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('Projects')
            .update({ Project_Status: newStatus })
            .eq('Project_ID', projectId);

          if (error) throw error;
          await fetchProjects();
        } catch (err: any) {
          console.error('Error updating project status:', err);
          setError(err.message);
        }
      },
    });
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Project?",
      description: `Are you sure you want to delete ${projectName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('Projects')
            .delete()
            .eq('Project_ID', projectId);

          if (error) throw error;
          await fetchProjects();
        } catch (err: any) {
          console.error('Error deleting project:', err);
          setError(err.message);
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(budget);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />

      <header className="w-full h-20 bg-[#1900ff] flex items-center justify-center">
        <h1 className="font-bold text-white text-xl tracking-[-0.23px] leading-5">
          TIME MANAGEMENT
        </h1>
      </header>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Project List</h2>
                <p className="text-gray-500 mt-1">
                  View and manage all projects
                </p>
              </div>
              <button
                onClick={() => navigate('/register-project')}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Add New Project
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No projects found. Add your first project to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Project Name</th>
                      <th className="text-left py-3 px-4">Client</th>
                      <th className="text-left py-3 px-4">Project Manager</th>
                      <th className="text-left py-3 px-4">Timeline</th>
                      <th className="text-left py-3 px-4">Budget</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr
                        key={project.Project_ID}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{project.Project_Name}</div>
                            <div className="text-sm text-gray-500">{project.Project_Description}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{project.Client_Name}</td>
                        <td className="py-3 px-4">{project.Project_Manager_Name}</td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>Start: {formatDate(project.Start_Date)}</div>
                            <div>End: {formatDate(project.End_Date)}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatBudget(project.Budget)}</td>
                        <td className="py-3 px-4">
                          <div 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getStatusColor(project.Project_Status)
                            }`}
                          >
                            {project.Project_Status}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/edit-project/${project.Project_ID}`, { 
                                state: { projectData: project } 
                              })}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Edit
                            </button>
                            <select
                              value={project.Project_Status}
                              onChange={(e) => handleStatusChange(project.Project_ID, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="Active">Active</option>
                              <option value="On Hold">On Hold</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => handleDelete(project.Project_ID, project.Project_Name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}; 
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

interface Team {
  Team_ID: string;
  Team_Name: string;
  Team_Lead_ID: string;
  Team_Lead_Name: string;
  Team_Status: boolean;
  Team_Description: string;
  Department: string;
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

export const TeamList = (): JSX.Element => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
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
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Teams')
        .select('*')
        .order('Team_Name');

      if (error) throw error;
      setTeams(data || []);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (teamId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    setConfirmDialog({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Team?`,
      description: `Are you sure you want to ${action} this team? This will affect team members' access.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('Teams')
            .update({ Team_Status: !currentStatus })
            .eq('Team_ID', teamId);

          if (error) throw error;
          await fetchTeams();
        } catch (err: any) {
          console.error(`Error ${action}ing team:`, err);
          setError(err.message);
        }
      },
    });
  };

  const handleDelete = async (teamId: string, teamName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Team?",
      description: `Are you sure you want to delete ${teamName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('Teams')
            .delete()
            .eq('Team_ID', teamId);

          if (error) throw error;
          await fetchTeams();
        } catch (err: any) {
          console.error('Error deleting team:', err);
          setError(err.message);
        }
      },
    });
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
                <h2 className="text-2xl font-bold">Team List</h2>
                <p className="text-gray-500 mt-1">
                  View and manage all teams
                </p>
              </div>
              <button
                onClick={() => navigate('/register-team')}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Add New Team
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No teams found. Add your first team to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Team ID</th>
                      <th className="text-left py-3 px-4">Team Name</th>
                      <th className="text-left py-3 px-4">Team Lead</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr
                        key={team.Team_ID}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{team.Team_ID}</td>
                        <td className="py-3 px-4">{team.Team_Name}</td>
                        <td className="py-3 px-4">{team.Team_Lead_Name}</td>
                        <td className="py-3 px-4">{team.Department}</td>
                        <td className="py-3 px-4">{team.Team_Description}</td>
                        <td className="py-3 px-4">
                          <div 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              team.Team_Status
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {team.Team_Status ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/edit-team/${team.Team_ID}`, { 
                                state: { teamData: team } 
                              })}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusToggle(team.Team_ID, team.Team_Status)}
                              className={`${
                                team.Team_Status
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {team.Team_Status ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(team.Team_ID, team.Team_Name)}
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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface Team {
  Team_ID: number;
  Team_Name: string;
  Team_Descr: string;
  Team_Lead: string;
  Org_ID: number;
  Team_Status: boolean;
  team_lead?: {
    Emp_First_Name: string;
    Emp_Last_Name: string;
  };
  members?: {
    Emp_ID: string;
    Emp_Name: string;
  }[];
}

export const Teams = (): JSX.Element => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    fetchTeams();

    // Set up real-time subscription
    const channel = supabase
      .channel('teams_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Teams'
        },
        (payload) => {
          console.log('Real-time change:', payload);
          
          if (payload.eventType === 'INSERT') {
            fetchTeams(); // Refetch to get the related data
          }
          else if (payload.eventType === 'DELETE') {
            setTeams(current => 
              current.filter(team => team.Team_ID !== payload.old.Team_ID)
            );
          }
          else if (payload.eventType === 'UPDATE') {
            fetchTeams(); // Refetch to get the updated related data
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch teams with team lead and member information
      const { data, error: fetchError } = await supabase
        .from('Teams')
        .select(`
          *,
          team_lead:Team_Lead (
            Emp_First_Name,
            Emp_Last_Name
          ),
          members:Team_Members (
            Emp_ID,
            Emp_Name
          )
        `)
        .order('Team_Name');

      if (fetchError) throw fetchError;
      setTeams(data || []);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: Team) => {
    navigate('/create-team', { 
      state: { 
        isEditing: true,
        teamData: team 
      }
    });
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setError(null);
      const team = teams.find(t => t.Team_ID === id);
      if (!team) return;

      const { error: updateError } = await supabase
        .from('Teams')
        .update({ Team_Status: !team.Team_Status })
        .eq('Team_ID', id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Error toggling team status:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      
      // First delete team members
      const { error: membersError } = await supabase
        .from('Team_Members')
        .delete()
        .eq('Team_ID', id);

      if (membersError) throw membersError;

      // Then delete the team
      const { error: deleteError } = await supabase
        .from('Teams')
        .delete()
        .eq('Team_ID', id);

      if (deleteError) throw deleteError;
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting team:', err);
      setError(err.message);
    }
  };

  const filteredTeams = teams.filter(team => {
    switch (activeTab) {
      case 'active':
        return team.Team_Status;
      case 'inactive':
        return !team.Team_Status;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading teams...</div>
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
                <h2 className="text-2xl font-bold">Teams</h2>
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
                  onClick={() => navigate('/create-team')}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  Create Team
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'all' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('all')}
              >
                All Teams
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'active' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('active')}
              >
                Active Teams
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'inactive' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('inactive')}
              >
                Inactive Teams
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <div className="grid grid-cols-[2fr,3fr,2fr,2fr,1fr,1fr] gap-4 bg-gray-50 p-4 rounded-lg font-medium mb-4">
                  <div>Team Name</div>
                  <div>Description</div>
                  <div>Team Lead</div>
                  <div>Members</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="space-y-4">
                  {filteredTeams.map((team) => (
                    <div key={team.Team_ID} className="grid grid-cols-[2fr,3fr,2fr,2fr,1fr,1fr] gap-4 bg-gray-100 p-4 rounded-lg items-center">
                      <div className="truncate font-medium">{team.Team_Name}</div>
                      <div className="truncate text-gray-600">{team.Team_Descr || 'No description'}</div>
                      <div className="truncate">
                        {team.team_lead ? 
                          `${team.team_lead.Emp_First_Name} ${team.team_lead.Emp_Last_Name}` : 
                          'Not assigned'
                        }
                      </div>
                      <div className="truncate">
                        {team.members && team.members.length > 0 ? (
                          <span>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                        ) : (
                          'No members'
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-12 h-6 ${team.Team_Status ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors duration-200`}
                          onClick={() => handleToggleStatus(team.Team_ID)}
                        >
                          <div className={`absolute ${team.Team_Status ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors duration-200"
                          onClick={() => handleEdit(team)}
                        >
                          Edit
                        </button>
                        {showDeleteConfirm === team.Team_ID ? (
                          <div className="flex items-center gap-1">
                            <button 
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
                              onClick={() => handleDelete(team.Team_ID)}
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
                            onClick={() => setShowDeleteConfirm(team.Team_ID)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredTeams.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No teams found. Click "Create Team" to create one.
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
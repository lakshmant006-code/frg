import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface Employee {
  Emp_id: string;
  Emp_First_Name: string;
  Emp_Last_Name: string;
  Emp_Status: boolean;
}

interface TeamFormData {
  name: string;
  teamLeadId: string;
  members: string[];
  active: boolean;
}

export const CreateTeam = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing;
  const existingTeam = location.state?.teamData;

  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    teamLeadId: "",
    members: [],
    active: true
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
    if (isEditing && existingTeam) {
      setFormData({
        name: existingTeam.Team_Name || "",
        teamLeadId: existingTeam.Team_Lead || "",
        members: existingTeam.members?.map((m: any) => m.Emp_ID) || [],
        active: existingTeam.Team_Status ?? true
      });
    }
  }, [isEditing, existingTeam]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Employees')
        .select('Emp_id, Emp_First_Name, Emp_Last_Name')
        .eq('Emp_Status', true)
        .order('Emp_First_Name');

      if (fetchError) throw fetchError;
      setEmployees(data || []);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      members: selectedOptions
    }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      active: !prev.active
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.name || !formData.teamLeadId) {
        setError('Please fill in all required fields');
        return;
      }

      // Get the next Team_ID
      const { data: maxIdResult } = await supabase
        .from('Teams')
        .select('Team_ID')
        .order('Team_ID', { ascending: false })
        .limit(1)
        .maybeSingle();

      const teamId = isEditing ? existingTeam.Team_ID : (maxIdResult?.Team_ID || 0) + 1;

      const teamData = {
        Team_ID: teamId,
        Team_Name: formData.name,
        Team_Lead: formData.teamLeadId,
        Team_Status: formData.active,
        Org_ID: 1 // Default organization ID
      };

      if (isEditing) {
        // Update team
        const { error: updateError } = await supabase
          .from('Teams')
          .update(teamData)
          .eq('Team_ID', teamId);

        if (updateError) throw updateError;

        // Delete existing team members
        const { error: deleteError } = await supabase
          .from('Team_Members')
          .delete()
          .eq('Team_ID', teamId);

        if (deleteError) throw deleteError;
      } else {
        // Insert new team
        const { error: insertError } = await supabase
          .from('Teams')
          .insert([teamData]);

        if (insertError) throw insertError;
      }

      // Insert team members
      if (formData.members.length > 0) {
        // Get the next Team_Members_ID
        const { data: maxMemberIdResult } = await supabase
          .from('Team_Members')
          .select('Team_Members_ID')
          .order('Team_Members_ID', { ascending: false })
          .limit(1)
          .maybeSingle();

        let nextMemberId = (maxMemberIdResult?.Team_Members_ID || 0) + 1;

        // Create team members data
        const teamMembersData = formData.members.map(memberId => {
          const employee = employees.find(e => e.Emp_id === memberId);
          const memberData = {
            Team_Members_ID: nextMemberId++,
            Team_ID: teamId,
            Team_Name: formData.name,
            Emp_ID: memberId,
            Emp_Name: employee ? `${employee.Emp_First_Name} ${employee.Emp_Last_Name}` : '',
            Org_ID: 1
          };
          return memberData;
        });

        // Insert team members
        const { error: membersError } = await supabase
          .from('Team_Members')
          .insert(teamMembersData);

        if (membersError) throw membersError;
      }

      navigate('/teams');
    } catch (err: any) {
      console.error('Error saving team:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => navigate('/teams')}
            className="mb-6 text-gray-600 flex items-center gap-2"
          >
            ← Back to Teams
          </button>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">
                {isEditing ? 'Edit Team' : 'Create Team'}
              </h2>
              <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                HR Only
              </div>
            </div>
            <p className="text-gray-500 mb-8">
              {isEditing ? 'Update team information' : 'Add a new team to the system'}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Team Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Lead*
                    </label>
                    <select
                      name="teamLeadId"
                      value={formData.teamLeadId}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Team Lead</option>
                      {employees.map(employee => (
                        <option key={employee.Emp_id} value={employee.Emp_id}>
                          {employee.Emp_First_Name} {employee.Emp_Last_Name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                <select
                  multiple
                  value={formData.members}
                  onChange={handleMemberChange}
                  className="w-full p-2 border rounded-md h-48"
                >
                  {employees.map(employee => (
                    <option key={employee.Emp_id} value={employee.Emp_id}>
                      {employee.Emp_First_Name} {employee.Emp_Last_Name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Hold Ctrl (Windows) or Command (Mac) to select multiple members
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                  <div 
                    className={`w-12 h-6 ${formData.active ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer`}
                    onClick={handleToggleActive}
                  >
                    <div className={`absolute ${formData.active ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => navigate('/teams')}
                  className="px-6 py-2 border rounded-md"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-black text-white rounded-md disabled:bg-gray-400"
                >
                  {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Team' : 'Create Team')}
                </button>
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
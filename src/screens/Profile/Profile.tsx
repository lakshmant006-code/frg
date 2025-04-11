import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  role: {
    role_id: number;
    role_name: string;
  };
  employee: {
    Employee_ID: string;
    Employee_Name: string;
    Employee_Email: string;
    Employee_Phone: string;
    Department: string;
    Designation: string;
    Shift: string;
  };
}

export const Profile = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        navigate('/login');
        return;
      }

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('User_Roles')
        .select(`
          role_id,
          role:Roles(role_name)
        `)
        .eq('user_id', user.id)
        .single();

      if (roleError) throw roleError;

      // Get employee details
      const { data: empData, error: empError } = await supabase
        .from('Employees')
        .select('*')
        .eq('Employee_Email', user.email)
        .single();

      if (empError) throw empError;

      setProfile({
        id: user.id,
        email: user.email || '',
        role: {
          role_id: roleData.role_id,
          role_name: roleData.role.role_name
        },
        employee: empData
      });

    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl text-red-600">Profile not found.</div>
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
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">My Profile</h2>
              <p className="text-gray-500">View and manage your profile information</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-8">
              {/* Authentication Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Authentication Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-medium">{profile.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-medium">{profile.role.role_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Employee ID</p>
                      <p className="font-medium">{profile.employee.Employee_ID}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{profile.employee.Employee_Name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{profile.employee.Employee_Phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium">{profile.employee.Department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Designation</p>
                      <p className="font-medium">{profile.employee.Designation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Shift</p>
                      <p className="font-medium">{profile.employee.Shift}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}; 
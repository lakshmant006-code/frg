import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface Role {
  Role_ID: number;
  Role_Name: string;
  Role_Descr: string;
  Role_Status: boolean;
  Org_ID: number;
}

export const Roles = (): JSX.Element => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Roles')
        .select('*')
        .order('Role_ID');

      if (fetchError) throw fetchError;
      setRoles(data || []);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    navigate('/create-role', { 
      state: { 
        isEditing: true,
        roleData: role 
      }
    });
  };

  const handleDelete = async (roleId: number) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('Roles')
        .delete()
        .eq('Role_ID', roleId);

      if (deleteError) throw deleteError;

      setRoles(roles.filter(role => role.Role_ID !== roleId));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting role:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading roles...</div>
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
                <h2 className="text-2xl font-bold">Roles</h2>
                <p className="text-gray-500">Manage system roles and permissions</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  HR Only
                </div>
                <button
                  onClick={() => navigate('/create-role')}
                  className="px-4 py-2 bg-black text-white rounded-md"
                >
                  Create Role
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.Role_ID} className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{role.Role_Name}</h3>
                      <p className="text-sm text-gray-600">{role.Role_Descr}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="px-3 py-1 bg-black text-white text-sm rounded"
                        onClick={() => handleEdit(role)}
                      >
                        Edit
                      </button>
                      {showDeleteConfirm === role.Role_ID ? (
                        <div className="flex items-center gap-1">
                          <button 
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                            onClick={() => handleDelete(role.Role_ID)}
                          >
                            Confirm
                          </button>
                          <button 
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
                            onClick={() => setShowDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="px-3 py-1 bg-black text-white text-sm rounded"
                          onClick={() => setShowDeleteConfirm(role.Role_ID)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {roles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No roles found. Click "Create Role" to create one.
                </div>
              )}
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
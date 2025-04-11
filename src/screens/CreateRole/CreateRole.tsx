import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface RoleFormData {
  roleId: string;
  roleName: string;
  roleDescription: string;
  active: boolean;
}

export const CreateRole = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    roleId: "",
    roleName: "",
    roleDescription: "",
    active: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      if (!formData.roleName || !formData.roleId) {
        setError('Role ID and name are required');
        return;
      }

      // Convert roleId to number
      const roleId = parseInt(formData.roleId);
      if (isNaN(roleId)) {
        setError('Role ID must be a valid number');
        return;
      }

      const { error: insertError } = await supabase
        .from('Roles')
        .insert([{
          Role_id: roleId,
          Role_Name: formData.roleName,
          Role_Description: formData.roleDescription
        }]);

      if (insertError) throw insertError;

      navigate('/roles');
    } catch (err: any) {
      console.error('Error creating role:', err);
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
            onClick={() => navigate('/roles')}
            className="mb-6 text-gray-600 flex items-center gap-2"
          >
            ← Back to Roles
          </button>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Create Role</h2>
              <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                HR Only
              </div>
            </div>
            <p className="text-gray-500 mb-8">Add a new role to the system</p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Role Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role ID*
                    </label>
                    <input
                      type="number"
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter role ID (numeric)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name*
                    </label>
                    <input
                      type="text"
                      name="roleName"
                      value={formData.roleName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter role name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Description
                    </label>
                    <textarea
                      name="roleDescription"
                      value={formData.roleDescription}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md h-32"
                      placeholder="Enter role description"
                    />
                  </div>
                </div>
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
                  onClick={() => navigate('/roles')}
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
                  {loading ? 'Creating...' : 'Create Role'}
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
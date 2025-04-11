import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface Employee {
  Emp_id: string;
  Emp_First_Name: string;
  Emp_Last_Name: string;
  Emp_email: string;
  Emp_Phone: string;
  Emp_Date_Joined: string;
  Emp_working_shift: string;
  Emp_Status: boolean;
  Org_ID: number;
  Role_ID?: number;
  role?: {
    Role_Name: string;
    Role_Descr: string;
  };
}

interface Role {
  Role_ID: number;
  Role_Name: string;
  Role_Descr: string;
  Role_Status: boolean;
}

export const UserList = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.success ? location.state?.message : null
  );

  useEffect(() => {
    fetchEmployees();
    fetchRoles();

    // Set up real-time subscription for employees
    const employeesChannel = supabase
      .channel('employees_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Employees'
        },
        (payload) => {
          console.log('Employee real-time change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setEmployees(current => {
              if (current.some(e => e.Emp_id === (payload.new as Employee).Emp_id)) {
                return current;
              }
              return [...current, payload.new as Employee];
            });
          }
          else if (payload.eventType === 'DELETE') {
            setEmployees(current => 
              current.filter(employee => employee.Emp_id !== payload.old.Emp_id)
            );
          }
          else if (payload.eventType === 'UPDATE') {
            setEmployees(current =>
              current.map(employee =>
                employee.Emp_id === payload.new.Emp_id
                  ? { ...employee, ...payload.new }
                  : employee
              )
            );
          }
        }
      );

    // Set up real-time subscription for roles
    const rolesChannel = supabase
      .channel('roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Roles'
        },
        (payload) => {
          console.log('Role real-time change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setRoles(current => {
              if (current.some(r => r.Role_ID === (payload.new as Role).Role_ID)) {
                return current;
              }
              return [...current, payload.new as Role];
            });
          }
          else if (payload.eventType === 'DELETE') {
            setRoles(current => 
              current.filter(role => role.Role_ID !== payload.old.Role_ID)
            );
          }
          else if (payload.eventType === 'UPDATE') {
            setRoles(current =>
              current.map(role =>
                role.Role_ID === payload.new.Role_ID
                  ? { ...role, ...payload.new }
                  : role
              )
            );
          }
        }
      );

    // Subscribe to both channels
    Promise.all([
      employeesChannel.subscribe((status) => {
        console.log('Employees subscription status:', status);
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      }),
      rolesChannel.subscribe((status) => {
        console.log('Roles subscription status:', status);
      })
    ]);

    // Clear location state after showing success message
    if (location.state?.success) {
      window.history.replaceState({}, document.title);
    }

    // Cleanup subscriptions on unmount
    return () => {
      employeesChannel.unsubscribe();
      rolesChannel.unsubscribe();
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Employees')
        .select(`
          *,
          role:Role_ID (
            Role_Name,
            Role_Descr
          )
        `)
        .order('Emp_First_Name');

      if (fetchError) throw fetchError;
      setEmployees(data || []);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Roles')
        .select('*')
        .order('Role_Name');

      if (fetchError) throw fetchError;
      setRoles(data || []);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.message);
    }
  };

  const handleEdit = (employee: Employee) => {
    navigate('/register-user', { 
      state: { 
        isEditing: true,
        employeeData: employee 
      }
    });
  };

  const handleToggleActive = async (id: string) => {
    try {
      setError(null);
      const employee = employees.find(e => e.Emp_id === id);
      if (!employee) return;

      // If deactivating employee, first delete their skills
      if (employee.Emp_Status) {
        const { error: skillsDeleteError } = await supabase
          .from('Employees_Skills')
          .delete()
          .eq('Emp_ID', id);

        if (skillsDeleteError) throw skillsDeleteError;
      }

      const { error: updateError } = await supabase
        .from('Employees')
        .update({ Emp_Status: !employee.Emp_Status })
        .eq('Emp_id', id);

      if (updateError) throw updateError;

      // State will be updated by real-time subscription
    } catch (err: any) {
      console.error('Error toggling employee status:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);

      // First delete all skills associated with the employee
      const { error: skillsDeleteError } = await supabase
        .from('Employees_Skills')
        .delete()
        .eq('Emp_ID', id);

      if (skillsDeleteError) throw skillsDeleteError;

      // Then delete the employee
      const { error: deleteError } = await supabase
        .from('Employees')
        .delete()
        .eq('Emp_id', id);

      if (deleteError) throw deleteError;

      // State will be updated by real-time subscription
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <header className="w-full h-20 bg-[#1900ff] flex items-center justify-center fixed top-0 z-10">
        <h1 className="font-bold text-white text-xl tracking-[-0.23px] leading-5">
          TIME MANAGEMENT
        </h1>
      </header>

      <div className="flex pt-20 flex-1">
        <div className="w-64 fixed left-0 top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <Sidebar />
        </div>

        <main className="ml-64 flex-1 p-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">List of Users</h2>
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
                  onClick={() => navigate('/register-user')}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  Add User
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                <div className="grid grid-cols-[2fr,1fr,2fr,1fr,1fr,1fr,1fr] gap-4 bg-gray-50 p-4 rounded-lg font-medium mb-4">
                  <div>Name</div>
                  <div>Employee ID</div>
                  <div>Email</div>
                  <div>Phone</div>
                  <div>Role</div>
                  <div>Working Shift</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee.Emp_id} className="grid grid-cols-[2fr,1fr,2fr,1fr,1fr,1fr,1fr] gap-4 bg-gray-100 p-4 rounded-lg items-center">
                      <div className="truncate">{`${employee.Emp_First_Name} ${employee.Emp_Last_Name}`}</div>
                      <div className="truncate font-mono text-sm">{employee.Emp_id}</div>
                      <div className="truncate">{employee.Emp_email}</div>
                      <div className="truncate">{employee.Emp_Phone || 'N/A'}</div>
                      <div className="truncate">
                        {employee.role?.Role_Name || 'Not assigned'}
                        {employee.role?.Role_Descr && (
                          <span className="block text-xs text-gray-500">
                            {employee.role.Role_Descr}
                          </span>
                        )}
                      </div>
                      <div className="truncate">{employee.Emp_working_shift || 'Not set'}</div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-12 h-6 ${employee.Emp_Status ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors duration-200`}
                            onClick={() => handleToggleActive(employee.Emp_id)}
                          >
                            <div className={`absolute ${employee.Emp_Status ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                          </div>
                        </div>
                        <button 
                          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors duration-200"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </button>
                        {showDeleteConfirm === employee.Emp_id ? (
                          <div className="flex items-center gap-1">
                            <button 
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
                              onClick={() => handleDelete(employee.Emp_id)}
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
                            onClick={() => setShowDeleteConfirm(employee.Emp_id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {employees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No users found. Click "Add User" to create one.
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
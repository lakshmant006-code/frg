import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { Header } from "../../components/Header/Header";
import { supabase } from "../../lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";

interface Project {
  Project_ID: number;
  Proj_Name: string;
}

interface Activity {
  Act_id: number;
  Act_name: string;
}

interface TimeEntry {
  Act_Time_Track_ID: number;
  Project_ID: number;
  Act_id: number;
  Org_ID: number;
  Client_ID: string;
  Skill_ID: number;
  Emp_id: string;
  Emp_Name: string;
  Start_Time: string;
  End_Time: string | null;
  project: {
    Proj_Name: string;
  };
  activity: {
    Act_name: string;
  };
}

interface Employee {
  Employee_ID: string;
  Employee_Name: string;
  Employee_Email: string;
  Employee_Phone: string;
  Department: string;
  Designation: string;
}

interface DatabaseEmployee {
  Emp_id: string;
  Emp_First_Name: string;
  Emp_Last_Name: string;
  Emp_email: string;
  Emp_Phone: string;
  Emp_working_shift: string;
  Emp_Status: boolean;
  Org_ID: number;
  Role_ID?: number;
}

interface Client {
  Client_ID: string;
  Client_name: string;
  Client_Status: boolean;
}

export const TimeTracking = (): JSX.Element => {
  const navigate = useNavigate();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);

  useEffect(() => {
    checkEmployeeAccess();
    fetchTimeEntries();
    fetchClients();

    // Set up real-time subscription
    const channel = supabase
      .channel('time_tracking_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Activity_Time_Tracking'
        },
        (payload) => {
          console.log('Real-time change:', payload);
          fetchTimeEntries();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeEntry) {
      interval = setInterval(() => {
        const startTime = new Date(activeEntry.Start_Time).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeEntry]);

  useEffect(() => {
    if (selectedClient) {
      fetchProjects(selectedClient);
      fetchActivities();
    }
  }, [selectedClient]);

  const checkEmployeeAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        setError('Authentication error. Please login again.');
        navigate('/login');
        return;
      }
      
      if (!user || !user.email) {
        setError('Invalid user data. Please login again.');
        navigate('/login');
        return;
      }

      // Get employee details using email
      let { data: empData } = await supabase
        .from('Employees')
        .select(`
          Emp_id,
          Emp_First_Name,
          Emp_Last_Name,
          Emp_email,
          Emp_Phone,
          Emp_working_shift,
          Emp_Status,
          Org_ID,
          Role_ID
        `)
        .eq('Emp_email', user.email)
        .single();

      // If employee doesn't exist, create one
      if (!empData) {
        // Get the next employee ID
        const { data: maxIdResult } = await supabase
          .from('Employees')
          .select('Emp_id')
          .order('Emp_id', { ascending: false })
          .limit(1)
          .single();

        const nextId = maxIdResult ? `EMP${String(Number(maxIdResult.Emp_id.replace('EMP', '')) + 1).padStart(3, '0')}` : 'EMP001';
        
        const newEmployee: DatabaseEmployee = {
          Emp_id: nextId,
          Emp_First_Name: user.email.split('@')[0] || 'New',
          Emp_Last_Name: 'User',
          Emp_email: user.email,
          Emp_Phone: '',
          Emp_working_shift: 'Day',
          Emp_Status: true,
          Org_ID: 1,
          Role_ID: 3 // Default to Employee role
        };

        const { data: insertedEmp, error: insertError } = await supabase
          .from('Employees')
          .insert([newEmployee])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating employee record:', insertError);
          setError('Error creating employee record. Please contact your administrator.');
          return;
        }

        empData = insertedEmp;
      }

      if (!empData) {
        setError('Failed to create or fetch employee record');
        return;
      }

      // Transform the data to match the component's expected format
      const transformedEmpData: Employee = {
        Employee_ID: empData.Emp_id,
        Employee_Name: `${empData.Emp_First_Name} ${empData.Emp_Last_Name}`,
        Employee_Email: empData.Emp_email,
        Employee_Phone: empData.Emp_Phone || '',
        Department: empData.Emp_working_shift || 'General',
        Designation: empData.Role_ID === 1 ? 'Admin' : empData.Role_ID === 2 ? 'Manager' : 'Employee'
      };

      setEmployeeData(transformedEmpData);
      setError(null); // Clear any previous errors if successful
    } catch (err: any) {
      console.error('Error checking access:', err);
      setError(`Access check failed: ${err.message}`);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Clients')
        .select('Client_ID, Client_name, Client_Status')
        .eq('Client_Status', true)
        .order('Client_name');

      if (fetchError) throw fetchError;
      setClients(data || []);

      // Set first client as default if available
      if (data && data.length > 0) {
        setSelectedClient(data[0].Client_ID);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    }
  };

  const fetchProjects = async (clientId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Projects')
        .select(`
          Project_ID,
          Proj_Name,
          Client_ID,
          client:Clients!Projects_Client_ID_fkey (
            Client_name
          )
        `)
        .eq('Client_ID', clientId)
        .eq('Proj_Status', true)
        .returns<Project[]>();

      if (fetchError) throw fetchError;
      setProjects(data || []);
      
      // Reset selected project when client changes
      setSelectedProject(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First get the employee ID using email
      const { data: empData, error: empError } = await supabase
        .from('Employees')
        .select('Employee_ID')
        .eq('Employee_Email', user.email)
        .single();

      if (empError) throw empError;
      if (!empData) throw new Error('Employee not found');

      const { data, error: fetchError } = await supabase
        .from('Activity_Time_Tracking')
        .select(`
          Act_Time_Track_ID,
          Project_ID,
          Act_id,
          Org_ID,
          Client_ID,
          Skill_ID,
          Emp_id,
          Emp_Name,
          Start_Time,
          End_Time,
          project:Projects!Activity_Time_Tracking_Project_ID_fkey (
            Proj_Name
          ),
          activity:Activities!Activity_Time_Tracking_Act_id_fkey (
            Act_name
          )
        `)
        .eq('Emp_id', empData.Employee_ID)
        .order('Start_Time', { ascending: false })
        .returns<TimeEntry[]>();

      if (fetchError) throw fetchError;
      setTimeEntries(data || []);

      // Check for active timer
      const runningEntry = data?.find(entry => !entry.End_Time);
      if (runningEntry) {
        setActiveEntry(runningEntry);
        const startTime = new Date(runningEntry.Start_Time).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      }
    } catch (err: any) {
      console.error('Error fetching time entries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Activities')
        .select('Act_id, Act_name, Act_status')
        .eq('Act_status', true);

      if (fetchError) throw fetchError;
      setActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.message);
    }
  };

  const startTimer = async () => {
    try {
      if (!selectedClient || !selectedProject || !selectedActivity) {
        setError('Please select a client, project, and activity');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First verify if the employee exists using email
      const { data: employeeData, error: employeeError } = await supabase
        .from('Employees')
        .select('Employee_ID, Employee_Name')
        .eq('Employee_Email', user.email)
        .single();

      if (employeeError || !employeeData) {
        setError('Employee record not found. Please contact your administrator.');
        return;
      }

      // First stop any running timer
      if (activeEntry) {
        await stopTimer();
      }

      // Get the next time tracking ID
      const { data: maxIdResult } = await supabase
        .from('Activity_Time_Tracking')
        .select('Act_Time_Track_ID')
        .order('Act_Time_Track_ID', { ascending: false })
        .limit(1)
        .single();

      const nextId = (maxIdResult?.Act_Time_Track_ID || 0) + 1;

      const timeEntry = {
        Act_Time_Track_ID: nextId,
        Project_ID: selectedProject,
        Act_id: selectedActivity,
        Org_ID: 1, // Default organization
        Client_ID: selectedClient,
        Skill_ID: 1, // Default skill
        Emp_id: employeeData.Employee_ID,  // Use the verified employee ID
        Emp_Name: employeeData.Employee_Name, // Use the actual employee name
        Start_Time: new Date().toISOString(),
        End_Time: null
      };

      const { data, error: insertError } = await supabase
        .from('Activity_Time_Tracking')
        .insert([timeEntry])
        .select(`
          Act_Time_Track_ID,
          Project_ID,
          Act_id,
          Org_ID,
          Client_ID,
          Skill_ID,
          Emp_id,
          Emp_Name,
          Start_Time,
          End_Time,
          project:Projects!Activity_Time_Tracking_Project_ID_fkey (
            Proj_Name
          ),
          activity:Activities!Activity_Time_Tracking_Act_id_fkey (
            Act_name
          )
        `)
        .single()
        .returns<TimeEntry>();

      if (insertError) throw insertError;

      setActiveEntry(data);
      setElapsedTime(0);
      setDialogOpen(false);
      
      // Show success message
      setError(null);
      
      // Refresh the time entries list
      fetchTimeEntries();
    } catch (err: any) {
      console.error('Error starting timer:', err);
      setError(err.message);
    }
  };

  const stopTimer = async () => {
    try {
      if (!activeEntry) return;

      const { error: updateError } = await supabase
        .from('Activity_Time_Tracking')
        .update({ 
          End_Time: new Date().toISOString()
        })
        .eq('Act_Time_Track_ID', activeEntry.Act_Time_Track_ID);

      if (updateError) throw updateError;

      setActiveEntry(null);
      setElapsedTime(0);
      
      // Show success message
      setError(null);
      
      // Refresh the time entries list
      fetchTimeEntries();
    } catch (err: any) {
      console.error('Error stopping timer:', err);
      setError(err.message);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDuration = (startTime: string, endTime: string | null): number => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    return Math.floor((end - start) / 1000);
  };

  if (loading && !timeEntries.length) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading time entries...</div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl text-red-600">Access denied or employee record not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Header />
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            {/* Employee Info Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Employee Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{employeeData.Employee_Name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="font-medium">{employeeData.Employee_ID}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{employeeData.Department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-medium">{employeeData.Designation}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Time Tracking</h2>
                <p className="text-gray-500">Track your time on projects and activities</p>
              </div>
              {activeEntry ? (
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-mono bg-gray-100 px-4 py-2 rounded">
                    {formatDuration(elapsedTime)}
                  </div>
                  <button 
                    onClick={stopTimer}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Stop Timer
                  </button>
                </div>
              ) : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                      Start Timer
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start New Timer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client
                        </label>
                        <select
                          value={selectedClient}
                          onChange={(e) => setSelectedClient(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Client</option>
                          {clients.map(client => (
                            <option key={client.Client_ID} value={client.Client_ID}>
                              {client.Client_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedClient && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project
                          </label>
                          <select
                            value={selectedProject || ''}
                            onChange={(e) => setSelectedProject(Number(e.target.value))}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select Project</option>
                            {projects.map(project => (
                              <option key={project.Project_ID} value={project.Project_ID}>
                                {project.Proj_Name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {selectedProject && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activity
                          </label>
                          <select
                            value={selectedActivity || ''}
                            onChange={(e) => setSelectedActivity(Number(e.target.value))}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select Activity</option>
                            {activities.map(activity => (
                              <option key={activity.Act_id} value={activity.Act_id}>
                                {activity.Act_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDialogOpen(false)}
                          className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={startTimer}
                          disabled={!selectedClient || !selectedProject || !selectedActivity}
                          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Start Timer
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Time Entries</h3>
                <div className="space-y-4">
                  {timeEntries.map(entry => (
                    <div key={entry.Act_Time_Track_ID} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{entry.project?.Proj_Name}</h4>
                          <p className="text-sm text-gray-500">{entry.activity?.Act_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono">
                            {formatDuration(calculateDuration(entry.Start_Time, entry.End_Time))}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.Start_Time).toLocaleString()}
                          </p>
                          {!entry.End_Time && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Running
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {timeEntries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No time entries found. Start tracking your time by clicking "Start Timer".
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
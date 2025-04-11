import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

interface Activity {
  Act_id: number;
  Act_name: string;
  Act_Dscr: string | null;
  Act_status: boolean;
}

interface Client {
  Client_ID: string;
  Client_name: string;
}

interface Employee {
  Emp_id: string;
  Emp_First_Name: string;
  Emp_Last_Name: string;
  Emp_Status: boolean;
}

interface Resource {
  employeeId: string;
  employeeName: string;
  hoursAllocated: number;
  skillNeeded: string;
}

interface ProjectActivity {
  activityId: number;
  activityName: string;
  hoursAllocated: number;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  resources: Resource[];
}

interface ProjectFormData {
  projectId: string;
  projName: string;
  projDescr: string;
  clientId: string;
  orgId: number;
  projStartDate: Date;
  projPlannedEndDate: Date;
  projActualEndDate: Date | null;
  projAddStreet1: string;
  projAddStreet2: string;
  projCity: string;
  projCounty: string;
  projState: string;
  projCountry: string;
  projZipcode: string;
  projCountyZone: string;
  projStatus: boolean;
  projProgressStatus: string;
  projFloorBuiltArea: string;
  projWallArea: string;
  projRoofArea: string;
  projScopeArea: string;
}

export const RegisterProject = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing;
  const existingProject = location.state?.projectData;
  
  const [formData, setFormData] = useState<ProjectFormData>({
    projectId: "",
    projName: "",
    projDescr: "",
    clientId: "",
    orgId: 1,
    projStartDate: new Date(),
    projPlannedEndDate: new Date(),
    projActualEndDate: null,
    projAddStreet1: "",
    projAddStreet2: "",
    projCity: "",
    projCounty: "",
    projState: "",
    projCountry: "",
    projZipcode: "",
    projCountyZone: "",
    projStatus: true,
    projProgressStatus: "Initiated",
    projFloorBuiltArea: "",
    projWallArea: "",
    projRoofArea: "",
    projScopeArea: ""
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projectActivities, setProjectActivities] = useState<ProjectActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [hoursAllocated, setHoursAllocated] = useState<number>(0);
  const [activityStartDate, setActivityStartDate] = useState<Date | null>(null);
  const [activityEndDate, setActivityEndDate] = useState<Date | null>(null);
  const [activityStatus, setActivityStatus] = useState<string>("Not Started");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resourcesDialogOpen, setResourcesDialogOpen] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [resourceHours, setResourceHours] = useState<number>(0);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const skills = [
    "Vertex BD",
    "Revit",
    "AutoCAD",
    "SketchUp",
    "3ds Max"
  ];

  useEffect(() => {
    fetchClients();
    fetchActivities();
    fetchEmployees();
    if (isEditing && existingProject) {
      setFormData({
        projectId: existingProject.Project_ID.toString(),
        projName: existingProject.Proj_Name,
        projDescr: existingProject.Proj_Descr || "",
        clientId: existingProject.Client_ID,
        orgId: existingProject.Org_ID,
        projStartDate: new Date(existingProject.Proj_Start_Date),
        projPlannedEndDate: new Date(existingProject.Proj_Planned_End_Date),
        projActualEndDate: existingProject.Proj_Actual_End_date ? new Date(existingProject.Proj_Actual_End_date) : null,
        projAddStreet1: existingProject.Proj_Add_Street1_1,
        projAddStreet2: existingProject.Proj_Add_Street2 || "",
        projCity: existingProject.Proj_City,
        projCounty: existingProject.Proj_County || "",
        projState: existingProject.Proj_State,
        projCountry: existingProject.Proj_Country,
        projZipcode: existingProject.Proj_Zipcode.toString(),
        projCountyZone: existingProject.Proj_County_Zone,
        projStatus: existingProject.Proj_Status,
        projProgressStatus: existingProject.Proj_Progress_Status,
        projFloorBuiltArea: existingProject.Proj_Floor_Built_Area?.toString() || "",
        projWallArea: existingProject.Proj_Wall_Area?.toString() || "",
        projRoofArea: existingProject.Proj_Roof_Area?.toString() || "",
        projScopeArea: existingProject.Proj_Scope_Area?.toString() || ""
      });
      fetchProjectActivities(existingProject.Project_ID);
    }
  }, [isEditing, existingProject]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'projFloorBuiltArea' || name === 'projWallArea' || 
        name === 'projRoofArea' || name === 'projScopeArea') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      const parts = numericValue.split('.');
      const sanitizedValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
      
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null, field: keyof ProjectFormData) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date
      }));
    }
  };

  const handleAddResource = () => {
    if (!selectedEmployee || resourceHours <= 0 || !selectedSkill) {
      setErrorMessage('Please fill in all resource fields');
      setErrorDialogOpen(true);
      return;
    }

    const employee = employees.find(e => e.Emp_id === selectedEmployee);
    if (!employee) return;

    // Calculate total allocated hours including the new resource
    const existingHours = resources.reduce((sum, r) => {
      if (editingResourceIndex !== null && r === resources[editingResourceIndex]) {
        return sum; // Skip the resource being edited
      }
      return sum + r.hoursAllocated;
    }, 0);
    
    const totalHours = existingHours + resourceHours;
    
    if (totalHours > hoursAllocated) {
      setErrorMessage(`Cannot add resource. Total resource hours (${totalHours}) would exceed activity hours (${hoursAllocated}).Already allocated hours are (${existingHours}) and available hours to be allocated are (${hoursAllocated - existingHours}).`);
      setErrorDialogOpen(true);
      return;
    }

    const newResource: Resource = {
      employeeId: selectedEmployee,
      employeeName: `${employee.Emp_First_Name} ${employee.Emp_Last_Name}`,
      hoursAllocated: resourceHours,
      skillNeeded: selectedSkill
    };

    if (editingResourceIndex !== null) {
      const updatedResources = [...resources];
      updatedResources[editingResourceIndex] = newResource;
      setResources(updatedResources);
      setEditingResourceIndex(null);
    } else {
      setResources(prevResources => [...prevResources, newResource]);
    }

    setSelectedEmployee("");
    setResourceHours(0);
    setSelectedSkill("");
    setErrorMessage("");
    setResourcesDialogOpen(false);
  };

  const handleEditResource = (index: number) => {
    const resource = resources[index];
    setSelectedEmployee(resource.employeeId);
    setResourceHours(resource.hoursAllocated);
    setSelectedSkill(resource.skillNeeded);
    setEditingResourceIndex(index);
    setResourcesDialogOpen(true);
  };

  const handleRemoveResource = (index: number) => {
    setResources(prevResources => prevResources.filter((_, i) => i !== index));
  };

  const handleAddActivity = async () => {
    if (!selectedActivity || hoursAllocated <= 0) {
      setError('Please select an activity and enter valid hours');
      return;
    }

    const activity = activities.find(a => a.Act_id === selectedActivity);
    if (!activity) return;

    // Validate total resource hours match activity hours
    const totalResourceHours = resources.reduce((sum, r) => sum + r.hoursAllocated, 0);
    if (totalResourceHours !== hoursAllocated) {
      setError(`Total resource hours (${totalResourceHours}) must equal activity hours (${hoursAllocated})`);
      return;
    }

    // Get the next Proj_Act_ID
    const { data: maxIdResult } = await supabase
      .from('Project_Activities')
      .select('Proj_Act_ID')
      .order('Proj_Act_ID', { ascending: false })
      .limit(1)
      .single();

    const nextProjActId = (maxIdResult?.Proj_Act_ID || 0) + 1;

    const newActivity: ProjectActivity = {
      activityId: selectedActivity,
      activityName: activity.Act_name,
      hoursAllocated,
      startDate: activityStartDate,
      endDate: activityEndDate,
      status: activityStatus,
      resources: resources,
      projActId: nextProjActId // Add this line
    };

    if (editingActivityIndex !== null) {
      const updatedActivities = [...projectActivities];
      updatedActivities[editingActivityIndex] = newActivity;
      setProjectActivities(updatedActivities);
      setEditingActivityIndex(null);
    } else {
      setProjectActivities([...projectActivities, newActivity]);
    }
    
    setSelectedActivity(null);
    setHoursAllocated(0);
    setActivityStartDate(null);
    setActivityEndDate(null);
    setActivityStatus("Not Started");
    setResources([]);
    setError(null);
    setDialogOpen(false);
  };

  const handleEditActivity = (index: number) => {
    const activity = projectActivities[index];
    setSelectedActivity(activity.activityId);
    setHoursAllocated(activity.hoursAllocated);
    setActivityStartDate(activity.startDate);
    setActivityEndDate(activity.endDate);
    setActivityStatus(activity.status);
    setResources(activity.resources);
    setEditingActivityIndex(index);
    setDialogOpen(true);
  };

  const handleRemoveActivity = (activityId: number) => {
    setProjectActivities(projectActivities.filter(pa => pa.activityId !== activityId));
  };

  const validateForm = () => {
    if (!formData.projName) {
      setError('Project name is required');
      return false;
    }
    if (!formData.clientId) {
      setError('Client is required');
      return false;
    }
    if (!formData.projAddStreet1) {
      setError('Street address is required');
      return false;
    }
    if (!formData.projCity) {
      setError('City is required');
      return false;
    }
    if (!formData.projState) {
      setError('State is required');
      return false;
    }
    if (!formData.projCountry) {
      setError('Country is required');
      return false;
    }
    if (!formData.projZipcode) {
      setError('ZIP code is required');
      return false;
    }
    if (!formData.projCountyZone) {
      setError('County zone is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setLoading(true);
      setError(null);

      let projectId: number;
      if (!isEditing) {
        const { data: maxIdResult } = await supabase
          .from('Projects')
          .select('Project_ID')
          .order('Project_ID', { ascending: false })
          .limit(1)
          .maybeSingle();

        projectId = (maxIdResult?.Project_ID || 0) + 1;
      } else {
        projectId = parseInt(formData.projectId);
      }

      const projectData = {
        Project_ID: projectId,
        Proj_Name: formData.projName,
        Proj_Descr: formData.projDescr,
        Client_ID: formData.clientId,
        Org_ID: formData.orgId,
        Proj_Start_Date: formData.projStartDate.toISOString().split('T')[0],
        Proj_Planned_End_Date: formData.projPlannedEndDate.toISOString().split('T')[0],
        Proj_Actual_End_date: formData.projActualEndDate?.toISOString().split('T')[0] || null,
        Proj_Add_Street1_1: formData.projAddStreet1,
        Proj_Add_Street2: formData.projAddStreet2,
        Proj_City: formData.projCity,
        Proj_County: formData.projCounty,
        Proj_State: formData.projState,
        Proj_Country: formData.projCountry,
        Proj_Zipcode: parseInt(formData.projZipcode),
        Proj_County_Zone: formData.projCountyZone,
        Proj_Status: formData.projStatus,
        Proj_Progress_Status: formData.projProgressStatus,
        Proj_Floor_Built_Area: formData.projFloorBuiltArea ? parseFloat(formData.projFloorBuiltArea) : null,
        Proj_Wall_Area: formData.projWallArea ? parseFloat(formData.projWallArea) : null,
        Proj_Roof_Area: formData.projRoofArea ? parseFloat(formData.projRoofArea) : null,
        Proj_Scope_Area: formData.projScopeArea ? parseFloat(formData.projScopeArea) : null
      };

      if (isEditing) {
        // First, fetch all existing project activities to get their IDs
        const { data: existingActivities } = await supabase
          .from('Project_Activities')
          .select('Proj_Act_ID')
          .eq('Project_ID', projectId);

        if (existingActivities) {
          // Delete all resources for these activities first
          for (const activity of existingActivities) {
            const { error: deleteResourcesError } = await supabase
              .from('Project_Activity_Resources')
              .delete()
              .eq('Proj_Act_ID', activity.Proj_Act_ID);

            if (deleteResourcesError) throw deleteResourcesError;
          }
        }

        // Now it's safe to delete the activities
        const { error: deleteActivitiesError } = await supabase
          .from('Project_Activities')
          .delete()
          .eq('Project_ID', projectId);

        if (deleteActivitiesError) throw deleteActivitiesError;

        // Update the project
        const { error: updateError } = await supabase
          .from('Projects')
          .update(projectData)
          .eq('Project_ID', projectId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('Projects')
          .insert([projectData]);

        if (insertError) throw insertError;
      }

      // Insert new activities and resources
      if (projectActivities.length > 0) {
        for (const pa of projectActivities) {
          const { data: activityData, error: activityError } = await supabase
            .from('Project_Activities')
            .insert([{
              Project_ID: projectId,
              Act_id: pa.activityId,
              Activity_Name: pa.activityName,
              Total_Time_Allotted: pa.hoursAllocated.toString(),
              Activity_Start_Date: pa.startDate?.toISOString().split('T')[0],
              Acitivity_End_Date: pa.endDate?.toISOString().split('T')[0],
              Activity_Work_Status: pa.status,
              Org_ID: formData.orgId,
              Client_ID: formData.clientId
            }])
            .select()
            .single();

          if (activityError) throw activityError;

          if (pa.resources.length > 0 && activityData) {
            const { data: maxResourceId } = await supabase
              .from('Project_Activity_Resources')
              .select('Proj_Act_Resource_ID')
              .order('Proj_Act_Resource_ID', { ascending: false })
              .limit(1)
              .maybeSingle();

            let nextResourceId = (maxResourceId?.Proj_Act_Resource_ID || 0) + 1;

            const resourcesData = pa.resources.map(resource => {
              const resourceId = nextResourceId++;
              return {
                Proj_Act_Resource_ID: resourceId,
                Project_name: formData.projName,
                Activity_Name: pa.activityName,
                Emp_Name: resource.employeeName,
                Skill_Name: resource.skillNeeded,
                Hours_Allotted: `${Math.floor(resource.hoursAllocated)}:00:00`,
                Hours_Actual: null,
                Org_ID: formData.orgId,
                Client_ID: formData.clientId,
                Project_ID: projectId,
                Proj_Act_ID: activityData.Proj_Act_ID
              };
            });

            const { error: resourcesError } = await supabase
              .from('Project_Activity_Resources')
              .insert(resourcesData);

            if (resourcesError) throw resourcesError;
          }
        }
      }

      navigate('/project-list');
    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('Clients')
        .select('Client_ID, Client_name')
        .eq('Client_Status', true);
      
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('Activities')
        .select('*')
        .eq('Act_status', true);
      
      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('Employees')
        .select('*')
        .eq('Emp_Status', true);
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchProjectActivities = async (projectId: number) => {
    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('Project_Activities')
        .select('*')
        .eq('Project_ID', projectId);

      if (activitiesError) throw activitiesError;

      const activities: ProjectActivity[] = [];

      for (const activity of activitiesData || []) {
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('Project_Activity_Resources')
          .select('*')
          .eq('Project_ID', projectId)
          .eq('Activity_Name', activity.Activity_Name);

        if (resourcesError) throw resourcesError;

        const resources: Resource[] = (resourcesData || []).map(resource => ({
          employeeId: resource.Emp_ID || '',
          employeeName: resource.Emp_Name,
          hoursAllocated: parseInt(resource.Hours_Allotted.split(':')[0]),
          skillNeeded: resource.Skill_Name
        }));

        activities.push({
          activityId: activity.Act_id,
          activityName: activity.Activity_Name,
          hoursAllocated: parseInt(activity.Total_Time_Allotted),
          startDate: activity.Activity_Start_Date ? new Date(activity.Activity_Start_Date) : null,
          endDate: activity.Acitivity_End_Date ? new Date(activity.Acitivity_End_Date) : null,
          status: activity.Activity_Work_Status || 'Not Started',
          resources
        });
      }

      setProjectActivities(activities);
    } catch (err) {
      console.error('Error fetching project activities:', err);
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
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit Project' : 'Register New Project'}
                </h2>
                <p className="text-gray-500 mt-1">
                  Organization ID: #{formData.orgId}
                </p>
              </div>
              <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                Admin Only
              </div>
            </div>
            <p className="text-gray-500 mb-8">
              {isEditing ? 'Update project information' : 'Add a new project to the system'}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name*
                    </label>
                    <input
                      type="text"
                      name="projName"
                      value={formData.projName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client*
                    </label>
                    <select
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client.Client_ID} value={client.Client_ID}>
                          {client.Client_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Description
                    </label>
                    <textarea
                      name="projDescr"
                      value={formData.projDescr}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Project Dates</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date*
                    </label>
                    <DatePicker
                      selected={formData.projStartDate}
                      onChange={(date) => handleDateChange(date, 'projStartDate')}
                      className="w-full p-2 border rounded-md"
                      dateFormat="MM/dd/yyyy"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planned End Date*
                    </label>
                    <DatePicker
                      selected={formData.projPlannedEndDate}
                      onChange={(date) => handleDateChange(date, 'projPlannedEndDate')}
                      className="w-full p-2 border rounded-md"
                      dateFormat="MM/dd/yyyy"
                      minDate={formData.projStartDate}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual End Date
                    </label>
                    <DatePicker
                      selected={formData.projActualEndDate}
                      onChange={(date) => handleDateChange(date, 'projActualEndDate')}
                      className="w-full p-2 border rounded-md"
                      dateFormat="MM/dd/yyyy"
                      minDate={formData.projStartDate}
                      isClearable
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Project Status</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progress Status
                    </label>
                    <select
                      name="projProgressStatus"
                      value={formData.projProgressStatus}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Initiated">Initiated</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Active Status</span>
                      <div 
                        className={`w-12 h-6 ${formData.projStatus ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors duration-200`}
                        onClick={() => setFormData(prev => ({ ...prev, projStatus: !prev.projStatus }))}
                      >
                        <div className={`absolute ${formData.projStatus ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Project Location</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address 1*
                    </label>
                    <input
                      type="text"
                      name="projAddStreet1"
                      value={formData.projAddStreet1}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address 2
                    </label>
                    <input
                      type="text"
                      name="projAddStreet2"
                      value={formData.projAddStreet2}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      name="projCity"
                      value={formData.projCity}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County
                    </label>
                    <input
                      type="text"
                      name="projCounty"
                      value={formData.projCounty}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State*
                    </label>
                    <input
                      type="text"
                      name="projState"
                      value={formData.projState}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country*
                    </label>
                    <input
                      type="text"
                      name="projCountry"
                      value={formData.projCountry}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code*
                    </label>
                    <input
                      type="text"
                      name="projZipcode"
                      value={formData.projZipcode}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County Zone*
                    </label>
                    <input
                      type="text"
                      name="projCountyZone"
                      value={formData.projCountyZone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Project Measurements</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Built Up Area (Sft)
                    </label>
                    <input
                      type="text"
                      name="projFloorBuiltArea"
                      value={formData.projFloorBuiltArea}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter floor area in square feet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wall Area (Sft)
                    </label>
                    <input
                      type="text"
                      name="projWallArea"
                      value={formData.projWallArea}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter wall area in square feet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roof Area (Sft)
                    </label>
                    <input
                      type="text"
                      name="projRoofArea"
                      value={formData.projRoofArea}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter roof area in square feet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scope Area (Sft)
                    </label>
                    <input
                      type="text"
                      name="projScopeArea"
                      value={formData.projScopeArea}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter scope area in square feet"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Project Activities</h3>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                      >
                        Add Activity
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingActivityIndex !== null ? 'Edit Activity' : 'Add New Activity'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="grid grid-cols-6 gap-4">
                          <div className="col-span-2">
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

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Hours
                            </label>
                            <input
                              type="number"
                              value={hoursAllocated}
                              onChange={(e) => setHoursAllocated(Number(e.target.value))}
                              className="w-full p-2 border rounded-md"
                              min="0"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <DatePicker
                              selected={activityStartDate}
                              onChange={setActivityStartDate}
                              className="w-full p-2 border rounded-md"
                              dateFormat="MM/dd/yyyy"
                              minDate={formData.projStartDate}
                              maxDate={formData.projPlannedEndDate}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <DatePicker
                              selected={activityEndDate}
                              onChange={setActivityEndDate}
                              className="w-full p-2 border rounded-md"
                              dateFormat="MM/dd/yyyy"
                              minDate={activityStartDate || formData.projStartDate}
                              maxDate={formData.projPlannedEndDate}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={activityStatus}
                              onChange={(e) => setActivityStatus(e.target.value)}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="On Hold">On Hold</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Resources
                            </label>
                            <Dialog open={resourcesDialogOpen} onOpenChange={setResourcesDialogOpen}>
                              <DialogTrigger asChild>
                                <button
                                  type="button"
                                  className="px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800"
                                >
                                  Add Resource
                                </button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {editingResourceIndex !== null ? 'Edit Resource' : 'Add New Resource'}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Employee
                                    </label>
                                    <select
                                      value={selectedEmployee}
                                      onChange={(e) => setSelectedEmployee(e.target.value)}
                                      className="w-full p-2 border rounded-md"
                                    >
                                      <option value="">Select Employee</option>
                                      {employees.map(employee => (
                                        <option key={employee.Emp_id} value={employee.Emp_id}>
                                          {`${employee.Emp_First_Name} ${employee.Emp_Last_Name}`}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Hours
                                    </label>
                                    <input
                                      type="number"
                                      value={resourceHours}
                                      onChange={(e) => setResourceHours(Number(e.target.value))}
                                      className="w-full p-2 border rounded-md"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Skill Required
                                    </label>
                                    <select
                                      value={selectedSkill}
                                      onChange={(e) => setSelectedSkill(e.target.value)}
                                      className="w-full p-2 border rounded-md"
                                    >
                                      <option value="">Select Skill</option>
                                      {skills.map(skill => (
                                        <option key={skill} value={skill}>
                                          {skill}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setResourcesDialogOpen(false);
                                      setEditingResourceIndex(null);
                                      setSelectedEmployee("");
                                      setResourceHours(0);
                                      setSelectedSkill("");
                                    }}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleAddResource}
                                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                                  >
                                    {editingResourceIndex !== null ? 'Update' : 'Add'}
                                  </button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          {/* Resources List */}
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {resources.map((resource, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                              >
                                <div>
                                  <p className="font-medium">{resource.employeeName}</p>
                                  <p className="text-sm text-gray-500">
                                    {resource.skillNeeded} • {resource.hoursAllocated} hours
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEditResource(index)}
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveResource(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                            {resources.length === 0 && (
                              <p className="text-gray-500 text-sm text-center py-2">
                                No resources added yet
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                          <button
                            type="button"
                            onClick={() => {
                              setDialogOpen(false);
                              if (editingActivityIndex === null) {
                                setSelectedActivity(null);
                                setHoursAllocated(0);
                                setActivityStartDate(null);
                                setActivityEndDate(null);
                                setActivityStatus("Not Started");
                                setResources([]);
                              }
                            }}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddActivity}
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                          >
                            {editingActivityIndex !== null ? 'Update Activity' : 'Add Activity'}
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-4">
                  {projectActivities.map((activity, index) => (
                    <div
                      key={activity.activityId}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-2">
                            <h4 className="font-medium">{activity.activityName}</h4>
                            <p className="text-sm text-gray-500">{activity.hoursAllocated} hours total</p>
                          </div>
                          <div className="col-span-4 text-sm">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Start:</span>
                                <span>{activity.startDate?.toLocaleDateString() || 'Not set'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">End:</span>
                                <span>{activity.endDate?.toLocaleDateString() || 'Not set'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              activity.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              activity.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                          <div className="col-span-3">
                            {activity.resources.map((resource, idx) => (
                              <div key={idx} className="text-sm">
                                {resource.employeeName} ({resource.skillNeeded}, {resource.hoursAllocated}h)
                              </div>
                            ))}
                          </div>
                          <div className="col-span-1 flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleEditActivity(index)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveActivity(activity.activityId)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {projectActivities.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No activities added yet. Click "Add Activity" to get started.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/project-list')}
                  className="px-6 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2 bg-black text-white rounded-md ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                  }`}
                >
                  {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>

          <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-red-600">Resource Allocation Error</DialogTitle>
              </DialogHeader>
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                {errorMessage}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setErrorDialogOpen(false)}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};
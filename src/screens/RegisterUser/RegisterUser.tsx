import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";

interface EmployeeFormData {
  empId: string;
  empFirstName: string;
  empLastName: string;
  empEmail: string;
  empPhone: string;
  empDateJoined: Date | null;
  empStreet1: string;
  empStreet2: string;
  empCity: string;
  empState: string;
  empCountry: string;
  empZipcode: string;
  empWorkingShift: string;
  empStatus: boolean;
  empDateTermination: Date | null;
  orgId: number;
  empAadharNum: string;
  roleId: number | null;
  selectedSkills: SelectedSkill[];
}

interface SelectedSkill {
  skillId: number;
  skillName: string;
  proficiency: string;
}

interface Skill {
  Skill_ID: number;
  Skill_Name: string;
  Skill_Type: string;
}

interface Role {
  Role_ID: number;
  Role_Name: string;
  Role_Descr: string;
}

export const RegisterUser = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing;
  const existingEmployee = location.state?.employeeData;
  const [skillToRemove, setSkillToRemove] = useState<number | null>(null);

  const [formData, setFormData] = useState<EmployeeFormData>({
    empId: "",
    empFirstName: "",
    empLastName: "",
    empEmail: "",
    empPhone: "",
    empDateJoined: new Date(),
    empStreet1: "",
    empStreet2: "",
    empCity: "",
    empState: "",
    empCountry: "",
    empZipcode: "",
    empWorkingShift: "",
    empStatus: true,
    empDateTermination: null,
    orgId: 1,
    empAadharNum: "",
    roleId: null,
    selectedSkills: []
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextEmployeeId, setNextEmployeeId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [selectedProficiency, setSelectedProficiency] = useState<string>('Intermediate');
  const [isEditingSkill, setIsEditingSkill] = useState(false);

  const proficiencyLevels = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' }
  ];

  useEffect(() => {
    fetchRoles();
    fetchSkills();
    if (isEditing && existingEmployee) {
      setFormData({
        empId: existingEmployee.Emp_id || "",
        empFirstName: existingEmployee.Emp_First_Name || "",
        empLastName: existingEmployee.Emp_Last_Name || "",
        empEmail: existingEmployee.Emp_email || "",
        empPhone: existingEmployee.Emp_Phone || "",
        empDateJoined: existingEmployee.Emp_Date_Joined ? new Date(existingEmployee.Emp_Date_Joined) : new Date(),
        empStreet1: existingEmployee.Emp_Street_1 || "",
        empStreet2: existingEmployee.Emp_Street_2 || "",
        empCity: existingEmployee.Emp_City || "",
        empState: existingEmployee.Emp_State || "",
        empCountry: existingEmployee.Emp_Country || "",
        empZipcode: existingEmployee.Emp_Zipcode || "",
        empWorkingShift: existingEmployee.Emp_working_shift || "",
        empStatus: existingEmployee.Emp_Status ?? true,
        empDateTermination: existingEmployee.Emp_Date_Termination ? new Date(existingEmployee.Emp_Date_Termination) : null,
        orgId: existingEmployee.Org_ID || 1,
        empAadharNum: existingEmployee.Emp_Aadhar_Num?.toString() || "",
        roleId: existingEmployee.Role_ID || null,
        selectedSkills: []
      });
      fetchEmployeeSkills(existingEmployee.Emp_id);
    } else {
      generateNextEmployeeId();
    }
  }, [isEditing, existingEmployee]);

  const fetchRoles = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Roles')
        .select('*')
        .eq('Role_Status', true)
        .order('Role_Name');

      if (fetchError) throw fetchError;
      setRoles(data || []);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles');
    }
  };

  const fetchSkills = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Skills')
        .select('*')
        .order('Skill_Name');

      if (fetchError) throw fetchError;
      setSkills(data || []);
    } catch (err: any) {
      console.error('Error fetching skills:', err);
      setError('Failed to load skills');
    }
  };

  const fetchEmployeeSkills = async (employeeId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Employees_Skills')
        .select('*')
        .eq('Emp_ID', employeeId);

      if (fetchError) throw fetchError;
      
      if (data) {
        const selectedSkills = data.map(es => ({
          skillId: es.Skill_ID,
          skillName: es.Skill_Name,
          proficiency: es.Emp_Skill_Proficiency
        }));
        setFormData(prev => ({ ...prev, selectedSkills }));
      }
    } catch (err: any) {
      console.error('Error fetching employee skills:', err);
      setError('Failed to load employee skills');
    }
  };

  const generateNextEmployeeId = async () => {
    try {
      const { data, error } = await supabase
        .from('Employees')
        .select('Emp_id')
        .order('Emp_id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && !error.message.includes('No rows found')) {
        throw error;
      }

      let nextId = 'EMP001';
      if (data?.Emp_id) {
        const numericPart = parseInt(data.Emp_id.replace('EMP', ''));
        nextId = `EMP${String(numericPart + 1).padStart(3, '0')}`;
      }

      setNextEmployeeId(nextId);
      setFormData(prev => ({ ...prev, empId: nextId }));
    } catch (err) {
      console.error('Error generating employee ID:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'empAadharNum') {
      const numericValue = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      
      if (numericValue.length > 0 && numericValue.length !== 12) {
        setValidationErrors(prev => ({
          ...prev,
          empAadharNum: 'Aadhaar number must be exactly 12 digits'
        }));
      } else {
        setValidationErrors(prev => {
          const { empAadharNum, ...rest } = prev;
          return rest;
        });
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null, field: 'empDateJoined' | 'empDateTermination') => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleToggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      empStatus: !prev.empStatus
    }));
  };

  const handleAddSkill = () => {
    if (!selectedSkill || !selectedProficiency) {
      setError('Please select a skill and proficiency level');
      return;
    }

    const skill = skills.find(s => s.Skill_ID === selectedSkill);
    if (!skill) {
      setError('Selected skill not found');
      return;
    }

    const newSkill: SelectedSkill = {
      skillId: selectedSkill,
      skillName: skill.Skill_Name,
      proficiency: selectedProficiency
    };

    setFormData(prev => ({
      ...prev,
      selectedSkills: [...prev.selectedSkills, newSkill]
    }));

    // Reset form
    setSelectedSkill(null);
    setSelectedProficiency('Intermediate');
    setSkillsDialogOpen(false);
    setError(null);
    setIsEditingSkill(false);
  };

  const handleEditSkill = (skill: SelectedSkill) => {
    setSelectedSkill(skill.skillId);
    setSelectedProficiency(skill.proficiency);
    setIsEditingSkill(true);
    setSkillsDialogOpen(true);
  };

  const handleRemoveSkill = async (skillId: number) => {
    setSkillToRemove(skillId);
  };

  const confirmRemoveSkill = async () => {
    if (skillToRemove === null) return;
    
    try {
      setError(null);
      
      if (isEditing && existingEmployee) {
        // Remove from database if we're editing an existing employee
        const { error: deleteError } = await supabase
          .from('Employees_Skills')
          .delete()
          .eq('Emp_ID', existingEmployee.Emp_id)
          .eq('Skill_ID', skillToRemove);

        if (deleteError) throw deleteError;
      }

      // Remove from local state
      setFormData(prev => ({
        ...prev,
        selectedSkills: prev.selectedSkills.filter(s => s.skillId !== skillToRemove)
      }));
      
      setSkillToRemove(null);
    } catch (err: any) {
      console.error('Error removing skill:', err);
      setError('Failed to remove skill. Please try again.');
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.empFirstName.trim()) errors.empFirstName = 'First name is required';
    if (!formData.empLastName.trim()) errors.empLastName = 'Last name is required';
    if (!formData.empEmail.trim()) errors.empEmail = 'Email is required';
    if (!formData.roleId) errors.roleId = 'Role is required';
    
    if (!formData.empStreet1.trim()) errors.empStreet1 = 'Street address is required';
    if (!formData.empCity.trim()) errors.empCity = 'City is required';
    if (!formData.empState.trim()) errors.empState = 'State is required';
    if (!formData.empCountry.trim()) errors.empCountry = 'Country is required';
    if (!formData.empZipcode.trim()) errors.empZipcode = 'ZIP code is required';

    if (formData.empAadharNum && formData.empAadharNum.length !== 12) {
      errors.empAadharNum = 'Aadhaar number must be exactly 12 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before submitting');
        return;
      }

      setLoading(true);
      setError(null);

      const employeeData = {
        Emp_id: formData.empId,
        Emp_First_Name: formData.empFirstName,
        Emp_Last_Name: formData.empLastName,
        Emp_email: formData.empEmail,
        Emp_Phone: formData.empPhone,
        Emp_Date_Joined: formData.empDateJoined?.toISOString().split('T')[0],
        Emp_Street_1: formData.empStreet1,
        Emp_Street_2: formData.empStreet2,
        Emp_City: formData.empCity,
        Emp_State: formData.empState,
        Emp_Country: formData.empCountry,
        Emp_Zipcode: formData.empZipcode,
        Emp_working_shift: formData.empWorkingShift,
        Emp_Status: formData.empStatus,
        Emp_Date_Termination: formData.empDateTermination?.toISOString().split('T')[0] || null,
        Org_ID: formData.orgId,
        Emp_Aadhar_Num: formData.empAadharNum ? formData.empAadharNum : null,
        Role_ID: formData.roleId
      };

      let result;
      
      if (isEditing && existingEmployee) {
        result = await supabase
          .from('Employees')
          .update(employeeData)
          .eq('Emp_id', existingEmployee.Emp_id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('Employees')
          .insert([employeeData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Handle skills
      if (isEditing) {
        // Delete all existing skills first
        const { error: deleteError } = await supabase
          .from('Employees_Skills')
          .delete()
          .eq('Emp_ID', formData.empId);

        if (deleteError) throw deleteError;
      }

      // Insert new skills
      if (formData.selectedSkills.length > 0) {
        const skillsData = formData.selectedSkills.map((skill, index) => ({
          Emp_Skill_ID: Date.now() + index,
          Emp_ID: formData.empId,
          Emp_Name: `${formData.empFirstName} ${formData.empLastName}`,
          Skill_ID: skill.skillId,
          Skill_Name: skill.skillName,
          Emp_Skill_Proficiency: skill.proficiency,
          Org_ID: formData.orgId
        }));

        const { error: skillsError } = await supabase
          .from('Employees_Skills')
          .insert(skillsData);

        if (skillsError) throw skillsError;
      }

      // Refresh employee skills data if we're editing
      if (isEditing) {
        await fetchEmployeeSkills(formData.empId);
      }

      // Navigate back with success state
      navigate('/user-list', { 
        state: { 
          success: true, 
          message: `User ${isEditing ? 'updated' : 'created'} successfully` 
        }
      });
    } catch (err: any) {
      console.error('Error saving employee:', err);
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
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit User' : 'Register New User'}
                </h2>
                <p className="text-gray-500 mt-1">
                  Organization ID: #{formData.orgId}
                </p>
              </div>
              <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                HR Only
              </div>
            </div>
            <p className="text-gray-500 mb-8">
              {isEditing ? 'Update user information' : 'Add a new user to the system'}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID*
                      {!isEditing && (
                        <span className="text-gray-500 text-xs ml-2">
                          (Auto-generated if left empty)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="empId"
                      value={formData.empId}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md font-mono"
                      placeholder={nextEmployeeId || "Enter employee ID"}
                      disabled={isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role*
                    </label>
                    <select
                      name="roleId"
                      value={formData.roleId || ""}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.roleId ? 'border-red-500' : ''
                      }`}
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.Role_ID} value={role.Role_ID}>
                          {role.Role_Name}
                          {role.Role_Descr && ` - ${role.Role_Descr}`}
                        </option>
                      ))}
                    </select>
                    {validationErrors.roleId && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.roleId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="empFirstName"
                      value={formData.empFirstName}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.empFirstName ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.empFirstName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.empFirstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="empLastName"
                      value={formData.empLastName}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.empLastName ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.empLastName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.empLastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="empEmail"
                      value={formData.empEmail}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.empEmail ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.empEmail && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.empEmail}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="empPhone"
                      value={formData.empPhone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      name="empAadharNum"
                      value={formData.empAadharNum}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.empAadharNum ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength={12}
                    />
                    {validationErrors.empAadharNum && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.empAadharNum}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Skills</h3>
                  <Dialog open={skillsDialogOpen} onOpenChange={setSkillsDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                      >
                        Add Skill
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Skill</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skill
                          </label>
                          <select
                            value={selectedSkill || ''}
                            onChange={(e) => setSelectedSkill(Number(e.target.value))}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select Skill</option>
                            {skills
                              .filter(skill => !formData.selectedSkills.some(s => s.skillId === skill.Skill_ID))
                              .map(skill => (
                                <option key={skill.Skill_ID} value={skill.Skill_ID}>
                                  {skill.Skill_Name} ({skill.Skill_Type})
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Proficiency Level
                          </label>
                          <select
                            value={selectedProficiency}
                            onChange={(e) => setSelectedProficiency(e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            {proficiencyLevels.map(level => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Show current skills */}
                        {formData.selectedSkills.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Current Skills
                            </label>
                            <div className="space-y-2 bg-gray-50 p-2 rounded-md">
                              {formData.selectedSkills.map((skill) => (
                                <div key={skill.skillId} className="text-sm text-gray-600">
                                  {skill.skillName} - {skill.proficiency}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSkillsDialogOpen(false);
                              setSelectedSkill(null);
                              setSelectedProficiency('Intermediate');
                              setError(null);
                              setIsEditingSkill(false);
                            }}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                          >
                            {isEditingSkill ? 'Update Skill' : 'Add Skill'}
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {formData.selectedSkills.map((skill) => (
                    <div
                      key={skill.skillId}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="font-medium">{skill.skillName}</p>
                        <p className="text-sm text-gray-500">
                          Proficiency: {skill.proficiency}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSkill(skill)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.skillId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.selectedSkills.length === 0 && (
                    <p className="text-gray-500 text-sm">No skills added yet. Click "Add Skill" to add skills.</p>
                  )}
                </div>

                {/* Add confirmation dialog */}
                <Dialog open={skillToRemove !== null} onOpenChange={() => setSkillToRemove(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove Skill</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>Are you sure you want to remove this skill?</p>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSkillToRemove(null)}
                          className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={confirmRemoveSkill}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address 1*
                    </label>
                    <input
                      type="text"
                      name="empStreet1"
                      value={formData.empStreet1}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.empStreet1 ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.empStreet1 && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.empStreet1}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address 2
                    </label>
                    <input
                      type="text"
                      name="empStreet2"
                      value={formData.empStreet2}
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
                      name="empCity"
                      value={formData.empCity}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.empCity ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.empCity && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.empCity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State*
                    </label>
                    <input
                      type="text"
                      name="empState"
                      value={formData.empState}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.empState ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.empState && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.empState}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country*
                    </label>
                    <input
                      type="text"
                      name="empCountry"
                      value={formData.empCountry}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.empCountry ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.empCountry && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.empCountry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code*
                    </label>
                    <input
                      type="text"
                      name="empZipcode"
                      value={formData.empZipcode}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.empZipcode ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.empZipcode && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.empZipcode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Joined
                    </label>
                    <DatePicker
                      selected={formData.empDateJoined}
                      onChange={(date) => handleDateChange(date, 'empDateJoined')}
                      className="w-full p-2 border rounded-md"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Working Shift
                    </label>
                    <input
                      type="text"
                      name="empWorkingShift"
                      value={formData.empWorkingShift}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Day Shift, Night Shift"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleToggleStatus}
                        className={`px-4 py-2 rounded-md ${
                          formData.empStatus
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {formData.empStatus ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                  {!formData.empStatus && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Termination Date
                      </label>
                      <DatePicker
                        selected={formData.empDateTermination}
                        onChange={(date) => handleDateChange(date, 'empDateTermination')}
                        className="w-full p-2 border rounded-md"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/user-list')}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
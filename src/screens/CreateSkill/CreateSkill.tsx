import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface SkillFormData {
  skillId: string;
  skillName: string;
  skillDescription: string;
  skillType: string;
  orgId: number;
}

export const CreateSkill = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing;
  const existingSkill = location.state?.skillData;

  const [formData, setFormData] = useState<SkillFormData>({
    skillId: "",
    skillName: "",
    skillDescription: "",
    skillType: "",
    orgId: 1 // Default organization ID
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skillTypes = [
    { value: "REVIT", label: "Autodesk Revit" },
    { value: "VERTEX", label: "Vertex Systems BD" },
    { value: "STRUCSOFT", label: "StrucSoft" },
    { value: "FRAMECAD", label: "FRAMECAD" },
    { value: "SCOTTSDALE", label: "Scottsdale Construction Systems" },
    { value: "MWF", label: "MWF Advance Metal" }
  ];

  useEffect(() => {
    if (isEditing && existingSkill) {
      setFormData({
        skillId: existingSkill.Skill_ID.toString(),
        skillName: existingSkill.Skill_Name,
        skillDescription: existingSkill.Skill_Descr || "",
        skillType: existingSkill.Skill_Type,
        orgId: existingSkill.Org_ID
      });
    } else {
      generateNextSkillId();
    }
  }, [isEditing, existingSkill]);

  const generateNextSkillId = async () => {
    try {
      const { data, error } = await supabase
        .from('Skills')
        .select('Skill_ID')
        .order('Skill_ID', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && !error.message.includes('No rows found')) {
        throw error;
      }

      const nextId = (data?.Skill_ID || 0) + 1;
      setFormData(prev => ({ ...prev, skillId: nextId.toString() }));
    } catch (err: any) {
      console.error('Error generating skill ID:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.skillName.trim()) {
      setError('Skill name is required');
      return false;
    }
    if (!formData.skillType.trim()) {
      setError('Skill type is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setLoading(true);
      setError(null);

      const skillData = {
        Skill_ID: parseInt(formData.skillId),
        Skill_Name: formData.skillName,
        Skill_Descr: formData.skillDescription || null,
        Skill_Type: formData.skillType,
        Org_ID: formData.orgId
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('Skills')
          .update(skillData)
          .eq('Skill_ID', existingSkill.Skill_ID);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('Skills')
          .insert([skillData]);

        if (insertError) throw insertError;
      }

      navigate('/skills');
    } catch (err: any) {
      console.error('Error saving skill:', err);
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
                  {isEditing ? 'Edit Skill' : 'Create Skill'}
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
              {isEditing ? 'Update skill information' : 'Add a new skill to the system'}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Skill Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Name*
                    </label>
                    <input
                      type="text"
                      name="skillName"
                      value={formData.skillName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Type*
                    </label>
                    <select
                      name="skillType"
                      value={formData.skillType}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Type</option>
                      {skillTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="skillDescription"
                      value={formData.skillDescription}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => navigate('/skills')}
                  className="px-6 py-2 border rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Skill' : 'Create Skill')}
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
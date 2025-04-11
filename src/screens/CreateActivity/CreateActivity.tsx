import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface ActivityFormData {
  actId: string;
  actName: string;
  actDescription: string;
  actStatus: boolean;
  orgId: number;
}

export const CreateActivity = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing;
  const existingActivity = location.state?.activityData;
  
  const [formData, setFormData] = useState<ActivityFormData>({
    actId: "",
    actName: "",
    actDescription: "",
    actStatus: true,
    orgId: 1 // Default organization ID
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextAvailableId, setNextAvailableId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && existingActivity) {
      setFormData({
        actId: existingActivity.Act_id.toString(),
        actName: existingActivity.Act_name || "",
        actDescription: existingActivity.Act_Dscr || "",
        actStatus: existingActivity.Act_status ?? true,
        orgId: existingActivity.Org_ID || 1
      });
    } else {
      generateNextActivityId();
    }
  }, [isEditing, existingActivity]);

  const generateNextActivityId = async () => {
    try {
      const { data: maxIdResult, error: maxIdError } = await supabase
        .from('Activities')
        .select('Act_id')
        .order('Act_id', { ascending: false })
        .limit(1)
        .single();

      if (maxIdError && !maxIdError.message.includes('No rows found')) {
        throw maxIdError;
      }

      const nextId = maxIdResult ? maxIdResult.Act_id + 1 : 1;
      const formattedId = `Activity${String(nextId).padStart(4, '0')}`;
      setNextAvailableId(formattedId);
      setFormData(prev => ({
        ...prev,
        actId: formattedId
      }));
    } catch (err) {
      console.error('Error generating activity ID:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      actStatus: !prev.actStatus
    }));
  };

  const validateForm = () => {
    if (!formData.actName.trim()) {
      setError('Activity name is required');
      return false;
    }
    if (!formData.actId.trim()) {
      setError('Activity ID is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setLoading(true);
      setError(null);

      const activityData = {
        Act_id: parseInt(formData.actId.replace('Activity', '')),
        Act_name: formData.actName,
        Act_Dscr: formData.actDescription || null,
        Act_status: formData.actStatus,
        Org_ID: formData.orgId
      };

      let result;
      
      if (isEditing && existingActivity) {
        result = await supabase
          .from('Activities')
          .update(activityData)
          .eq('Act_id', existingActivity.Act_id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('Activities')
          .insert([activityData])
          .select()
          .single();
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      navigate('/view-activities');
    } catch (err: any) {
      console.error('Error saving activity:', err);
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
            onClick={() => navigate('/view-activities')}
            className="mb-6 text-gray-600 flex items-center gap-2 hover:text-gray-800 transition-colors duration-200"
          >
            ← Back to Activities
          </button>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit Activity' : 'Create Activity'}
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
              {isEditing ? 'Update activity information' : 'Add a new activity to the system'}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Activity Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity ID
                    </label>
                    <input
                      type="text"
                      name="actId"
                      value={formData.actId}
                      className="w-full p-2 border rounded-md bg-gray-50 text-gray-500"
                      placeholder={nextAvailableId || "Auto-generated"}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Name*
                    </label>
                    <input
                      type="text"
                      name="actName"
                      value={formData.actName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter activity name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Description
                    </label>
                    <textarea
                      name="actDescription"
                      value={formData.actDescription}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md h-32"
                      placeholder="Enter activity description"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Activity Status</span>
                  <div 
                    className={`w-12 h-6 ${formData.actStatus ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors duration-200`}
                    onClick={handleToggleStatus}
                  >
                    <div className={`absolute ${formData.actStatus ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formData.actStatus ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => navigate('/view-activities')}
                  className="px-6 py-2 border rounded-md hover:bg-gray-50 transition-colors duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Activity' : 'Create Activity')}
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
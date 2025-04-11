import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
import { RealtimeChannel } from '@supabase/supabase-js';

interface Activity {
  Act_id: number;
  Act_name: string;
  Act_Dscr: string | null;
  Act_status: boolean;
  Org_ID: number;
}

export const ViewActivities = (): JSX.Element => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    fetchActivities();

    // Set up real-time subscription
    const channel = supabase
      .channel('activities_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Activities'
        },
        (payload) => {
          console.log('Real-time change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setActivities(current => {
              // Check if activity already exists to prevent duplicates
              if (current.some(a => a.Act_id === (payload.new as Activity).Act_id)) {
                return current;
              }
              return [...current, payload.new as Activity].sort((a, b) => a.Act_id - b.Act_id);
            });
          }
          else if (payload.eventType === 'DELETE') {
            setActivities(current => 
              current.filter(activity => activity.Act_id !== payload.old.Act_id)
            );
          }
          else if (payload.eventType === 'UPDATE') {
            setActivities(current =>
              current.map(activity =>
                activity.Act_id === payload.new.Act_id
                  ? { ...activity, ...payload.new }
                  : activity
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Activities')
        .select('*')
        .order('Act_id', { ascending: true });

      if (fetchError) throw fetchError;
      setActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    navigate('/create-activity', { 
      state: { 
        isEditing: true,
        activityData: activity 
      }
    });
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setError(null);
      const activity = activities.find(a => a.Act_id === id);
      if (!activity) return;

      const { error: updateError } = await supabase
        .from('Activities')
        .update({ Act_status: !activity.Act_status })
        .eq('Act_id', id);

      if (updateError) throw updateError;

      // State will be updated by real-time subscription
    } catch (err: any) {
      console.error('Error toggling activity status:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('Activities')
        .delete()
        .eq('Act_id', id);

      if (deleteError) throw deleteError;

      // State will be updated by real-time subscription
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting activity:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading activities...</div>
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
                <h2 className="text-2xl font-bold">List of Activities</h2>
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
                  onClick={() => navigate('/create-activity')}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  Create Activity
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <div className="grid grid-cols-[1fr,2fr,3fr,1fr,1fr] gap-4 bg-gray-50 p-4 rounded-lg font-medium mb-4">
                  <div>ID</div>
                  <div>Activity Name</div>
                  <div>Description</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div 
                      key={activity.Act_id} 
                      className="grid grid-cols-[1fr,2fr,3fr,1fr,1fr] gap-4 bg-gray-100 p-4 rounded-lg items-center transform transition-all duration-300 hover:shadow-md"
                    >
                      <div className="text-gray-600">#{activity.Act_id}</div>
                      <div className="truncate font-medium">{activity.Act_name}</div>
                      <div className="truncate text-gray-600">{activity.Act_Dscr || 'No description'}</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-12 h-6 ${activity.Act_status ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors duration-200`}
                          onClick={() => handleToggleStatus(activity.Act_id)}
                        >
                          <div className={`absolute ${activity.Act_status ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {activity.Act_status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors duration-200"
                          onClick={() => handleEdit(activity)}
                        >
                          Edit
                        </button>
                        {showDeleteConfirm === activity.Act_id ? (
                          <div className="flex items-center gap-1">
                            <button 
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
                              onClick={() => handleDelete(activity.Act_id)}
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
                            onClick={() => setShowDeleteConfirm(activity.Act_id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {activities.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No activities found. Click "Create Activity" to create one.
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
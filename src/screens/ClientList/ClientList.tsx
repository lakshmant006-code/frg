import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

interface Client {
  Client_ID: string;
  Client_name: string;
  Client_Dscr: string;
  Client_Status: boolean;
  Client_Address_street_1: string;
  Client_Address_Street_2: string;
  Client_City: string;
  Client_State: string;
  Client_Country: string;
  Client_ZIPCODE: number;
  Org_ID: number;
  Client_Contact_name: string;
  Client_Phone: number;
  Client_Website: string;
  Client_Resource: string;
}

export const ClientList = (): JSX.Element => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    fetchClients();

    // Set up real-time subscription
    const channel = supabase
      .channel('clients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Clients'
        },
        (payload) => {
          console.log('Real-time change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setClients(current => {
              if (current.some(c => c.Client_ID === (payload.new as Client).Client_ID)) {
                return current;
              }
              return [...current, payload.new as Client];
            });
          }
          else if (payload.eventType === 'DELETE') {
            setClients(current => 
              current.filter(client => client.Client_ID !== payload.old.Client_ID)
            );
          }
          else if (payload.eventType === 'UPDATE') {
            setClients(current =>
              current.map(client =>
                client.Client_ID === payload.new.Client_ID
                  ? { ...client, ...payload.new }
                  : client
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

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Clients')
        .select('*')
        .order('Client_name');

      if (fetchError) throw fetchError;
      setClients(data || []);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    navigate('/register-client', { 
      state: { 
        isEditing: true,
        clientData: client 
      }
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setError(null);
      const client = clients.find(c => c.Client_ID === id);
      if (!client) return;

      const { error: updateError } = await supabase
        .from('Clients')
        .update({ Client_Status: !client.Client_Status })
        .eq('Client_ID', id);

      if (updateError) throw updateError;

      // State will be updated by real-time subscription
    } catch (err: any) {
      console.error('Error toggling client status:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('Clients')
        .delete()
        .eq('Client_ID', id);

      if (deleteError) throw deleteError;

      // State will be updated by real-time subscription
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting client:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading clients...</div>
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
                <h2 className="text-2xl font-bold">List of Clients</h2>
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
                  onClick={() => navigate('/register-client')}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  Add Client
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                <div className="grid grid-cols-[1fr,2fr,1fr,3fr,2fr,1fr] gap-4 bg-gray-50 p-4 rounded-lg font-medium mb-4">
                  <div>Client ID</div>
                  <div>Company Name</div>
                  <div>Contact</div>
                  <div>Address</div>
                  <div>Description</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.Client_ID} className="grid grid-cols-[1fr,2fr,1fr,3fr,2fr,1fr] gap-4 bg-gray-100 p-4 rounded-lg items-center">
                      <div className="truncate font-mono text-sm">{client.Client_ID}</div>
                      <div className="truncate">{client.Client_name}</div>
                      <div className="truncate">
                        {client.Client_Contact_name || 'N/A'}
                      </div>
                      <div className="truncate">
                        {[
                          client.Client_Address_street_1,
                          client.Client_Address_Street_2,
                          client.Client_City,
                          client.Client_State,
                          client.Client_Country,
                          client.Client_ZIPCODE
                        ].filter(Boolean).join(', ')}
                      </div>
                      <div className="truncate">{client.Client_Dscr || 'No description'}</div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-12 h-6 ${client.Client_Status ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors duration-200`}
                            onClick={() => handleToggleStatus(client.Client_ID)}
                          >
                            <div className={`absolute ${client.Client_Status ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                          </div>
                        </div>
                        <button 
                          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors duration-200"
                          onClick={() => handleEdit(client)}
                        >
                          Edit
                        </button>
                        {showDeleteConfirm === client.Client_ID ? (
                          <div className="flex items-center gap-1">
                            <button 
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
                              onClick={() => handleDelete(client.Client_ID)}
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
                            onClick={() => setShowDeleteConfirm(client.Client_ID)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {clients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No clients found. Click "Add Client" to create one.
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
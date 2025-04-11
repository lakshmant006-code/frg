import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";

interface Client {
  Client_ID: string;
  Client_name: string;
  Client_Email: string;
  Client_Phone: string;
  Client_Status: boolean;
  Client_Add_Street1: string;
  Client_City: string;
  Client_State: string;
  Client_Country: string;
  updated_at?: string;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ClientList = (): JSX.Element => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Clients')
        .select(`
          *,
          updated_at
        `)
        .order('Client_name');

      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (clientId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    setConfirmDialog({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Client?`,
      description: `Are you sure you want to ${action} this client? This will affect their access to the system.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('Clients')
            .update({ Client_Status: !currentStatus })
            .eq('Client_ID', clientId);

          if (error) throw error;
          await fetchClients();
        } catch (err: any) {
          console.error(`Error ${action}ing client:`, err);
          setError(err.message);
        }
      },
    });
  };

  const handleDelete = async (clientId: string, clientName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Client?",
      description: `Are you sure you want to delete ${clientName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('Clients')
            .delete()
            .eq('Client_ID', clientId);

          if (error) throw error;
          await fetchClients();
        } catch (err: any) {
          console.error('Error deleting client:', err);
          setError(err.message);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />

      <header className="w-full h-20 bg-[#1900ff] flex items-center justify-center">
        <h1 className="font-bold text-white text-xl tracking-[-0.23px] leading-5">
          TIME MANAGEMENT
        </h1>
      </header>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Client List</h2>
                <p className="text-gray-500 mt-1">
                  View and manage all client accounts
                </p>
              </div>
              <button
                onClick={() => navigate('/register-client')}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Add New Client
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">Loading clients...</div>
            ) : clients.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No clients found. Add your first client to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Client Name</th>
                      <th className="text-left py-3 px-4">Contact</th>
                      <th className="text-left py-3 px-4">Address</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr
                        key={client.Client_ID}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{client.Client_name}</div>
                            <div className="text-sm text-gray-500">{client.Client_ID}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{client.Client_Email}</div>
                            <div>{client.Client_Phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{client.Client_Add_Street1}</div>
                            <div>{`${client.Client_City}, ${client.Client_State}, ${client.Client_Country}`}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.Client_Status
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {client.Client_Status ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/edit-client/${client.Client_ID}`, { 
                                state: { clientData: client } 
                              })}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusToggle(client.Client_ID, client.Client_Status)}
                              className={`${
                                client.Client_Status
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {client.Client_Status ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(client.Client_ID, client.Client_name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}; 
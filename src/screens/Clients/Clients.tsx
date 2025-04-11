import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";

interface Client {
  id: number;
  name: string;
  description: string;
  clientId: string;
  address: string;
  active: boolean;
}

interface Software {
  name: string;
}

interface Machine {
  name: string;
}

export const Clients = (): JSX.Element => {
  const location = useLocation();
  const [view, setView] = useState<'list' | 'register'>('list');
  
  // Client List State
  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: "Client 1", description: "Description", clientId: "CL001", address: "Client Address", active: true },
    { id: 2, name: "Client 1", description: "Description", clientId: "CL002", address: "Client Address", active: true },
    { id: 3, name: "Client 1", description: "Description", clientId: "CL003", address: "Client Address", active: true },
    { id: 4, name: "Client 1", description: "Description", clientId: "CL004", address: "Client Address", active: true },
    { id: 5, name: "Client 1", description: "Description", clientId: "CL005", address: "Client Address", active: true },
    { id: 6, name: "Client 1", description: "Description", clientId: "CL006", address: "Client Address", active: true },
  ]);

  // Client List Actions
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    clientId: "",
    address: "",
  });

  // Register Client State
  const [formData, setFormData] = useState({
    clientId: "Jane Smith",
    fullName: "Jane Smith",
    companyName: "UBC Impex.com",
    contact1: "+1 (555) 123-4567",
    contact2: "+1 (555) 123-4567",
    email: "name@example.com",
    address: "123 Business St. Street 456, City, State, ZIP",
    website: "https://www.website.com",
    industryType: "",
    subscriptionPlan: "Premium",
    currency: "USD",
    billable: true,
    budget: "https://www.website.com",
    hourlyRate: "150",
    portalAccess: true,
    portalPassword: "",
    active: true,
    softwares: [] as Software[],
    machines: [] as Machine[]
  });

  useEffect(() => {
    if (location.state?.newClient) {
      setClients(prev => [...prev, location.state.newClient]);
    }
  }, [location.state]);

  // Client List Handlers
  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setEditForm({
      name: client.name,
      description: client.description,
      clientId: client.clientId,
      address: client.address,
    });
  };

  const handleSave = (id: number) => {
    setClients(clients.map(client => 
      client.id === id 
        ? { ...client, ...editForm }
        : client
    ));
    setEditingId(null);
  };

  const handleToggleActive = (id: number) => {
    setClients(clients.map(client =>
      client.id === id
        ? { ...client, active: !client.active }
        : client
    ));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = (id: number) => {
    setClients(clients.filter(client => client.id !== id));
    setShowDeleteConfirm(null);
  };

  // Register Client Handlers
  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const handleRegister = () => {
    const newClientId = `CL${String(Date.now()).slice(-3)}`;
    
    const newClient = {
      id: Date.now(),
      name: formData.companyName,
      description: formData.industryType,
      clientId: newClientId,
      address: formData.address,
      active: formData.active
    };

    setClients(prev => [...prev, newClient]);
    setView('list');
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
          <div className="flex justify-between items-center mb-8">
            <select 
              value={view} 
              onChange={(e) => setView(e.target.value as 'list' | 'register')}
              className="bg-white border border-gray-300 rounded-md px-4 py-2"
            >
              <option value="list">Client List</option>
              <option value="register">Register New Client</option>
            </select>
          </div>

          {view === 'list' ? (
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">List of Clients</h2>
                <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  HR Only
                </div>
              </div>

              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
                    <div className="grid grid-cols-4 flex-1 gap-4">
                      {editingId === client.id ? (
                        <>
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleInputChange}
                            className="bg-white rounded px-2 py-1"
                          />
                          <input
                            type="text"
                            name="description"
                            value={editForm.description}
                            onChange={handleInputChange}
                            className="bg-white rounded px-2 py-1"
                          />
                          <input
                            type="text"
                            name="clientId"
                            value={editForm.clientId}
                            onChange={handleInputChange}
                            className="bg-white rounded px-2 py-1"
                          />
                          <input
                            type="text"
                            name="address"
                            value={editForm.address}
                            onChange={handleInputChange}
                            className="bg-white rounded px-2 py-1"
                          />
                        </>
                      ) : (
                        <>
                          <div>{client.name}</div>
                          <div>{client.description}</div>
                          <div>{client.clientId}</div>
                          <div>{client.address}</div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{client.active ? 'Active' : 'Inactive'}</span>
                        <div 
                          className={`w-12 h-6 ${client.active ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer`}
                          onClick={() => handleToggleActive(client.id)}
                        >
                          <div className={`absolute ${client.active ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                        </div>
                      </div>
                      {editingId === client.id ? (
                        <button 
                          className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          onClick={() => handleSave(client.id)}
                        >
                          Save
                        </button>
                      ) : (
                        <button 
                          className="px-4 py-1 bg-black text-white rounded hover:bg-gray-800"
                          onClick={() => handleEdit(client)}
                        >
                          Edit
                        </button>
                      )}
                      {showDeleteConfirm === client.id ? (
                        <div className="flex items-center gap-2">
                          <button 
                            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => handleDelete(client.id)}
                          >
                            Confirm
                          </button>
                          <button 
                            className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            onClick={() => setShowDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="px-4 py-1 bg-black text-white rounded hover:bg-gray-800"
                          onClick={() => setShowDeleteConfirm(client.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Register New Client</h2>
                <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Admin Only
                </div>
              </div>
              <p className="text-gray-500 mb-8">Add a new client to the system</p>

              {/* Registration form fields */}
              {/* ... (Keep all the registration form fields from RegisterClient.tsx) ... */}
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setView('list')}
                  className="px-6 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Register Client
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="text-center py-4 text-sm text-gray-600">
        <p>Contact Support</p>
        <p>2025 Time Management. All rights reserved.</p>
      </footer>
    </div>
  );
};
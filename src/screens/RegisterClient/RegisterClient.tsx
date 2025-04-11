import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ClientFormData {
  clientId: string;
  clientName: string;
  clientDescription: string;
  clientStatus: boolean;
  clientAddressStreet1: string;
  clientAddressStreet2: string;
  clientCity: string;
  clientState: string;
  clientCountry: string;
  clientZipcode: string;
  orgId: number;
  clientContactName: string;
  clientPhone: string;
  clientWebsite: string;
  clientResource: string;
}

export const RegisterClient = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing;
  const existingClient = location.state?.clientData;
  
  const [formData, setFormData] = useState<ClientFormData>({
    clientId: "",
    clientName: "",
    clientDescription: "",
    clientStatus: true,
    clientAddressStreet1: "",
    clientAddressStreet2: "",
    clientCity: "",
    clientState: "",
    clientCountry: "",
    clientZipcode: "",
    orgId: 1, // Default organization ID
    clientContactName: "",
    clientPhone: "",
    clientWebsite: "",
    clientResource: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextClientId, setNextClientId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && existingClient) {
      setFormData({
        clientId: existingClient.Client_ID || "",
        clientName: existingClient.Client_name || "",
        clientDescription: existingClient.Client_Dscr || "",
        clientStatus: existingClient.Client_Status ?? true,
        clientAddressStreet1: existingClient.Client_Address_street_1 || "",
        clientAddressStreet2: existingClient.Client_Address_Street_2 || "",
        clientCity: existingClient.Client_City || "",
        clientState: existingClient.Client_State || "",
        clientCountry: existingClient.Client_Country || "",
        clientZipcode: existingClient.Client_ZIPCODE?.toString() || "",
        orgId: existingClient.Org_ID || 1,
        clientContactName: existingClient.Client_Contact_name || "",
        clientPhone: existingClient.Client_Phone?.toString() || "",
        clientWebsite: existingClient.Client_Website || "",
        clientResource: existingClient.Client_Resource || ""
      });
    } else {
      generateNextClientId();
    }
  }, [isEditing, existingClient]);

  const generateNextClientId = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('Client_ID')
        .order('Client_ID', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextId = 'CL001';
      if (data && data.length > 0) {
        const lastId = data[0].Client_ID;
        const numericPart = parseInt(lastId.replace('CL', ''));
        nextId = `CL${String(numericPart + 1).padStart(3, '0')}`;
      }

      setNextClientId(nextId);
      setFormData(prev => ({ ...prev, clientId: nextId }));
    } catch (err) {
      console.error('Error generating client ID:', err);
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
      clientStatus: !prev.clientStatus
    }));
  };

  const validateForm = () => {
    if (!formData.clientId.trim()) {
      setError('Client ID is required');
      return false;
    }
    if (!formData.clientName.trim()) {
      setError('Client name is required');
      return false;
    }
    if (!formData.clientAddressStreet1.trim()) {
      setError('Street address is required');
      return false;
    }
    if (!formData.clientCity.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.clientState.trim()) {
      setError('State is required');
      return false;
    }
    if (!formData.clientCountry.trim()) {
      setError('Country is required');
      return false;
    }
    if (!formData.clientZipcode.trim()) {
      setError('ZIP code is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setLoading(true);
      setError(null);

      const clientData = {
        Client_ID: formData.clientId,
        Client_name: formData.clientName,
        Client_Dscr: formData.clientDescription,
        Client_Status: formData.clientStatus,
        Client_Address_street_1: formData.clientAddressStreet1,
        Client_Address_Street_2: formData.clientAddressStreet2,
        Client_City: formData.clientCity,
        Client_State: formData.clientState,
        Client_Country: formData.clientCountry,
        Client_ZIPCODE: parseInt(formData.clientZipcode),
        Org_ID: formData.orgId,
        Client_Contact_name: formData.clientContactName,
        Client_Phone: formData.clientPhone ? parseInt(formData.clientPhone) : null,
        Client_Website: formData.clientWebsite,
        Client_Resource: formData.clientResource
      };

      let result;
      
      if (isEditing && existingClient) {
        result = await supabase
          .from('clients')
          .update(clientData)
          .eq('Client_ID', existingClient.Client_ID)
          .select()
          .single();
      } else {
        result = await supabase
          .from('clients')
          .insert([clientData])
          .select()
          .single();
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      navigate('/clients');
    } catch (err: any) {
      console.error('Error saving client:', err);
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
                  {isEditing ? 'Edit Client' : 'Register New Client'}
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
              {isEditing ? 'Update client information' : 'Add a new client to the system'}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID*
                      {!isEditing && (
                        <span className="text-gray-500 text-xs ml-2">
                          (Auto-generated if left empty)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md font-mono"
                      placeholder={nextClientId || "Enter client ID"}
                      disabled={isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name*
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="clientDescription"
                      value={formData.clientDescription}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
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
                      name="clientAddressStreet1"
                      value={formData.clientAddressStreet1}
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
                      name="clientAddressStreet2"
                      value={formData.clientAddressStreet2}
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
                      name="clientCity"
                      value={formData.clientCity}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State*
                    </label>
                    <input
                      type="text"
                      name="clientState"
                      value={formData.clientState}
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
                      name="clientCountry"
                      value={formData.clientCountry}
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
                      name="clientZipcode"
                      value={formData.clientZipcode}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="clientContactName"
                      value={formData.clientContactName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="clientWebsite"
                      value={formData.clientWebsite}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource
                    </label>
                    <input
                      type="text"
                      name="clientResource"
                      value={formData.clientResource}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Client Status</span>
                  <div 
                    className={`w-12 h-6 ${formData.clientStatus ? 'bg-black' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors duration-200`}
                    onClick={handleToggleStatus}
                  >
                    <div className={`absolute ${formData.clientStatus ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all duration-200`}></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formData.clientStatus ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => navigate('/clients')}
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
                  {loading ? (isEditing ? 'Updating...' : 'Registering...') : (isEditing ? 'Update Client' : 'Register Client')}
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
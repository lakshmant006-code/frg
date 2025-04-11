import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
import { AnimatedPage } from "../../components/AnimatedPage";

interface Organization {
  Org_ID: number;
  Org_name: string;
  org_desc: string;
  Org_Address_1: string;
  Org_City: string;
  Org_State: string;
  Org_country: string;
  Org_Zip_Code: number;
  Org_Contact_Name: string;
  Org_Phone_Num?: string;
  Org_email?: string;
  Org_Website?: string;
  Type_Of_Machines?: string;
}

export const Organization = (): JSX.Element => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Organization | null>(null);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Resource_mgmt_Org')
        .select('*')
        .eq('Org_ID', 1)
        .maybeSingle();

      if (fetchError && !fetchError.message.includes('No rows found')) {
        throw fetchError;
      }

      if (!data) {
        // If no organization exists, create a default one
        const defaultOrg = {
          Org_ID: 1,
          Org_name: 'Default Organization',
          org_desc: 'Default organization for the system',
          Org_Address_1: '123 Main St',
          Org_City: 'City',
          Org_State: 'State',
          Org_country: 'Country',
          Org_Zip_Code: 12345,
          Org_Contact_Name: 'Admin'
        };

        const { error: insertError } = await supabase
          .from('Resource_mgmt_Org')
          .insert([defaultOrg]);

        if (insertError) throw insertError;

        setOrganization(defaultOrg);
        setFormData(defaultOrg);
      } else {
        setOrganization(data);
        setFormData(data);
      }
    } catch (err: any) {
      console.error('Error fetching organization:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData) return;

      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('Resource_mgmt_Org')
        .update(formData)
        .eq('Org_ID', 1);

      if (updateError) throw updateError;

      setOrganization(formData);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating organization:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading organization details...</div>
      </div>
    );
  }

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
          <AnimatedPage>
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-1">
                    <h2 className="text-2xl font-bold">Organization Details</h2>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-mono">
                      ID: {organization?.Org_ID}
                    </span>
                  </div>
                  <p className="text-gray-500">Manage your organization information</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                    Admin Only
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                      Edit Details
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="Org_name"
                        value={formData?.Org_name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="Org_Contact_Name"
                        value={formData?.Org_Contact_Name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_Contact_Name}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        name="org_desc"
                        value={formData?.org_desc || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">{organization?.org_desc}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="Org_Phone_Num"
                        value={formData?.Org_Phone_Num || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_Phone_Num || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="Org_email"
                        value={formData?.Org_email || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_email || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="Org_Website"
                        value={formData?.Org_Website || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_Website || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Machines
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="Type_Of_Machines"
                        value={formData?.Type_Of_Machines || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">{organization?.Type_Of_Machines || 'N/A'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="Org_Address_1"
                          value={formData?.Org_Address_1 || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_Address_1}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="Org_City"
                          value={formData?.Org_City || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_City}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="Org_State"
                          value={formData?.Org_State || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_State}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="Org_country"
                          value={formData?.Org_country || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_country}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="Org_Zip_Code"
                          value={formData?.Org_Zip_Code || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded-md">{organization?.Org_Zip_Code}</p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(organization);
                      }}
                      className="px-6 py-2 border rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </AnimatedPage>
        </main>
      </div>

      <footer className="text-center py-4 text-sm text-gray-600">
        <p>Contact Support</p>
        <p>2025 Time Management. All rights reserved.</p>
      </footer>
    </div>
  );
};
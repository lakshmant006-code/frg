import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Organization {
  Org_ID: number;
  Org_name: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  loading: true,
  error: null,
  refreshOrganization: async () => {},
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Resource_mgmt_Org')
        .select('Org_ID, Org_name')
        .eq('Org_ID', 1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        // If no organization exists, create a default one
        const defaultOrg = {
          Org_ID: 1,
          Org_name: 'Default Organization'
        };

        const { error: insertError } = await supabase
          .from('Resource_mgmt_Org')
          .insert([defaultOrg]);

        if (insertError) throw insertError;

        setOrganization(defaultOrg);
      } else {
        setOrganization(data);
      }
    } catch (err: any) {
      console.error('Error fetching organization:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();

    // Set up real-time subscription
    const channel = supabase
      .channel('org_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Resource_mgmt_Org',
          filter: 'Org_ID=eq.1'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setOrganization(payload.new as Organization);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <OrganizationContext.Provider value={{ organization, loading, error, refreshOrganization: fetchOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
};
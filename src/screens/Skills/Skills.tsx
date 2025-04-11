import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
import { AnimatedPage } from "../../components/AnimatedPage";

interface Skill {
  Skill_ID: number;
  Skill_Name: string;
  Skill_Descr: string | null;
  Skill_Type: string;
  Org_ID: number;
}

export const Skills = (): JSX.Element => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Skills')
        .select('*')
        .order('Skill_Name');

      if (fetchError) throw fetchError;
      setSkills(data || []);
    } catch (err: any) {
      console.error('Error fetching skills:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    navigate('/create-skill', { 
      state: { 
        isEditing: true,
        skillData: skill 
      }
    });
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('Skills')
        .delete()
        .eq('Skill_ID', id);

      if (deleteError) throw deleteError;

      setSkills(skills.filter(skill => skill.Skill_ID !== id));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting skill:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-xl">Loading skills...</div>
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
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Skills</h2>
                  <p className="text-gray-500">Manage employee skills and competencies</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                    HR Only
                  </div>
                  <button
                    onClick={() => navigate('/create-skill')}
                    className="px-4 py-2 bg-black text-white rounded-md"
                  >
                    Create Skill
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.Skill_ID} className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{skill.Skill_Name}</h3>
                        <p className="text-sm text-gray-600">{skill.Skill_Descr || 'No description'}</p>
                        <span className="inline-block mt-1 text-xs bg-gray-200 px-2 py-1 rounded">
                          {skill.Skill_Type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          className="px-3 py-1 bg-black text-white text-sm rounded"
                          onClick={() => handleEdit(skill)}
                        >
                          Edit
                        </button>
                        {showDeleteConfirm === skill.Skill_ID ? (
                          <div className="flex items-center gap-1">
                            <button 
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                              onClick={() => handleDelete(skill.Skill_ID)}
                            >
                              Confirm
                            </button>
                            <button 
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
                              onClick={() => setShowDeleteConfirm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="px-3 py-1 bg-black text-white text-sm rounded"
                            onClick={() => setShowDeleteConfirm(skill.Skill_ID)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {skills.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No skills found. Click "Create Skill" to create one.
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
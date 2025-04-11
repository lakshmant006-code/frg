import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useOrganization } from "../../contexts/OrganizationContext";
import { FaUsers, FaUserPlus, FaClipboardList, FaProjectDiagram, FaUsersCog, FaChartBar, FaClock, FaUserTag, FaBuilding, FaLightbulb, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { IconType } from 'react-icons';
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

interface MenuItem {
  path: string;
  label: string;
  icon: IconType;
}

export const Sidebar = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organization } = useOrganization();

  const isActive = (path: string) => location.pathname === path;

  const menuItems: MenuItem[] = [
    { path: '/organization', label: 'Organization', icon: FaBuilding },
    { path: '/manage-clients', label: 'Manage Clients', icon: FaUsers },
    { path: '/roles', label: 'Manage Roles', icon: FaUserTag },
    { path: '/manage-teams', label: 'Manage Teams', icon: FaUsersCog },
    { path: '/manage-users', label: 'Manage Users', icon: FaUserPlus },
    { path: '/manage-projects', label: 'Manage Projects', icon: FaProjectDiagram },
    { path: '/view-activities', label: 'Manage Activities', icon: FaClipboardList },
    { path: '/skills', label: 'Manage Skills', icon: FaLightbulb },
    { path: '/time-tracking', label: 'Time Tracking', icon: FaClock },
    { path: '/reports', label: 'Reports', icon: FaChartBar },
    { path: '/profile', label: 'Profile', icon: FaUserCircle },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const menuItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const logoVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div 
      className="bg-white p-6 h-full"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        variants={logoVariants}
        className="mb-8"
      >
        <img
          src="/image-1.png"
          alt="UBC Logo"
          className="w-32 object-contain"
        />
        {organization && (
          <div className="mt-4 text-sm">
            <p className="text-gray-500">Organization</p>
            <div className="flex items-center gap-2">
              <span className="font-medium">{organization.Org_name}</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                ID: {organization.Org_ID}
              </span>
            </div>
          </div>
        )}
      </motion.div>
      
      <nav className="space-y-2">
        <AnimatePresence>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              variants={menuItemVariants}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
                  isActive(item.path) && 'bg-gray-100 text-gray-900 dark:text-gray-50'
                )}
              >
                {item.icon({ className: 'h-4 w-4' })}
                <span className="mx-4 font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 100, damping: 20 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-8"
      >
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-50"
        >
          {FaSignOutAlt({ className: 'h-4 w-4' })}
          <span className="mx-4 font-medium">Sign Out</span>
        </button>
      </motion.div>
    </motion.div>
  );
};
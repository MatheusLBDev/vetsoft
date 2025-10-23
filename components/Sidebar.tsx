import React from 'react';
import { Page } from '../types';
import { HomeIcon, UsersIcon, CalendarIcon, PawIcon, BoxIcon } from './icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <li
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive ? 'bg-teal-500 text-white shadow-md' : 'text-gray-600 hover:bg-teal-100 hover:text-teal-700'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { page: Page.Dashboard, label: 'Dashboard', icon: <HomeIcon className="w-6 h-6" /> },
    { page: Page.Clients, label: 'Clientes', icon: <UsersIcon className="w-6 h-6" /> },
    { page: Page.Appointments, label: 'Agendamentos', icon: <CalendarIcon className="w-6 h-6" /> },
    { page: Page.Inventory, label: 'Estoque', icon: <BoxIcon className="w-6 h-6" /> },
  ];

  const handleNavItemClick = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false); // Fecha o menu ao navegar em mobile
  };

  return (
    <>
      {/* Overlay para fechar o menu em mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      <aside className={`fixed top-0 left-0 z-20 w-64 bg-white shadow-lg h-screen flex flex-col p-4 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center mb-8 px-2">
          <PawIcon className="w-10 h-10 text-teal-600" />
          <h1 className="text-2xl font-bold ml-2 text-gray-800">Uniso<span className="text-teal-500">Vet</span></h1>
        </div>
        <nav>
          <ul>
            {navItems.map((item) => (
              <NavItem
                key={item.page}
                icon={item.icon}
                label={item.label}
                isActive={currentPage === item.page}
                onClick={() => handleNavItemClick(item.page)}
              />
            ))}
          </ul>
        </nav>
        <div className="mt-auto text-center text-xs text-gray-400">
          <p>&copy; 2024 UnisoVet</p>
          <p>Todos os direitos reservados.</p>
        </div>
      </aside>
    </>
  );
};

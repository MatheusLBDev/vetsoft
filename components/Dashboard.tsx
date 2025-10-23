
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Client, Pet, Appointment } from '../types';
import { HomeIcon, UsersIcon, PawIcon, CalendarIcon } from './icons';

interface DashboardProps {
  clients: Client[];
  pets: Pet[];
  appointments: Appointment[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center transition-transform hover:scale-105">
    <div className="bg-teal-100 p-4 rounded-full mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ clients, appointments }) => {
  const upcomingAppointments = appointments.filter(a => new Date(a.date) >= new Date()).length;
  const totalPets = clients.reduce((acc, client) => acc + client.pets.length, 0);

  const getWeeklyAppointmentData = () => {
    const data: { name: string; agendamentos: number }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayStr = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      const formattedDate = date.toISOString().split('T')[0];
      
      const count = appointments.filter(a => a.date.startsWith(formattedDate)).length;
      data.push({ name: dayStr.charAt(0).toUpperCase() + dayStr.slice(1,3), agendamentos: count });
    }
    return data;
  };

  const weeklyData = getWeeklyAppointmentData();

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Clientes" value={clients.length} icon={<UsersIcon className="w-8 h-8 text-teal-600" />} />
        <StatCard title="Total de Pets" value={totalPets} icon={<PawIcon className="w-8 h-8 text-teal-600" />} />
        <StatCard title="Agendamentos Futuros" value={upcomingAppointments} icon={<CalendarIcon className="w-8 h-8 text-teal-600" />} />
        <StatCard title="Consultas Hoje" value={weeklyData[0].agendamentos} icon={<HomeIcon className="w-8 h-8 text-teal-600" />} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agendamentos da Semana</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="agendamentos" fill="#14b8a6" name="Agendamentos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

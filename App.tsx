import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Client, Pet, Appointment, Page, AppointmentStatus, Product, Service, Sale } from './types';
import { Sidebar } from './components/Sidebar';
import { PawIcon } from './components/icons';

// Lazy load page components
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const Clients = lazy(() => import('./components/Clients').then(module => ({ default: module.Clients })));
const Appointments = lazy(() => import('./components/Appointments').then(module => ({ default: module.Appointments })));
const Inventory = lazy(() => import('./components/Inventory').then(module => ({ default: module.Inventory })));

const API_URL = '/api';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [clientsRes, appointmentsRes, productsRes, servicesRes, salesRes] = await Promise.all([
        fetch(`${API_URL}/clients/`),
        fetch(`${API_URL}/appointments/`),
        fetch(`${API_URL}/inventory/products`),
        fetch(`${API_URL}/inventory/services`),
        fetch(`${API_URL}/inventory/sales`),
      ]);
      setClients(await clientsRes.json());
      setAppointments(await appointmentsRes.json());
      setProducts(await productsRes.json());
      setServices(await servicesRes.json());
      setSales(await salesRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addClient = useCallback(async (clientData: Omit<Client, 'id'>) => {
    const response = await fetch(`${API_URL}/clients/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    if (response.ok) {
        const newClient = await response.json();
        setClients(prev => [...prev, newClient]);
    }
  }, []);

  const addPet = useCallback(async (petData: Omit<Pet, 'id'>) => {
    const response = await fetch(`${API_URL}/pets/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petData),
    });
    if (response.ok) {
      fetchData()
    }
  }, []);

  const deletePet = useCallback(async (petId: number) => {
    const response = await fetch(`${API_URL}/pets/${petId}`,
    {
      method: 'DELETE',
    });
    if (response.ok) {
      setClients(prevClients =>
        prevClients.map(client => ({
          ...client,
          pets: client.pets?.filter(pet => pet.id !== petId),
        }))
      );
    }
  }, []);

  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>) => {
    const response = await fetch(`${API_URL}/appointments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });
    if (response.ok) {
        const newAppointment = await response.json();
        setAppointments(prev => [...prev, newAppointment]);
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (id: number, status: AppointmentStatus) => {
    const response = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (response.ok) {
        const updatedAppointment = await response.json();
        setAppointments(prev => prev.map(app => app.id === id ? updatedAppointment : app));
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard clients={clients} appointments={appointments} />;
      case Page.Clients:
        return <Clients clients={clients} addClient={addClient} addPet={addPet} deletePet={deletePet} />;
      case Page.Appointments:
        return <Appointments appointments={appointments} clients={clients} addAppointment={addAppointment} updateAppointmentStatus={updateAppointmentStatus} />;
      case Page.Inventory:
        return <Inventory 
          products={products}
          setProducts={setProducts}
          services={services}
          setServices={setServices}
          sales={sales}
          setSales={setSales}
          appointments={appointments}
          fetchData={fetchData} // Pass fetchData to re-sync after sales etc.
        />;
      default:
        return <Dashboard clients={clients} appointments={appointments} />;
    }
  };

  return (
    <div className="relative min-h-screen md:flex bg-slate-50 text-gray-800">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
      />
      <main className="flex-1 overflow-y-auto">
        <header className="md:hidden flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
            <div className="flex items-center">
                <PawIcon className="w-8 h-8 text-teal-600" />
                <h1 className="text-xl font-bold ml-2 text-gray-800">Uniso<span className="text-teal-500">Vet</span></h1>
            </div>
            <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </header>
        <Suspense fallback={<div className="p-6">Carregando...</div>}>
          {renderPage()}
        </Suspense>
      </main>
    </div>
  );
}

export default App;

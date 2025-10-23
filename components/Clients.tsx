import React, { useState, useMemo, useEffect } from 'react';
import { Client, Pet } from '../types';
import { Modal } from './Modal';
import { UsersIcon, PawIcon, PlusIcon } from './icons';

interface ClientsProps {
    clients: Client[];
    addClient: (client: Omit<Client, 'id'>) => void;
    addPet: (pet: Omit<Pet, 'id'>) => void;
    deletePet: (petId: number) => void;
}

const ClientForm: React.FC<{ onSubmit: (data: Omit<Client, 'id'>) => void; onClose: () => void; }> = ({ onSubmit, onClose }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, phone, email, address });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">Salvar Cliente</button>
            </div>
        </form>
    );
};

const PetForm: React.FC<{ ownerId: string; onSubmit: (data: Omit<Pet, 'id'>) => void; onClose: () => void; }> = ({ ownerId, onSubmit, onClose }) => {
    const [name, setName] = useState('');
    const [species, setSpecies] = useState<'Cachorro' | 'Gato' | 'Pássaro' | 'Roedor' | 'Outro'>('Cachorro');
    const [breed, setBreed] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, species, breed, birthDate, ownerId });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Pet</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Espécie</label>
                <select
                    value={species}
                    onChange={e => setSpecies(e.target.value as any)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
                    <option className="bg-white text-gray-900">Cachorro</option>
                    <option className="bg-white text-gray-900">Gato</option>
                    <option className="bg-white text-gray-900">Pássaro</option>
                    <option className="bg-white text-gray-900">Roedor</option>
                    <option className="bg-white text-gray-900">Outro</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Raça</label>
                <input type="text" value={breed} onChange={e => setBreed(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">Salvar Pet</button>
            </div>
        </form>
    );
};


export const Clients: React.FC<ClientsProps> = ({ clients, addClient, addPet, deletePet }) => {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isClientModalOpen, setClientModalOpen] = useState(false);
    const [isPetModalOpen, setPetModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = useMemo(() => 
        clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [clients, searchTerm]
    );

    const clientPets = useMemo(() => 
        selectedClient ? selectedClient.pets : [],
        [selectedClient]
    );

    useEffect(() => {
        if (selectedClient) {
            const updatedClient = clients.find(c => c.id === selectedClient.id);
            setSelectedClient(updatedClient || null);
        }
    }, [clients]);

    if (selectedClient) {
        return (
            <div className="p-4 sm:p-8">
                <button onClick={() => setSelectedClient(null)} className="mb-6 px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">&larr; Voltar para a lista</button>
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">{selectedClient.name}</h2>
                    <p className="text-gray-600">{selectedClient.email} | {selectedClient.phone}</p>
                    <p className="text-gray-500 mt-2">{selectedClient.address}</p>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-700">Pets</h3>
                    <button onClick={() => setPetModalOpen(true)} className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">
                        <PlusIcon className="w-5 h-5 mr-2" /> Adicionar Pet
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {clientPets.length > 0 ? clientPets.map(pet => (
                            <li key={pet.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <PawIcon className="w-8 h-8 text-teal-500 mr-4" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{pet.name}</p>
                                        <p className="text-sm text-gray-500">{pet.species} - {pet.breed}</p>
                                    </div>
                                </div>
                                <button onClick={() => deletePet(pet.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Excluir</button>
                            </li>
                        )) : <p className="p-4 text-gray-500">Nenhum pet cadastrado.</p>}
                    </ul>
                </div>
                <Modal isOpen={isPetModalOpen} onClose={() => setPetModalOpen(false)} title={`Adicionar Pet para ${selectedClient.name}`}>
                    <PetForm ownerId={selectedClient.id.toString()} onSubmit={addPet} onClose={() => setPetModalOpen(false)} />
                </Modal>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Clientes</h1>
                <button onClick={() => setClientModalOpen(true)} className="flex items-center justify-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 shadow w-full sm:w-auto">
                    <PlusIcon className="w-5 h-5 mr-2" /> Novo Cliente
                </button>
            </div>

            <div className="mb-6">
                 <input 
                    type="text" 
                    placeholder="Buscar cliente por nome..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {filteredClients.map(client => (
                        <li key={client.id} onClick={() => setSelectedClient(client)} className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-3 bg-teal-100 rounded-full mr-4">
                                    <UsersIcon className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{client.name}</p>
                                    <p className="text-sm text-gray-500">{client.email}</p>
                                </div>
                            </div>
                            <span className="text-gray-400">&rarr;</span>
                        </li>
                    ))}
                </ul>
            </div>
            <Modal isOpen={isClientModalOpen} onClose={() => setClientModalOpen(false)} title="Adicionar Novo Cliente">
                <ClientForm onSubmit={addClient} onClose={() => setClientModalOpen(false)} />
            </Modal>
        </div>
    );
};
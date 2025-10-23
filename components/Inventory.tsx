import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Product, Service, Sale, SaleItem, Appointment } from '../types';
import { Modal } from './Modal';
import { PlusIcon } from './icons';

const API_URL = 'http://127.0.0.1:8000';

// Props definition
interface InventoryProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    sales: Sale[];
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    appointments: Appointment[];
    fetchData: () => Promise<void>;
}

// Helper: Tab Button Component
const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void }> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            isActive
                ? 'border-b-2 border-teal-500 text-teal-600'
                : 'text-gray-500 hover:text-gray-700'
        }`}
    >
        {title}
    </button>
);

// Helper: Stat Card Component
const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

// Forecast Data Type
interface ForecastData {
    date: string;
    predicted_sales: number;
}

// Main Inventory Component
export const Inventory: React.FC<InventoryProps> = (props) => {
    const [activeTab, setActiveTab] = useState('overview');
    
    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab {...props} />;
            case 'products': return <ProductsTab {...props} />;
            case 'services': return <ServicesTab {...props} />;
            case 'new-sale': return <NewSaleTab {...props} />;
            case 'sales-history': return <SalesHistoryTab products={props.products} services={props.services} />;
            
            default: return null;
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Estoque e Vendas</h1>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap gap-x-6" aria-label="Tabs">
                    <TabButton title="Visão Geral" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <TabButton title="Produtos" isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                    <TabButton title="Serviços" isActive={activeTab === 'services'} onClick={() => setActiveTab('services')} />
                    <TabButton title="Nova Venda" isActive={activeTab === 'new-sale'} onClick={() => setActiveTab('new-sale')} />
                    <TabButton title="Histórico de Vendas" isActive={activeTab === 'sales-history'} onClick={() => setActiveTab('sales-history')} />
                    
                </nav>
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};

const OverviewTab: React.FC<InventoryProps> = ({ products, sales }) => {
    const lowStockCount = useMemo(() => products.filter(p => p.stock <= 5).length, [products]);
    const totalRevenue = useMemo(() => sales.reduce((acc, sale) => acc + sale.total, 0), [sales]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [forecastData, setForecastData] = useState<ForecastData[] | null>(null);
    const [suggestions, setSuggestions] = useState<any[] | null>(null);

    const handleForecast = async () => {
        setLoading(true);
        setError(null);
        setForecastData(null);
        setSuggestions(null);
        try {
            const response = await fetch(`${API_URL}/forecast/sales`);
            if (!response.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            const data = await response.json();
            if (data.message) {
                setError(data.message);
            } else {
                setForecastData(data.forecast);
                setSuggestions(data.inventory_suggestions);
            }
        } catch (e) {
            console.error(e);
            setError("Falha ao gerar a previsão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Produtos em Estoque" value={products.length} />
                <StatCard title="Itens com Baixo Estoque" value={lowStockCount} />
                <StatCard title="Receita Total (Vendas)" value={totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Previsão de Vendas e Sugestão de Estoque</h2>
                <p className="text-gray-500 mb-4">Clique no botão para gerar uma previsão de vendas para os próximos 30 dias e receber sugestões de reabastecimento de estoque.</p>
                <button onClick={handleForecast} disabled={loading} className="px-5 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-400">
                    {loading ? 'Gerando Previsão...' : 'Gerar Previsão'}
                </button>
                {error && <p className="mt-4 text-red-500">{error}</p>}
                {forecastData && (
                    <div className="mt-6" style={{ width: '100%', height: 400 }}>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Previsão para os Próximos 30 Dias</h3>
                        <ResponsiveContainer>
                            <LineChart data={forecastData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="predicted_sales" stroke="#14b8a6" name="Vendas Previstas" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
                {suggestions && suggestions.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Sugestões de Estoque</h3>
                        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                            <table className="w-full text-left text-gray-900">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="p-4 font-semibold text-gray-900">Produto</th>
                                        <th className="p-4 font-semibold text-gray-900">Estoque Atual</th>
                                        <th className="p-4 font-semibold text-gray-900">Vendas Estimadas (30 dias)</th>
                                        <th className="p-4 font-semibold text-gray-900">Sugestão</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-gray-900">
                                    {suggestions.map(s => (
                                        <tr key={s.product_name}>
                                            <td className="p-4 text-gray-900">{s.product_name}</td>
                                            <td className="p-4 text-gray-900">{s.current_stock}</td>
                                            <td className="p-4 text-gray-900">{s.estimated_sales_30_days}</td>
                                            <td className="p-4 text-gray-900">{s.suggestion}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};



// Generic CRUD Tab Component
const CrudTab = <T extends { id: number; name: string; description: string; price: number; stock?: number }>({
    title,
    items,
    setItems,
    itemType,
    endpoint,
    columns,
    form: FormComponent,
}: {
    title: string;
    items: T[];
    setItems: React.Dispatch<React.SetStateAction<T[]>>;
    itemType: string;
    endpoint: string;
    columns: { header: string; accessor: (item: T) => React.ReactNode }[];
    form: React.FC<{ onSubmit: (data: Omit<T, 'id'>) => void; onClose: () => void; initialData?: T; items: T[] }>;
}) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | undefined>(undefined);

    const handleSave = async (data: Omit<T, 'id'>) => {
        const url = editingItem ? `${API_URL}${endpoint}/${editingItem.id}` : `${API_URL}${endpoint}`;
        const method = editingItem ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const savedItem = await response.json();
            if (editingItem) {
                setItems(prev => prev.map(item => item.id === editingItem.id ? savedItem : item));
            } else {
                setItems(prev => [...prev, savedItem]);
            }
        } else {
            alert(`Falha ao salvar ${itemType}`);
        }
    };

    const handleDelete = async (id: number) => {
        if(window.confirm(`Tem certeza que deseja excluir este ${itemType}?`)) {
            const response = await fetch(`${API_URL}${endpoint}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setItems(prev => prev.filter(item => item.id !== id));
            } else {
                alert(`Falha ao excluir ${itemType}`);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => { setEditingItem(undefined); setModalOpen(true); }} 
                    className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 shadow"
                >
                    <PlusIcon className="w-5 h-5 mr-2" /> Adicionar {itemType}
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left text-gray-900">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            {columns.map(col => (
                                <th key={col.header} className="p-4 font-semibold text-gray-900">{col.header}</th>
                            ))}
                            <th className="p-4 font-semibold text-gray-900">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-gray-900">
                        {items.map(item => (
                            <tr key={item.id}>
                                {columns.map(col => (
                                    <td key={col.header} className="p-4 text-gray-900">{col.accessor(item)}</td>
                                ))}
                                <td className="p-4 space-x-2">
                                    <button 
                                        onClick={() => { setEditingItem(item); setModalOpen(true); }} 
                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)} 
                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={`${editingItem ? 'Editar' : 'Adicionar'} ${itemType}`}>
                <div className="text-gray-900">
                    <FormComponent onSubmit={handleSave} onClose={() => setModalOpen(false)} initialData={editingItem} items={items} />
                </div>
            </Modal>
        </div>
    );
};

// Product Form
const ProductForm: React.FC<{ onSubmit: (data: Omit<Product, 'id'>) => void; onClose: () => void; initialData?: Product; items: Product[] }> = ({ onSubmit, onClose, initialData, items }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price || 0);
    const [stock, setStock] = useState(initialData?.stock || 0);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const isDuplicate = items.some(
            p => p.name.toLowerCase() === name.toLowerCase() && p.id !== initialData?.id
        );

        if (isDuplicate) {
            setError('Já existe um produto com este nome.');
            return;
        }

        onSubmit({ name, description, price, stock });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white text-gray-900 p-6 rounded-lg shadow-md">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input 
                    type="text" 
                    placeholder="Nome" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea 
                        placeholder="Descrição" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Preço</label>
                    <input 
                        type="number" 
                        placeholder="Preço" 
                        value={price} 
                        onChange={e => setPrice(parseFloat(e.target.value))} 
                        required 
                        min="0" 
                        step="0.01" 
                        className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Qnt. Estoque</label>
                    <input 
                        type="number" 
                        placeholder="Estoque" 
                        value={stock} 
                        onChange={e => setStock(parseInt(e.target.value))} 
                        required 
                        min="0" 
                        className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                >
                    Salvar
                </button>
            </div>
        </form>
    );
};

const ServiceForm: React.FC<{ onSubmit: (data: Omit<Service, 'id'>) => void; onClose: () => void; initialData?: Service; items: Service[] }> = ({ onSubmit, onClose, initialData, items }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price || 0);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const isDuplicate = items.some(
            s => s.name.toLowerCase() === name.toLowerCase() && s.id !== initialData?.id
        );

        if (isDuplicate) {
            setError('Já existe um serviço com este nome.');
            return;
        }

        onSubmit({ name, description, price });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" placeholder="Nome do Serviço" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea placeholder="Descrição do Serviço" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Preço</label>
                <input type="number" placeholder="Preço" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required min="0" step="0.01" className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"/>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">Salvar</button>
            </div>
        </form>
    );
};

// Tab Implementations
const ProductsTab: React.FC<InventoryProps> = ({ products, setProducts }) => (
    <CrudTab 
        title="Produtos"
        items={products}
        setItems={setProducts}
        itemType="Produto"
        endpoint="/inventory/products"
        columns={[
            { header: "Nome", accessor: item => item.name },
            { header: "Preço", accessor: item => item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
            { header: "Estoque", accessor: item => item.stock },
        ]}
        form={ProductForm}
    />
);

const ServicesTab: React.FC<InventoryProps> = ({ services, setServices }) => (
    <CrudTab 
        title="Serviços"
        items={services}
        setItems={setServices}
        itemType="Serviço"
        endpoint="/inventory/services"
        columns={[
            { header: "Nome", accessor: item => item.name },
            { header: "Preço", accessor: item => item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        ]}
        form={ServiceForm}
    />
);

// New Sale Tab Component
const NewSaleTab: React.FC<InventoryProps> = ({ products, services, fetchData }) => {
    const [cart, setCart] = useState<SaleItem[]>([]);
    
    const addToCart = (item: Product | Service, type: 'product' | 'service') => {
        const existing = cart.find(cartItem => cartItem.id === item.id);
        if (type === 'product' && (item as Product).stock <= (existing?.quantity || 0)) {
            alert('Produto sem estoque!');
            return;
        }
        if (existing) {
            setCart(cart.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
        } else {
            setCart([...cart, { id: item.id, name: item.name, price: item.price, quantity: 1, type }]);
        }
    };
    
    const total = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
    
    const finalizeSale = async () => {
        if (cart.length === 0) return;

        const saleData = {
            items: cart.map(item => ({
                product_id: item.type === 'product' ? item.id : undefined,
                service_id: item.type === 'service' ? item.id : undefined,
                quantity: item.quantity,
                price: item.price,
            })),
            total: total,
            date: new Date().toISOString(),
        };
        
        const response = await fetch(`${API_URL}/inventory/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData),
        });
        
        if (response.ok) {
            setCart([]);
            await fetchData(); // Re-sync all data from the server
            alert('Venda finalizada com sucesso!');
        } else {
            alert('Falha ao finalizar a venda.');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-semibold mb-2">Produtos</h3>
                    <div className="bg-white rounded-lg shadow-md max-h-96 overflow-y-auto">
                        <ul className="divide-y">{products.map(p => <li key={p.id} onClick={() => addToCart(p, 'product')} className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between"><span>{p.name}</span><span className="text-gray-500">{p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></li>)}</ul>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-2">Serviços</h3>
                    <div className="bg-white rounded-lg shadow-md max-h-96 overflow-y-auto">
                        <ul className="divide-y">{services.map(s => <li key={s.id} onClick={() => addToCart(s, 'service')} className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between"><span>{s.name}</span><span className="text-gray-500">{s.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></li>)}</ul>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4">Carrinho</h3>
                <ul className="divide-y mb-4">{cart.length > 0 ? cart.map(item => <li key={item.id} className="py-2 flex justify-between"><span>{item.quantity}x {item.name}</span><span>{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></li>) : <p className="text-gray-500">O carrinho está vazio.</p>}</ul>
                <div className="border-t pt-4">
                    <p className="text-xl font-bold flex justify-between"><span>Total</span><span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
                    <button onClick={finalizeSale} disabled={cart.length === 0} className="mt-4 w-full px-4 py-3 bg-teal-500 text-white font-bold rounded-md hover:bg-teal-600 disabled:bg-gray-400">Finalizar Venda</button>
                </div>
            </div>
        </div>
    );
};

const SalesHistoryTab: React.FC<Omit<InventoryProps, 'setProducts' | 'setServices' | 'setSales' | 'appointments' | 'fetchData' | 'sales'> & { products: Product[], services: Service[]}> = ({ products, services }) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalSales, setTotalSales] = useState(0);
    const [loading, setLoading] = useState(true);
    const salesPerPage = 10;

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/inventory/sales?skip=${(currentPage - 1) * salesPerPage}&limit=${salesPerPage}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch sales data');
                }
                const data = await response.json();
                setSales(data);
                // A resposta da API precisa incluir o total de vendas para a paginação funcionar
                // Como a API atual não faz isso, vamos simular o total com base no comprimento da resposta
                // O ideal é que a API retorne algo como { sales: [...], total: ... }
                const total = response.headers.get('X-Total-Count');
                setTotalSales(total ? parseInt(total, 10) : data.length < salesPerPage ? (currentPage - 1) * salesPerPage + data.length : currentPage * salesPerPage + 1);

            } catch (error) {
                console.error(error);
                alert('Falha ao carregar o histórico de vendas.');
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, [currentPage]);

    const totalPages = Math.ceil(totalSales / salesPerPage);

    const getItemName = (item: SaleItem) => {
        if (item.product_id) {
            const product = products.find(p => p.id === item.product_id);
            return product ? product.name : 'Produto não encontrado';
        }
        if (item.service_id) {
            const service = services.find(s => s.id === item.service_id);
            return service ? service.name : 'Serviço não encontrado';
        }
        return 'Item desconhecido';
    };

    if (loading) {
        return <p>Carregando histórico de vendas...</p>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {sales.length > 0 ? sales.map(sale => (
                    <li key={sale.id} className="p-4">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-gray-800">Venda #{sale.id}</p>
                            <p className="font-bold text-lg text-teal-600">{sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(sale.date).toLocaleString('pt-BR')}</p>
                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                            {sale.items.map(item => <li key={`${item.product_id}-${item.service_id}`}>{item.quantity}x {getItemName(item)}</li>)}
                        </ul>
                    </li>
                )) : <p className="p-4 text-gray-500">Nenhuma venda registrada.</p>}
            </ul>
            {totalPages > 1 && (
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
};
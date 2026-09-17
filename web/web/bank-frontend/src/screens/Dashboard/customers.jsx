import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Search, ChevronRight, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

const Customers = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/dashboard/customers', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch customer data');

                const data = await response.json();
                if (data.status === 'success') {
                    setCustomers(data.data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchCustomers();
    }, [token]);

    // Format helpers
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    const formatPercent = (decimal) => `${((decimal || 0) * 100).toFixed(1)}%`;

    // Visual helpers for Risk Badges
    const getRiskDisplay = (score) => {
        if (score >= 0.7) return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, text: 'High Risk' };
        if (score >= 0.4) return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, text: 'Medium Risk' };
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: ShieldCheck, text: 'Low Risk' };
    };

    // Real-time Search Filter
    const filteredCustomers = customers.filter(customer => 
        customer.surname?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        customer.id?.toString().includes(searchQuery)
    );

    if (isLoading) return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-lime/50 border-t-lime"></div></div>;
    if (error) return <div className="rounded bg-red-50 p-4 text-red-700">{error}</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Search */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Customer Risk Directory</h2>
                    <p className="mt-1 text-sm text-white/50">Manage your portfolio and review AI-flagged accounts.</p>
                </div>
                <div className="mt-4 sm:mt-0 relative rounded-md max-w-xs w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-white/40" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded border-0 bg-white/[0.04] py-2 pl-10 text-white ring-1 ring-inset ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-inset focus:ring-lime sm:text-sm sm:leading-6"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden rounded border border-white/10 bg-[#111]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/[0.04]">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Customer Info</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Account Balance</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Value Segment</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">AI Churn Risk</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 bg-[#111]">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => {
                                    const risk = getRiskDisplay(customer.ai_risk_score);
                                    const RiskIcon = risk.icon;

                                    return (
                                        <tr key={customer.id} className="transition-colors hover:bg-white/[0.04]">
                                            {/* Customer Name & ID */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-lime/30 flex items-center justify-center text-black font-bold">
                                                        {customer.first_name ? customer.first_name.charAt(0) : 'U'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-white">{customer.last_name || 'Unknown'}</div>
                                                        <div className="text-xs text-white/50">ID: {customer.id}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Balance */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-white font-medium">{formatCurrency(customer.balance)}</div>
                                                <div className="text-xs text-white/50">Salary: {formatCurrency(customer.estimated_salary)}</div>
                                            </td>

                                            {/* Value Matrix Segment */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                               <span className="text-sm font-bold text-white">{customer.value_score} / 100</span>
                                            </td>

                                            {/* AI Risk Score Badge */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${risk.color}`}>
                                                    <RiskIcon className="h-3.5 w-3.5" />
                                                    {risk.text} ({formatPercent(customer.ai_risk_score)})
                                                </span>
                                            </td>

                                            {/* Action Button */}
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
                                                    className="inline-flex items-center gap-1 text-white hover:text-white transition-colors"
                                                >
                                                    View Profile <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-white/50">
                                        No customers found matching "{searchQuery}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Customers;
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
    ArrowLeft, CreditCard, Wallet, TrendingUp, 
    ShieldAlert, Target, Star, MapPin, Download, 
    History, ListOrdered, FileText 
} from 'lucide-react';

const CustomerProfile = () => {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCompleteProfile = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/customers/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Customer profile data not found.');

                const result = await response.json();
                if (result.status === 'success') {
                    setData(result.data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchCompleteProfile();
    }, [id, token]);

    // EXPORT FUNCTION: Generates a CSV Report for the Bank Manager
    const exportReport = () => {
        const { profile, transactions, history } = data;
        const csvRows = [
            ['CUSTOMER IQ INTELLIGENCE REPORT'],
            ['Date Generated', new Date().toLocaleString()],
            [''],
            ['--- PROFILE DETAILS ---'],
            ['Name', `${profile.first_name} ${profile.last_name}`],
            ['Customer UID', profile.customer_uid],
            ['Geography', profile.geography],
            ['Credit Score', profile.credit_score],
            ['Current Balance', profile.balance],
            [''],
            ['--- AI ASSESSMENT ---'],
            ['Churn Risk Score', `${(profile.ai_risk_score * 100).toFixed(2)}%`],
            ['Value Score', profile.value_score],
            ['Assigned Strategy', profile.plan_name],
            [''],
            ['--- RECENT TRANSACTIONS ---'],
            ['Date', 'Category', 'Type', 'Amount'],
            ...transactions.map(t => [t.transaction_date, t.category, t.transaction_type, t.amount]),
            [''],
            ['--- HISTORICAL LOGS ---'],
            ['Assessment Date', 'Risk Score', 'Value Score', 'Plan Assigned'],
            ...history.map(h => [h.assessment_date, h.ai_risk_score, h.value_score, h.plan_name])
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `CustomerIQ_Report_${profile.last_name}_${profile.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-lime/50 border-t-lime"></div></div>;
    if (error) return <div className="rounded bg-red-50 p-4 text-red-700">{error}</div>;

    const { profile, transactions, history } = data;
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard/customers')} className="p-2 rounded-full hover:bg-white/[0.06] text-white/50"><ArrowLeft className="h-5 w-5" /></button>
                    <h2 className="text-2xl font-bold text-white">Customer 360 View</h2>
                </div>
                <button 
                    onClick={exportReport}
                    className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded text-sm font-bold hover:bg-neutral-800 transition-all"
                >
                    <Download className="h-4 w-4" /> Export Intelligence Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2: Details & Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Identity Card */}
                    <div className="bg-[#111] rounded p-6 border border-white/10">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="h-16 w-16 rounded bg-black flex items-center justify-center text-white text-2xl font-bold shadow-soft">
                                    {profile.first_name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{profile.first_name} {profile.last_name}</h3>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-white/50 font-medium">
                                        <MapPin className="h-4 w-4" /> {profile.geography} • Age {profile.age}
                                    </div>
                                    <span className="inline-block mt-2 px-2 py-0.5 bg-white/[0.06] text-white/60 text-[10px] font-bold rounded uppercase tracking-wider">UID: {profile.customer_uid}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Credit Score</div>
                                <div className="text-2xl font-black text-white">{profile.credit_score}</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#111] p-5 rounded border border-white/10">
                            <div className="flex items-center gap-3 text-white mb-2">
                                <Wallet className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider text-white/40">Current Balance</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{formatCurrency(profile.balance)}</div>
                        </div>
                        <div className="bg-[#111] p-5 rounded border border-white/10">
                            <div className="flex items-center gap-3 text-white mb-2">
                                <TrendingUp className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider text-white/40">Tenure</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{profile.tenure_years} Years</div>
                        </div>
                    </div>

                    {/* Transaction History Table */}
                    <div className="bg-[#111] rounded p-6 border border-white/10">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2"><ListOrdered className="h-5 w-5 text-white/40" /> Recent Transactions</h4>
                        <div className="space-y-3">
                            {transactions.map((t, i) => (
                                <div key={i} className="flex justify-between items-center p-3 hover:bg-white/[0.04] rounded transition-colors border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded ${t.transaction_type === 'CREDIT' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            <TrendingUp className={`h-4 w-4 ${t.transaction_type === 'DEBIT' && 'rotate-180'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white/90">{t.category}</p>
                                            <p className="text-[10px] text-white/40 uppercase font-medium">{new Date(t.transaction_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-black ${t.transaction_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.transaction_type === 'CREDIT' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: AI Intelligence & History Logs */}
                <div className="space-y-6">
                    {/* Risk Gauge Card */}
                    <div className="bg-black rounded p-6 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <ShieldAlert className="h-6 w-6 text-lime" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime">AI Risk Assessment</span>
                        </div>
                        <div className="text-center py-4">
                            <div className="text-5xl font-black text-white">{((profile.ai_risk_score || 0) * 100).toFixed(1)}%</div>
                            <p className="text-xs font-medium text-neutral-300 mt-2 uppercase tracking-widest">Churn Probability</p>
                        </div>
                        <div className="mt-6 h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-lime transition-all duration-1000" style={{ width: `${(profile.ai_risk_score || 0) * 100}%` }} />
                        </div>
                    </div>

                    {/* Actionable Plan Card */}
                    <div className="bg-[#111] rounded p-6 border-2 border-lime/40">
                        <div className="flex items-center gap-2 mb-4"><Target className="h-5 w-5 text-white" /><h4 className="font-bold text-white">Retention Strategy</h4></div>
                        <div className="bg-lime/20 rounded p-4 border border-lime/40">
                            <p className="text-xs font-bold text-white uppercase mb-1">Status: Active Plan</p>
                            <p className="text-lg font-bold text-white leading-tight">{profile.plan_name || 'Standard Monitoring'}</p>
                        </div>
                        <p className="mt-4 text-[11px] text-white/50 leading-relaxed italic">"Automated selection based on a Value Score of {profile.value_score}."</p>
                    </div>

                    {/* History Timeline Logs */}
                    <div className="bg-[#111] rounded p-6 border border-white/10">
                        <h4 className="font-bold text-white mb-6 flex items-center gap-2"><History className="h-5 w-5 text-white/40" /> Retention History</h4>
                        <div className="relative border-l-2 border-lime/40 ml-4 space-y-8">
                            {history.map((h, i) => (
                                <div key={i} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-black border-4 border-white" />
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-white/90 leading-none">{h.plan_name}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] text-white/40 font-bold uppercase">{new Date(h.assessment_date).toLocaleDateString()}</span>
                                            <span className="text-xs font-black text-white">{(h.ai_risk_score * 100).toFixed(1)}% Risk</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
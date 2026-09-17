import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Save, Zap, Info, X, Trash2, ShieldAlert, Target } from 'lucide-react';

const RetentionRules = () => {
    const { token } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for the new plan form
    const [newPlan, setNewPlan] = useState({
        name: '', 
        bank_investment: '', 
        min_risk: 0.50, 
        max_risk: 1.00, 
        min_value: 0, 
        max_value: 100
    });

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/dashboard/retention-settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.status === 'success') setPlans(result.data);
        } catch (err) {
            console.error("Failed to load rules.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSettings(); }, [token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/dashboard/retention-settings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(newPlan)
            });
            if (res.ok) {
                setShowAddForm(false);
                fetchSettings();
                setNewPlan({ name: '', bank_investment: '', min_risk: 0.50, max_risk: 1.00, min_value: 0, max_value: 100 });
            }
        } catch (err) { alert("Failed to create plan."); }
    };

    if (isLoading) return <div className="p-4 text-center animate-pulse text-white font-bold">Synchronizing Rules Engine...</div>;

    return (
        <div className="space-y-6 pb-20 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Strategy & Allocation Manager</h2>
                    <p className="text-sm text-white/50">Define how the system reacts to specific AI Risk and Value combinations.</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`flex items-center gap-2 px-6 py-3 rounded text-sm font-bold transition-all ${
                        showAddForm ? 'bg-gray-200 text-white/80' : 'bg-black text-white hover:bg-white/10'
                    }`}
                >
                    {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showAddForm ? 'Cancel' : 'Add New Strategy'}
                </button>
            </div>

            {/* CREATE PLAN MODAL-STYLE FORM */}
            {showAddForm && (
                <div className="bg-[#111] border-2 border-lime/40 rounded p-4 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-lime/30 rounded text-black"><Zap className="h-5 w-5" /></div>
                        <h3 className="font-bold text-xl text-white">Configure New Strategy</h3>
                    </div>
                    
                    <form onSubmit={handleCreate} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/40 uppercase tracking-widest">Plan Name</label>
                                <input required className="w-full rounded border-white/10 focus:ring-lime text-sm p-3" placeholder="e.g. Premium Cashback Rescue" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/40 uppercase tracking-widest">Investment Cost</label>
                                <input required className="w-full rounded border-white/10 focus:ring-lime text-sm p-3" placeholder="e.g. $50.00 / account" value={newPlan.bank_investment} onChange={e => setNewPlan({...newPlan, bank_investment: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white/[0.04] rounded border border-white/10">
                            {/* AI Risk Range */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white/80 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-500" /> AI Risk Range</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold text-white/40">MIN (0.0 - 1.0)</span>
                                        <input type="number" step="0.01" className="w-full rounded border-white/10 text-sm font-bold" value={newPlan.min_risk} onChange={e => setNewPlan({...newPlan, min_risk: e.target.value})} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold text-white/40">MAX (0.0 - 1.0)</span>
                                        <input type="number" step="0.01" className="w-full rounded border-white/10 text-sm font-bold" value={newPlan.max_risk} onChange={e => setNewPlan({...newPlan, max_risk: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Customer Value Range */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white/80 flex items-center gap-2"><Target className="h-4 w-4 text-white" /> Value Score Range</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold text-white/40">MIN (0 - 100)</span>
                                        <input type="number" className="w-full rounded border-white/10 text-sm font-bold" value={newPlan.min_value} onChange={e => setNewPlan({...newPlan, min_value: e.target.value})} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold text-white/40">MAX (0 - 100)</span>
                                        <input type="number" className="w-full rounded border-white/10 text-sm font-bold" value={newPlan.max_value} onChange={e => setNewPlan({...newPlan, max_value: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-black text-white px-10 py-3 rounded font-bold text-sm shadow-soft hover:scale-105 transition-transform">
                                Deploy Strategy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List of Current Strategies */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Active Rules Library</h3>
                {plans.map((plan) => (
                    <div key={plan.plan_id} className="bg-[#111] p-6 rounded border border-white/10 flex flex-col md:flex-row justify-between items-center group hover:border-lime/50 transition-all">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <div className="h-12 w-12 rounded bg-white/[0.04] flex items-center justify-center text-white group-hover:bg-black group-hover:text-white transition-colors">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{plan.name}</h4>
                                <p className="text-xs text-white/40 font-medium italic">Investment: {plan.bank_investment}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-white/40 uppercase">AI Threshold</p>
                                <p className="text-sm font-black text-white/80">{(plan.min_risk_score * 100).toFixed(0)}% - {(plan.max_risk_score * 100).toFixed(0)}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-white/40 uppercase">Value Segment</p>
                                <p className="text-sm font-black text-white">{plan.min_value_score} - {plan.max_value_score}</p>
                            </div>
                            <button className="p-2 text-white/30 hover:text-red-500 transition-colors">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RetentionRules;
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Save, Settings2, ShieldCheck, Database } from 'lucide-react';

const RulesConfig = () => {
    const { token } = useContext(AuthContext);
    const [valueRules, setValueRules] = useState({
        balance_max_points: 40,
        salary_max_points: 30,
        active_member_bonus: 15
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchRules = async () => {
            const res = await fetch('http://localhost:5000/api/dashboard/value-rules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') setValueRules(data.data);
        };
        fetchRules();
    }, [token]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/dashboard/value-rules', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(valueRules)
            });
            if (res.ok) setMessage('Rules updated successfully!');
        } catch (err) {
            setMessage('Error updating rules.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white">System Logic Settings</h2>
                <p className="text-sm text-white/50">Adjust the weights for AI risk assessment and customer value scoring.</p>
            </div>

            {/* Value Scoring Logic */}
            <div className="bg-[#111] rounded p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-lime/30 rounded text-black">
                        <Settings2 className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Value Scoring Weights</h3>
                </div>

                <div className="space-y-10">
                    {/* Balance Weight Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-white/80">Account Balance Weight</label>
                            <span className="bg-lime/20 text-black px-3 py-1 rounded-full text-xs font-black">
                                {valueRules.balance_max_points} Points Max
                            </span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={valueRules.balance_max_points}
                            onChange={(e) => setValueRules({...valueRules, balance_max_points: e.target.value})}
                            className="w-full h-2 bg-gray-200 rounded appearance-none cursor-pointer accent-black"
                        />
                        <p className="text-[11px] text-white/40 font-medium">How much impact the customer's total balance has on their overall value score.</p>
                    </div>

                    {/* Salary Weight Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-white/80">Estimated Salary Weight</label>
                            <span className="bg-lime/20 text-black px-3 py-1 rounded-full text-xs font-black">
                                {valueRules.salary_max_points} Points Max
                            </span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={valueRules.salary_max_points}
                            onChange={(e) => setValueRules({...valueRules, salary_max_points: e.target.value})}
                            className="w-full h-2 bg-gray-200 rounded appearance-none cursor-pointer accent-black"
                        />
                    </div>

                    {/* Active Member Bonus */}
                    <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-bold text-white/90">Active Member Bonus</p>
                                <p className="text-[10px] text-white/40 font-bold uppercase">Points added for high engagement</p>
                            </div>
                        </div>
                        <input 
                            type="number" 
                            className="w-20 text-center rounded border-white/10 font-bold text-white"
                            value={valueRules.active_member_bonus}
                            onChange={(e) => setValueRules({...valueRules, active_member_bonus: e.target.value})}
                        />
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
                    <p className="text-xs text-white/40 italic">Changes will apply to the next batch assessment run.</p>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded font-bold hover:bg-neutral-800 transition-all"
                    >
                        {isSaving ? 'Updating...' : <><Save className="h-4 w-4" /> Save Configuration</>}
                    </button>
                </div>
                {message && <p className="mt-4 text-center text-sm font-bold text-green-600">{message}</p>}
            </div>
        </div>
    );
};

export default RulesConfig;
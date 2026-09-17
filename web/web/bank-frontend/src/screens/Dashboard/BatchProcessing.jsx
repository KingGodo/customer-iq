import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Play, History, CheckCircle2, Clock, Cpu, BarChart3 } from 'lucide-react';

const BatchProcessing = () => {
    const { token } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const fetchHistory = async () => {
        const res = await fetch('http://localhost:5000/api/dashboard/batch-history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') setHistory(data.data);
    };

    useEffect(() => { fetchHistory(); }, [token]);

    const handleRunBatch = async () => {
        setIsRunning(true);
        setStatusMessage('Initializing AI Pipeline...');
        try {
            const res = await fetch('http://localhost:5000/api/trigger-batch', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                setStatusMessage(`Success! Processed  customers.`);
                fetchHistory(); // Refresh the list
            }
        } catch (err) {
            setStatusMessage('Error executing batch job.');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111] p-4 rounded border border-white/10">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Cpu className="h-6 w-6 text-white" /> AI Batch Processing
                    </h2>
                    <p className="text-sm text-white/50 mt-1">Synchronize customer data with the Neural Network and Rules Engine.</p>
                </div>
                <button 
                    onClick={handleRunBatch}
                    disabled={isRunning}
                    className={`flex items-center gap-2 px-8 py-4 rounded font-bold text-white transition-all ${
                        isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-neutral-800'
                    }`}
                >
                    {isRunning ? <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" /> : <Play className="h-5 w-5" />}
                    {isRunning ? 'Processing...' : 'Run Mass Assessment'}
                </button>
            </div>

            {statusMessage && (
                <div className="bg-lime/20 border border-lime/40 text-black p-4 rounded text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> {statusMessage}
                </div>
            )}

            {/* History Table */}
            <div className="bg-[#111] rounded border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                    <History className="h-5 w-5 text-white/40" />
                    <h3 className="font-bold text-white">Execution History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.04] text-[10px] uppercase tracking-widest text-white/40 font-black">
                            <tr>
                                <th className="px-6 py-4">Run Date</th>
                                <th className="px-6 py-4">Customers Synced</th>
                                <th className="px-6 py-4">Detection Rate (Avg)</th>
                                <th className="px-6 py-4">Primary Strategy</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.map((run, i) => (
                                <tr key={i} className="hover:bg-white/[0.04] transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-2 text-sm font-bold text-white/80">
                                        <Clock className="h-4 w-4 text-white/30" /> {new Date(run.run_timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white/50 font-medium">
                                        {run.customers_processed} Members
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4 text-lime" />
                                            <span className="text-sm font-black text-white">{(run.avg_risk_detected * 100).toFixed(1)}% Risk</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-white/50 italic">
                                        {run.primary_strategy || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Completed</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BatchProcessing;
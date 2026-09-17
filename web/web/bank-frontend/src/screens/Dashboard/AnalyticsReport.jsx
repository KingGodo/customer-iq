import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Activity, Clock, Target, BrainCircuit } from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, LineChart, Line
} from 'recharts';

const AnalyticsReport = () => {
    const { token } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/dashboard/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.status === 'success') {
                    // Add some empty state data if they literally just created the table
                    setAnalytics(data.data.length > 0 ? data.data : []); 
                }
            } catch (err) {
                console.error("Failed to load analytics");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    if (isLoading) return <div className="p-4 text-center text-white/50 font-bold animate-pulse">Loading AI Metrics...</div>;

    if (analytics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-[#111] rounded border border-white/10 text-center">
                <BrainCircuit className="h-16 w-16 text-white/30 mb-4" />
                <h2 className="text-2xl font-black text-white">No AI Data Found</h2>
                <p className="text-white/50 mt-2">Trigger a Batch Assessment in the processing tab to generate your first AI performance report.</p>
            </div>
        );
    }

    // Calculate Averages for Top Cards
    const latestRun = analytics[analytics.length - 1];
    const avgConfidence = (analytics.reduce((acc, curr) => acc + parseFloat(curr.confidence_pct), 0) / analytics.length).toFixed(1);
    const avgTime = (analytics.reduce((acc, curr) => acc + curr.execution_time_ms, 0) / analytics.length).toFixed(0);

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto animate-in fade-in duration-500">
            
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-lime/30 text-black rounded"><Activity className="h-6 w-6" /></div>
                <div>
                    <h2 className="text-2xl font-black text-white">AI Model Performance</h2>
                    <p className="text-sm text-white/50 font-medium mt-1">Real-time MLOps tracking and model confidence metrics.</p>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111] p-6 rounded border border-white/10 flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Target className="h-6 w-6" /></div>
                    <div>
                        <p className="text-xs font-black text-white/40 uppercase">Avg Model Confidence</p>
                        <h3 className="text-2xl font-black text-white">{avgConfidence}%</h3>
                    </div>
                </div>
                <div className="bg-[#111] p-6 rounded border border-white/10 flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><Clock className="h-6 w-6" /></div>
                    <div>
                        <p className="text-xs font-black text-white/40 uppercase">Avg Execution Time</p>
                        <h3 className="text-2xl font-black text-white">{avgTime} ms</h3>
                    </div>
                </div>
                <div className="bg-[#111] p-6 rounded border border-white/10 flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><BrainCircuit className="h-6 w-6" /></div>
                    <div>
                        <p className="text-xs font-black text-white/40 uppercase">Latest Run Status</p>
                        <h3 className="text-sm font-black text-green-600 mt-1">OPTIMAL ({latestRun.model_version || 'v1.0'})</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CHART 1: Detection Rate Over Time */}
                <div className="bg-[#111] p-6 rounded border border-white/10">
                    <h3 className="font-bold text-white mb-6">Risk Detection Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics}>
                                <defs>
                                    <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="time_label" tick={{fontSize: 10}} tickMargin={10} />
                                <YAxis tick={{fontSize: 10}} tickFormatter={(val) => `${val}%`} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="churn_rate_pct" name="Churn Detected" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorChurn)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CHART 2: System Load & Execution Time */}
                <div className="bg-[#111] p-6 rounded border border-white/10">
                    <h3 className="font-bold text-white mb-6">Processing Load & Speed</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="time_label" tick={{fontSize: 10}} />
                                <YAxis yAxisId="left" orientation="left" tick={{fontSize: 10}} />
                                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} />
                                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                <Bar yAxisId="left" dataKey="total_customers_scanned" name="Profiles Scanned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="execution_time_ms" name="Execution Time (ms)" stroke="#f97316" strokeWidth={3} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsReport;
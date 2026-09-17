import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
    Database, Key, UploadCloud, Terminal, 
    FileText, CheckCircle2, Copy, AlertTriangle, FileUp, ChevronDown, ChevronUp
} from 'lucide-react';

const DataIngestion = () => {
    const { token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('api');
    
    // API State
    const [apiKey, setApiKey] = useState('Loading...');
    const [copied, setCopied] = useState(false);

    // CSV State
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/settings/api-key', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.status === 'success') setApiKey(data.key);
                else setApiKey('Error loading key');
            } catch (err) {
                setApiKey('Connection error');
            }
        };
        if (token) fetchApiKey();
    }, [token]);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            setUploadStatus({ type: '', message: '' });
        } else {
            setFile(null);
            setUploadStatus({ type: 'error', message: 'Please select a valid .csv file.' });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setUploadStatus({ type: '', message: '' });

        const formData = new FormData();
        formData.append('customer_file', file);

        try {
            const res = await fetch('http://localhost:5000/api/upload/csv', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, 
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                setUploadStatus({ type: 'success', message: `Success! ${data.fileName} uploaded and queued.` });
                setFile(null);
                document.getElementById('csv-upload').value = '';
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err) {
            setUploadStatus({ type: 'error', message: err.message });
        } finally {
            setIsUploading(false);
        }
    };

    // ==========================================
    // 📚 API DOCUMENTATION DATA (All 4 Endpoints)
    // ==========================================
    const apiEndpoints = [
        {
            title: "Sync Customer Profiles",
            url: "/api/v1/sync/customers",
            description: "Creates or updates core customer identity and demographic data. Uses ON DUPLICATE KEY UPDATE logic to keep credit scores and active status up-to-date without creating duplicates.",
            payload: `{
  "customers": [
    {
      "uid": "CUST-88901",
      "fName": "Tino",
      "lName": "M.",
      "gender": "M",
      "age": 28,
      "geo": "Harare",
      "score": 720,
      "tenure": 3,
      "active": 1,
      "hasCard": 1,
      "joined": "2023-01-15"
    }
  ]
}`
        },
        {
            title: "Sync Transactions",
            url: "/api/v1/sync/transactions",
            description: "Appends new financial transactions. This historical data drives the dynamic balance calculation and AI feature engineering.",
            payload: `{
  "transactions": [
    {
      "customerId": 105,
      "amount": 1500.00,
      "type": "CREDIT",
      "category": "SALARY",
      "desc": "Monthly Payroll Deposit"
    }
  ]
}`
        },
        {
            title: "Sync Product Enrollments",
            url: "/api/v1/sync/products",
            description: "Logs when a customer enrolls in a specific banking product (e.g., Savings Account, Auto Loan, Fixed Deposit).",
            payload: `{
  "enrollments": [
    {
      "customerId": 105,
      "productId": 3,
      "date": "2026-05-01",
      "status": "ACTIVE"
    }
  ]
}`
        },
        {
            title: "Sync Loyalty & Engagement",
            url: "/api/v1/sync/loyalty",
            description: "Updates the customer's accumulated loyalty points and their latest Customer Satisfaction (CSAT) score. Uses UPSERT logic.",
            payload: `{
  "loyaltyData": [
    {
      "customerId": 105,
      "points": 4500,
      "score": 8.5
    }
  ]
}`
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
            
            <div className="bg-[#111] p-4 rounded border border-white/10 flex items-start gap-4">
                <div className="p-3 bg-lime/30 text-black rounded">
                    <Database className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white">Data Ingestion Engine</h2>
                    <p className="text-sm text-white/50 font-medium mt-1">Connect legacy systems or manually upload your institutional data.</p>
                </div>
            </div>

            <div className="flex p-1 bg-white/[0.06] rounded w-fit">
                <button onClick={() => setActiveTab('api')} className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-bold transition-all ${activeTab === 'api' ? 'bg-[#111] text-white' : 'text-white/50 hover:text-white'}`}>
                    <Terminal className="h-4 w-4" /> API Developer Gateway
                </button>
                <button onClick={() => setActiveTab('csv')} className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-bold transition-all ${activeTab === 'csv' ? 'bg-[#111] text-white' : 'text-white/50 hover:text-white'}`}>
                    <FileText className="h-4 w-4" /> Manual CSV Import
                </button>
            </div>

            {/* TAB 1: API INTEGRATION */}
            {activeTab === 'api' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    
                    <div className="bg-gray-900 rounded p-4 text-white relative overflow-hidden shadow-gray-200">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Key className="h-32 w-32" /></div>
                        <h3 className="text-lg font-bold flex items-center gap-2 text-lime mb-2">
                            <Key className="h-5 w-5" /> Secret Access Key
                        </h3>
                        <p className="text-sm text-white/40 mb-6 max-w-xl leading-relaxed">
                            Pass this key in the <code className="bg-gray-800 px-2 py-0.5 rounded text-white/30">x-api-key</code> header to authenticate. Base URL: <code className="bg-gray-800 px-2 py-0.5 rounded text-white/30">http://localhost:5000</code>
                        </p>
                        
                        <div className="flex items-center justify-between bg-gray-800 p-4 rounded border border-gray-700 max-w-md">
                            <code className="font-mono text-sm font-bold text-green-400 truncate pr-4">{apiKey}</code>
                            <button onClick={handleCopy} className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-white/30 flex-shrink-0">
                                {copied ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#111] rounded border border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-gray-50">
                            <h3 className="font-black text-white uppercase tracking-widest text-sm">Endpoint Reference</h3>
                            <p className="text-sm text-white/50 mt-1">Click on an endpoint to view the required JSON payload structure.</p>
                        </div>
                        
                        <div className="divide-y divide-gray-50">
                            {apiEndpoints.map((endpoint, idx) => (
                                <ExpandableEndpoint key={idx} endpoint={endpoint} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CSV UPLOAD */}
            {activeTab === 'csv' && (
                <div className="bg-[#111] rounded border border-white/10 p-4 animate-in slide-in-from-bottom-4 duration-300 text-center">
                    <div className="mx-auto bg-lime/20 w-16 h-16 rounded flex items-center justify-center text-black mb-6">
                        <FileUp className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Upload Customer Database</h3>
                    <p className="text-sm text-white/50 mb-8 max-w-md mx-auto">
                        Import your legacy data using a standard CSV file. Ensure the file contains headers that map to Customer ID, Name, Balance, and Demographics.
                    </p>

                    <form onSubmit={handleUpload} className="max-w-xl mx-auto space-y-6">
                        <div className="relative border-2 border-dashed border-white/15 rounded p-4 hover:bg-white/[0.04] hover:border-lime transition-all cursor-pointer">
                            <input type="file" id="csv-upload" accept=".csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-3 pointer-events-none">
                                <UploadCloud className={`h-10 w-10 ${file ? 'text-white' : 'text-white/40'}`} />
                                <div className="text-sm font-bold text-white/80">
                                    {file ? file.name : "Click to browse or drag and drop"}
                                </div>
                                <div className="text-[10px] uppercase font-black tracking-widest text-white/40">
                                    {file ? `${(file.size / 1024).toFixed(2)} KB` : "CSV Files Only (Max 10MB)"}
                                </div>
                            </div>
                        </div>

                        {uploadStatus.message && (
                            <div className={`p-4 rounded text-sm font-bold flex items-center justify-center gap-2 ${uploadStatus.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {uploadStatus.type === 'error' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                {uploadStatus.message}
                            </div>
                        )}

                        <button type="submit" disabled={!file || isUploading} className={`w-full py-4 rounded font-black text-sm text-white transition-all ${(!file || isUploading) ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-white/10 hover:scale-[1.02]'}`}>
                            {isUploading ? 'PROCESSING FILE...' : 'INITIALIZE UPLOAD PIPELINE'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

// --- Expandable Documentation Row ---
const ExpandableEndpoint = ({ endpoint }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="group transition-all">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex items-center justify-between p-6 hover:bg-white/[0.04] focus:outline-none"
            >
                <div className="text-left">
                    <h4 className="font-bold text-white">{endpoint.title}</h4>
                    <div className="flex items-center gap-3 mt-2 font-mono text-xs">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-black">POST</span>
                        <span className="text-white/60">{endpoint.url}</span>
                    </div>
                </div>
                <div className="text-white/40 group-hover:text-white transition-colors">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </button>

            {/* Expanded Content (Documentation Details) */}
            {isOpen && (
                <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-3xl">
                        {endpoint.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Request Block */}
                        <div>
                            <h5 className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">Request Payload (JSON)</h5>
                            <div className="bg-gray-900 rounded p-4 overflow-x-auto shadow-inner border border-gray-800">
                                <pre className="text-[11px] text-green-400 font-mono leading-relaxed">
                                    {endpoint.payload}
                                </pre>
                            </div>
                        </div>

                        {/* Response Block */}
                        <div>
                            <h5 className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">Success Response (200 OK)</h5>
                            <div className="bg-gray-900 rounded p-4 overflow-x-auto shadow-inner border border-gray-800">
                                <pre className="text-[11px] text-blue-400 font-mono leading-relaxed">
{`{
  "status": "success",
  "message": "Successfully synced records."
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataIngestion;
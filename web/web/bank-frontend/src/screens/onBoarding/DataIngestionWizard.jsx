import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, CheckCircle2, ShieldCheck, Database, ListOrdered, Link2 } from 'lucide-react';
import Swal from 'sweetalert2';

// Ingestion step schema configuration mappings
const INGESTION_STEPS = [
    {
        id: 1,
        title: "Reference Card Configurations",
        endpoint: "ref-card-types",
        payloadKey: "cards",
        description: "Establishes institutional tier levels, spending limits, and membership rates.",
        requiredFields: ["card_name", "annual_fee"],
        sampleRow: "STANDARD, 0.00\nSILVER, 50.00\nGOLD, 100.00"
    },
    {
        id: 2,
        title: "Product Reference Codes",
        endpoint: "ref-bank-products",
        payloadKey: "products",
        description: "Registers account portfolios, commercial facilities, and checking structures.",
        requiredFields: ["product_name", "category"],
        sampleRow: "Everyday Checking, CHECKING\nAuto Loan, LOAN\nRetirement IRA, INVESTMENT"
    },
    {
        id: 3,
        title: "Retention Plan Schemes",
        endpoint: "retention-plans",
        payloadKey: "plans",
        description: "Loads localized retention workflows and automation strategies into the model logic.",
        requiredFields: ["name", "bank_investment", "actionable_steps"],
        sampleRow: "VIP Rescue Campaign, 250.00, \"['Call client', 'Waive fees']\""
    },
    {
        id: 4,
        title: "Scoring Weight Frameworks",
        endpoint: "value-scoring-rules",
        payloadKey: "rules",
        description: "Configures normalization factors and core metrics balances used by the neural network weights.",
        requiredFields: ["balance_normalization_factor", "balance_max_points", "salary_normalization_factor", "salary_max_points", "active_member_bonus", "diamond_card_bonus"],
        sampleRow: "150000.00, 40, 120000.00, 30, 15, 15"
    },
    {
        id: 5,
        title: "Core Customer Profiles",
        endpoint: "customer-profiles",
        payloadKey: "customers",
        description: "Maps base client entities, demographics, and credit scores across the operational platform.",
        requiredFields: ["bank_id", "customer_uid", "first_name", "last_name", "gender", "age", "geography", "credit_score", "tenure_years", "is_active_member", "has_cr_card", "card_type_id"],
        sampleRow: "DYNAMIC_ID, CUST-8210, John, Smith, Male, 42, France, 710, 3, 1, 1, 1"
    },
    {
        id: 6,
        title: "Customer Loyalty Data",
        endpoint: "customer-loyalty",
        payloadKey: "loyaltyLogs",
        description: "Appends client point balances and satisfaction indices directly onto core customer IDs.",
        requiredFields: ["customer_id", "points_earned", "satisfaction_score"],
        sampleRow: "1, 4500, 5\n2, 120, 2"
    },
    {
        id: 7,
        title: "Ledger Transaction Streams",
        endpoint: "customer-transactions",
        payloadKey: "transactions",
        description: "Streams batch financial movements, deposits, and account histories into the feature engine.",
        requiredFields: ["customer_id", "amount", "transaction_type", "category", "description"],
        sampleRow: "1, 9500.00, CREDIT, SALARY, Corporate Payroll"
    }
];

const DataIngestionWizard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Fallback: If no ID was forwarded from registration, default to a dev fallback ID (e.g., 5)
    const initialBankId = location.state?.bankId;

    const [bankId, setBankId] = useState(initialBankId);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [completedSteps, setCompletedSteps] = useState([]);
    const fileInputRef = useRef(null);

    const activeStep = INGESTION_STEPS[currentStepIdx];

    const parseCSVToJson = (text, expectedFields) => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length < 2) throw new Error("Dataset contains insufficient data rows.");
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const missingFields = expectedFields.filter(f => !headers.includes(f.toLowerCase()));
        if (missingFields.length > 0) {
            throw new Error(`Data format signature mismatch. Missing expected columns: ${missingFields.join(', ')}`);
        }

        return lines.slice(1).map((line) => {
            const currentValues = line.split(',').map(v => v.trim());
            const rowObject = {};
            
            headers.forEach((header, index) => {
                let cellValue = currentValues[index];
                if (cellValue && (cellValue.startsWith('"') || cellValue.startsWith("'"))) {
                    cellValue = cellValue.slice(1, -1);
                }
                rowObject[header] = cellValue;
            });
            return rowObject;
        });
    };

    const processUploadPipeline = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                const textData = event.target.result;
                const jsonArray = parseCSVToJson(textData, activeStep.requiredFields);
                
                const requestPayload = { [activeStep.payloadKey]: jsonArray };

                const response = await fetch(`http://localhost:5000/api/bulk/${activeStep.endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestPayload)
                });

                const serverData = await response.json();
                if (!response.ok) throw new Error(serverData.error || serverData.details || "Transmission failed.");

                Swal.fire({
                    icon: 'success',
                    title: 'Sync Complete',
                    text: serverData.message,
                    confirmButtonColor: '#111827',
                    customClass: { popup: 'rounded-2xl' }
                });

                setCompletedSteps([...completedSteps, activeStep.id]);
                setFile(null);

                if (currentStepIdx < INGESTION_STEPS.length - 1) {
                    setCurrentStepIdx(currentStepIdx + 1);
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'All Tiers Populated',
                        text: 'Core institutional telemetry configuration is fully synchronized.',
                        confirmButtonColor: '#111827',
                        customClass: { popup: 'rounded-2xl' }
                    }).then(() => {
                        navigate('/login'); // Safe destination after onboarding finishes
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Processing Denied',
                    text: err.message,
                    confirmButtonColor: '#111827',
                    customClass: { popup: 'rounded-2xl' }
                });
            } finally {
                // Safely handles loading resets across all babel installations
                setIsLoading(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <main className="flex min-h-screen w-full bg-white select-none">
            
            {/* LEFT SIDE PANEL: Active Sequential Phase Upload Form */}
            <div className="flex w-full flex-col justify-between px-6 py-8 md:px-12 lg:w-[45%] xl:px-16">
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white shadow-md">
                            <Database className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-black tracking-widest text-gray-900 uppercase">Deployment Hub</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">Step {activeStep.id} of {INGESTION_STEPS.length}</span>
                </div>

                <div className="my-auto py-8">
                    {/* EDITABLE/FLEXIBLE NODE ASSIGNMENT LINKAGE */}
                    <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-gray-50 p-2 pl-3 border border-gray-200">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                            <Link2 className="h-3.5 w-3.5 text-gray-400" />
                            <span>Node Target Bank ID:</span>
                        </div>
                        <input 
                            type="number" 
                            value={bankId} 
                            onChange={(e) => setBankId(e.target.value)}
                            className="w-14 rounded bg-white px-1.5 py-0.5 text-xs font-mono font-bold border border-gray-300 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                            Step Dependent Processing Pipeline
                        </span>
                        <h2 className="text-2xl font-black tracking-tight text-gray-900 lg:text-3xl">{activeStep.title}</h2>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed pt-1">{activeStep.description}</p>
                    </div>

                    <form className="mt-6 space-y-6" onSubmit={processUploadPipeline}>
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                const droppedFile = e.dataTransfer.files[0];
                                if (droppedFile?.name.endsWith('.csv')) setFile(droppedFile);
                            }}
                            onClick={() => fileInputRef.current.click()}
                            className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer
                                ${isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-gray-50/40 hover:bg-gray-50/80'}`}
                        >
                            <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} accept=".csv" className="hidden" />
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm border border-gray-100 group-hover:scale-105 transition-transform">
                                <UploadCloud className="h-5 w-5" />
                            </div>

                            {!file ? (
                                <>
                                    <p className="mt-3 text-xs font-bold text-gray-800">Drag & drop step-{activeStep.id} CSV sheet here</p>
                                    <p className="mt-1 text-[11px] text-gray-400">Comma separated data standard text files</p>
                                </>
                            ) : (
                                <>
                                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gray-900">
                                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                        <span>{file.name}</span>
                                    </div>
                                    <p className="mt-0.5 text-[10px] text-emerald-600 font-bold">Loaded ({(file.size / 1024).toFixed(1)} KB)</p>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {INGESTION_STEPS.map((step, idx) => (
                                <button 
                                    key={step.id} type="button" disabled={idx > completedSteps.length}
                                    onClick={() => { setFile(null); setCurrentStepIdx(idx); }}
                                    className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black border transition-all
                                        ${idx === currentStepIdx ? 'bg-gray-900 border-gray-900 text-white ring-2 ring-gray-900/10' : 
                                          completedSteps.includes(step.id) ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                                          'bg-white border-gray-100 text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                                >
                                    {completedSteps.includes(step.id) ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.id}
                                </button>
                            ))}
                        </div>

                        <button type="submit" disabled={!file || isLoading}
                            className="w-full rounded-xl bg-gray-900 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-black transition-all active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed">
                            {isLoading ? 'Verifying Field Matrices...' : `Parse and Stream Step ${activeStep.id}`}
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 pt-4 text-[11px] font-medium text-gray-400">
                    <ShieldCheck className="h-4 w-4 text-gray-400" />
                    <span>Enforcing strong system data alignment and verification constraints.</span>
                </div>
            </div>

            {/* RIGHT SIDE PANEL: Live Dynamic Interactive Fields Blueprint Documentation */}
            <div 
                className="hidden lg:flex lg:w-[55%] relative bg-cover bg-center bg-no-repeat text-white flex-col justify-center p-16"
                style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=80')` 
                }}
            >
                <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-[3px]" />
                
                <div className="relative max-w-xl space-y-6 z-10">
                    <div>
                        <span className="text-[9px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 w-max block mb-2">
                            Step Requirement Matrix
                        </span>
                        <h1 className="text-xl font-black tracking-tight">Required CSV Column Formatting</h1>
                        <p className="text-xs text-gray-400 font-medium">
                            Your sheet headers row must match the specified values below. Columns are case-insensitive but must match listed keys.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Required Header Titles</span>
                        <div className="flex flex-wrap gap-1.5">
                            {activeStep.requiredFields.map((field) => (
                                <span key={field} className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-blue-300">
                                    {field}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Target Blueprint Format Sample</span>
                            <span className="text-[9px] px-2 py-0.5 rounded font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">UTF-8 Encoded</span>
                        </div>
                        <div className="w-full rounded-xl p-4 bg-black/60 border border-white/5 font-mono text-[11px] text-gray-300 leading-relaxed whitespace-pre shadow-inner">
                            <span className="text-gray-500 font-bold">{activeStep.requiredFields.join(',')}\n</span>
                            {activeStep.sampleRow.replace(/DYNAMIC_ID/g, bankId)}
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
};

export default DataIngestionWizard;
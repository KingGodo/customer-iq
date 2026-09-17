import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import Pages
import Landing from './screens/onBoarding/Landing';
import Login from './screens/onBoarding/Login';
import Register from './screens/onBoarding/Register';
import Overview from './screens/Dashboard/Overview';
import CustomerRiskPage from './screens/Dashboard/customers';
import CustomerProfile from './screens/Dashboard/CustomerProfile';
import RulesConfig from './screens/Dashboard/RuleConfig';
import BatchProcessing from './screens/Dashboard/BatchProcessing';
import RetentionRules from './screens/Dashboard/RetentionRules';
import DataIngestion from './screens/Dashboard/DataIngestion';
import Analytics from './screens/Dashboard/AnalyticsReport';
import DataIngestionWizard from './screens/onBoarding/DataIngestionWizard';
import Communications from './screens/Dashboard/Communications';
// Import Layout
import DashboardLayout from './screens/Dashboard/layout';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                     <Route 
                        path="/ingest-wizard" 
                        element={
                            
                                <DataIngestionWizard />
                            
                        } 
                    />
                    {/* Protected Dashboard Routes Wrapped in the Layout */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <DashboardLayout>
                                <Overview />
                            </DashboardLayout>
                        } 
                    />
                    
                    
                    <Route 
                        path="/dashboard/customers" 
                        element={
                            <DashboardLayout>
                                <CustomerRiskPage />
                            </DashboardLayout>
                        } 
                    />

                    <Route 
                        path="/dashboard/customers/:id" 
                        element={
                            <DashboardLayout>
                                <CustomerProfile />
                            </DashboardLayout>
                        } 
                    />  
                    <Route 
                        path="/dashboard/rules" 
                        element={
                            <DashboardLayout>
                                <RulesConfig />
                            </DashboardLayout>
                        } 
                    />
                    <Route 
                        path="/dashboard/batch" 
                        element={
                            <DashboardLayout>
                                <BatchProcessing />
                            </DashboardLayout>
                        } 
                    />
                    <Route 
                        path="/dashboard/retention" 
                        element={
                            <DashboardLayout>
                                <RetentionRules />
                            </DashboardLayout>
                        } 
                    />
                    <Route
                        path="/dashboard/communications"
                        element={
                            <DashboardLayout>
                                <Communications />
                            </DashboardLayout>
                        }
                    />
                    <Route 
                        path="/dashboard/ingestion" 
                        element={
                            <DashboardLayout>
                                <DataIngestion />
                            </DashboardLayout>
                        } 
                    />
                    <Route 
                        path="/dashboard/analytics" 
                        element={
                            <DashboardLayout>
                                <Analytics />
                            </DashboardLayout>
                        } 
                    />
                   
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GoogleSuccess from "./pages/GoogleSuccess";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import MyApplications from "./pages/MyApplications";
import CreateJob from "./pages/CreateJob";
import CandidateProfile from "./pages/CandidateProfile";
import Companies from "./pages/Companies";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ContactMessages from "./pages/ContactMessages";

import AdminDashboard from "./pages/AdminDashboard";

import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import CreateRecruiterJob from "./pages/recruiter/CreateJob";
import MyJobs from "./pages/recruiter/MyJobs";
import JobApplications from "./pages/recruiter/JobApplications";
import RecruiterApplications from "./pages/recruiter/RecruiterApplications";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Navbar />

                <main className="flex-grow">
                    <Routes>
                        {/* ================= PUBLIC ROUTES ================= */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/google-success" element={<GoogleSuccess />} />

                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/jobs/:id" element={<JobDetails />} />
                        <Route path="/companies" element={<Companies />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />

                        {/* ================= CANDIDATE ROUTES ================= */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["candidate"]}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/candidate-profile"
                            element={
                                <ProtectedRoute allowedRoles={["candidate"]}>
                                    <CandidateProfile />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/my-applications"
                            element={
                                <ProtectedRoute allowedRoles={["candidate"]}>
                                    <MyApplications />
                                </ProtectedRoute>
                            }
                        />

                        {/* ================= COMPANY / RECRUITER JOB ROUTE ================= */}
                        <Route
                            path="/create-job"
                            element={
                                <ProtectedRoute allowedRoles={["company", "recruiter", "admin"]}>
                                    <CreateJob />
                                </ProtectedRoute>
                            }
                        />

                        {/* ================= RECRUITER ROUTES ================= */}
                        <Route
                            path="/recruiter/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["company", "recruiter", "admin"]}>
                                    <RecruiterDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/recruiter/profile"
                            element={
                                <ProtectedRoute allowedRoles={["company", "recruiter", "admin"]}>
                                    <RecruiterProfile />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/recruiter/create-job"
                            element={
                                <ProtectedRoute allowedRoles={["company", "recruiter", "admin"]}>
                                    <CreateRecruiterJob />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/recruiter/my-jobs"
                            element={
                                <ProtectedRoute allowedRoles={["company", "recruiter", "admin"]}>
                                    <MyJobs />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/recruiter/applied-candidates"
                            element={
                                <ProtectedRoute allowedRoles={["company", "recruiter", "admin"]}>
                                    <RecruiterApplications />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/recruiter/resume-review"
                            element={
                                <ProtectedRoute allowedRoles={["company", "recruiter", "admin"]}>
                                    <RecruiterApplications />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/recruiter/shortlist-reject"
                            element={
                                <ProtectedRoute allowedRoles={["company", "recruiter", "admin"]}>
                                    <RecruiterApplications />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/recruiter/job-applications/:jobId"
                            element={
                                <ProtectedRoute allowedRoles={["company", "recruiter", "admin"]}>
                                    <JobApplications />
                                </ProtectedRoute>
                            }
                        />

                        {/* ================= ADMIN ROUTES ================= */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/contact-messages"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <ContactMessages />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>

                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;                                                                       
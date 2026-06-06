// import {
//     BrowserRouter,
//     Routes,
//     Route
// } from "react-router-dom";

// import MainLayout from "../layouts/MainLayout";

// import Home from "../pages/Home";
// import Login from "../pages/Login";
// import Register from "../pages/Register";
// import Dashboard from "../pages/Dashboard";

// function AppRoutes() {

//     return (

//         <BrowserRouter>

//             <Routes>

//                 {/* Main Layout Routes */}
//                 <Route
//                     path="/"
//                     element={
//                         <MainLayout>
//                             <Home />
//                         </MainLayout>
//                     }
//                 />

//                 <Route
//                     path="/login"
//                     element={
//                         <MainLayout>
//                             <Login />
//                         </MainLayout>
//                     }
//                 />

//                 <Route
//                     path="/register"
//                     element={
//                         <MainLayout>
//                             <Register />
//                         </MainLayout>
//                     }
//                 />

//                 <Route
//                     path="/dashboard"
//                     element={
//                         <MainLayout>
//                             <Dashboard />
//                         </MainLayout>
//                     }
//                 />

//             </Routes>

//         </BrowserRouter>
//     );
// }

// export default AppRoutes;
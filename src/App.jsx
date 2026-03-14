import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import ChatPreview from "./components/ChatPreview";
import Footer from "./components/Footer";
import SplashCursor from "./components/SplashCursor";
import Profile from "./pages/Profile";


import Auth from "./pages/Auth";
import ChatDashboard from "./pages/ChatDashboard";
import UserProfile from "./pages/UserProfile";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {

return(

<div className="relative min-h-screen text-white overflow-x-hidden">

<SplashCursor />
<div className="fixed inset-0 bg-black -z-20"></div>

<Routes>

<Route
path="/"
element={
<>
<Navbar />
<Hero />
<Features />
<ChatPreview />
<Footer />
</>
}
/>

<Route path="/auth" element={<Auth />} />

<Route
path="/chat"
element={
<ProtectedRoute>
<ChatDashboard />
</ProtectedRoute>
}
/>

<Route
path="/profile/:id"
element={
<ProtectedRoute>
<UserProfile />
</ProtectedRoute>
}
/>

<Route
path="/profile"
element={
<ProtectedRoute>
<Profile/>
</ProtectedRoute>
}
/>


</Routes>

</div>

);
}

import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyListingsPage from './pages/MyListingsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

function AnimatedRoutes() {
  const location = useLocation();
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.classList.remove('page-enter-active');
    el.classList.add('page-enter');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.remove('page-enter');
        el.classList.add('page-enter-active');
      });
    });
  }, [location.pathname]);

  return (
    <div ref={containerRef}>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/host/create" element={<CreateListingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">
        <AnimatedRoutes />
      </main>
    </div>
  );
}
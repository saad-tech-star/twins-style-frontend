import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home/Home'
import Shop from './pages/shop/shop'
import Contact from './pages/contact/contact.jsx'
import Cart from './pages/cart/cart'
import Checkout from './pages/checkout/checkout.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/admin/login" />
  return children
}

const AppLayout = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdmin && <Navbar />}
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/shop"        element={<Shop />} />
          <Route path="/contact"     element={<Contact />} />
          <Route path="/cart"        element={<Cart />} />
          <Route path="/product/:id" element={<Shop />} />
          <Route path="/checkout"    element={<Checkout />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }/>
          <Route path="/admin" element={<Navigate to="/admin/login" />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <AppLayout />
    </Router>
  )
}

export default App
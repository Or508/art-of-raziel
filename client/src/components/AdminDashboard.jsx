import React, { useState, lazy, Suspense, useMemo } from 'react';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Menu,
  X,
  Package,
  UserCheck,
  CalendarDays,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import './AdminDashboard.css';

const ProductsManagement = lazy(() => import('./ProductsManagement'));
const OrdersTable = lazy(() => import('./OrdersTable'));
const ContactRequestsTable = lazy(() => import('./ContactRequestsTable'));
const CustomersTable = lazy(() => import('./CustomersTable'));
const MeetingsTable = lazy(() => import('./MeetingsTable'));

const AdminDashboard = ({ onBack, language, products = [] }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarItems = useMemo(() => [
    { id: 'orders', icon: ShoppingCart, label: language === 'he' ? 'הזמנות' : 'Orders' },
    { id: 'contact', icon: MessageSquare, label: language === 'he' ? 'בקשות יצירת קשר' : 'Contact Requests' },
    { id: 'products', icon: Package, label: language === 'he' ? 'מוצרים' : 'Products' },
    { id: 'customers', icon: UserCheck, label: language === 'he' ? 'לקוחות' : 'Customers' },
    { id: 'meetings', icon: CalendarDays, label: language === 'he' ? 'פגישות' : 'Meetings' },
  ], [language]);

  return (
    <div className="admin-dashboard">
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <MenuIcon size={24} />
      </button>

      <motion.div
        className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}
        initial={{ x: -300 }}
        animate={{
          x: mobileMenuOpen ? 0 : (sidebarOpen ? 0 : -280)
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title">ART OF RAZIEL</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="back-btn" onClick={onBack}>
            {language === 'he' ? 'חזרה לאתר' : 'Back to Site'}
          </button>
        </div>
      </motion.div>

      <div className="admin-main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            {language === 'he' ? 'לוח בקרה' : 'Admin Dashboard'}
          </h1>
          <div className="header-actions">
            <span className="welcome-text">
              {language === 'he' ? 'ברוך הבא' : 'Welcome'}, Admin
            </span>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען ניהול מוצרים...' : 'Loading products management...'}</div>}>
              <ProductsManagement language={language} products={products} />
            </Suspense>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען הזמנות...' : 'Loading orders...'}</div>}>
              <OrdersTable language={language} />
            </Suspense>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען בקשות יצירת קשר...' : 'Loading contact requests...'}</div>}>
              <ContactRequestsTable language={language} />
            </Suspense>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען לקוחות...' : 'Loading customers...'}</div>}>
              <CustomersTable language={language} />
            </Suspense>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען פגישות...' : 'Loading meetings...'}</div>}>
              <MeetingsTable language={language} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, lazy, Suspense, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Percent,
  Menu as MenuIcon,
  Menu,
  X,
  Package,
  UserCheck,
  CalendarDays,
  BarChart3,
  Home,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import './AdminDashboard.css';

// Import Charts directly (small file, no need for lazy loading)
import { VisitorTrafficChart, CustomerBreakdownChart } from './Charts';

// Import data and utilities from separate files to reduce load
import { 
  getVisitorTrafficData, 
  getCustomerBreakdownData, 
  getTopProducts, 
  getStats 
} from '../utils/dashboardData';
import { calculatePeakHours } from '../utils/dashboardUtils';

// Lazy load heavy components to reduce initial bundle
const ProductsManagement = lazy(() => import('./ProductsManagement'));
const LiveActivityFeed = lazy(() => import('./LiveActivityFeed'));
const AIInsights = lazy(() => import('./AIInsights'));
const OrdersTable = lazy(() => import('./OrdersTable'));
const GlobalMapWidget = lazy(() => import('./GlobalMapWidget'));
const ContactRequestsTable = lazy(() => import('./ContactRequestsTable'));
const CustomersTable = lazy(() => import('./CustomersTable'));
const MeetingsTable = lazy(() => import('./MeetingsTable'));

const AdminDashboard = ({ onBack, language, products = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Memoize data to prevent recalculation on every render
  const visitorTrafficData = useMemo(() => getVisitorTrafficData(), []);
  const customerBreakdownData = useMemo(() => getCustomerBreakdownData(), []);
  const topProducts = useMemo(() => getTopProducts(language), [language]);
  const stats = useMemo(() => getStats(), []);
  
  // Memoize peak hours calculation
  const peakHours = useMemo(() => calculatePeakHours(visitorTrafficData, 3), [visitorTrafficData]);

  // Memoize sidebar items to prevent recreation on every render
  const sidebarItems = useMemo(() => [
    { id: 'overview', icon: Home, label: language === 'he' ? 'סקירה כללית' : 'Overview' },
    { id: 'orders', icon: ShoppingCart, label: language === 'he' ? 'הזמנות' : 'Orders' },
    { id: 'contact', icon: MessageSquare, label: language === 'he' ? 'בקשות יצירת קשר' : 'Contact Requests' },
    { id: 'products', icon: Package, label: language === 'he' ? 'מוצרים' : 'Products' },
    { id: 'customers', icon: UserCheck, label: language === 'he' ? 'לקוחות' : 'Customers' },
    { id: 'meetings', icon: CalendarDays, label: language === 'he' ? 'פגישות' : 'Meetings' },
    { id: 'analytics', icon: BarChart3, label: language === 'he' ? 'אנליטיקה' : 'Analytics' },
  ], [language]);

  // Memoize animation variants to prevent recreation
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }), []);

  return (
    <div className="admin-dashboard">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <MenuIcon size={24} />
      </button>

      {/* Sidebar */}
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
                onClick={() => setActiveTab(item.id)}
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

      {/* Main Content */}
      <div className="admin-main-content">
        {/* Header */}
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            className="dashboard-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Summary Cards */}
            <div className="stats-grid">
              <motion.div className="stat-card" variants={itemVariants}>
                <div className="stat-icon revenue">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-label">{language === 'he' ? 'סה"כ הכנסות' : 'Total Revenue'}</h3>
                  <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
                  <span className="stat-change positive">
                    +{stats.revenueChange}% {language === 'he' ? 'מהחודש הקודם' : 'from last month'}
                  </span>
                </div>
              </motion.div>

              <motion.div className="stat-card" variants={itemVariants}>
                <div className="stat-icon visitors">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-label">{language === 'he' ? 'מבקרים פעילים' : 'Active Visitors'}</h3>
                  <p className="stat-value">{stats.activeVisitors}</p>
                  <span className="stat-change neutral">
                    {language === 'he' ? 'עכשיו' : 'Now'}
                  </span>
                </div>
              </motion.div>

              <motion.div className="stat-card" variants={itemVariants}>
                <div className="stat-icon orders">
                  <ShoppingCart size={24} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-label">{language === 'he' ? 'סה"כ הזמנות' : 'Total Orders'}</h3>
                  <p className="stat-value">{stats.totalOrders}</p>
                  <span className="stat-change neutral">
                    {language === 'he' ? 'היום' : 'Today'}
                  </span>
                </div>
              </motion.div>

              <motion.div className="stat-card" variants={itemVariants}>
                <div className="stat-icon conversion">
                  <Percent size={24} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-label">{language === 'he' ? 'שיעור המרה' : 'Conversion Rate'}</h3>
                  <p className="stat-value">{stats.conversionRate}%</p>
                  <span className="stat-change positive">
                    +{stats.conversionChange}% {language === 'he' ? 'מהשבוע הקודם' : 'from last week'}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* AI Insights Widget */}
            <motion.div variants={itemVariants} style={{ marginBottom: '25px' }}>
              <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען תובנות...' : 'Loading insights...'}</div>}>
                <AIInsights language={language} products={products} />
              </Suspense>
            </motion.div>

            {/* Live Global Map Widget */}
            <motion.div variants={itemVariants} style={{ marginBottom: '25px' }}>
              <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען מפה...' : 'Loading map...'}</div>}>
                <GlobalMapWidget language={language} orders={[]} />
              </Suspense>
            </motion.div>

            {/* Two Column Layout for Charts and Activity */}
            <div className="dashboard-grid-layout">
              {/* Analytics Section */}
              <div className="analytics-section">
              {/* Visitor Traffic Chart */}
              <motion.div className="chart-card" variants={itemVariants}>
                <div className="chart-header">
                  <h3 className="chart-title">
                    {language === 'he' ? 'תנועת מבקרים לפי שעות' : 'Visitor Traffic by Hour'}
                  </h3>
                  <div className="peak-hours">
                    <span className="peak-label">{language === 'he' ? 'שעות שיא:' : 'Peak Hours:'}</span>
                    {peakHours.map((hour, idx) => (
                      <span key={idx} className="peak-hour">{hour}</span>
                    ))}
                  </div>
                </div>
                <VisitorTrafficChart 
                  data={visitorTrafficData} 
                  language={language} 
                  peakHours={peakHours}
                />
              </motion.div>

              {/* Customer Breakdown Chart */}
              <motion.div className="chart-card" variants={itemVariants}>
                <div className="chart-header">
                  <h3 className="chart-title">
                    {language === 'he' ? 'פילוח לקוחות' : 'Customer Breakdown'}
                  </h3>
                  <span className="chart-subtitle">
                    {language === 'he' ? '30 הימים האחרונים' : 'Last 30 Days'}
                  </span>
                </div>
                <CustomerBreakdownChart 
                  data={customerBreakdownData} 
                  language={language}
                />
              </motion.div>

              {/* Top Selling Products */}
              <motion.div className="products-card" variants={itemVariants}>
                <div className="chart-header">
                  <h3 className="chart-title">
                    {language === 'he' ? 'מוצרים מובילים' : 'Top Selling Products'}
                  </h3>
                </div>
                <div className="products-list">
                  {topProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      className="product-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="product-rank">#{index + 1}</div>
                      <div className="product-image-placeholder">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <Package size={24} />
                        )}
                      </div>
                      <div className="product-info">
                        <h4 className="product-name">{product.name}</h4>
                        <p className="product-sales">
                          {product.sales} {language === 'he' ? 'מכירות' : 'sales'}
                        </p>
                      </div>
                      <div className="product-revenue">
                        ${product.revenue.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              </div>

              {/* Live Activity Feed Sidebar */}
              <motion.div className="activity-feed-sidebar" variants={itemVariants}>
                <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען פעילות...' : 'Loading activity...'}</div>}>
                  <LiveActivityFeed language={language} />
                </Suspense>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען ניהול מוצרים...' : 'Loading products management...'}</div>}>
              <ProductsManagement language={language} products={products} />
            </Suspense>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען הזמנות...' : 'Loading orders...'}</div>}>
              <OrdersTable language={language} />
            </Suspense>
          </div>
        )}

        {/* Contact Requests Tab */}
        {activeTab === 'contact' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען בקשות יצירת קשר...' : 'Loading contact requests...'}</div>}>
              <ContactRequestsTable language={language} />
            </Suspense>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען לקוחות...' : 'Loading customers...'}</div>}>
              <CustomersTable language={language} />
            </Suspense>
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="dashboard-content">
            <Suspense fallback={<div className="loading-placeholder">{language === 'he' ? 'טוען פגישות...' : 'Loading meetings...'}</div>}>
              <MeetingsTable language={language} />
            </Suspense>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== 'overview' && activeTab !== 'products' && activeTab !== 'orders' && activeTab !== 'contact' && activeTab !== 'customers' && activeTab !== 'meetings' && (
          <div className="dashboard-content">
            <div className="coming-soon">
              <h2>{language === 'he' ? 'בקרוב' : 'Coming Soon'}</h2>
              <p>{language === 'he' ? 'תוכן זה יופיע בקרוב' : 'This content will be available soon'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, MapPin } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';
import './OrdersTable.css';

// Country flag emojis mapping
const COUNTRY_FLAGS = {
  'US': '🇺🇸',
  'IL': '🇮🇱',
  'FR': '🇫🇷',
  'GB': '🇬🇧',
  'CA': '🇨🇦',
  'DE': '🇩🇪',
  'AU': '🇦🇺',
  'IT': '🇮🇹',
  'ES': '🇪🇸',
  'NL': '🇳🇱',
};

const OrdersTable = ({ language }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [contextMenu, setContextMenu] = useState(null); // { order, x, y }

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to load orders');
        }
        if (active) {
          setOrders(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        if (active) setOrders([]);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      // Search filter
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'total':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'name':
          comparison = a.customer.fullName.localeCompare(b.customer.fullName);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  // Handle row click
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Handle right-click for context menu
  const handleRowRightClick = (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      order,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Handle context menu action
  const handleContextAction = async (order, action) => {
    closeContextMenu();
    
    if (action === 'view') {
      handleRowClick(order);
    } else if (action === 'mark-paid') {
      handleStatusUpdate(order.id, 'Paid');
    } else if (action === 'mark-processing') {
      handleStatusUpdate(order.id, 'Processing');
    } else if (action === 'mark-shipped') {
      handleStatusUpdate(order.id, 'Shipped');
    } else if (action === 'mark-delivered') {
      handleStatusUpdate(order.id, 'Delivered');
    }
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        closeContextMenu();
      }
    };
    
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update order status');
      }

      const savedStatus = result.data?.status || newStatus;
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: savedStatus } : order
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: savedStatus });
      }
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const symbols = {
      USD: '$',
      ILS: '₪',
      EUR: '€',
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Truncate order ID
  const truncateOrderId = (id) => {
    if (id.length > 12) {
      return id.substring(0, 8) + '...';
    }
    return id;
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Paid': 'status-paid',
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled',
    };
    return statusMap[status] || 'status-default';
  };

  return (
    <div className="orders-table-container">
      {/* Header with Filters */}
      <div className="orders-header">
        <h2 className="orders-title">
          {language === 'he' ? 'ניהול הזמנות' : 'Order Management'}
        </h2>
        
        <div className="orders-filters">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder={language === 'he' ? 'חפש הזמנות...' : 'Search orders...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
            <option value="Pending">{language === 'he' ? 'ממתין' : 'Pending'}</option>
            <option value="Paid">{language === 'he' ? 'שולם' : 'Paid'}</option>
            <option value="Processing">{language === 'he' ? 'בעיבוד' : 'Processing'}</option>
            <option value="Shipped">{language === 'he' ? 'נשלח' : 'Shipped'}</option>
            <option value="Delivered">{language === 'he' ? 'נמסר' : 'Delivered'}</option>
          </select>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">{language === 'he' ? 'תאריך' : 'Date'}</option>
            <option value="total">{language === 'he' ? 'סכום' : 'Total'}</option>
            <option value="name">{language === 'he' ? 'שם' : 'Name'}</option>
          </select>

          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? (language === 'he' ? 'עולה' : 'Ascending') : (language === 'he' ? 'יורד' : 'Descending')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Orders Count */}
      <div className="orders-count">
        {language === 'he' 
          ? `נמצאו ${filteredAndSortedOrders.length} הזמנות`
          : `${filteredAndSortedOrders.length} orders found`
        }
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>{language === 'he' ? 'מספר הזמנה' : 'Order ID'}</th>
              <th>{language === 'he' ? 'לקוח' : 'Customer'}</th>
              <th>{language === 'he' ? 'מדינה' : 'Country'}</th>
              <th>{language === 'he' ? 'סכום' : 'Total'}</th>
              <th>{language === 'he' ? 'סטטוס' : 'Status'}</th>
              <th>{language === 'he' ? 'תאריך' : 'Date'}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredAndSortedOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    {language === 'he' ? 'לא נמצאו הזמנות' : 'No orders found'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="order-row"
                    onClick={() => handleRowClick(order)}
                    onContextMenu={(e) => handleRowRightClick(e, order)}
                  >
                    <td className="order-id-cell">
                      <code>{truncateOrderId(order.id)}</code>
                    </td>
                    <td className="customer-cell">
                      <div className="customer-info">
                        <span className="customer-name">{order.customer.fullName}</span>
                        <span className="customer-email">{order.customer.email}</span>
                      </div>
                    </td>
                    <td className="country-cell">
                      <span className="country-flag">
                        {COUNTRY_FLAGS[order.shippingAddress.country] || '🌍'}
                      </span>
                      <span className="country-code">{order.shippingAddress.country}</span>
                    </td>
                    <td className="total-cell">
                      <span className="total-amount">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      <div className="date-info">
                        <Calendar size={14} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="context-menu"
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="context-menu-header">
              <span className="context-menu-title">
                {language === 'he' ? 'פעולות מהירות' : 'Quick Actions'}
              </span>
            </div>
            <div className="context-menu-items">
              <button
                className="context-menu-item"
                onClick={() => handleContextAction(contextMenu.order, 'view')}
              >
                {language === 'he' ? 'צפה בפרטים' : 'View Details'}
              </button>
              <div className="context-menu-divider"></div>
              <button
                className="context-menu-item"
                onClick={() => handleContextAction(contextMenu.order, 'mark-paid')}
                disabled={contextMenu.order.status === 'Paid'}
              >
                {language === 'he' ? 'סמן כשולם' : 'Mark as Paid'}
              </button>
              <button
                className="context-menu-item"
                onClick={() => handleContextAction(contextMenu.order, 'mark-processing')}
                disabled={contextMenu.order.status === 'Processing'}
              >
                {language === 'he' ? 'סמן כבעיבוד' : 'Mark as Processing'}
              </button>
              <button
                className="context-menu-item"
                onClick={() => handleContextAction(contextMenu.order, 'mark-shipped')}
                disabled={contextMenu.order.status === 'Shipped'}
              >
                {language === 'he' ? 'סמן כנשלח' : 'Mark as Shipped'}
              </button>
              <button
                className="context-menu-item"
                onClick={() => handleContextAction(contextMenu.order, 'mark-delivered')}
                disabled={contextMenu.order.status === 'Delivered'}
              >
                {language === 'he' ? 'סמן כנמסר' : 'Mark as Delivered'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            language={language}
            onClose={() => {
              setShowModal(false);
              setSelectedOrder(null);
            }}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersTable;

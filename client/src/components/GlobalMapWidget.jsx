import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import './GlobalMapWidget.css';

// Country coordinates for map positioning (simplified world map)
const COUNTRY_COORDINATES = {
  'US': { x: 25, y: 40 }, // USA
  'IL': { x: 55, y: 45 }, // Israel
  'FR': { x: 48, y: 42 }, // France
  'GB': { x: 47, y: 38 }, // United Kingdom
  'CA': { x: 20, y: 30 }, // Canada
  'DE': { x: 50, y: 40 }, // Germany
  'AU': { x: 75, y: 75 }, // Australia
  'IT': { x: 50, y: 43 }, // Italy
  'ES': { x: 45, y: 42 }, // Spain
  'NL': { x: 49, y: 39 }, // Netherlands
};

const GlobalMapWidget = ({ language }) => {
  const [allOrders, setAllOrders] = useState([]);

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
          setAllOrders(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error('Error loading map orders:', error);
        if (active) setAllOrders([]);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  // Count orders by country
  const ordersByCountry = useMemo(() => {
    const countryCounts = {};
    allOrders.forEach(order => {
      const country = order.shippingAddress?.country;
      if (country) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });
    return countryCounts;
  }, [allOrders]);

  // Get max count for scaling
  const maxCount = useMemo(() => {
    return Math.max(...Object.values(ordersByCountry), 1);
  }, [ordersByCountry]);

  return (
    <motion.div
      className="global-map-widget"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="map-widget-header">
        <Globe size={24} className="map-icon" />
        <h3 className="map-widget-title">
          {language === 'he' ? 'מפה גלובלית - הזמנות' : 'Global Orders Map'}
        </h3>
      </div>

      <div className="map-container">
        {/* Simplified World Map Background */}
        <svg
          viewBox="0 0 100 60"
          className="world-map-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Simplified continents (stylized) */}
          <g className="continents">
            {/* North America */}
            <path
              d="M 10 20 Q 15 15, 25 20 Q 30 25, 30 35 Q 25 40, 20 35 Q 15 30, 10 25 Z"
              className="continent-path"
            />
            {/* Europe */}
            <path
              d="M 45 25 Q 50 20, 55 25 Q 58 30, 55 35 Q 50 38, 45 35 Q 42 30, 45 25 Z"
              className="continent-path"
            />
            {/* Middle East */}
            <path
              d="M 55 42 Q 58 40, 60 42 Q 62 45, 60 48 Q 58 50, 55 48 Z"
              className="continent-path"
            />
            {/* Asia */}
            <path
              d="M 60 20 Q 70 15, 80 25 Q 85 35, 80 45 Q 75 50, 70 45 Q 65 40, 60 35 Z"
              className="continent-path"
            />
          </g>

          {/* Pulsing dots for countries with orders */}
          {Object.entries(ordersByCountry).map(([country, count]) => {
            const coords = COUNTRY_COORDINATES[country];
            if (!coords) return null;

            const intensity = count / maxCount; // 0 to 1
            const size = 2 + (intensity * 3); // 2 to 5

            return (
              <g key={country} className="order-marker">
                {/* Outer pulsing ring */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={size + 2}
                  className="pulse-ring"
                  style={{
                    animationDelay: `${intensity * 2}s`,
                    opacity: 0.3 * intensity,
                  }}
                />
                {/* Main pulsing dot */}
                <motion.circle
                  cx={coords.x}
                  cy={coords.y}
                  r={size}
                  className="pulse-dot"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: intensity * 0.5,
                  }}
                  style={{
                    fill: intensity > 0.7 ? '#00d4ff' : intensity > 0.4 ? '#D4AF37' : '#ff6b6b',
                  }}
                />
                {/* Order count label */}
                <text
                  x={coords.x}
                  y={coords.y + size + 3}
                  className="order-count-label"
                  textAnchor="middle"
                >
                  {count}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-dot high-activity"></div>
          <span>{language === 'he' ? 'פעילות גבוהה' : 'High Activity'}</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot medium-activity"></div>
          <span>{language === 'he' ? 'פעילות בינונית' : 'Medium Activity'}</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot low-activity"></div>
          <span>{language === 'he' ? 'פעילות נמוכה' : 'Low Activity'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-value">{Object.keys(ordersByCountry).length}</span>
          <span className="stat-label">
            {language === 'he' ? 'מדינות פעילות' : 'Active Countries'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{allOrders.length}</span>
          <span className="stat-label">
            {language === 'he' ? 'סה"כ הזמנות' : 'Total Orders'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalMapWidget;

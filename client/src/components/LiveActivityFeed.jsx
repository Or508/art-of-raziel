import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, Eye, Package, User, TrendingUp, Heart } from 'lucide-react';
import './LiveActivityFeed.css';

const LiveActivityFeed = ({ language }) => {
  const [activities, setActivities] = useState([]);

  // Mock activity types
  const activityTypes = [
    { type: 'view', icon: Eye, color: '#00d4ff', text: (item) => language === 'he' ? `משתמש צפה ב'${item}'` : `User viewed '${item}'` },
    { type: 'cart', icon: ShoppingCart, color: '#D4AF37', text: (item) => language === 'he' ? `הוסף '${item}' לסל` : `Added '${item}' to cart` },
    { type: 'order', icon: Package, color: '#ff0064', text: (location) => language === 'he' ? `הזמנה חדשה מ-${location}` : `New order from ${location}` },
    { type: 'user', icon: User, color: '#00d4ff', text: () => language === 'he' ? 'משתמש חדש נרשם' : 'New user registered' },
    { type: 'trending', icon: TrendingUp, color: '#D4AF37', text: (item) => language === 'he' ? `'${item}' בטרנדינג` : `'${item}' is trending` },
  ];

  const productNames = [
    language === 'he' ? 'מזוזה גדולה' : 'Large Mezuzah',
    language === 'he' ? 'חותם שלמה' : 'Seal of Solomon',
    language === 'he' ? 'קמיע להצלחה' : 'Success Amulet',
    language === 'he' ? 'מזוזה בינונית' : 'Medium Mezuzah',
    language === 'he' ? 'קמיע לפרנסה' : 'Prosperity Amulet',
  ];

  const locations = [
    language === 'he' ? 'תל אביב' : 'Tel Aviv',
    language === 'he' ? 'ירושלים' : 'Jerusalem',
    language === 'he' ? 'חיפה' : 'Haifa',
    language === 'he' ? 'באר שבע' : 'Beer Sheva',
  ];

  useEffect(() => {
    // Generate random activities every 3-8 seconds
    const generateActivity = () => {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const Icon = activityType.icon;
      
      let activityText = '';
      if (activityType.type === 'view' || activityType.type === 'cart' || activityType.type === 'trending') {
        activityText = activityType.text(productNames[Math.floor(Math.random() * productNames.length)]);
      } else if (activityType.type === 'order') {
        activityText = activityType.text(locations[Math.floor(Math.random() * locations.length)]);
      } else {
        activityText = activityType.text();
      }

      const newActivity = {
        id: Date.now(),
        type: activityType.type,
        text: activityText,
        icon: Icon,
        color: activityType.color,
        timestamp: new Date(),
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 10)); // Keep last 10 activities
    };

    // Generate first activity immediately
    generateActivity();

    // Set interval for random activities
    const interval = setInterval(() => {
      generateActivity();
    }, Math.random() * 5000 + 3000); // 3-8 seconds

    return () => clearInterval(interval);
  }, [language]);

  return (
    <div className="activity-feed">
      <div className="activity-header">
        <h3 className="activity-title">
          {language === 'he' ? 'פעילות בזמן אמת' : 'Live Activity'}
        </h3>
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          <span>{language === 'he' ? 'חי' : 'LIVE'}</span>
        </div>
      </div>

      <div className="activity-list">
        <AnimatePresence initial={false}>
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="activity-icon" style={{ color: activity.color }}>
                  <Icon size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">{activity.text}</p>
                  <span className="activity-time">
                    {activity.timestamp.toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveActivityFeed;

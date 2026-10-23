import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Lightbulb } from 'lucide-react';
import './AIInsights.css';

const AIInsights = ({ language }) => {
  const [currentInsight, setCurrentInsight] = useState(0);

  // Generate insights based on mock data
  const insights = [
    {
      icon: Clock,
      type: 'timing',
      text: language === 'he' 
        ? 'טיפ: מכירות של "קמיע הגנה" מגיעות לשיא ב-20:00. שקול להריץ מבצע בזק ב-19:00.'
        : "Tip: Sales for 'Protection Amulet' peak at 20:00. Consider running a flash sale at 19:00.",
      color: '#00d4ff'
    },
    {
      icon: TrendingUp,
      type: 'trend',
      text: language === 'he'
        ? 'נראה ש"מזוזות גדולות" פופולריות יותר בסופי שבוע. הגדל את המלאי ביום חמישי.'
        : "'Large Mezuzahs' appear more popular on weekends. Increase stock on Thursdays.",
      color: '#D4AF37'
    },
    {
      icon: Lightbulb,
      type: 'optimization',
      text: language === 'he'
        ? 'שיעור המרה גבוה יותר כשמוצרים מוצגים עם תמונות. ודא שכל המוצרים כוללים תמונות.'
        : 'Conversion rate is higher when products have images. Ensure all products include images.',
      color: '#ff0064'
    },
    {
      icon: TrendingUp,
      type: 'trend',
      text: language === 'he'
        ? 'לקוחות חוזרים קונים יותר "חותם שלמה". שקול להציע להם הנחה מיוחדת.'
        : "Returning customers buy more 'Seal of Solomon'. Consider offering them a special discount.",
      color: '#D4AF37'
    },
    {
      icon: Clock,
      type: 'timing',
      text: language === 'he'
        ? 'השעות 14:00-16:00 מראות פעילות נמוכה. זה זמן טוב לפרסום ושיווק.'
        : 'Hours 14:00-16:00 show low activity. This is a good time for advertising and marketing.',
      color: '#00d4ff'
    }
  ];

  useEffect(() => {
    // Rotate insights every 8 seconds
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const current = insights[currentInsight];
  const Icon = current.icon;

  return (
    <motion.div
      className="ai-insights"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="insights-header">
        <div className="insights-title-container">
          <Sparkles size={24} className="sparkle-icon" />
          <h3 className="insights-title">
            {language === 'he' ? 'תובנות Raziel AI' : 'Raziel AI Insights'}
          </h3>
        </div>
        <div className="insights-indicator">
          {insights.map((_, index) => (
            <span
              key={index}
              className={`indicator-dot ${index === currentInsight ? 'active' : ''}`}
              onClick={() => setCurrentInsight(index)}
            />
          ))}
        </div>
      </div>

      <motion.div
        key={currentInsight}
        className="insight-content"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.4 }}
      >
        <div className="insight-icon-wrapper" style={{ backgroundColor: `${current.color}20`, borderColor: current.color }}>
          <Icon size={24} style={{ color: current.color }} />
        </div>
        <p className="insight-text">{current.text}</p>
      </motion.div>

      <div className="insights-footer">
        <span className="insights-powered">
          {language === 'he' ? 'מופעל על ידי AI' : 'Powered by AI'}
        </span>
      </div>
    </motion.div>
  );
};

export default AIInsights;

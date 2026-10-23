import React, { memo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Export chart components separately for code splitting (memoized to prevent unnecessary re-renders)
export const VisitorTrafficChart = memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.2)" />
        <XAxis 
          dataKey="hour" 
          stroke="#D4AF37"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#D4AF37"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            border: '1px solid #D4AF37',
            borderRadius: '6px',
            color: '#D4AF37'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="visitors" 
          stroke="#00d4ff" 
          strokeWidth={2}
          fill="url(#visitorGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

export const CustomerBreakdownChart = memo(({ data, language }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.2)" />
        <XAxis 
          dataKey="day" 
          stroke="#D4AF37"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#D4AF37"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            border: '1px solid #D4AF37',
            borderRadius: '6px',
            color: '#D4AF37'
          }}
        />
        <Legend 
          wrapperStyle={{ color: '#D4AF37' }}
        />
        <Bar 
          dataKey="new" 
          fill="#00d4ff" 
          name={language === 'he' ? 'לקוחות חדשים' : 'New Customers'}
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="returning" 
          fill="#D4AF37" 
          name={language === 'he' ? 'לקוחות חוזרים' : 'Returning Customers'}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

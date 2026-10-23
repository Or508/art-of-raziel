// Dashboard Mock Data - Separated to reduce AdminDashboard load

export const getVisitorTrafficData = () => [
  { hour: '00:00', visitors: 12 },
  { hour: '02:00', visitors: 8 },
  { hour: '04:00', visitors: 5 },
  { hour: '06:00', visitors: 15 },
  { hour: '08:00', visitors: 45 },
  { hour: '10:00', visitors: 78 },
  { hour: '12:00', visitors: 120 },
  { hour: '14:00', visitors: 145 },
  { hour: '16:00', visitors: 165 },
  { hour: '18:00', visitors: 180 },
  { hour: '20:00', visitors: 195 },
  { hour: '22:00', visitors: 98 },
];

export const getCustomerBreakdownData = () => [
  { day: 'Week 1', new: 45, returning: 120 },
  { day: 'Week 2', new: 52, returning: 135 },
  { day: 'Week 3', new: 38, returning: 142 },
  { day: 'Week 4', new: 61, returning: 158 },
];

export const getTopProducts = (language) => [
  { id: 1, name: language === 'he' ? 'מזוזה גדולה' : 'Large Mezuzah', sales: 45, revenue: 11250, image: null },
  { id: 2, name: language === 'he' ? 'חותם שלמה' : 'Seal of Solomon', sales: 38, revenue: 22800, image: null },
  { id: 3, name: language === 'he' ? 'קמיע להצלחה' : 'Success Amulet', sales: 32, revenue: 16000, image: null },
  { id: 4, name: language === 'he' ? 'מזוזה בינונית' : 'Medium Mezuzah', sales: 28, revenue: 5320, image: null },
  { id: 5, name: language === 'he' ? 'קמיע לפרנסה' : 'Prosperity Amulet', sales: 25, revenue: 12500, image: null },
];

export const getStats = () => ({
  totalRevenue: 12450,
  revenueChange: +12.5,
  activeVisitors: 195,
  totalOrders: 48,
  conversionRate: 3.2,
  conversionChange: +0.8,
});

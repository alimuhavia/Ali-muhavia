import React, { useEffect, useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { generateDailyInsight } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, Clock, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { stats, attendanceLogs, students } = useAcademy();
  const [insight, setInsight] = useState<string>("Generating AI insights...");
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const result = await generateDailyInsight(stats, attendanceLogs, students);
      setInsight(result);
      setLoadingInsight(false);
    };
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const attendanceData = [
    { name: 'Present', value: stats.presentToday, color: '#22c55e' },
    { name: 'Absent', value: stats.absentToday, color: '#ef4444' },
    { name: 'Late', value: stats.lateArrivals, color: '#f59e0b' },
  ];

  const feeData = [
    { name: 'Paid', value: stats.totalRevenue },
    { name: 'Pending', value: stats.pendingFees },
  ];

  const COLORS = ['#4f46e5', '#ef4444'];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Smart Dashboard</h2>
        <p className="text-gray-500">Real-time overview of academy performance</p>
      </header>

      {/* AI Insight Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600">
            <Sparkles size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">Daily AI Insight</h3>
            {loadingInsight ? (
              <div className="animate-pulse h-4 bg-indigo-200 rounded w-3/4"></div>
            ) : (
              <p className="text-indigo-800 whitespace-pre-line leading-relaxed">{insight}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Users className="text-blue-600" />} 
          title="Total Students" 
          value={stats.totalStudents} 
          color="bg-blue-50" 
        />
        <StatCard 
          icon={<CheckCircle className="text-green-600" />} 
          title="Present Today" 
          value={stats.presentToday} 
          color="bg-green-50" 
        />
        <StatCard 
          icon={<Clock className="text-orange-600" />} 
          title="Late Arrivals" 
          value={stats.lateArrivals} 
          color="bg-orange-50" 
        />
        <StatCard 
          icon={<AlertTriangle className="text-red-600" />} 
          title="Pending Fees" 
          value={`$${stats.pendingFees}`} 
          color="bg-red-50" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Today's Attendance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Collection Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Fee Status Overview</h3>
          <div className="h-64 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
  <div className={`p-6 rounded-xl border border-opacity-50 shadow-sm flex items-center space-x-4 ${color}`}>
    <div className="p-3 bg-white rounded-full shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;
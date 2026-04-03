import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { TrendingUp, ShoppingBag, Package, DollarSign } from "lucide-react";

// Mock data for trends to make it look active (as per guidelines to WOW the user)
const trendData = [
  { name: 'Mon', orders: 40, revenue: 2400 },
  { name: 'Tue', orders: 30, revenue: 1398 },
  { name: 'Wed', orders: 20, revenue: 9800 },
  { name: 'Thu', orders: 27, revenue: 3908 },
  { name: 'Fri', orders: 18, revenue: 4800 },
  { name: 'Sat', orders: 23, revenue: 3800 },
  { name: 'Sun', orders: 34, revenue: 4300 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Clothing', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Books', value: 200 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

const Dashboard = () => {
  const { total: totalProducts, items: products } = useSelector((state: RootState) => state.products);
  const { total: totalOrders } = useSelector((state: RootState) => state.orders);

  // Derived stats
  const totalRevenue = trendData.reduce((acc, curr) => acc + curr.revenue, 0);
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stats Cards Row */}
      <div className="grid">
        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">${totalRevenue.toLocaleString()}</span>
            <span className="badge success" style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> +12.5%
            </span>
          </div>
          <div className="stat-icon revenue"><DollarSign /></div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Orders Placed</span>
            <span className="stat-value">{totalOrders}</span>
            <span className="badge" style={{ marginTop: '8px' }}>Lifetime orders</span>
          </div>
          <div className="stat-icon orders"><ShoppingBag /></div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{totalProducts}</span>
            <span className="badge" style={{ marginTop: '8px' }}>Active in catalog</span>
          </div>
          <div className="stat-icon products"><Package /></div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-content">
            <span className="stat-label">Out of Stock</span>
            <span className="stat-value" style={{ color: outOfStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}>{outOfStockCount}</span>
            <span className="badge error" style={{ marginTop: '8px' }}>Requires attention</span>
          </div>
          <div className="stat-icon alerts"><TrendingUp style={{ transform: 'rotate(180deg)' }}/></div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Revenue Trend Area Chart */}
        <div className="glass-card">
          <h3>Weekly Revenue Trend ($)</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Stock Breakdown Bar Chart */}
        <div className="glass-card">
          <h3>Order Activity by Day</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3>Inventory Distribution by Category</h3>
        <div style={{ height: '240px', width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '2rem' }}>
            {categoryData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS[index] }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{entry.name}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{entry.value} units</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

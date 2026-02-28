import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { FiActivity, FiKey, FiBarChart2 } from 'react-icons/fi';

const PLAN_LABELS = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise'
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    requestsToday: 0,
    dailyLimit: 50,
    plan: 'free'
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/auth/me');
      const user = response.data.user;
      setStats({
        requestsToday: user.requestsToday || 0,
        dailyLimit: user.dailyLimit || 50,
        plan: user.plan || 'free'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const usagePercent = Math.min(100, Math.round((stats.requestsToday / stats.dailyLimit) * 100));

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Overview of your API usage and account</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
        <div className="card">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
            <FiActivity size={24} color="var(--green)" />
            <h3>Requests Today</h3>
          </div>
          <p style={{fontSize: '32px', fontWeight: 'bold'}}>{stats.requestsToday}</p>
          <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px'}}>
            of {stats.dailyLimit.toLocaleString()} daily limit
          </p>
          <div style={{
            marginTop: '12px',
            height: '6px',
            borderRadius: '3px',
            background: 'var(--surface)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${usagePercent}%`,
              height: '100%',
              borderRadius: '3px',
              background: usagePercent >= 90 ? 'var(--danger)' : usagePercent >= 70 ? '#f59e0b' : 'var(--green)',
              transition: 'width 0.3s'
            }} />
          </div>
          <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>
            {usagePercent}% used — resets at midnight (Brasília)
          </p>
        </div>

        <div className="card">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
            <FiKey size={24} color="var(--green)" />
            <h3>Current Plan</h3>
          </div>
          <p style={{fontSize: '32px', fontWeight: 'bold', textTransform: 'uppercase'}}>
            {PLAN_LABELS[stats.plan] || stats.plan}
          </p>
          <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px'}}>
            {stats.dailyLimit.toLocaleString()} requests/day
          </p>
        </div>

        <div className="card">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
            <FiBarChart2 size={24} color="var(--green)" />
            <h3>Remaining Today</h3>
          </div>
          <p style={{fontSize: '32px', fontWeight: 'bold'}}>
            {Math.max(0, stats.dailyLimit - stats.requestsToday).toLocaleString()}
          </p>
          <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px'}}>
            requests available
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

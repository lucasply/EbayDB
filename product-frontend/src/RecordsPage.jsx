import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from './api';

export default function RecordsPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
  const [year, setYear] = useState(today.getFullYear());
  const [dailySales, setDailySales] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const [view, setView] = useState('monthly'); // 'monthly' | 'yearly'
  const [yearlySales, setYearlySales] = useState([]);

  // Fetch daily sales and calculate revenue when month/year changes
  useEffect(() => {
    fetchDailySales();
  }, [month, year]);

  const fetchDailySales = async () => {
    try {
      // Fetch daily sales for the selected month
      const res = await api.get(`/sold/daily/${year}/${month}`);
      const salesData = res.data;
      console.log('Fetched sales data:', salesData);

      setDailySales(salesData);

      // Calculate total revenue for the month
      const total = salesData.reduce((sum, day) => sum + Number(day.total_revenue), 0);
      setMonthlyRevenue(total);

    } catch (err) {
      console.error('Error fetching daily sales:', err);
    }
  };

  const fetchYearlySales = async () => {
    try {
        const res = await api.get(`/sold/yearly/${year}`);
        const salesData = res.data;

        setYearlySales(salesData);

        // Total revenue for the year
        const total = salesData.reduce(
        (sum, m) => sum + Number(m.total_revenue),
        0
        );
        setMonthlyRevenue(total);
    } catch (err) {
        console.error('Error fetching yearly sales:', err);
    }
  };


  const handleMonthChange = (e) => setMonth(Number(e.target.value));
  const handleYearChange = (e) => setYear(Number(e.target.value));

  
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);

  useEffect(() => {
    if (view === 'monthly') {
        fetchDailySales();
    } else {
        fetchYearlySales();
    }
  }, [month, year, view]);

  return (
    <div style={{ padding: 1, fontFamily: 'Arial, sans-serif' }}>
        {/* Title */}
        <h2 style={{ marginBottom: 16,fontSize: 24 }}>📊 Monthly Sales Records</h2>

        {/* Toolbar */}
        <div
        style={{
            display: 'flex',
            gap: 24,
            marginBottom: 24,
            flexWrap: 'wrap',
            alignItems: 'center'
        }}>
            <label style={{ marginBottom: 4, fontWeight: 500 }}>View:</label>
            <select value={view} onChange={(e) => setView(e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </select>
        </div>

        {/* Month selector */}
        {view === 'monthly' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: 4, fontWeight: 500 }}>Month:</label>
                <select
                value={month}
                onChange={handleMonthChange}
                style={{ padding: 4, fontSize: 14 }}
                >
                {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                    </option>
                ))}
                </select>
            </div>
        )}

        {/* Year selector */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: 4, fontWeight: 500 }}>Year:</label>
            <select value={year} onChange={handleYearChange} style={{ padding: 4, fontSize: 14 }}>
            {years.map(y => (
                <option key={y} value={y}>{y}</option>
            ))}
            </select>
        </div>

        {/* Total revenue */}
        <div style={{ marginLeft: 'auto', fontWeight: 600, fontSize: 16 }}>
            Total Revenue: ${monthlyRevenue.toFixed(2)}
        </div>


        {/* Chart */}
        <ResponsiveContainer width="250%" height={400}>
        <BarChart
            data={view === 'monthly' ? dailySales : yearlySales}
            margin={{ top: 20, right: 50, left: 10, bottom: 20 }}>

            <CartesianGrid strokeDasharray="3 3" stroke="#ffffffff" />
            <XAxis
            data={view === 'monthly' ? dailySales : yearlySales}
            interval ={0}
            type = {'number'}
            dataKey={view === 'monthly' ? 'day' : 'month'}
            padding={{ left: 10, right: 10}}
            domain={[1, 'dataMax']}
            tick={{ fontSize: 16 }}
            tickFormatter={(value) =>
                view === 'monthly'
                ? value
                : new Date(0, value - 1).toLocaleString('en-US', { month: 'short' })
            }
            label={{
                value: view === 'monthly' ? 'Day' : 'Month',
                position: 'insideBottomRight',
                offset: -10,
                fontSize: 20
            }}
            />
            <YAxis
            tick={{ fontSize: 16}}
            label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', fontSize: 20, offset: 10 }}
            />
            <Tooltip contentStyle={{
                    backgroundColor: "#000000ff",
                    borderRadius: "2px",
                    border: "1px solid #ccc",
                    fontSize: "0.85rem"
                }}
                formatter={(value) =>
                    new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(value)
                } 
                labelFormatter={(label) =>
                    view !== 'monthly'
                    ? new Date(0, label - 1).toLocaleString('en-US', { month: 'long' })
                    : `Day ${label}`
                }
            />
                
            <Legend wrapperStyle={{ fontSize: 14 }} />
            <Bar
            dataKey="total_revenue"
            name={view === 'monthly' ? "Daily Revenue" : "Monthly Revenue"}
            fill="#82ca9d"
            radius={[4, 4, 0, 0]}
            barSize={20}
            />
        </BarChart>
        </ResponsiveContainer>
    </div>
    );
}

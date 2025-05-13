
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 7000 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 8000 },
  { name: 'Jul', revenue: 9000 },
  { name: 'Aug', revenue: 10000 },
];

const RevenueChart: React.FC = () => {
  return (
    <Card className="sanskara-card">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue trend for the current year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis 
                tickFormatter={(value) => `₹${value}`} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value) => [`₹${value}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#C41E3A"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 6, fill: '#C41E3A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;

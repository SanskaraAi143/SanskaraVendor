
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface RevenueChartProps {
  vendorId?: string;
}

interface RevenueData {
  name: string;
  revenue: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ vendorId }) => {
  const [chartData, setChartData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    const fetchRevenueData = async () => {
      if (!vendorId) return;
      
      try {
        setIsLoading(true);
        const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
          const date = subMonths(new Date(), i);
          return {
            month: format(date, 'MMM'),
            startDate: startOfMonth(date),
            endDate: endOfMonth(date),
            revenue: 0
          };
        }).reverse();
        
        // Fetch payments data
        const { data, error } = await supabase
          .from('payments')
          .select('amount, paid_at')
          .eq('payment_status', 'completed');
          
        if (error) throw error;
        
        // Process data into monthly revenue
        const monthlyData = lastSixMonths.map((monthData) => {
          const monthRevenue = data
            ?.filter((payment) => {
              const paidDate = new Date(payment.paid_at);
              return paidDate >= monthData.startDate && paidDate <= monthData.endDate;
            })
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);
            
          return {
            name: monthData.month,
            revenue: monthRevenue || 0
          };
        });
        
        setChartData(monthlyData);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        toast({
          title: "Error",
          description: "Could not load revenue data",
          variant: "destructive",
        });
        
        // Set sample data if real data fetch fails
        setChartData([
          { name: 'Jan', revenue: 25000 },
          { name: 'Feb', revenue: 35000 },
          { name: 'Mar', revenue: 45000 },
          { name: 'Apr', revenue: 30000 },
          { name: 'May', revenue: 50000 },
          { name: 'Jun', revenue: 80000 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRevenueData();
  }, [vendorId]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 p-2 rounded shadow-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sanskara-red">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="sanskara-card">
      <CardHeader className="pb-2">
        <CardTitle>Revenue Trends</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickCount={5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill="#FF5A5F"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;


import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  CreditCard,
  Calendar,
  PieChart as PieChartIcon,
  BarChart2,
  DollarSign,
  ArrowDownIcon,
  ArrowUpIcon,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import usePersistState from '@/hooks/usePersistState';

interface Payment {
  payment_id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  paid_at: string;
  transaction_id: string | null;
  payment_status: string;
  payment_type: string;
  payment_method: string | null;
  notes: string | null;
  client_name?: string;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

interface PaymentMethodData {
  name: string;
  value: number;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = usePersistState<Payment[]>('payments', []);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyRevenueData[]>([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState<PaymentMethodData[]>([]);
  const [totalStats, setTotalStats] = useState({
    revenue: 0,
    completed: 0,
    pending: 0,
    monthlyGrowth: 0
  });
  const { vendorProfile } = useAuth();
  
  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchPayments();
    }
  }, [vendorProfile]);
  
  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery, statusFilter]);
  
  const fetchPayments = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          payment_id,
          booking_id,
          user_id,
          amount,
          paid_at,
          transaction_id,
          payment_status,
          payment_type,
          payment_method,
          notes,
          bookings(user_id)
        `)
        .eq('bookings.vendor_id', vendorProfile.vendor_id);
        
      if (error) throw error;
      
      // For demo purposes, if no payments exist, use sample data
      const paymentsData = data && data.length > 0 
        ? data.map(p => ({ ...p, client_name: `Client #${p.user_id.substring(0, 8)}` }))
        : generateSamplePayments();
        
      setPayments(paymentsData);
      generateRevenueData(paymentsData);
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Could not load payment data",
        variant: "destructive",
      });
      
      // For demo purposes, use sample data
      const sampleData = generateSamplePayments();
      setPayments(sampleData);
      generateRevenueData(sampleData);
      
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateRevenueData = (paymentsData: Payment[]) => {
    // Generate monthly revenue data
    const lastSixMonths: MonthlyRevenueData[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthDisplay = format(monthDate, 'MMM');
      
      lastSixMonths.push({
        month: monthDisplay,
        revenue: 0,
        bookings: 0
      });
    }
    
    // Calculate revenue by month
    paymentsData.forEach(payment => {
      if (payment.payment_status === 'completed') {
        const paymentMonth = format(new Date(payment.paid_at), 'MMM');
        const monthEntry = lastSixMonths.find(m => m.month === paymentMonth);
        if (monthEntry) {
          monthEntry.revenue += payment.amount;
          monthEntry.bookings += 1;
        }
      }
    });
    
    setMonthlyRevenueData(lastSixMonths);
    
    // Generate payment methods data
    const methodsMap: {[key: string]: number} = {};
    paymentsData.forEach(payment => {
      const method = payment.payment_method || 'Other';
      methodsMap[method] = (methodsMap[method] || 0) + payment.amount;
    });
    
    const methodsData = Object.entries(methodsMap).map(([name, value]) => ({ name, value }));
    setPaymentMethodsData(methodsData);
    
    // Calculate total stats
    const totalRevenue = paymentsData
      .filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
      
    const completedCount = paymentsData.filter(p => p.payment_status === 'completed').length;
    const pendingCount = paymentsData.filter(p => p.payment_status === 'pending').length;
    
    // Calculate monthly growth (difference between current month and previous month)
    const currentMonthRevenue = lastSixMonths[lastSixMonths.length - 1].revenue;
    const previousMonthRevenue = lastSixMonths[lastSixMonths.length - 2].revenue;
    const monthlyGrowth = previousMonthRevenue === 0 
      ? 100 
      : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    
    setTotalStats({
      revenue: totalRevenue,
      completed: completedCount,
      pending: pendingCount,
      monthlyGrowth
    });
  };
  
  const filterPayments = () => {
    let filtered = [...payments];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(payment => 
        payment.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(payment => payment.payment_status === statusFilter);
    }
    
    setFilteredPayments(filtered);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
  };
  
  const generateSamplePayments = (): Payment[] => {
    // Generate random sample payments for demo purposes
    const statuses = ['completed', 'pending', 'failed', 'refunded'];
    const methods = ['Credit Card', 'UPI', 'Bank Transfer', 'Cash', 'PayTM'];
    const types = ['advance', 'final_payment', 'installment'];
    
    const numSamples = 15;
    const now = new Date();
    const vendorId = vendorProfile?.vendor_id || 'vendor-123';
    
    return Array.from({ length: numSamples }).map((_, idx) => {
      const randomDay = Math.floor(Math.random() * 180); // last 180 days
      const paymentDate = new Date(now.getTime() - randomDay * 24 * 60 * 60 * 1000);
      const randomAmount = Math.floor(Math.random() * 50000) + 5000; // 5000 to 55000
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      
      return {
        payment_id: `payment-${idx}`,
        booking_id: `booking-${Math.floor(Math.random() * 100)}`,
        user_id: `user-${Math.floor(Math.random() * 50)}`,
        amount: randomAmount,
        paid_at: paymentDate.toISOString(),
        transaction_id: `txn-${Math.random().toString(36).substring(2, 10)}`,
        payment_status: status,
        payment_type: type,
        payment_method: method,
        notes: null,
        client_name: `Client #${Math.floor(Math.random() * 1000)}`
      };
    });
  };
  
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getDisplayStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Chart colors
  const CHART_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Payments & Revenue</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your payment transactions
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                <span className="text-2xl font-bold">{formatCurrency(totalStats.revenue)}</span>
              </div>
              <div className="bg-sanskara-red/10 p-3 rounded-full">
                <DollarSign className="h-5 w-5 text-sanskara-red" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <div className={totalStats.monthlyGrowth >= 0 ? 'text-green-500 flex' : 'text-red-500 flex'}>
                {totalStats.monthlyGrowth >= 0 ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                )}
                {Math.abs(totalStats.monthlyGrowth).toFixed(1)}%
              </div>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Completed Payments</span>
                <span className="text-2xl font-bold">{totalStats.completed}</span>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${totalStats.completed / (totalStats.completed + totalStats.pending) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {((totalStats.completed / (totalStats.completed + totalStats.pending)) * 100).toFixed(0)}% completion rate
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Pending Payments</span>
                <span className="text-2xl font-bold">{totalStats.pending}</span>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full" 
                  style={{ width: `${totalStats.pending / (totalStats.completed + totalStats.pending) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {((totalStats.pending / (totalStats.completed + totalStats.pending)) * 100).toFixed(0)}% pending collection
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Avg. Payment</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(totalStats.completed > 0 
                    ? totalStats.revenue / totalStats.completed 
                    : 0
                  )}
                </span>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <div className="text-blue-500 flex">
                <CreditCard className="h-3 w-3 mr-1" />
                Most common: {paymentMethodsData.length > 0 
                  ? paymentMethodsData.sort((a, b) => b.value - a.value)[0].name
                  : 'Credit Card'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Monthly Revenue</CardTitle>
            <CardDescription>Revenue breakdown by month</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyRevenueData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value / 1000}K`} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#f97316" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Payment Methods</CardTitle>
            <CardDescription>Distribution by payment method</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription className="mt-1">
                View and manage all your payment transactions
              </CardDescription>
            </div>
            <Tabs defaultValue="all" className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter || 'all'} onValueChange={(val) => setStatusFilter(val === 'all' ? null : val)}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              
              {(searchQuery || statusFilter) && (
                <Button variant="ghost" onClick={clearFilters} className="h-9 px-2 lg:px-3">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
              <p className="ml-3 text-sanskara-maroon">Loading transactions...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="border rounded-md flex flex-col items-center justify-center py-16 text-center">
              <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-1">No Transactions Found</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                {searchQuery || statusFilter 
                  ? "No transactions match your search criteria" 
                  : "You haven't received any payments yet."}
              </p>
              {(searchQuery || statusFilter) && (
                <Button 
                  variant="link" 
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.payment_id}>
                      <TableCell className="font-medium">
                        {payment.transaction_id ? payment.transaction_id.substring(0, 8) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{payment.client_name}</span>
                          <span className="text-xs text-muted-foreground">
                            Booking #{payment.booking_id.substring(0, 6)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(payment.paid_at)}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.payment_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(payment.payment_status)}>
                          {getDisplayStatus(payment.payment_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!isLoading && filteredPayments.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {filteredPayments.length} of {payments.length} transactions
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-8" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="h-8 bg-muted/50">
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;

// Import missing icons
import { CheckCircle, Clock, TrendingUp, User } from 'lucide-react';

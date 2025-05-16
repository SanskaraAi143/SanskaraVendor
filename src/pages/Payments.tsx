
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, CreditCard, DollarSign, Check, X, Filter } from 'lucide-react';

interface Payment {
  payment_id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_status: string;
  payment_type: string;
  notes: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
  booking_info?: {
    event_date: string;
    user_info?: {
      display_name: string;
      email: string;
    }
  }
}

const PaymentsPage: React.FC = () => {
  const { vendorProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState({
    status: 'all',
    timeframe: 'all'
  });
  
  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchPayments();
    }
  }, [vendorProfile]);
  
  const fetchPayments = async () => {
    setIsLoading(true);
    
    try {
      // First, get all bookings for this vendor
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('booking_id')
        .eq('vendor_id', vendorProfile?.vendor_id);
      
      if (bookingsError) throw bookingsError;
      
      if (bookings && bookings.length > 0) {
        const bookingIds = bookings.map(booking => booking.booking_id);
        
        // Now get payments for these bookings with booking info
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            booking_info:bookings(
              event_date,
              user_info:users(
                display_name,
                email
              )
            )
          `)
          .in('booking_id', bookingIds)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setPayments(data || []);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          payment_status: status,
          updated_at: new Date().toISOString(),
          paid_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('payment_id', paymentId);
      
      if (error) throw error;
      
      toast({
        title: 'Payment Updated',
        description: `Payment status updated to ${status}`,
        variant: 'success',
      });
      
      // Refresh the payments list
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
    }
  };
  
  const filteredPayments = payments.filter(payment => {
    // Filter by tab (payment type)
    if (activeTab !== 'all' && payment.payment_type !== activeTab) {
      return false;
    }
    
    // Filter by status
    if (filter.status !== 'all' && payment.payment_status !== filter.status) {
      return false;
    }
    
    // Filter by timeframe
    if (filter.timeframe !== 'all') {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      
      switch (filter.timeframe) {
        case 'today':
          return paymentDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return paymentDate >= weekAgo;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          return paymentDate >= monthAgo;
        default:
          return true;
      }
    }
    
    return true;
  });
  
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getTotalAmount = (status: string = 'all') => {
    return filteredPayments
      .filter(p => status === 'all' || p.payment_status === status)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track your booking payments
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalAmount('completed'))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-yellow-500 mr-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalAmount('pending'))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">
                {filteredPayments.filter(p => p.payment_status === 'pending').length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="advance">Advance Payments</TabsTrigger>
            <TabsTrigger value="final">Final Payments</TabsTrigger>
            <TabsTrigger value="addon">Add-on Payments</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Select 
              value={filter.status} 
              onValueChange={(value) => setFilter(prev => ({...prev, status: value}))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filter.timeframe} 
              onValueChange={(value) => setFilter(prev => ({...prev, timeframe: value}))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View and manage all your payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="h-8 w-8 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
                <p className="ml-3">Loading payment data...</p>
              </div>
            ) : filteredPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.payment_id}>
                      <TableCell>
                        {payment.booking_info?.user_info?.display_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {payment.booking_info?.event_date 
                          ? formatDate(payment.booking_info.event_date) 
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(payment.payment_status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.payment_status === 'completed' ? payment.paid_at : payment.created_at)}
                      </TableCell>
                      <TableCell>
                        {payment.payment_status === 'pending' ? (
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => updatePaymentStatus(payment.payment_id, 'completed')}
                              title="Mark as Paid"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => updatePaymentStatus(payment.payment_id, 'failed')}
                              title="Mark as Failed"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : payment.payment_status === 'completed' ? (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => updatePaymentStatus(payment.payment_id, 'refunded')}
                            title="Mark as Refunded"
                          >
                            <DollarSign className="h-4 w-4 text-purple-600" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => updatePaymentStatus(payment.payment_id, 'pending')}
                            title="Reset to Pending"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                <p className="text-muted-foreground mt-4">No payment records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default PaymentsPage;

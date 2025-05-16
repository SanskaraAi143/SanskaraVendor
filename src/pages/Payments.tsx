
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DollarSign, AlertCircle } from 'lucide-react';

interface Payment {
  payment_id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_type: string;
  paid_at: string;
  created_at: string;
  notes?: string;
  transaction_id?: string;
}

const PaymentStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-800 border-red-300">Failed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>;
  }
};

const PaymentsPage: React.FC = () => {
  const { vendorProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchPayments();
    }
  }, [vendorProfile, activeTab]);

  const fetchPayments = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          bookings(*)
        `)
        .eq('bookings.vendor_id', vendorProfile?.vendor_id);
      
      if (activeTab !== 'all') {
        query = query.eq('payment_status', activeTab);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setPayments(data as unknown as Payment[]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track all your payments
        </p>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>View and manage all your payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="h-8 w-8 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
                  <p className="ml-3">Loading payments...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-2 text-lg font-medium">No payments found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === 'all' 
                      ? 'There are no payment records available yet.' 
                      : `There are no ${activeTab} payments available.`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Transaction ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.payment_id}>
                          <TableCell>
                            {payment.paid_at ? format(new Date(payment.paid_at), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium">
                            ${payment.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                          <TableCell>
                            <PaymentStatusBadge status={payment.payment_status} />
                          </TableCell>
                          <TableCell className="capitalize">{payment.payment_type}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.transaction_id || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentsPage;

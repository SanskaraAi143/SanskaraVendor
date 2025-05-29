import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider, setLogger } from '@tanstack/react-query';
import Services from './Services';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { BrowserRouter } from 'react-router-dom'; // For useNavigate mock

// Suppress console errors from react-query when testing error states
setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {}, // Mock error to avoid console spam during tests
});

// Mock dependencies
jest.mock('@/hooks/useAuthContext');
jest.mock('@/integrations/supabase/client');
jest.mock('@/components/ui/use-toast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Retain other exports
  useNavigate: () => jest.fn(), // Mock useNavigate
}));

const mockUseAuth = useAuth as jest.Mock;
// More specific type for supabase mock to handle chained calls
const mockSupabaseClient = supabase as jest.Mocked<typeof supabase>;
const mockToast = toast as jest.Mock;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests for faster failures
      cacheTime: 0, // Disable caching for tests
    },
    mutations: {
      retry: false,
    }
  },
});

const renderServicesComponent = (queryClient: QueryClient) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter> {/* Added BrowserRouter for useNavigate context */}
        <Services />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Services Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    // Reset mocks before each test
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ vendorProfile: { vendor_id: 'test-vendor-123', vendor_name: 'Test Vendor' } });
  });

  afterEach(() => {
    queryClient.clear(); // Clear query cache after each test
  });

  test('should display loading state initially', () => {
    // Mock supabase to be in a pending state or delay response
    // This setup ensures the query function never resolves
    (mockSupabaseClient.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      // eq: jest.fn().mockReturnValue(new Promise(() => {})), // This would be the last call in the chain
      // Correct way to mock a promise that never resolves for the final chained call
      mockImplementationOnce: () => new Promise(() => {}), // For the first .eq
      mockImplementationOnce: () => new Promise(() => {}), // For the second .eq, if needed
    }));
     const mockEqIsActive = jest.fn().mockReturnValue(new Promise(() => {})); // Never resolves
     const mockEqVendorId = jest.fn().mockReturnValue({ eq: mockEqIsActive });
    (mockSupabaseClient.from as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue({ eq: mockEqVendorId }) });


    renderServicesComponent(queryClient);
    expect(screen.getByText(/Loading services.../i)).toBeInTheDocument();
  });

  test('should display services when data is fetched successfully', async () => {
    const mockServicesData = [
      { service_id: '1', service_name: 'Test Service 1', service_category: 'Photography', base_price: 100, is_negotiable: false, description: 'Desc 1', price_unit: 'event' },
      { service_id: '2', service_name: 'Test Service 2', service_category: 'Venue', base_price: 200, is_negotiable: true, description: 'Desc 2', price_unit: 'day' },
    ];

    const mockEqIsActive = jest.fn().mockResolvedValue({ data: mockServicesData, error: null });
    const mockEqVendorId = jest.fn().mockReturnValue({ eq: mockEqIsActive });
    (mockSupabaseClient.from as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue({ eq: mockEqVendorId }) });

    renderServicesComponent(queryClient);

    await waitFor(() => {
      expect(screen.getByText('Test Service 1')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument(); // Check category
      expect(screen.getByText('₹100/event')).toBeInTheDocument(); // Check price
    });
    await waitFor(() => {
        expect(screen.getByText('Test Service 2')).toBeInTheDocument();
        expect(screen.getByText('Venue')).toBeInTheDocument();
        expect(screen.getByText('₹200/day')).toBeInTheDocument();
    });
    expect(screen.queryByText(/Loading services.../i)).not.toBeInTheDocument();
  });

  test('should display "No Services Found" when data is an empty list', async () => {
    const mockEqIsActive = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockEqVendorId = jest.fn().mockReturnValue({ eq: mockEqIsActive });
    (mockSupabaseClient.from as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue({ eq: mockEqVendorId }) });

    renderServicesComponent(queryClient);

    await waitFor(() => {
      expect(screen.getByText(/No Services Found/i)).toBeInTheDocument();
      expect(screen.getByText(/You haven't added any services yet./i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Loading services.../i)).not.toBeInTheDocument();
  });

  test('should display error message and trigger toast when fetching fails', async () => {
    const errorMessage = 'Failed to fetch services from Supabase.';
    const mockEqIsActive = jest.fn().mockResolvedValue({ data: null, error: { message: errorMessage, code: '500' } });
    const mockEqVendorId = jest.fn().mockReturnValue({ eq: mockEqIsActive });
    (mockSupabaseClient.from as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue({ eq: mockEqVendorId }) });
    
    renderServicesComponent(queryClient);

    await waitFor(() => {
      // Check for error message displayed in the component's UI
      expect(screen.getByText(/Failed to Load Services/i)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(errorMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i"))).toBeInTheDocument();

      // Check if toast was called with error
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    });
    expect(screen.queryByText(/Loading services.../i)).not.toBeInTheDocument();
  });

  test('should call Supabase update when deleting a service', async () => {
    const mockServiceIdToDelete = 'service-to-delete-1';
    const mockServicesData = [
      { service_id: mockServiceIdToDelete, service_name: 'Deletable Service', service_category: 'Test', base_price: 50, is_negotiable: false, description: 'Delete me', price_unit: 'unit' },
      { service_id: '2', service_name: 'Another Service', service_category: 'Venue', base_price: 200, is_negotiable: true, description: 'Keep me', price_unit: 'day' },
    ];

    // Mock for initial fetch
    const mockFetchEqIsActive = jest.fn().mockResolvedValue({ data: mockServicesData, error: null });
    const mockFetchEqVendorId = jest.fn().mockReturnValue({ eq: mockFetchEqIsActive });
    (mockSupabaseClient.from as jest.Mock)
      .mockReturnValueOnce({ select: jest.fn().mockReturnValue({ eq: mockFetchEqVendorId }) }); // For useQuery

    // Mock for the update (delete) mutation
    const mockUpdateFn = jest.fn().mockResolvedValue({ data: [{ service_id: mockServiceIdToDelete }], error: null }); // Simulate successful update
    const mockUpdateEqServiceId = jest.fn().mockReturnValue({ update: mockUpdateFn }); // This is slightly simplified, Supabase returns more than just update
    
    // This is a more accurate mock for the update call chain
     const mockUpdateResult = { data: [{ service_id: mockServiceIdToDelete }], error: null };
     const mockUpdateCall = jest.fn().mockResolvedValue(mockUpdateResult);
     const mockUpdateEq = jest.fn().mockReturnValue({ update: mockUpdateCall });

    (mockSupabaseClient.from as jest.Mock)
      .mockImplementationOnce(() => ({ // For the initial fetch
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(), // vendor_id
        mockImplementationOnce: () => jest.fn().mockResolvedValueOnce({data: mockServicesData, error: null}), // is_active
      }))
      .mockImplementationOnce(() => ({ // For the delete mutation
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({ data: [{service_id: mockServiceIdToDelete}], error: null}) // service_id for update
      }));
      
    // More robust Supabase mock for multiple calls
    const mockSelectEqIsActive = jest.fn().mockResolvedValue({ data: mockServicesData, error: null });
    const mockSelectEqVendorId = jest.fn().mockReturnValue({ eq: mockSelectEqIsActive });

    const mockUpdateEqServiceId = jest.fn().mockResolvedValue({ error: null }); // Simulating the .eq().update() part
    const mockUpdateMethod = jest.fn().mockReturnValue({ eq: mockUpdateEqServiceId });

    (mockSupabaseClient.from as jest.Mock)
        .mockImplementation((tableName: string) => {
            if (tableName === 'vendor_services') { // Could also check the method being called if needed
                // First call is select, second is update
                if (mockUpdateMethod.mock.calls.length === 0) { // If update hasn't been called yet, it's a select
                    return { select: jest.fn().mockReturnValue({ eq: mockSelectEqVendorId }) };
                }
                return { update: mockUpdateMethod }; // for the mutation
            }
            return { from: jest.fn().mockReturnThis() }; // Default for other tables
        });


    renderServicesComponent(queryClient);

    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByText('Deletable Service')).toBeInTheDocument();
    });

    // Find the delete button for the specific service.
    // This assumes each service card has a unique way to find its delete button.
    // For simplicity, let's assume the delete button is identifiable by text or a test-id.
    // We might need to adjust the component to add test-ids for more robust selection.
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // Assuming the first delete button corresponds to the first service "Deletable Service"
    const deleteButton = deleteButtons[0]; 
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Wait for the AlertDialog to appear
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete this service?/i)).toBeInTheDocument();
    });

    // Click the confirm delete button in the dialog
    const confirmDeleteButton = screen.getByRole('button', { name: /delete/i, hidden: false }); // Dialog's delete button
    
    await act(async () => {
      fireEvent.click(confirmDeleteButton);
    });
    
    // Wait for the mutation to complete and check if Supabase 'update' was called
    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('vendor_services');
      // The following checks the parameters of the update call for the mutation
      // This is a bit tricky because of the chaining. We check the last part of the chain.
      // expect(mockUpdateEqServiceId).toHaveBeenCalledWith('service_id', mockServiceIdToDelete); // Check .eq('service_id', ...)
      expect(mockUpdateMethod).toHaveBeenCalledWith({ is_active: false }); // Check .update({ is_active: false })
    });

    // Check for success toast
    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
            title: "Service deleted",
            description: "The service has been successfully removed",
        });
    });
  });
});

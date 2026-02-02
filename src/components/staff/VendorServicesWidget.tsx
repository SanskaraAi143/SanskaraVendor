import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

interface AssignedService {
  service_id: string;
  service_name: string;
  service_category: string;
  vendor_name: string;
}

const VendorServicesWidget: React.FC = () => {
  const [assignedServices, setAssignedServices] = useState<AssignedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      console.warn("VendorServicesWidget: User not authenticated.");
      return;
    }

    const fetchAssignedServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // First get the staff ID
        const staffQuery = query(
          collection(db, 'vendor_staff'),
          where('supabase_auth_uid', '==', user.uid)
        );
        const staffSnapshot = await getDocs(staffQuery);

        if (staffSnapshot.empty) {
          setError('Staff profile not found.');
          return;
        }

        const staffData = staffSnapshot.docs[0].data();
        const staffId = staffSnapshot.docs[0].id;
        const vendorId = staffData.vendor_id;

        // Fetch vendor name
        let vendorName = 'Unknown Vendor';
        if (vendorId) {
          const vendorDoc = await getDoc(doc(db, 'vendors', vendorId));
          if (vendorDoc.exists()) {
            vendorName = vendorDoc.data().vendor_name || 'Unknown Vendor';
          }
        }

        // Get assigned services from vendor_service_staff
        const assignmentQuery = query(
          collection(db, 'vendor_service_staff'),
          where('staff_id', '==', staffId)
        );
        const assignmentSnapshot = await getDocs(assignmentQuery);

        const servicesPromises = assignmentSnapshot.docs.map(async (assignmentDoc) => {
          const assignment = assignmentDoc.data();
          const serviceId = assignment.service_id;

          if (!serviceId) return null;

          const serviceDoc = await getDoc(doc(db, 'vendor_services', serviceId));
          if (serviceDoc.exists()) {
            const serviceData = serviceDoc.data();
            return {
              service_id: serviceDoc.id,
              service_name: serviceData.service_name || 'Unknown Service',
              service_category: serviceData.service_category || 'Unknown',
              vendor_name: vendorName
            };
          }
          return null;
        });

        const services = (await Promise.all(servicesPromises)).filter(Boolean) as AssignedService[];
        setAssignedServices(services);
      } catch (err: any) {
        console.error('Error fetching assigned services:', err);
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedServices();
  }, [user, authLoading]);

  let content = <p>Services you are assigned to work on.</p>;
  let displayValue: string | number = "-";

  if (isLoading || authLoading) {
    content = (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sanskara-purple" />
        <span className="ml-2">Loading services...</span>
      </div>
    );
    displayValue = "";
  } else if (error) {
    content = <p className="text-red-500 text-xs">{error}</p>;
    displayValue = "Error";
  } else if (assignedServices.length > 0) {
    displayValue = assignedServices.length;
    content = (
      <div className="space-y-2">
        <p>You are assigned to {assignedServices.length} service(s):</p>
        <div className="text-xs space-y-1">
          {assignedServices.slice(0, 3).map(service => (
            <div key={service.service_id} className="truncate">
              • {service.service_name}
            </div>
          ))}
          {assignedServices.length > 3 && (
            <div className="text-gray-500">
              +{assignedServices.length - 3} more...
            </div>
          )}
        </div>
      </div>
    );
  } else {
    content = <p>No services assigned to you yet.</p>;
    displayValue = 0;
  }

  return (
    <DashboardCard
      title="My Assigned Services"
      icon={<CheckCircle2 className="h-5 w-5" />}
      color="sanskara-purple"
      value={displayValue}
      footerLink={{
        text: 'View all services',
        href: '/staff/services',
      }}
    >
      {content}
    </DashboardCard>
  );
};

export default VendorServicesWidget;

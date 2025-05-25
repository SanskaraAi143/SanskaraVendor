import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import StaffDashboard from './StaffDashboard';

const StaffDashboardPage: React.FC = () => {
  return (
    <StaffDashboardLayout>
      <StaffDashboard />
    </StaffDashboardLayout>
  );
};

export default StaffDashboardPage;
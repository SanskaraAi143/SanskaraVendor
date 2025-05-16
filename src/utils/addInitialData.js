// This is a utility script to add initial data for testing purposes
// You can copy-paste this to your browser console while logged in to add some test data

const addInitialData = async () => {
  const supabase = window.supabase;
  
  // Get the current vendor ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No user is logged in');
    return;
  }
  
  const { data: vendorProfile, error: vendorError } = await supabase
    .from('vendors')
    .select('vendor_id')
    .eq('supabase_auth_uid', user.id)
    .single();
    
  if (vendorError || !vendorProfile) {
    console.error('Could not get vendor profile:', vendorError);
    return;
  }
  
  const vendorId = vendorProfile.vendor_id;
  console.log('Adding test data for vendor:', vendorId);
  
  try {
    // Ensure the supabase_auth_uid exists in the users table
    const users = [
      {
        supabase_auth_uid: '1663284d-e830-4957-8dac-a1a0b48b4631',
        email: 'rahul@example.com',
        display_name: 'Rahul Sharma'
      },
      {
        supabase_auth_uid: '2b7c9e4f-3d5a-4b8e-9c2d-5a1b2c3d4e5f',
        email: 'priya@example.com',
        display_name: 'Priya Singh'
      }
    ];

    const { error: usersError } = await supabase
      .from('users')
      .insert(users)
      .onConflict('supabase_auth_uid'); // Avoid duplicate entries

    if (usersError) throw new Error(`Error adding users: ${usersError.message}`);
    console.log('Ensured users exist in the users table');

    // Update staff members to use valid supabase_auth_uid
    const staffMembers = [
      {
        vendor_id: vendorId,
        display_name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone_number: '+91 98765 43210',
        role: 'admin',
        supabase_auth_uid: '1663284d-e830-4957-8dac-a1a0b48b4631'
      },
      {
        vendor_id: vendorId,
        display_name: 'Priya Singh',
        email: 'priya@example.com',
        phone_number: '+91 87654 32109',
        role: 'staff',
        supabase_auth_uid: '2b7c9e4f-3d5a-4b8e-9c2d-5a1b2c3d4e5f'
      }
    ];
    
    const { error: staffError } = await supabase
      .from('vendor_staff')
      .insert(staffMembers);
      
    if (staffError) throw new Error(`Error adding staff: ${staffError.message}`);
    console.log('Added staff members');
    
    // Add some services
    const services = [
      {
        vendor_id: vendorId,
        service_name: 'Basic Photography Package',
        service_category: 'Photography',
        base_price: 25000,
        price_unit: 'per day',
        description: 'Covers pre-wedding shoot and full day wedding coverage',
        is_active: true
      },
      {
        vendor_id: vendorId,
        service_name: 'Premium Video Package',
        service_category: 'Videography',
        base_price: 45000,
        price_unit: 'per event',
        description: 'Cinematic wedding film with drone shots and same-day edit',
        is_active: true
      },
      {
        vendor_id: vendorId,
        service_name: 'Complete Wedding Package',
        service_category: 'Photography',
        base_price: 85000,
        price_unit: 'flat',
        description: 'Full wedding coverage with photo album, video, and prints',
        is_active: true
      }
    ];
    
    const { error: servicesError } = await supabase
      .from('vendor_services')
      .insert(services);
      
    if (servicesError) throw new Error(`Error adding services: ${servicesError.message}`);
    console.log('Added services');
    
    // Add some tasks
    const tasks = [
      {
        vendor_id: vendorId,
        title: 'Call client about wedding details',
        description: 'Discuss shot list and day-of timeline',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'high',
        status: 'To Do',
        is_complete: false
      },
      {
        vendor_id: vendorId,
        title: 'Prepare equipment for next shoot',
        description: 'Charge batteries, format cards, clean lenses',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium',
        status: 'In Progress',
        is_complete: false
      },
      {
        vendor_id: vendorId,
        title: 'Send invoice to Ahmed & Fatima',
        description: 'Final payment for wedding package',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'urgent',
        status: 'To Do',
        is_complete: false
      },
      {
        vendor_id: vendorId,
        title: 'Edit and deliver Rajan & Meera photos',
        description: 'Select and edit final photos, prepare gallery',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium',
        status: 'To Do',
        is_complete: false
      }
    ];
    
    const { error: tasksError } = await supabase
      .from('vendor_tasks')
      .insert(tasks);
      
    if (tasksError) throw new Error(`Error adding tasks: ${tasksError.message}`);
    console.log('Added tasks');
    
    // Add some bookings
    const today = new Date();
    const bookings = [
      {
        vendor_id: vendorId,
        user_id: crypto.randomUUID(),
        event_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30).toISOString().split('T')[0],
        total_amount: 85000,
        advance_amount_due: 30000,
        paid_amount: 30000,
        booking_status: 'confirmed',
        notes_for_vendor: 'Traditional Indian wedding'
      },
      {
        vendor_id: vendorId,
        user_id: crypto.randomUUID(),
        event_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45).toISOString().split('T')[0],
        total_amount: 45000,
        advance_amount_due: 15000,
        paid_amount: 15000,
        booking_status: 'pending_confirmation',
        notes_for_vendor: 'Modern engagement shoot, casual style'
      },
      {
        vendor_id: vendorId,
        user_id: crypto.randomUUID(),
        event_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString().split('T')[0],
        total_amount: 25000,
        advance_amount_due: 10000,
        paid_amount: 25000,
        booking_status: 'completed',
        notes_for_vendor: 'Pre-wedding shoot at beachside'
      }
    ];
    
    const { error: bookingsError } = await supabase
      .from('bookings')
      .insert(bookings);
      
    if (bookingsError) throw new Error(`Error adding bookings: ${bookingsError.message}`);
    console.log('Added bookings');
    
    // Add some availability
    const availabilityDates = [];
    for (let i = -5; i < 60; i += 5) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const status = i % 15 === 0 ? 'unavailable' : i % 10 === 0 ? 'tentative' : 'available';
      
      availabilityDates.push({
        vendor_id: vendorId,
        available_date: date.toISOString().split('T')[0],
        status: status,
        notes: status === 'unavailable' ? 'Personal commitment' : ''
      });
    }
    
    const { error: availabilityError } = await supabase
      .from('vendor_availability')
      .insert(availabilityDates);
      
    if (availabilityError) throw new Error(`Error adding availability: ${availabilityError.message}`);
    console.log('Added availability dates');
    
    // Add some mock payment data (for revenue chart)
    const payments = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 15);
      
      // Add 2-3 payments per month with random amounts
      const numPayments = Math.floor(Math.random() * 2) + 2;
      
      for (let j = 0; j < numPayments; j++) {
        const paymentDate = new Date(month.getFullYear(), month.getMonth(), Math.floor(Math.random() * 28) + 1);
        
        payments.push({
          booking_id: crypto.randomUUID(),
          user_id: crypto.randomUUID(),
          amount: Math.floor(Math.random() * 40000) + 15000,
          paid_at: paymentDate.toISOString(),
          payment_status: 'completed',
          payment_type: Math.random() > 0.5 ? 'advance' : 'final',
          payment_method: Math.random() > 0.3 ? 'online' : 'cash'
        });
      }
    }
    
    const { error: paymentsError } = await supabase
      .from('payments')
      .insert(payments);
      
    if (paymentsError) throw new Error(`Error adding payments: ${paymentsError.message}`);
    console.log('Added payments');
    
    console.log('✅ All test data added successfully!');
    console.log('Please refresh the page to see the updated data.');
    
  } catch (error) {
    console.error('Error adding test data:', error);
  }
};

// Run the function
addInitialData();

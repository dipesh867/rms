import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const demoUsers = [
  {
    email: 'admin@restaurantpro.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    status: 'active',
    department: 'Administration'
  },
  {
    email: 'owner@restaurant.com',
    password: 'owner123',
    name: 'Restaurant Owner',
    role: 'owner',
    status: 'active',
    department: 'Management'
  },
  {
    email: 'vendor@restaurant.com',
    password: 'vendor123',
    name: 'Vendor Partner',
    role: 'vendor',
    status: 'active',
    department: 'Vendor'
  },
  {
    email: 'kitchen@restaurant.com',
    password: 'kitchen123',
    name: 'Kitchen Staff',
    role: 'kitchen',
    status: 'active',
    department: 'Kitchen'
  },
  {
    email: 'staff@restaurant.com',
    password: 'staff123',
    name: 'Restaurant Staff',
    role: 'staff',
    status: 'active',
    department: 'Service'
  },
  {
    email: 'manager@restaurant.com',
    password: 'manager123',
    name: 'Restaurant Manager',
    role: 'manager',
    status: 'active',
    department: 'Management'
  }
];

async function createDemoUser(userData) {
  try {
    console.log(`Creating user: ${userData.email}`);
    
    // First, create the auth user using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true // Auto-confirm email
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`User ${userData.email} already exists, skipping...`);
        return;
      }
      throw authError;
    }

    // Then create the user record in our users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: userData.status,
        department: userData.department,
        created_at: new Date().toISOString(),
        restaurant_id: null // Will be set later if needed
      });

    if (userError) {
      if (userError.code === '23505') { // Unique constraint violation
        console.log(`User record for ${userData.email} already exists in users table`);
        return;
      }
      throw userError;
    }

    console.log(`✅ Successfully created user: ${userData.email}`);
  } catch (error) {
    console.error(`❌ Error creating user ${userData.email}:`, error.message);
  }
}

async function setupDemoUsers() {
  console.log('🚀 Setting up demo users...\n');
  
  for (const user of demoUsers) {
    await createDemoUser(user);
  }
  
  console.log('\n✨ Demo user setup complete!');
  console.log('\nDemo credentials:');
  demoUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
}

// Run the setup
setupDemoUsers().catch(console.error);
// This is a mock file that replaces the Supabase client
// All functions will be no-ops or return mock data

// Mock client with the same structure as Supabase client
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: {}, error: null }),
    signUp: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    admin: {
      createUser: async () => ({ data: { user: { id: 'mock-id' } }, error: null }),
      deleteUser: async () => ({ error: null })
    }
  },
  from: (table: string) => {
    // Create a chainable query object
    const createQueryMethods = () => {
      const queryMethods: any = {
        select: (query = '*') => queryMethods,
        eq: (column: string, value: any) => queryMethods,
        not: (column: string, operator: string, value?: any) => queryMethods,
        in: (column: string, values: any[]) => queryMethods,
        gte: (column: string, value: any) => queryMethods,
        lte: (column: string, value: any) => queryMethods,
        filter: (column: string, operator: string, value: any) => queryMethods,
        contains: (column: string, value: any) => queryMethods,
        order: (column: string, options?: any) => queryMethods,
        limit: (count: number) => queryMethods,
        range: (from: number, to: number) => queryMethods,
        single: async () => ({ data: null, error: null }),
        execute: async () => ({ data: [], error: null }),
        // Terminal methods that return promises
        then: async (resolve: any) => resolve({ data: [], error: null })
      };
      return queryMethods;
    };

    const queryMethods = createQueryMethods();

    return {
      ...queryMethods,
      insert: (data: any) => ({
        select: () => ({
          single: async () => ({ data: { ...data, id: 'mock-id' }, error: null })
        })
      }),
      update: (data: any) => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: { ...data, id: 'mock-id' }, error: null })
          })
        })
      }),
      delete: () => ({
        eq: () => ({ error: null })
      }),
      rpc: () => ({ error: null })
    };
  },
  functions: {
    invoke: async (name: string, options: any = {}) => {
      console.log(`Mock invoking function: ${name}`, options);
      return { data: { success: true }, error: null };
    }
  }
};
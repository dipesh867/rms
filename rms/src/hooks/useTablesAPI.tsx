/**
 * Updated Tables Hook using Django API
 * Replaces useTables.tsx with Django backend integration
 */
import { useState, useEffect, createContext, useContext } from 'react';
import { tableAPI } from '../services/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface Chair {
  id: number;
  number: string;
  table: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  customer_name?: string;
  created_at: string;
  updated_at: string;
}

interface Table {
  id: number;
  number: string;
  restaurant: number;
  restaurant_name?: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  section: string;
  qr_code?: string;
  waiter_assigned?: number;
  waiter_name?: string;
  reservation_time?: string;
  shape: 'rectangle' | 'circle' | 'square';
  position_x: number;
  position_y: number;
  chairs: Chair[];
  current_order_id?: number;
  created_at: string;
  updated_at: string;
}

interface NewTable {
  number: string;
  capacity: number;
  section: string;
  shape?: 'rectangle' | 'circle' | 'square';
  position_x?: number;
  position_y?: number;
  waiter_assigned?: number;
}

interface TablesContextType {
  tables: Table[];
  isLoading: boolean;
  error: string | null;
  fetchTables: () => Promise<void>;
  createTable: (table: NewTable) => Promise<Table | null>;
  updateTable: (id: number, updates: Partial<Table>) => Promise<Table | null>;
  deleteTable: (id: number) => Promise<boolean>;
  updateTableStatus: (id: number, status: string) => Promise<boolean>;
  getTablesBySection: (section: string) => Table[];
  getAvailableTables: () => Table[];
  getOccupiedTables: () => Table[];
  assignWaiter: (tableId: number, waiterId: number) => Promise<boolean>;
  reserveTable: (tableId: number, reservationTime: string) => Promise<boolean>;
}

const TablesContext = createContext<TablesContextType | undefined>(undefined);

export const useTablesAPI = () => {
  const context = useContext(TablesContext);
  if (!context) {
    throw new Error('useTablesAPI must be used within a TablesAPIProvider');
  }
  return context;
};

interface TablesAPIProviderProps {
  children: React.ReactNode;
}

export const TablesAPIProvider: React.FC<TablesAPIProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tables
  const fetchTables = async () => {
    if (!user?.restaurant_id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await tableAPI.getTables(parseInt(user.restaurant_id));
      setTables(response.data || []);

    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to load tables');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new table
  const createTable = async (tableData: NewTable): Promise<Table | null> => {
    if (!user?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await tableAPI.createTable({
        ...tableData,
        restaurant: parseInt(user.restaurant_id),
        status: 'available',
        position_x: tableData.position_x || 0,
        position_y: tableData.position_y || 0,
        shape: tableData.shape || 'rectangle'
      });
      const data = response.data;

      setTables(prev => [...prev, data]);
      toast.success('Table created successfully');
      return data;
    } catch (err: any) {
      console.error('Error creating table:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to create table');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update table
  const updateTable = async (id: number, updates: Partial<Table>): Promise<Table | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Remove unwanted fields
      const { 
        id: _, restaurant: __, restaurant_name: ___, waiter_name: ____, 
        chairs: _____, current_order_id: ______, created_at: _______, 
        updated_at: ________, ...cleanUpdates 
      } = updates;

      const response = await tableAPI.updateTable(id, cleanUpdates);
      const data = response.data;

      setTables(prev => prev.map(table => table.id === id ? data : table));
      toast.success('Table updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating table:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to update table');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete table
  const deleteTable = async (id: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await tableAPI.deleteTable(id);

      setTables(prev => prev.filter(table => table.id !== id));
      toast.success('Table deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting table:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to delete table');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update table status
  const updateTableStatus = async (id: number, status: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await tableAPI.updateTableStatus(id, status);

      // Update local state
      setTables(prev => prev.map(table => 
        table.id === id ? { ...table, status: status as any } : table
      ));

      toast.success('Table status updated');
      return true;
    } catch (err: any) {
      console.error('Error updating table status:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to update table status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get tables by section
  const getTablesBySection = (section: string): Table[] => {
    return tables.filter(table => table.section === section);
  };

  // Get available tables
  const getAvailableTables = (): Table[] => {
    return tables.filter(table => table.status === 'available');
  };

  // Get occupied tables
  const getOccupiedTables = (): Table[] => {
    return tables.filter(table => table.status === 'occupied');
  };

  // Assign waiter to table
  const assignWaiter = async (tableId: number, waiterId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await tableAPI.updateTable(tableId, { waiter_assigned: waiterId });

      // Update local state
      setTables(prev => prev.map(table => 
        table.id === tableId ? { ...table, waiter_assigned: waiterId } : table
      ));

      toast.success('Waiter assigned to table');
      return true;
    } catch (err: any) {
      console.error('Error assigning waiter:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to assign waiter');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reserve table
  const reserveTable = async (tableId: number, reservationTime: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await tableAPI.updateTable(tableId, { 
        status: 'reserved',
        reservation_time: reservationTime
      });

      // Update local state
      setTables(prev => prev.map(table => 
        table.id === tableId 
          ? { ...table, status: 'reserved', reservation_time: reservationTime }
          : table
      ));

      toast.success('Table reserved successfully');
      return true;
    } catch (err: any) {
      console.error('Error reserving table:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to reserve table');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount and user change
  useEffect(() => {
    if (user?.restaurant_id) {
      fetchTables();
    }
  }, [user?.restaurant_id]);

  const value: TablesContextType = {
    tables,
    isLoading,
    error,
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    getTablesBySection,
    getAvailableTables,
    getOccupiedTables,
    assignWaiter,
    reserveTable
  };

  return (
    <TablesContext.Provider value={value}>
      {children}
    </TablesContext.Provider>
  );
};

export default useTablesAPI;

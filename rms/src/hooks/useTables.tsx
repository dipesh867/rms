import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Table, Chair } from '../types';
import { useApp } from '../contexts/AppContext';
import toast from 'react-hot-toast';

interface TableContextType {
  tables: Table[];
  tableSections: string[];
  isLoading: boolean;
  error: string | null;
  fetchTables: () => Promise<void>;
  addTable: (table: Omit<Table, 'id'>) => Promise<Table | null>;
  updateTable: (id: string, updates: Partial<Table>) => Promise<Table | null>;
  deleteTable: (id: string) => Promise<boolean>;
  updateTableStatus: (id: string, status: Table['status']) => Promise<boolean>;
  updateChairStatus: (tableId: string, chairId: string, status: Chair['status']) => Promise<boolean>;
  getAvailableTables: () => Table[];
  getTablesBySection: (section: string) => Table[];
}

const TableContext = createContext<TableContextType | undefined>(undefined);

// Generate chairs for a table
const generateChairsForTable = (tableId: string, capacity: number, startNumber: number = 0): Chair[] => {
  const chairs: Chair[] = [];
  for (let i = 1; i <= capacity; i++) {
    chairs.push({
      id: `${tableId}-chair-${startNumber + i}`,
      number: `${startNumber + i}`,
      status: 'available',
    });
  }
  return chairs;
};

export const TableProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { tables: appTables, addTable: addAppTable, updateTable: updateAppTable, deleteTable: deleteAppTable, updateChairStatus: updateAppChairStatus } = useApp();
  const [tables, setTables] = useState<Table[]>([]);
  const [tableSections, setTableSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch tables from AppContext
  const fetchTables = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      setTables(appTables);
      
      // Extract unique sections
      const sections = Array.from(new Set(appTables.map(table => table.section) || []));
      setTableSections(sections);
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError(err.message);
      toast.error('Failed to load tables');
    } finally {
      setIsLoading(false);
    }
  }, [appTables]);
  
  // Add new table
  const addTable = async (table: Omit<Table, 'id'>): Promise<Table | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Make sure the table has chairs
      let tableWithChairs = { ...table };
      if (!tableWithChairs.chairs || tableWithChairs.chairs.length === 0) {
        tableWithChairs.chairs = generateChairsForTable('temp', tableWithChairs.capacity);
      }
      
      // Use AppContext to add table
      const newTable = addAppTable(tableWithChairs);
      
      // Update sections if needed
      if (!tableSections.includes(newTable.section)) {
        setTableSections(prev => [...prev, newTable.section]);
      }
      
      toast.success('Table added successfully');
      return newTable;
    } catch (err: any) {
      console.error('Error adding table:', err);
      setError(err.message);
      toast.error('Failed to add table');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update existing table
  const updateTable = async (id: string, updates: Partial<Table>): Promise<Table | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use AppContext to update table
      updateAppTable(id, updates);
      
      // Fetch the updated table
      const updatedTable = tables.find(t => t.id === id);
      if (!updatedTable) {
        throw new Error('Table not found after update');
      }
      
      // Update sections if needed
      if (updates.section && !tableSections.includes(updates.section)) {
        setTableSections(prev => [...prev, updates.section!]);
      }
      
      toast.success('Table updated successfully');
      return updatedTable;
    } catch (err: any) {
      console.error('Error updating table:', err);
      setError(err.message);
      toast.error('Failed to update table');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete table
  const deleteTable = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use AppContext to delete table
      deleteAppTable(id);
      
      // Recalculate sections
      const remainingSections = Array.from(new Set(tables.filter(table => table.id !== id).map(table => table.section)));
      setTableSections(remainingSections);
      
      toast.success('Table deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting table:', err);
      setError(err.message);
      toast.error('Failed to delete table');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update table status
  const updateTableStatus = async (id: string, status: Table['status']): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use AppContext to update table status
      updateAppTable(id, { status });
      
      toast.success(`Table status updated to ${status}`);
      return true;
    } catch (err: any) {
      console.error('Error updating table status:', err);
      setError(err.message);
      toast.error('Failed to update table status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update chair status
  const updateChairStatus = async (tableId: string, chairId: string, status: Chair['status']): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use AppContext to update chair status
      updateAppChairStatus(tableId, chairId, status);
      
      toast.success(`Chair status updated to ${status}`);
      return true;
    } catch (err: any) {
      console.error('Error updating chair status:', err);
      setError(err.message);
      toast.error('Failed to update chair status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get all available tables
  const getAvailableTables = (): Table[] => {
    return tables.filter(table => table.status === 'available');
  };
  
  // Get tables by section
  const getTablesBySection = (section: string): Table[] => {
    return tables.filter(table => table.section === section);
  };
  
  // Load tables on mount and when user changes
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);
  
  return (
    <TableContext.Provider
      value={{
        tables,
        tableSections,
        isLoading,
        error,
        fetchTables,
        addTable,
        updateTable,
        deleteTable,
        updateTableStatus,
        updateChairStatus,
        getAvailableTables,
        getTablesBySection
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export const useTables = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTables must be used within a TableProvider');
  }
  return context;
};
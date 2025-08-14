import { queryClient } from "./queryClient";
import dayjs from "dayjs";

export function clearAllDataCache() {
  // Clear all cached data to force fresh fetch
  queryClient.clear();
  
  // Also clear any localStorage cache if present
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('tanstack-query-') || key.includes('cache')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Could not clear localStorage cache:', error);
  }
  
  // Clear sessionStorage if needed
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.includes('query') || key.includes('cache')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Could not clear sessionStorage cache:', error);
  }
}

export function refreshAllDataQueries() {
  const today = dayjs().format('YYYY-MM-DD'); // Use actual current date
  
  // Invalidate all main data queries
  queryClient.invalidateQueries({ queryKey: ["/api/children"] });
  queryClient.invalidateQueries({ queryKey: [`/api/task-completions/date/${today}`] });
  queryClient.invalidateQueries({ queryKey: ["/api/prizes"] });
  queryClient.invalidateQueries({ queryKey: ["/api/greeting"] });
  queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
  queryClient.invalidateQueries({ queryKey: ["/api/current-time-type"] });
  
  // Force refetch for all task lists
  queryClient.invalidateQueries({ 
    predicate: (query) => query.queryKey[0]?.toString()?.startsWith('/api/tasks/child/') || false
  });
}
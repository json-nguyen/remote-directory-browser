import { useMemo } from 'react';
import { Column, Sort } from '@/components/DataTable';

export const useTable = <T>(
  data: T[],
  columns: Column<T>[],
  sort: Sort<T>,
  searchValue?: string
) => {
  const filteredRows = useMemo(() => {
    let filtered = [...data];
    if (searchValue) {
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = col.valueGetter ? col.valueGetter(row) : row[col.key];
          return (
            col.searchable &&
            String(value).toLowerCase().includes(searchValue.toLowerCase())
          );
        })
      );
    }

    if (sort.key && sort.direction) {
      filtered = filtered.sort((a, b) => {
        if (a[sort.key] < b[sort.key]) return sort.direction === 'asc' ? -1 : 1;
        if (a[sort.key] > b[sort.key]) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchValue, sort, columns]);

  return {
    rows: filteredRows,
  };
};

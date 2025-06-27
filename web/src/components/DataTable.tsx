import styled from 'styled-components';
import SearchInput from '@/components/SearchInput';
import { Box } from './ui/Box';
import SortAscIcon from '@/assets/icons/sort-asc.svg?react';
import SortDescIcon from '@/assets/icons/sort-desc.svg?react';
import { useTable } from '@/hooks/useTable';

const TableContainer = styled.div`
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th<{ sortable?: boolean }>`
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};
`;

const THead = styled.thead`
  background: #20a890;
  color: #ffffff;
  text-align: left;
`;

const TBody = styled.tbody`
  tr:nth-of-type(even) {
    background-color: #f3f3f3;
  }
  tr {
    &:hover {
      background-color: #f4f0ff;
    }
  }
`;

const Td = styled.td<{ noResults?: boolean }>`
  padding: ${({ noResults }) => (noResults ? '32px' : '12px 16px')};
  border-bottom: 1px solid #ddd;
  text-align: ${({ noResults }) => (noResults ? 'center' : 'left')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export interface DataTableRef {
  reset: () => void;
}

export interface Column<T> {
  key: keyof T;
  label: string;
  header: (value: string) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  // Used to fetch value for search filtering
  valueGetter?: (row: T) => string;

  // Used to render custom content for the cell
  render?: (row: T) => React.ReactNode;
}

export interface Sort<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

interface TableProps<T> {
  loading?: boolean;
  data: T[];
  columns: Column<T>[];
  getRowProps?: (row: T) => React.HTMLAttributes<HTMLTableRowElement>;
  searchValue: string;
  sortValue: Sort<T>;
  onSearchChange?: (value: string) => void;
  onSortChange?: (sortVal: Sort<T>) => void;
}

export const DataTable = <T,>({
  loading,
  data,
  columns,
  searchValue,
  sortValue,
  getRowProps,
  onSearchChange,
  onSortChange,
}: TableProps<T>) => {
  const { rows } = useTable(data, columns, sortValue, searchValue);

  const renderSortIcon = (key: keyof T) => {
    if (key !== sortValue.key) return null;
    if (sortValue.direction === 'asc') return <SortAscIcon width={10} />;
    if (sortValue.direction === 'desc') return <SortDescIcon width={10} />;
    return null;
  };

  const handleSortClick = (key: keyof T) => {
    const direction =
      key === sortValue.key && sortValue.direction === 'asc' ? 'desc' : 'asc';
    onSortChange?.({ key, direction });
  };

  return (
    <>
      <Box mb="16px">
        <SearchInput
          searchValue={searchValue}
          setSearchValue={val => {
            onSearchChange?.(val);
          }}
        />
      </Box>
      <TableContainer>
        <Table>
          <THead>
            <tr>
              {columns.map(column => (
                <Th
                  key={String(column.key)}
                  onClick={() => column.sortable && handleSortClick(column.key)}
                  sortable={column.sortable}
                >
                  <Box display="flex" alignItems="center" gap="8px">
                    {column.header(column.label)}
                    {column.sortable && renderSortIcon(column.key)}
                  </Box>
                </Th>
              ))}
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <tr>
                <Td noResults colSpan={columns.length}>
                  Loading...
                </Td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <Td noResults colSpan={columns.length}>
                  No Results Found
                </Td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const rowProps = getRowProps?.(row) ?? {};
                return (
                  <tr key={index} {...rowProps}>
                    {columns.map(column => (
                      <Td
                        title={String(row[column.key])}
                        key={String(column.key)}
                      >
                        {column.render
                          ? column.render(row)
                          : (row[column.key] as React.ReactNode)}
                      </Td>
                    ))}
                  </tr>
                );
              })
            )}
          </TBody>
        </Table>
      </TableContainer>
    </>
  );
};

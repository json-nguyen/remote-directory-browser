import { renderHook } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useTable } from '@/hooks/useTable';
import { DirectoryEntry } from '@/types/directory';
import { Column } from '@/components/DataTable';

const mockDirectory: DirectoryEntry[] = [
  { name: 'b', type: 'dir', size: 0 },
  { name: 'abc.pdf', type: 'file', size: 500 },
  { name: 'abb.txt', type: 'file', size: 100 },
];

const mockColumns: Column<DirectoryEntry>[] = [
  {
    key: 'name',
    label: 'Name',
    header: (val: string) => val,
    sortable: true,
    searchable: true,
  },
  {
    key: 'type',
    label: 'Type',
    header: (val: string) => val,
    sortable: true,
    searchable: false,
  },
  {
    key: 'size',
    label: 'Size',
    header: (val: string) => val,
    sortable: true,
    searchable: false,
  },
];

describe('useTable', () => {
  test('filters row by searchValue', () => {
    const { result } = renderHook(() =>
      useTable(
        mockDirectory,
        mockColumns,
        { key: 'name', direction: 'asc' },
        'ab'
      )
    );

    expect(result.current.rows).toHaveLength(2);
    const names = result.current.rows.map(row => row.name);
    expect(names).toContain('abc.pdf');
    expect(names).toContain('abb.txt');
  });

  test('sorts row by ascending', () => {
    const { result } = renderHook(() =>
      useTable(
        mockDirectory,
        mockColumns,
        { key: 'name', direction: 'asc' },
        ''
      )
    );

    expect(result.current.rows.map(r => r.name)).toEqual([
      'abb.txt',
      'abc.pdf',
      'b',
    ]);
  });

  test('sorts row by descending', () => {
    const { result } = renderHook(() =>
      useTable(
        mockDirectory,
        mockColumns,
        { key: 'name', direction: 'desc' },
        ''
      )
    );

    expect(result.current.rows.map(r => r.name)).toEqual([
      'b',
      'abc.pdf',
      'abb.txt',
    ]);
  });

  test('filters and sorts row', () => {
    const { result } = renderHook(() =>
      useTable(
        mockDirectory,
        mockColumns,
        { key: 'name', direction: 'desc' },
        'ab'
      )
    );

    expect(result.current.rows).toHaveLength(2);
    const names = result.current.rows.map(row => row.name);
    expect(names).toEqual(['abc.pdf', 'abb.txt']);
  });
});

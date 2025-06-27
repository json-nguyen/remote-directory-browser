import { expect, test, vi, describe, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';
import DirectoryPage from '@/pages/DirectoryPage';
import { AuthProvider } from '@/context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { getDirectory } from '@/api/directory';
import type { Mock } from 'vitest';

vi.mock('@/api/directory', () => ({
  getDirectory: vi.fn(),
}));

const renderWithWrappers = (ui: React.ReactNode, initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
};

beforeEach(() => {
  (getDirectory as Mock).mockImplementation((path: string) => {
    return {
      name: path,
      type: 'dir',
      size: 0,
      contents: [
        { name: 'b', type: 'dir', size: 0 },
        { name: 'abc.pdf', type: 'file', size: 500 },
        { name: 'abb.txt', type: 'file', size: 100 },
      ],
    };
  });
});

describe('Directory Page', () => {
  test('should display all rows on initial render', async () => {
    renderWithWrappers(<DirectoryPage />, '/');
    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('abc.pdf')).toBeInTheDocument();
    expect(screen.getByText('abb.txt')).toBeInTheDocument();
  });

  test('should filter rows based on search input and show a single matching row', async () => {
    renderWithWrappers(<DirectoryPage />, '/files');

    await screen.findByText('abc.pdf');

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'abc.pdf' } });

    expect(screen.getByText('abc.pdf')).toBeInTheDocument();
    expect(screen.queryByText('abb.txt')).not.toBeInTheDocument();
    expect(screen.queryByText('b')).not.toBeInTheDocument();
  });

  test('should filter rows based on search input and show multiple matching rows', async () => {
    renderWithWrappers(<DirectoryPage />, '/files');

    await screen.findByText('abc.pdf');

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'ab' } });

    expect(screen.getByText('abc.pdf')).toBeInTheDocument();
    expect(screen.getByText('abb.txt')).toBeInTheDocument();
    expect(screen.queryByText('b')).not.toBeInTheDocument();
  });

  test('should sort when clicking column header', async () => {
    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    renderWithWrappers(<DirectoryPage />, '/files');

    await screen.findByText('abc.pdf');

    const nameHeader = screen.getByRole('columnheader', { name: /Name/i });

    // Descending sort for string
    fireEvent.click(nameHeader);
    let rows = screen.getAllByRole('row');
    let cell = within(rows[1]).getByText('b');
    expect(cell).toBeInTheDocument();

    // Ascending sort for string
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row');
    cell = within(rows[1]).getByText('abb.txt');
    expect(cell).toBeInTheDocument();

    // Ascending sort for number
    const sizeHeader = screen.getByRole('columnheader', { name: /Size/i });
    fireEvent.click(sizeHeader);
    rows = screen.getAllByRole('row');
    let sizeCell = within(rows[1]).getByText('-');
    expect(sizeCell).toBeInTheDocument();

    // descending sort for number
    fireEvent.click(sizeHeader);
    rows = screen.getAllByRole('row');
    sizeCell = within(rows[1]).getByText('500 B');
    expect(sizeCell).toBeInTheDocument();
  });

  test('should display "No Results Found" when no rows match the search', async () => {
    renderWithWrappers(<DirectoryPage />, '/files');

    await screen.findByText('abc.pdf');

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, {
      target: { value: 'Nobody should show up' },
    });

    expect(screen.getByText('No Results Found')).toBeInTheDocument();
  });

  test('breadcrumbs should display', async () => {
    renderWithWrappers(<DirectoryPage />, '/files/breadcrumbA/breadcrumbB');

    await screen.findByText('abc.pdf');

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbA')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbB')).toBeInTheDocument();
  });
});

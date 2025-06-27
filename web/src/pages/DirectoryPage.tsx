import { useState, useMemo, useEffect, useCallback } from 'react';
import { DataTable, Sort } from '@/components/DataTable';
import { Column } from '@/components/DataTable';
import { DirectoryEntry } from '@/types/directory';
import styled from 'styled-components';
import { Button } from '@/components/ui/Button';
import { Box } from '@/components/ui/Box';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getDirectory } from '@/api/directory';
import Breadcrumbs from '@/components/Breadcrumbs';
import { APIError } from '@/api/client';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/context/AuthContext';

const DirectoryPageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 24px;
  text-align: center;
  margin-bottom 16px;
`;

const DirectoryPage = () => {
  const [data, setData] = useState<DirectoryEntry | null>(null);
  const { handleLogout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchVal = searchParams.get('search') ?? '';

  const parseSortParam = (param: string): Sort<DirectoryEntry> => {
    if (!param || !param.includes(':')) {
      return { key: 'name', direction: 'asc' };
    }

    const [key, dir] = param.split(':');

    // In a production app, I'd typically implement a runtime schema validator
    // like 'zod' to parse and validate query params
    const validKeys: (keyof DirectoryEntry)[] = ['name', 'type', 'size'];
    const isValidKey = validKeys.includes(key as keyof DirectoryEntry);
    const isValidDir = dir === 'asc' || dir === 'desc';
    return {
      key: isValidKey ? (key as keyof DirectoryEntry) : 'name',
      direction: isValidDir ? dir : 'asc',
    };
  };

  const sortVal = parseSortParam(searchParams.get('sort') ?? '');

  const currentPath = decodeURIComponent(
    location.pathname.replace(/^\/files\/?/, '')
  );

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        setLoading(true);
        const dir = await getDirectory(currentPath);
        setData(dir);
      } catch (err) {
        if (err instanceof APIError) {
          if (err.status === 401) {
            handleLogout(err.message);
          }
          if (err.status === 404) {
            await navigate('/404', { replace: true });
          } else {
            console.error(`API error ${err.status}:`, err.message);
            await navigate('/error', {
              state: { status: err.status, message: err.message },
            });
          }
        } else {
          await navigate('/error', {
            state: { message: 'Unexpected error occurred' },
          });
        }
      } finally {
        setLoading(false);
      }
    };
    void fetchDirectory();
  }, [location.pathname]);

  const columns = useMemo<Column<DirectoryEntry>[]>(
    () => [
      {
        key: 'name',
        label: 'Name',
        header: (value: string) => <strong>{value}</strong>,
        sortable: true,
        searchable: true,
      },
      {
        key: 'type',
        label: 'Type',
        header: (value: string) => <strong>{value}</strong>,
        sortable: true,
        render: value => {
          return value.type === 'dir' ? 'Directory' : 'File';
        },
      },
      {
        key: 'size',
        label: 'Size',
        header: (value: string) => <strong>{value}</strong>,
        sortable: true,
        valueGetter: value =>
          value.size === 0 ? '-' : formatFileSizeToString(value.size),
        render: value => {
          return value.size === 0 ? '-' : formatFileSizeToString(value.size);
        },
      },
    ],
    []
  );

  const formatFileSizeToString = (size: number): string => {
    const KB = 1000;
    const MB = KB * 1000;
    const GB = MB * 1000;
    const TB = GB * 1000;

    if (size < KB) return `${size} B`;
    if (size < MB) return `${(size / KB).toFixed(2)} KB`;
    if (size < GB) return `${(size / MB).toFixed(2)} MB`;
    if (size < TB) return `${(size / GB).toFixed(2)} GB`;
    return `${(size / TB).toFixed(2)} TB`;
  };

  const joinPaths = (...segments: string[]): string => {
    return segments
      .filter(Boolean)
      .map(s => s.replace(/^\/+|\/+$/g, ''))
      .join('/');
  };

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const resetTableState = () => {
    // updateParam('search', '');
    // updateParam('sort', '');
  };

  const handleBreadcrumbClick = () => {
    resetTableState();
  };

  if (loading && !data) {
    return <Loader />;
  }

  return (
    <DirectoryPageContainer>
      <Box display="flex" justifyContent="end">
        <Button onClick={() => void handleLogout()}>Logout</Button>
      </Box>

      <Title>Teleport Directory</Title>
      <Breadcrumbs
        onCrumbClick={handleBreadcrumbClick}
        homeRoute="files"
        homeLabel="Home"
      />
      <DataTable<DirectoryEntry>
        loading={loading}
        data={data?.contents || []}
        columns={columns}
        searchValue={searchVal}
        sortValue={sortVal}
        getRowProps={row => {
          if (row.type === 'dir') {
            return {
              onClick: () => {
                if (row.type === 'dir') {
                  resetTableState();
                  const newPath = joinPaths(currentPath, row.name);
                  void navigate(`/files/${newPath}`);
                }
              },
              style: { cursor: 'pointer' },
            };
          }
          return {};
        }}
        onSearchChange={value => updateParam('search', value)}
        onSortChange={value =>
          updateParam('sort', `${value.key}:${value.direction}`)
        }
      />
    </DirectoryPageContainer>
  );
};

export default DirectoryPage;

import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const MAX_CRUMB_LABEL_LENGTH = 24;

const CrumbList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  font-size: 16px;
`;

const CrumbItem = styled.li`
  display: flex;
  align-items: center;
`;

const CrumbLink = styled(Link)`
  color: #0070f3;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 8px;
  border-radius: 6px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: #e5e7eb;
    color: #0056b3;
  }
`;

const CrumbText = styled.span`
  color: #666;
  font-weight: 500;
  padding: 6px 8px;
`;

const Separator = styled.span`
  margin: 0 8px;
  color: #999;
  font-weight: 400;
`;

interface BreadcrumbProps {
  homeRoute: string;
  homeLabel: string;
  maxCrumbs?: number;
  onCrumbClick?: () => void;
}

interface BreadCrumb {
  label: string;
  path: string;
  isEllipsis?: boolean;
  ellipsisTitle?: string;
}
/*
 * For this implementation, breadcrumb links are auto-generated from the current URL path.
 * A static breadcrumb config is intentionally not implemented to reduce complexity. If needed in the future,
 * this component can be extended to support custom links/labels.
 */

const Breadcrumbs = ({
  homeRoute,
  homeLabel,
  maxCrumbs = 3,
  onCrumbClick,
}: BreadcrumbProps) => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const normalizedHomeRoute = homeRoute.startsWith('/')
    ? homeRoute
    : `/${homeRoute}`;

  const rootSegment = normalizedHomeRoute.replace(/^\//, '');

  if (segments[0] !== rootSegment) return null;

  const crumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = decodeURIComponent(segment);
    return { path, label };
  });

  const crumbsWithHome = crumbs.map((crumb, index) =>
    index === 0 ? { ...crumb, label: homeLabel } : crumb
  );

  const crumbsWithoutHome = crumbs.slice(1);

  let visibleCrumbs: BreadCrumb[] = [];
  let ellipsisTitle = '';

  if (crumbsWithoutHome.length > maxCrumbs) {
    const hiddenCrumbs = crumbsWithoutHome.slice(
      0,
      crumbsWithoutHome.length - maxCrumbs
    );
    ellipsisTitle = hiddenCrumbs.map(crumb => crumb.label).join('/');

    visibleCrumbs = [
      crumbsWithHome[0],
      { label: '…', path: '', isEllipsis: true, ellipsisTitle },
      ...crumbsWithoutHome.slice(-maxCrumbs),
    ];
  } else {
    visibleCrumbs = crumbsWithHome;
  }

  const truncateLabel = (label: string) => {
    return label.length > MAX_CRUMB_LABEL_LENGTH
      ? `${label.slice(0, MAX_CRUMB_LABEL_LENGTH)}…`
      : label;
  };

  return (
    <nav aria-label="Breadcrumb">
      <CrumbList>
        {visibleCrumbs.map((crumb, index) => {
          const isEllipsis = crumb.isEllipsis;
          return (
            <CrumbItem key={index}>
              {index > 0 && <Separator>/</Separator>}
              {isEllipsis ? (
                <CrumbText title={crumb.ellipsisTitle}>…</CrumbText>
              ) : index === visibleCrumbs.length - 1 ? (
                <CrumbText
                  title={
                    crumb.label.length > MAX_CRUMB_LABEL_LENGTH
                      ? crumb.label
                      : undefined
                  }
                >
                  {truncateLabel(crumb.label)}
                </CrumbText>
              ) : (
                <CrumbLink
                  onClick={onCrumbClick}
                  to={crumb.path}
                  title={
                    crumb.label.length > MAX_CRUMB_LABEL_LENGTH
                      ? crumb.label
                      : undefined
                  }
                >
                  {truncateLabel(crumb.label)}
                </CrumbLink>
              )}
            </CrumbItem>
          );
        })}
      </CrumbList>
    </nav>
  );
};

export default Breadcrumbs;

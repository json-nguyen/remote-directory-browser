import React from 'react';
import styled from 'styled-components';
import type { CSSProperties } from 'react';

// This component is a simple generic container with access to CSS properties.
interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  m?: string;
  mt?: string;
  mr?: string;
  mb?: string;
  ml?: string;

  p?: string;
  pt?: string;
  pr?: string;
  pb?: string;
  pl?: string;

  display?: CSSProperties['display'];
  justifyContent?: CSSProperties['justifyContent'];
  flexDirection?: CSSProperties['flexDirection'];
  alignItems?: CSSProperties['alignItems'];
  gap?: string;
}

export const Box = styled.div<BoxProps>`
  margin: ${({ m }) => m || 'initial'};
  margin-top: ${({ mt }) => mt || 'initial'};
  margin-right: ${({ mr }) => mr || 'initial'};
  margin-bottom: ${({ mb }) => mb || 'initial'};
  margin-left: ${({ ml }) => ml || 'initial'};

  padding: ${({ p }) => p || 'initial'};
  padding-top: ${({ pt }) => pt || 'initial'};
  padding-right: ${({ pr }) => pr || 'initial'};
  padding-bottom: ${({ pb }) => pb || 'initial'};
  padding-left: ${({ pl }) => pl || 'initial'};

  display: ${({ display }) => display || 'block'};
  justify-content: ${({ justifyContent }) => justifyContent || 'inital'};
  flex-direction: ${({ flexDirection }) => flexDirection || 'initial'};
  align-items: ${({ alignItems }) => alignItems || 'initial'};
  gap: ${({ gap }) => gap || '0'};
`;

import styled from 'styled-components';

export const Button = styled.button`
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(90deg, #6a5acd, #d16ba5); // lavender to pink
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

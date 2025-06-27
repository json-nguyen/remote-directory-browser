import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div`
  border: 4px solid #e0e0e0;
  border-top: 4px solid #7c3aed;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: ${spin} 1s linear infinite;
`;

const Loader = () => (
  <LoaderWrapper data-testid="loader">
    <Spinner />
  </LoaderWrapper>
);

export default Loader;

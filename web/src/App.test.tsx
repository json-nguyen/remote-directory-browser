import { test } from 'vitest';
import { render } from '@testing-library/react';
import { App } from './App';
import { MemoryRouter } from 'react-router-dom';

test('should render App component without crashing', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  <App />;
});

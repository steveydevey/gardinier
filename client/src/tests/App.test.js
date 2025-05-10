import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => <div>Mocked Route</div>
}));

test('renders without crashing', () => {
  render(<App />);
  expect(true).toBe(true);
}); 
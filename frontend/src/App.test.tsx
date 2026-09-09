import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders zendaBot logo and main heading', () => {
  render(<App />);
  const headings = screen.getAllByText(/zendaBot/i);
  expect(headings.length).toBeGreaterThan(0);
});

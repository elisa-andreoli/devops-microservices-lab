import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock window.APP_CONFIG
Object.defineProperty(window, 'APP_CONFIG', {
  value: { API_BASE_URL: 'http://localhost:3000' },
  writable: true
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders expenses heading', () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<App />);
    const heading = screen.getByText(/expenses/i);
    expect(heading).toBeInTheDocument();
  });

  test('renders expense form', () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<App />);
    
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Comment')).toBeInTheDocument();
    expect(screen.getByText('Add Expense')).toBeInTheDocument();
  });

  test('displays expenses in table', async () => {
    const mockExpenses = [
      {
        _id: '1',
        title: 'Test Expense',
        comment: 'Test Comment',
        startDate: '2024-01-01',
        status: 'Pending'
      }
    ];
    
    mockedAxios.get.mockResolvedValue({ data: mockExpenses });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Expense')).toBeInTheDocument();
      expect(screen.getByText('Test Comment')).toBeInTheDocument();
    });
  });

  test('opens modal when view button is clicked', async () => {
    const mockExpenses = [
      {
        _id: '1',
        title: 'Test Expense',
        comment: 'Test Comment',
        startDate: '2024-01-01',
        status: 'Pending'
      }
    ];
    
    mockedAxios.get.mockResolvedValue({ data: mockExpenses });
    
    render(<App />);
    
    await waitFor(() => {
      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);
    });
    
    expect(screen.getByText('Expense Details')).toBeInTheDocument();
  });
});
const request = require('supertest');
const express = require('express');
const Expense = require('../models/Expense');

// Mock the Expense model
jest.mock('../models/Expense');

const app = express();
app.use(express.json());
app.use('/api/expenses', require('../routes/expenses'));

describe('Expense API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/expenses', () => {
    it('should return all expenses', async () => {
      const mockExpenses = [
        { _id: '1', title: 'Test Expense', status: 'Pending' }
      ];
      Expense.find.mockResolvedValue(mockExpenses);

      const response = await request(app).get('/api/expenses');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockExpenses);
      expect(Expense.find).toHaveBeenCalled();
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('should return a single expense', async () => {
      const mockExpense = { _id: '1', title: 'Test Expense' };
      Expense.findById.mockResolvedValue(mockExpense);

      const response = await request(app).get('/api/expenses/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockExpense);
    });

    it('should return 404 if expense not found', async () => {
      Expense.findById.mockResolvedValue(null);

      const response = await request(app).get('/api/expenses/999');
      
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe('Expense not found');
    });
  });
});
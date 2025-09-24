const RabbitMQService = require('../services/rabbitmq');

// Mock amqplib
jest.mock('amqplib', () => ({
  connect: jest.fn()
}));

describe('RabbitMQ Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('publishMessage', () => {
    it('should handle missing channel gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await RabbitMQService.publishMessage('test.key', { test: 'data' });
      
      expect(consoleSpy).toHaveBeenCalledWith('RabbitMQ not connected, skipping message publish');
      consoleSpy.mockRestore();
    });
  });
});
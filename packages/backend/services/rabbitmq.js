const amqp = require('amqplib');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
      const vhost = process.env.RABBITMQ_VHOST || '/';
      const url = `${rabbitmqUrl}${vhost}`;
      
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      const exchange = process.env.RABBITMQ_EXCHANGE || 'expenses_exchange';
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      
      console.log('RabbitMQ connected');
    } catch (error) {
      console.error('RabbitMQ connection failed:', error.message);
    }
  }

  async publishMessage(routingKey, message) {
    if (!this.channel) {
      console.warn('RabbitMQ not connected, skipping message publish');
      return;
    }

    try {
      const exchange = process.env.RABBITMQ_EXCHANGE || 'expenses_exchange';
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      await this.channel.publish(exchange, routingKey, messageBuffer, {
        persistent: true,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to publish message:', error.message);
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.close();
    }
  }
}

module.exports = new RabbitMQService();
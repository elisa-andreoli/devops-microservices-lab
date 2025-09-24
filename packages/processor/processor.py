import os
import json
import pika
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class MessageProcessor:
    def __init__(self):
        self.rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://localhost')
        self.vhost = os.getenv('RABBITMQ_VHOST', '/')
        self.exchange = os.getenv('RABBITMQ_EXCHANGE', 'expenses_exchange')
        self.output_folder = os.getenv('OUTPUT_FOLDER', './messages')
        
        # Create output folder if it doesn't exist
        os.makedirs(self.output_folder, exist_ok=True)
        
    def connect(self):
        url = f"{self.rabbitmq_url}{self.vhost}"
        parameters = pika.URLParameters(url)
        self.connection = pika.BlockingConnection(parameters)
        self.channel = self.connection.channel()
        
        # Declare exchange
        self.channel.exchange_declare(exchange=self.exchange, exchange_type='topic', durable=True)
        
        # Create temporary queue
        result = self.channel.queue_declare(queue='', exclusive=True)
        self.queue_name = result.method.queue
        
        # Bind queue to exchange with all routing keys
        self.channel.queue_bind(exchange=self.exchange, queue=self.queue_name, routing_key='expense.*')
        
    def callback(self, ch, method, properties, body):
        try:
            message = json.loads(body.decode('utf-8'))
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
            filename = f"{timestamp}_{method.routing_key}.json"
            filepath = os.path.join(self.output_folder, filename)
            
            with open(filepath, 'w') as f:
                json.dump(message, f, indent=2)
            
            print(f"Message saved: {filename}")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            print(f"Error processing message: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    
    def start_consuming(self):
        self.channel.basic_consume(queue=self.queue_name, on_message_callback=self.callback)
        print(f"Waiting for messages from exchange '{self.exchange}'. To exit press CTRL+C")
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            print("\nStopping consumer...")
            self.channel.stop_consuming()
            self.connection.close()

if __name__ == '__main__':
    processor = MessageProcessor()
    processor.connect()
    processor.start_consuming()
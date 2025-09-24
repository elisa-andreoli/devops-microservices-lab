import pytest
import json
import os
from unittest.mock import patch, MagicMock
from processor import MessageProcessor

class TestMessageProcessor:
    
    @patch.dict(os.environ, {
        'RABBITMQ_URL': 'amqp://test',
        'RABBITMQ_VHOST': '/test',
        'RABBITMQ_EXCHANGE': 'test_exchange',
        'OUTPUT_FOLDER': './test_messages'
    })
    def test_init(self):
        processor = MessageProcessor()
        assert processor.rabbitmq_url == 'amqp://test'
        assert processor.vhost == '/test'
        assert processor.exchange == 'test_exchange'
        assert processor.output_folder == './test_messages'
    
    @patch('processor.pika.URLParameters')
    @patch('processor.pika.BlockingConnection')
    def test_connect(self, mock_connection, mock_params):
        mock_channel = MagicMock()
        mock_connection.return_value.channel.return_value = mock_channel
        
        processor = MessageProcessor()
        processor.connect()
        
        mock_params.assert_called_once()
        mock_channel.exchange_declare.assert_called_once()
        mock_channel.queue_declare.assert_called_once()
        mock_channel.queue_bind.assert_called_once()
    
    @patch('processor.os.makedirs')
    @patch('builtins.open')
    @patch('processor.json.dump')
    def test_callback_success(self, mock_json_dump, mock_open, mock_makedirs):
        processor = MessageProcessor()
        
        # Mock message data
        message_data = {
            'action': 'created',
            'entity': 'expense',
            'data': {'id': '123'},
            'timestamp': '2024-01-01T00:00:00Z'
        }
        
        # Mock channel and method
        mock_ch = MagicMock()
        mock_method = MagicMock()
        mock_method.routing_key = 'expense.created'
        mock_method.delivery_tag = 'test_tag'
        
        # Mock body
        mock_body = json.dumps(message_data).encode('utf-8')
        
        processor.callback(mock_ch, mock_method, None, mock_body)
        
        mock_ch.basic_ack.assert_called_once_with(delivery_tag='test_tag')
        mock_open.assert_called_once()
        mock_json_dump.assert_called_once()
    
    @patch('processor.json.loads')
    def test_callback_error(self, mock_json_loads):
        mock_json_loads.side_effect = json.JSONDecodeError('test', 'test', 0)
        
        processor = MessageProcessor()
        
        mock_ch = MagicMock()
        mock_method = MagicMock()
        mock_method.delivery_tag = 'test_tag'
        
        processor.callback(mock_ch, mock_method, None, b'invalid json')
        
        mock_ch.basic_nack.assert_called_once_with(
            delivery_tag='test_tag', 
            requeue=False
        )
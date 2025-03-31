echo "Initializing Elasticsearch index..."
curl -X PUT "http://elasticsearch:9200/news" -H "Content-Type: application/json" -d @/usr/share/elasticsearch/config/news_mapping.json
echo "Elasticsearch index created!"
#!/bin/bash

echo "🌱 Starting laptop seeder in Docker container..."

# Run the seeder inside the ecommerce-api container
docker compose exec ecommerce-api npm run seed:laptops

echo "✅ Laptop seeder completed!"

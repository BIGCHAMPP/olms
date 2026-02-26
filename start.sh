#!/bin/bash

# OLMS Startup Script for Render
# This script initializes the database and starts the server

echo "==================================="
echo "OLMS Startup Script"
echo "==================================="

# Set the database path
export DATABASE_URL="file:/opt/render/project/src/.data/custom.db"

echo "Database URL: $DATABASE_URL"

# Create database directory if it doesn't exist
mkdir -p /opt/render/project/src/.data

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push database schema
echo "Pushing database schema..."
npx prisma db push

# Seed database
echo "Seeding database..."
node prisma/seed.js

# Start the server
echo "Starting server..."
cd .next/standalone
NODE_ENV=production node server.js

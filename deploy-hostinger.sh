#!/bin/bash

# OLMS Hostinger Deployment Script
# Run this on your Hostinger server

echo "==================================="
echo "OLMS Deployment for Hostinger"
echo "Node.js Version: $(node -v)"
echo "==================================="

# Step 1: Install dependencies
echo ""
echo "Step 1: Installing dependencies..."
npm install

# Step 2: Generate Prisma client
echo ""
echo "Step 2: Generating Prisma client..."
npx prisma generate

# Step 3: Create database schema
echo ""
echo "Step 3: Creating database schema..."
npx prisma db push

# Step 4: Seed database with admin user
echo ""
echo "Step 4: Seeding database..."
node prisma/seed.js

# Step 5: Create .env file if not exists
if [ ! -f ".env" ]; then
    echo ""
    echo "Step 5: Creating .env file..."
    cat > .env << 'EOF'
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
NODE_ENV="production"
EOF
fi

# Step 6: Build the application
echo ""
echo "Step 6: Building application (this may take a few minutes)..."
npm run build

echo ""
echo "==================================="
echo "✅ Deployment Complete!"
echo "==================================="
echo ""
echo "To start the server, run:"
echo "  NODE_ENV=production node .next/standalone/server.js"
echo ""
echo "Login credentials:"
echo "  Username: admin"
echo "  Password: admin"
echo ""

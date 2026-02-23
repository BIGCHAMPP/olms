# Ornament & Loan Management System (OLMS)

A comprehensive loan management system for ornaments and gold loans with customer management, ornament tracking, loan disbursement, payment processing, and risk management.

## Features

### Core Modules
- **Authentication** - Secure login with role-based access (Admin, Branch Manager, Loan Officer)
- **Dashboard** - Real-time statistics, charts, and recent activity
- **Customer Management** - Add/Edit/Delete customers with status tracking
- **Ornament Management** - Track gold/silver ornaments with valuation
- **Loan Disbursement** - Create loans with LTV validation and ornament pledging
- **Payment Management** - Record interest/principal payments with receipts

### Risk & Compliance
- **Risk Zone Management** - Green/Yellow/Red zone classification
- **Audit Trail** - Complete activity logging
- **User Management** - Role-based access control
- **Branch Management** - Multi-branch support
- **Settings** - System configuration (interest rates, LTV limits, etc.)
- **Bulk Import** - JSON import for customers and loans

## Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin | ADMIN |

⚠️ **Important:** Change the default password after first login!

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS with shadcn/ui
- **Authentication:** JWT-based authentication

---

## Deployment on Hostinger

### Prerequisites
- Hostinger VPS or Cloud hosting with Node.js 18+ support
- SSH access to your server

### Step 1: Prepare Your Files

Upload these files and folders to your Hostinger server:

```
your-domain/
├── .next/standalone/     # Built application
├── .next/static/         # Static assets
├── public/               # Public files
├── db/                   # Database folder
├── prisma/               # Prisma schema
├── package.json
├── .env                  # Environment variables
```

### Step 2: Environment Variables

Create a `.env` file in your project root:

```env
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-secure-jwt-secret-change-this"
NODE_ENV="production"
```

⚠️ **Important:** Generate a secure JWT secret for production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Install Dependencies

```bash
cd your-domain
npm install --omit=dev
```

### Step 4: Initialize Database

```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### Step 5: Start the Application

**Using PM2 (Recommended for production):**

```bash
npm install -g pm2
pm2 start .next/standalone/server.js --name "olms" -- -p 3000
pm2 save
pm2 startup
```

**Or using Node directly:**

```bash
NODE_ENV=production node .next/standalone/server.js
```

### Step 6: Configure Nginx (Optional)

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 7: SSL Certificate (Optional)

```bash
sudo certbot --nginx -d your-domain.com
```

---

## Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build for Production

```bash
npm run build
```

This will:
1. Generate Prisma client
2. Build the Next.js application
3. Copy necessary files to `.next/standalone/`

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Ornaments
- `GET /api/ornaments` - List ornaments
- `POST /api/ornaments` - Create ornament
- `GET /api/ornaments/[id]` - Get ornament
- `PUT /api/ornaments/[id]` - Update ornament
- `DELETE /api/ornaments/[id]` - Delete ornament

### Loans
- `GET /api/loans` - List loans
- `POST /api/loans` - Create loan
- `GET /api/loans/[id]` - Get loan
- `PUT /api/loans/[id]` - Update loan
- `DELETE /api/loans/[id]` - Delete loan

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings

---

## Troubleshooting

### Cannot Login
1. Ensure the database is initialized: `node prisma/seed.js`
2. Check database file permissions: `chmod 644 db/custom.db`
3. Verify the JWT_SECRET in `.env`

### Database Errors
1. Regenerate Prisma client: `npx prisma generate`
2. Re-push schema: `npx prisma db push`
3. Reseed database: `node prisma/seed.js`

### Build Errors
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Rebuild: `npm run build`

---

## License

MIT License - Feel free to use this project for personal or commercial purposes.

# Flat Manager

A comprehensive flat/society management system built with Next.js, Prisma, and PostgreSQL. This application helps manage residents, maintenance payments, and expenses with an interactive dashboard.

## Features

- **Dashboard** - Visual analytics with pie charts showing income vs expenses breakdown, remaining balance
- **Residents Management** - Add, edit, and manage owners/tenants with maintenance status tracking
- **Payments Tracking** - Record and track monthly maintenance payments with payment mode and paid date tracking
- **Expenses Management** - Categorize and track expenses (Watchman Salary, Water Bill, Maintenance, Others) with month-wise filtering and edit capabilities
- **Authentication** - Secure admin and user login system

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with bcrypt
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL database (or Neon, Supabase, etc.)
- Available port 3000

### Installation

1. Clone the repository and navigate to the project:

```bash
cd flat-manager
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create `.env.local` file with the following variables:

```env
# Admin credentials (change in production!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=FlatMgr@2025!Secure#Admin

# Database connection
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

4. Set up the database:

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Admin Access

Default admin credentials (change in production):

- **Username**: `admin`
- **Password**: `FlatMgr@2025!Secure#Admin`

**Important**: Update the `ADMIN_PASSWORD` in `.env.local` before deploying to production.

## Project Structure

```
flat-manager/
├── app/
│   ├── (dashboard)/          # Dashboard routes (protected)
│   │   ├── dashboard/        # Main dashboard with analytics
│   │   ├── residents/        # Resident management
│   │   ├── payments/         # Maintenance payments
│   │   ├── expenses/         # Expense tracking
│   │   └── owners/           # Owner-specific views
│   ├── api/                  # API routes
│   │   ├── expenses/[id]/
│   │   ├── payments/[id]/
│   │   └── residents/[id]/
│   ├── login/               # Login page
│   └── layout.tsx           # Root layout
├── components/
│   └── Sidebar.tsx          # Navigation sidebar
├── lib/
│   ├── actions.ts           # Server actions (CRUD operations)
│   ├── auth.ts              # Authentication helpers
│   └── prisma.ts            # Prisma client instance
├── prisma/
│   └── schema.prisma        # Database schema
├── .env.local               # Environment variables
└── README.md
```

## Database Schema

### Key Models

- **User** - Residents (owners/tenants) with authentication
- **Maintenance** - Monthly maintenance payment records
- **Expense** - Expense entries categorized by type

### Enums

- `Role` - `OWNER`, `TENANT`
- `UserRole` - `ADMIN`, `USER`
- `PaymentMode` - `UPI`, `CASH`, `SOCIETY_ACCOUNT`

## Dashboard Charts

The dashboard features three key metrics cards and two interactive pie charts (filterable by month):

### Stats Cards
- **Total Residents** - Count of all registered residents
- **Total Income** - Sum of all paid maintenance payments
- **Total Expenses** - Sum of all recorded expenses
- **Remaining Balance** - Income minus Expenses (green if positive, red if negative)
- **Paid Maintenance** - Count of paid maintenance records
- **Unpaid Maintenance** - Count of unpaid maintenance records

### Pie Charts
1. **Income vs Expenses Overview** - Compares total maintenance income against total expenses
2. **Expense Breakdown by Category** - Shows expense distribution across:
   - Watchman Salary
   - Water Bill
   - Maintenance
   - Others

Monthly filtering allows admins to view analytics for specific months or all-time data. When a month is selected, all metrics (including remaining balance) are calculated for that month only.

## Payments Management

Maintenance payments tracking with full CRUD operations:
- Record monthly maintenance for each flat with amount, month, and payment mode
- **Payment Modes**: UPI, Cash, Society Account
- **Paid Date** - Automatically set when marking a payment as paid (via toggle or payment mode selection)
- **Status Toggle** - Click to mark payments as Paid/Unpaid; paid date is set/cleared automatically
- Table displays: Flat Number, Month, Amount, Status, Payment Mode, Paid Date (with day, month, year), and Actions

Paid dates are shown in DD-MMM-YYYY format (e.g., 21-Apr-2026). All maintenance income contributes to dashboard income metrics and the remaining balance calculation.

## Expense Management

Expenses can be added/edited with:
- **Type**: Watchman Salary, Water Bill, Maintenance, Others
- **Amount**: Numeric value in INR
- **Month**: Selection from 12 months
- **Note**: Optional description (useful for Others category)

Expenses table displays: Date, Month, Title, Note, Amount, and Actions (Edit/Delete for admins). The note field is shown for additional context on expenses.

## Residents Management

Residents table displays:
- Flat Number, Name, Phone, Type (Owner/Tenant)
- **Maintenance Status**: Paid/Unpaid/No Records (based on monthly payment records)
- Color-coded badges for quick visibility

## Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Security Notes

- Admin credentials are hardcoded as fallback; use environment variables in production
- All admin actions require authentication and authorization checks
- bcrypt is used for password hashing
- HTTP-only cookies store session data
- CSRF protection via Next.js built-in mechanisms

## Future Enhancements

- Email notifications for pending maintenance
- PDF invoice generation
- Mobile-responsive PWA
- Multi-society support
- Advanced analytics and reports
- Dark mode toggle (currently auto-detected)

## License

This project is private and not licensed for public use.

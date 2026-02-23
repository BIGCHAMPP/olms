'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  LayoutDashboard,
  Users,
  Gem,
  FileText,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Shield,
  UserCheck,
  BarChart3,
  FileSpreadsheet,
  History,
  MessageSquare,
  Building2,
  KeyRound,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

type UserRole = 'ADMIN' | 'BRANCH_MANAGER' | 'LOAN_OFFICER';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'CLOSED' | 'DEFAULTED' | 'RENEWED';
type RiskZone = 'GREEN' | 'YELLOW' | 'RED';
type OrnamentStatus = 'AVAILABLE' | 'PLEDGED' | 'RELEASED' | 'SOLD';
type PaymentType = 'INTEREST' | 'PRINCIPAL' | 'BOTH' | 'PENALTY' | 'PARTIAL_RELEASE' | 'FULL_CLOSURE';
type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD';

interface User {
  id: string;
  username: string;
  email: string;
  name: string | null;
  role: UserRole;
  branchId?: string | null;
}

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  alternatePhone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  occupation?: string | null;
  annualIncome?: number | null;
  status: CustomerStatus;
  branch?: { name: string } | null;
  _count?: { loans: number; ornaments: number };
  createdAt: string;
  updatedAt: string;
}

interface Ornament {
  id: string;
  ornamentId: string;
  customerId: string;
  name: string;
  type: string;
  metalType: string;
  karat: number;
  grossWeight: number;
  netWeight: number;
  stoneWeight: number;
  description?: string | null;
  imagePaths?: string | null;
  valuationAmount: number;
  valuationDate?: string | null;
  status: OrnamentStatus;
  customer?: Customer;
  loan?: { id: string; loanReferenceNumber: string; status: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface Loan {
  id: string;
  loanReferenceNumber: string;
  customerId: string;
  branchId?: string | null;
  principalAmount: number;
  interestRate: number;
  interestType: string;
  tenureMonths?: number | null;
  disbursementDate: string;
  dueDate?: string | null;
  maturityDate?: string | null;
  status: LoanStatus;
  riskZone: RiskZone;
  totalOrnamentValue: number;
  loanToValueRatio: number;
  outstandingPrincipal: number;
  outstandingInterest: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  penaltyAmount: number;
  closedAt?: string | null;
  customer?: Customer;
  branch?: { name: string } | null;
  ornaments?: Ornament[];
  payments?: Payment[];
  notes?: Note[];
  _count?: { ornaments: number; payments: number };
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: string;
  paymentId: string;
  loanId: string;
  customerId?: string | null;
  receivedBy?: string | null;
  paymentType: PaymentType;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string | null;
  receiptNumber?: string | null;
  notes?: string | null;
  paymentDate: string;
  loan?: Loan;
  receivedByUser?: { name: string; username: string } | null;
  createdAt: string;
}

interface Note {
  id: string;
  loanId?: string | null;
  customerId?: string | null;
  userId: string;
  content: string;
  user?: { name: string; username: string };
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  _count?: { users: number; customers: number; loans: number };
}

interface MetalRate {
  id: string;
  metalType: string;
  karat: number;
  ratePerGram: number;
  rateDate: string;
  source?: string | null;
}

interface Settings {
  [key: string]: string;
}

interface AuditLog {
  id: string;
  userId?: string | null;
  user?: { name: string; username: string } | null;
  action: string;
  module: string;
  recordId?: string | null;
  oldValues?: string | null;
  newValues?: string | null;
  createdAt: string;
}

interface Notification {
  id: string;
  loanId?: string | null;
  customerId?: string | null;
  type: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  sentAt?: string | null;
  channel: string;
  createdAt: string;
}

interface DashboardStats {
  totalCustomers: number;
  totalLoans: number;
  activeLoans: number;
  totalOrnaments: number;
  totalPayments: number;
  overdueLoans: number;
  redZoneLoans: number;
  yellowZoneLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalInterestCollected: number;
}

// ============================================
// LOGIN PAGE COMPONENT
// ============================================

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Login failed');
      }
      
      toast.success('Login successful!');
      onLogin(result.user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">OLMS</CardTitle>
            <CardDescription className="text-slate-400">
              Ornament & Loan Management System
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-red-400 text-sm">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export default function OLMSDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ornaments, setOrnaments] = useState<Ornament[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [rates, setRates] = useState<MetalRate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected items for detail view
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedOrnament, setSelectedOrnament] = useState<Ornament | null>(null);

  // Dialog states
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [ornamentDialogOpen, setOrnamentDialogOpen] = useState(false);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Edit mode
  const [editingItem, setEditingItem] = useState<unknown>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Initialize system first
        await fetch('/api/init');
        
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch data based on active module
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      if (activeModule === 'dashboard') {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setDashboardStats(data.stats);
      } else if (activeModule === 'customers') {
        const res = await fetch(`/api/customers?search=${searchQuery}&page=${currentPage}`);
        const data = await res.json();
        setCustomers(data.customers);
        setTotalPages(data.pagination.pages);
      } else if (activeModule === 'ornaments') {
        const res = await fetch(`/api/ornaments?search=${searchQuery}&page=${currentPage}`);
        const data = await res.json();
        setOrnaments(data.ornaments);
        setTotalPages(data.pagination.pages);
      } else if (activeModule === 'loans') {
        const res = await fetch(`/api/loans?search=${searchQuery}&page=${currentPage}`);
        const data = await res.json();
        setLoans(data.loans);
        setTotalPages(data.pagination.pages);
      } else if (activeModule === 'payments') {
        const res = await fetch(`/api/payments?page=${currentPage}`);
        const data = await res.json();
        setPayments(data.payments);
        setTotalPages(data.pagination.pages);
      } else if (activeModule === 'rates') {
        const res = await fetch('/api/rates');
        const data = await res.json();
        setRates(data.rates);
      } else if (activeModule === 'users') {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data.users);
      } else if (activeModule === 'branches') {
        const res = await fetch('/api/branches');
        const data = await res.json();
        setBranches(data.branches);
      } else if (activeModule === 'settings') {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings(data.settings);
      } else if (activeModule === 'audit') {
        const res = await fetch('/api/audit');
        const data = await res.json();
        setAuditLogs(data.logs);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch data');
    }
  }, [user, activeModule, searchQuery, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  // Menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'ornaments', label: 'Ornaments', icon: Gem },
    { id: 'loans', label: 'Loans', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'rates', label: 'Gold/Silver Rates', icon: TrendingUp },
    { id: 'users', label: 'User Management', icon: UserCheck },
    { id: 'branches', label: 'Branches', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'import', label: 'Import Data', icon: Upload },
  ];

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Login page
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 lg:relative lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">OLMS</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-700",
                    activeModule === item.id && "bg-amber-500/10 text-amber-400 hover:text-amber-300"
                  )}
                  onClick={() => {
                    setActiveModule(item.id);
                    setMobileMenuOpen(false);
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </ScrollArea>

          {/* User info */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 bg-amber-500">
                <AvatarFallback className="bg-amber-500 text-white font-semibold">
                  {user.name?.[0] || user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name || user.username}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-400 hover:text-white"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-white capitalize">
                {menuItems.find(m => m.id === activeModule)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {['customers', 'ornaments', 'loans'].includes(activeModule) && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-64 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeModule === 'dashboard' && (
            <DashboardModule
              stats={dashboardStats}
              loans={loans}
              onRefresh={fetchData}
            />
          )}
          {activeModule === 'customers' && (
            <CustomerModule
              customers={customers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onRefresh={fetchData}
              branches={branches}
              onAdd={() => {
                setEditingItem(null);
                setCustomerDialogOpen(true);
              }}
              onEdit={(customer) => {
                setEditingItem(customer);
                setCustomerDialogOpen(true);
              }}
              onDelete={(customer) => {
                setDeleteTarget({ type: 'customer', id: customer.id, name: `${customer.firstName} ${customer.lastName}` });
                setDeleteDialogOpen(true);
              }}
              onView={(customer) => setSelectedCustomer(customer)}
            />
          )}
          {activeModule === 'ornaments' && (
            <OrnamentModule
              ornaments={ornaments}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onRefresh={fetchData}
              customers={customers}
              rates={rates}
              onAdd={() => {
                setEditingItem(null);
                setOrnamentDialogOpen(true);
              }}
              onEdit={(ornament) => {
                setEditingItem(ornament);
                setOrnamentDialogOpen(true);
              }}
              onDelete={(ornament) => {
                setDeleteTarget({ type: 'ornament', id: ornament.id, name: ornament.name });
                setDeleteDialogOpen(true);
              }}
            />
          )}
          {activeModule === 'loans' && (
            <LoanModule
              loans={loans}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onRefresh={fetchData}
              customers={customers}
              ornaments={ornaments}
              branches={branches}
              settings={settings}
              onAdd={() => {
                setEditingItem(null);
                setLoanDialogOpen(true);
              }}
              onView={(loan) => setSelectedLoan(loan)}
              onPayment={(loan) => {
                setSelectedLoan(loan);
                setPaymentDialogOpen(true);
              }}
            />
          )}
          {activeModule === 'payments' && (
            <PaymentModule
              payments={payments}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onRefresh={fetchData}
            />
          )}
          {activeModule === 'rates' && (
            <RateModule
              rates={rates}
              onRefresh={fetchData}
              onAdd={() => {
                setEditingItem(null);
                setRateDialogOpen(true);
              }}
            />
          )}
          {activeModule === 'users' && (
            <UserModule
              users={users}
              branches={branches}
              onRefresh={fetchData}
              onAdd={() => {
                setEditingItem(null);
                setUserDialogOpen(true);
              }}
              onEdit={(u) => {
                setEditingItem(u);
                setUserDialogOpen(true);
              }}
            />
          )}
          {activeModule === 'branches' && (
            <BranchModule
              branches={branches}
              onRefresh={fetchData}
              onAdd={() => {
                setEditingItem(null);
                setBranchDialogOpen(true);
              }}
            />
          )}
          {activeModule === 'settings' && (
            <SettingsModule
              settings={settings}
              onRefresh={fetchData}
            />
          )}
          {activeModule === 'audit' && (
            <AuditModule
              logs={auditLogs}
              onRefresh={fetchData}
            />
          )}
          {activeModule === 'import' && (
            <ImportModule
              onRefresh={fetchData}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 border-t border-slate-700 py-4 px-6 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-400">
            <p>© 2024 Ornament & Loan Management System. All rights reserved.</p>
            <p>Version 1.0.0</p>
          </div>
        </footer>
      </div>

      {/* Dialogs */}
      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        customer={editingItem as Customer}
        branches={branches}
        onSuccess={() => {
          setCustomerDialogOpen(false);
          fetchData();
        }}
      />
      <OrnamentDialog
        open={ornamentDialogOpen}
        onClose={() => setOrnamentDialogOpen(false)}
        ornament={editingItem as Ornament}
        customers={customers}
        rates={rates}
        onSuccess={() => {
          setOrnamentDialogOpen(false);
          fetchData();
        }}
      />
      <LoanDialog
        open={loanDialogOpen}
        onClose={() => setLoanDialogOpen(false)}
        customers={customers}
        ornaments={ornaments}
        branches={branches}
        settings={settings}
        onSuccess={() => {
          setLoanDialogOpen(false);
          fetchData();
        }}
      />
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        loan={selectedLoan}
        onSuccess={() => {
          setPaymentDialogOpen(false);
          fetchData();
        }}
      />
      <RateDialog
        open={rateDialogOpen}
        onClose={() => setRateDialogOpen(false)}
        onSuccess={() => {
          setRateDialogOpen(false);
          fetchData();
        }}
      />
      <UserDialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        user={editingItem as User}
        branches={branches}
        onSuccess={() => {
          setUserDialogOpen(false);
          fetchData();
        }}
      />
      <BranchDialog
        open={branchDialogOpen}
        onClose={() => setBranchDialogOpen(false)}
        onSuccess={() => {
          setBranchDialogOpen(false);
          fetchData();
        }}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        target={deleteTarget}
        onSuccess={() => {
          setDeleteDialogOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}

// ============================================
// DASHBOARD MODULE
// ============================================

function DashboardModule({ 
  stats, 
  loans,
  onRefresh 
}: { 
  stats: DashboardStats | null;
  loans: Loan[];
  onRefresh: () => void;
}) {
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; count: number; amount: number }>>([]);
  const [statusData, setStatusData] = useState<Array<{ status: string; count: number }>>([]);
  const [riskData, setRiskData] = useState<Array<{ riskZone: string; count: number }>>([]);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setMonthlyData(data.monthlyLoans || []);
        setStatusData(data.loansByStatus || []);
        setRiskData(data.loansByRiskZone || []);
        setRecentLoans(data.recentLoans || []);
        setRecentPayments(data.recentPayments || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6'];

  const statCards = [
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Active Loans', value: stats?.activeLoans || 0, icon: FileText, color: 'from-green-500 to-green-600' },
    { title: 'Total Disbursed', value: `₹${((stats?.totalDisbursed || 0) / 100000).toFixed(2)}L`, icon: DollarSign, color: 'from-amber-500 to-amber-600' },
    { title: 'Outstanding', value: `₹${((stats?.totalOutstanding || 0) / 100000).toFixed(2)}L`, icon: CreditCard, color: 'from-purple-500 to-purple-600' },
    { title: 'Overdue Loans', value: stats?.overdueLoans || 0, icon: AlertTriangle, color: 'from-red-500 to-red-600' },
    { title: 'Red Zone', value: stats?.redZoneLoans || 0, icon: AlertTriangle, color: 'from-red-600 to-red-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-gradient-to-br", stat.color)}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{stat.title}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Loans Chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Monthly Loan Disbursement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="amount" fill="#f59e0b" name="Amount (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Zone Distribution */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Risk Zone Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="riskZone"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskData.map((entry, index) => (
                      <Cell
                        key={entry.riskZone}
                        fill={entry.riskZone === 'GREEN' ? '#22c55e' : entry.riskZone === 'YELLOW' ? '#eab308' : '#ef4444'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-slate-400">Green</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-slate-400">Yellow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-slate-400">Red</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Loans */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {recentLoans.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No recent loans</p>
              ) : (
                <div className="space-y-3">
                  {recentLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{loan.loanReferenceNumber}</p>
                        <p className="text-sm text-slate-400">
                          {loan.customer?.firstName} {loan.customer?.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-amber-400">₹{loan.principalAmount.toLocaleString()}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            loan.riskZone === 'GREEN' && "border-green-500 text-green-500",
                            loan.riskZone === 'YELLOW' && "border-yellow-500 text-yellow-500",
                            loan.riskZone === 'RED' && "border-red-500 text-red-500"
                          )}
                        >
                          {loan.riskZone}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {recentPayments.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No recent payments</p>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{payment.paymentId}</p>
                        <p className="text-sm text-slate-400">
                          {payment.loan?.customer?.firstName} {payment.loan?.customer?.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-400">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{payment.paymentType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// CUSTOMER MODULE
// ============================================

function CustomerModule({
  customers,
  searchQuery,
  setSearchQuery,
  currentPage,
  totalPages,
  setCurrentPage,
  onRefresh,
  branches,
  onAdd,
  onEdit,
  onDelete,
  onView,
}: {
  customers: Customer[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (p: number) => void;
  onRefresh: () => void;
  branches: Branch[];
  onAdd: () => void;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
  onView: (c: Customer) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative sm:hidden">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Customers Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">ID</TableHead>
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Phone</TableHead>
                  <TableHead className="text-slate-400">City</TableHead>
                  <TableHead className="text-slate-400">Loans</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-mono text-amber-400">{customer.customerId}</TableCell>
                      <TableCell className="text-white">
                        {customer.firstName} {customer.lastName}
                      </TableCell>
                      <TableCell className="text-slate-300">{customer.phone}</TableCell>
                      <TableCell className="text-slate-300">{customer.city || '-'}</TableCell>
                      <TableCell className="text-slate-300">{customer._count?.loans || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            customer.status === 'ACTIVE' && "border-green-500 text-green-500",
                            customer.status === 'INACTIVE' && "border-slate-500 text-slate-500",
                            customer.status === 'BLACKLISTED' && "border-red-500 text-red-500"
                          )}
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem onClick={() => onView(customer)} className="text-slate-300 hover:text-white hover:bg-slate-700">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(customer)} className="text-slate-300 hover:text-white hover:bg-slate-700">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem onClick={() => onDelete(customer)} className="text-red-400 hover:text-red-300 hover:bg-slate-700">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-slate-700 text-slate-300"
          >
            Previous
          </Button>
          <span className="text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="border-slate-700 text-slate-300"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// ORNAMENT MODULE
// ============================================

function OrnamentModule({
  ornaments,
  searchQuery,
  setSearchQuery,
  currentPage,
  totalPages,
  setCurrentPage,
  onRefresh,
  customers,
  rates,
  onAdd,
  onEdit,
  onDelete,
}: {
  ornaments: Ornament[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (p: number) => void;
  onRefresh: () => void;
  customers: Customer[];
  rates: MetalRate[];
  onAdd: () => void;
  onEdit: (o: Ornament) => void;
  onDelete: (o: Ornament) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative sm:hidden">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search ornaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Ornament
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">ID</TableHead>
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Metal</TableHead>
                  <TableHead className="text-slate-400">Weight (g)</TableHead>
                  <TableHead className="text-slate-400">Value</TableHead>
                  <TableHead className="text-slate-400">Customer</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ornaments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                      No ornaments found
                    </TableCell>
                  </TableRow>
                ) : (
                  ornaments.map((ornament) => (
                    <TableRow key={ornament.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-mono text-amber-400">{ornament.ornamentId}</TableCell>
                      <TableCell className="text-white">{ornament.name}</TableCell>
                      <TableCell className="text-slate-300">{ornament.type}</TableCell>
                      <TableCell className="text-slate-300">{ornament.metalType} ({ornament.karat}K)</TableCell>
                      <TableCell className="text-slate-300">{ornament.netWeight.toFixed(2)}</TableCell>
                      <TableCell className="text-amber-400 font-medium">₹{ornament.valuationAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-300">
                        {ornament.customer?.firstName} {ornament.customer?.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            ornament.status === 'AVAILABLE' && "border-green-500 text-green-500",
                            ornament.status === 'PLEDGED' && "border-amber-500 text-amber-500",
                            ornament.status === 'RELEASED' && "border-blue-500 text-blue-500"
                          )}
                        >
                          {ornament.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem onClick={() => onEdit(ornament)} className="text-slate-300 hover:text-white hover:bg-slate-700">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem onClick={() => onDelete(ornament)} className="text-red-400 hover:text-red-300 hover:bg-slate-700">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-slate-700 text-slate-300"
          >
            Previous
          </Button>
          <span className="text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="border-slate-700 text-slate-300"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// LOAN MODULE
// ============================================

function LoanModule({
  loans,
  searchQuery,
  setSearchQuery,
  currentPage,
  totalPages,
  setCurrentPage,
  onRefresh,
  customers,
  ornaments,
  branches,
  settings,
  onAdd,
  onView,
  onPayment,
}: {
  loans: Loan[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (p: number) => void;
  onRefresh: () => void;
  customers: Customer[];
  ornaments: Ornament[];
  branches: Branch[];
  settings: Settings;
  onAdd: () => void;
  onView: (l: Loan) => void;
  onPayment: (l: Loan) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative sm:hidden">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search loans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>
        <Button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Loan
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">Ref Number</TableHead>
                  <TableHead className="text-slate-400">Customer</TableHead>
                  <TableHead className="text-slate-400">Principal</TableHead>
                  <TableHead className="text-slate-400">Outstanding</TableHead>
                  <TableHead className="text-slate-400">Interest Rate</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Risk</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      No loans found
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan) => (
                    <TableRow key={loan.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-mono text-amber-400">{loan.loanReferenceNumber}</TableCell>
                      <TableCell className="text-white">
                        {loan.customer?.firstName} {loan.customer?.lastName}
                      </TableCell>
                      <TableCell className="text-slate-300">₹{loan.principalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-amber-400 font-medium">₹{loan.outstandingPrincipal.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-300">{loan.interestRate}%</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            loan.status === 'ACTIVE' && "border-green-500 text-green-500",
                            loan.status === 'OVERDUE' && "border-amber-500 text-amber-500",
                            loan.status === 'CLOSED' && "border-slate-500 text-slate-500"
                          )}
                        >
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            loan.riskZone === 'GREEN' && "border-green-500 text-green-500 bg-green-500/10",
                            loan.riskZone === 'YELLOW' && "border-yellow-500 text-yellow-500 bg-yellow-500/10",
                            loan.riskZone === 'RED' && "border-red-500 text-red-500 bg-red-500/10"
                          )}
                        >
                          {loan.riskZone}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem onClick={() => onView(loan)} className="text-slate-300 hover:text-white hover:bg-slate-700">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onPayment(loan)} className="text-slate-300 hover:text-white hover:bg-slate-700">
                              <CreditCard className="w-4 h-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-slate-700 text-slate-300"
          >
            Previous
          </Button>
          <span className="text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="border-slate-700 text-slate-300"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// PAYMENT MODULE
// ============================================

function PaymentModule({
  payments,
  currentPage,
  totalPages,
  setCurrentPage,
  onRefresh,
}: {
  payments: Payment[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (p: number) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">Payment ID</TableHead>
                  <TableHead className="text-slate-400">Loan</TableHead>
                  <TableHead className="text-slate-400">Customer</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Method</TableHead>
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-mono text-amber-400">{payment.paymentId}</TableCell>
                      <TableCell className="text-slate-300">{payment.loan?.loanReferenceNumber}</TableCell>
                      <TableCell className="text-white">
                        {payment.loan?.customer?.firstName} {payment.loan?.customer?.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-500 text-slate-300">
                          {payment.paymentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-400 font-medium">₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-300">{payment.paymentMethod}</TableCell>
                      <TableCell className="text-slate-300">
                        {format(new Date(payment.paymentDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// RATE MODULE
// ============================================

function RateModule({
  rates,
  onRefresh,
  onAdd,
}: {
  rates: MetalRate[];
  onRefresh: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Rate
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">Metal</TableHead>
                  <TableHead className="text-slate-400">Karat</TableHead>
                  <TableHead className="text-slate-400">Rate (per gram)</TableHead>
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                      No rates found
                    </TableCell>
                  </TableRow>
                ) : (
                  rates.map((rate) => (
                    <TableRow key={rate.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white">{rate.metalType}</TableCell>
                      <TableCell className="text-slate-300">{rate.karat}K</TableCell>
                      <TableCell className="text-amber-400 font-medium">₹{rate.ratePerGram.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-300">
                        {format(new Date(rate.rateDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-500 text-slate-300">
                          {rate.source || 'MANUAL'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// USER MODULE
// ============================================

function UserModule({
  users,
  branches,
  onRefresh,
  onAdd,
  onEdit,
}: {
  users: User[];
  branches: Branch[];
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (u: User) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">Username</TableHead>
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white font-medium">{u.username}</TableCell>
                      <TableCell className="text-slate-300">{u.name || '-'}</TableCell>
                      <TableCell className="text-slate-300">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-amber-500 text-amber-400">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            u.status === 'ACTIVE' && "border-green-500 text-green-500",
                            u.status === 'INACTIVE' && "border-slate-500 text-slate-500"
                          )}
                        >
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(u)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// BRANCH MODULE
// ============================================

function BranchModule({
  branches,
  onRefresh,
  onAdd,
}: {
  branches: Branch[];
  onRefresh: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card key={branch.id} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                {branch.name}
                <Badge
                  variant="outline"
                  className={cn(
                    branch.status === 'ACTIVE' && "border-green-500 text-green-500"
                  )}
                >
                  {branch.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-slate-400 text-sm">{branch.address || 'No address'}</p>
              <p className="text-slate-400 text-sm">{branch.phone || 'No phone'}</p>
              <div className="flex gap-4 mt-4 text-sm">
                <div>
                  <span className="text-slate-400">Users:</span>
                  <span className="text-white ml-1">{branch._count?.users || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400">Customers:</span>
                  <span className="text-white ml-1">{branch._count?.customers || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400">Loans:</span>
                  <span className="text-white ml-1">{branch._count?.loans || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SETTINGS MODULE
// ============================================

function SettingsModule({
  settings,
  onRefresh,
}: {
  settings: Settings;
  onRefresh: () => void;
}) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localSettings),
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      
      toast.success('Settings saved successfully');
      onRefresh();
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const settingFields = [
    { key: 'default_interest_rate', label: 'Default Interest Rate (%)', type: 'number' },
    { key: 'loan_to_value_ratio', label: 'Max Loan to Value Ratio (%)', type: 'number' },
    { key: 'penalty_rate', label: 'Penalty Interest Rate (%)', type: 'number' },
    { key: 'yellow_zone_threshold', label: 'Yellow Zone LTV Threshold (%)', type: 'number' },
    { key: 'red_zone_threshold', label: 'Red Zone LTV Threshold (%)', type: 'number' },
    { key: 'overdue_days_red', label: 'Days Overdue for Red Zone', type: 'number' },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">System Settings</CardTitle>
          <CardDescription className="text-slate-400">
            Configure system-wide parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <Label className="text-slate-300">{field.label}</Label>
              <Input
                type={field.type}
                value={localSettings[field.key] || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, [field.key]: e.target.value })}
                className="w-32 bg-slate-700 border-slate-600 text-white"
              />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// ============================================
// AUDIT MODULE
// ============================================

function AuditModule({
  logs,
  onRefresh,
}: {
  logs: AuditLog[];
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">Timestamp</TableHead>
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">Action</TableHead>
                  <TableHead className="text-slate-400">Module</TableHead>
                  <TableHead className="text-slate-400">Record ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-slate-300">
                        {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-white">{log.user?.name || log.user?.username || 'System'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            log.action === 'CREATE' && "border-green-500 text-green-500",
                            log.action === 'UPDATE' && "border-blue-500 text-blue-500",
                            log.action === 'DELETE' && "border-red-500 text-red-500"
                          )}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{log.module}</TableCell>
                      <TableCell className="font-mono text-slate-400 text-xs">{log.recordId}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// IMPORT MODULE
// ============================================

function ImportModule({
  onRefresh,
}: {
  onRefresh: () => void;
}) {
  const [importType, setImportType] = useState('customers');
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('Please enter data to import');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      let records;
      try {
        records = JSON.parse(importData);
      } catch {
        toast.error('Invalid JSON format');
        setImporting(false);
        return;
      }

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: importType, records }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Import failed');

      setResult(data.results);
      toast.success(`Import completed: ${data.results.success} successful, ${data.results.failed} failed`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const sampleData = {
    customers: [
      { firstName: 'John', lastName: 'Doe', phone: '9876543210', email: 'john@example.com', city: 'Mumbai' }
    ],
    loans: [
      { customerId: 'CUS000001', principalAmount: 50000, interestRate: 12, tenureMonths: 12 }
    ]
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Import Data</CardTitle>
          <CardDescription className="text-slate-400">
            Import customers or loans from JSON data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Import Type</Label>
            <Select value={importType} onValueChange={setImportType}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="loans">Loans</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">JSON Data</Label>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder={`Enter JSON array of ${importType}...`}
              className="min-h-[200px] bg-slate-700 border-slate-600 text-white font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setImportData(JSON.stringify(sampleData[importType as keyof typeof sampleData], null, 2))}
              className="border-slate-600 text-slate-300"
            >
              Load Sample
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
              <h4 className="text-white font-medium mb-2">Import Results</h4>
              <div className="flex gap-4 mb-2">
                <span className="text-green-400">Success: {result.success}</span>
                <span className="text-red-400">Failed: {result.failed}</span>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-slate-400 text-sm mb-1">Errors:</p>
                  <ScrollArea className="h-[100px]">
                    {result.errors.map((error, i) => (
                      <p key={i} className="text-red-400 text-sm">{error}</p>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// DIALOG COMPONENTS
// ============================================

function CustomerDialog({
  open,
  onClose,
  customer,
  branches,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  branches: Branch[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: customer || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      occupation: '',
    }
  });

  useEffect(() => {
    if (customer) {
      reset(customer);
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        occupation: '',
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const url = customer ? `/api/customers/${customer.id}` : '/api/customers';
      const method = customer ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Operation failed');
      
      toast.success(customer ? 'Customer updated successfully' : 'Customer created successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter customer details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">First Name *</Label>
              <Input
                {...register('firstName', { required: true })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              {errors.firstName && <p className="text-red-400 text-sm">Required</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Last Name *</Label>
              <Input
                {...register('lastName', { required: true })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              {errors.lastName && <p className="text-red-400 text-sm">Required</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Phone *</Label>
              <Input
                {...register('phone', { required: true })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              {errors.phone && <p className="text-red-400 text-sm">Required</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Alternate Phone</Label>
              <Input
                {...register('alternatePhone')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Email</Label>
            <Input
              type="email"
              {...register('email')}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Address</Label>
            <Textarea
              {...register('address')}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">City</Label>
              <Input
                {...register('city')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">State</Label>
              <Input
                {...register('state')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Pincode</Label>
              <Input
                {...register('pincode')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Occupation</Label>
            <Input
              {...register('occupation')}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? 'Saving...' : 'Save Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrnamentDialog({
  open,
  onClose,
  ornament,
  customers,
  rates,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  ornament: Ornament | null;
  customers: Customer[];
  rates: MetalRate[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: ornament || {
      customerId: '',
      name: '',
      type: 'NECKLACE',
      metalType: 'GOLD',
      karat: '22',
      grossWeight: '',
      netWeight: '',
      stoneWeight: '0',
      description: '',
      valuationAmount: '',
    }
  });

  const metalType = watch('metalType');
  const karat = watch('karat');
  const netWeight = watch('netWeight');

  useEffect(() => {
    if (!ornament) {
      setValue('customerId', '');
      setValue('name', '');
      setValue('type', 'NECKLACE');
      setValue('metalType', 'GOLD');
      setValue('karat', '22');
      setValue('grossWeight', '');
      setValue('netWeight', '');
      setValue('stoneWeight', '0');
      setValue('description', '');
      setValue('valuationAmount', '');
    }
  }, [ornament, setValue]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const url = ornament ? `/api/ornaments/${ornament.id}` : '/api/ornaments';
      const method = ornament ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Operation failed');
      
      toast.success(ornament ? 'Ornament updated successfully' : 'Ornament created successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {ornament ? 'Edit Ornament' : 'Add New Ornament'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter ornament details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Customer *</Label>
            <Select {...register('customerId')} onValueChange={(v) => setValue('customerId', v)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.customerId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Name *</Label>
            <Input
              {...register('name', { required: true })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., Gold Necklace"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Type *</Label>
              <Select {...register('type')} onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="NECKLACE">Necklace</SelectItem>
                  <SelectItem value="BANGLE">Bangle</SelectItem>
                  <SelectItem value="RING">Ring</SelectItem>
                  <SelectItem value="EARRINGS">Earrings</SelectItem>
                  <SelectItem value="CHAIN">Chain</SelectItem>
                  <SelectItem value="PENDANT">Pendant</SelectItem>
                  <SelectItem value="BRACELET">Bracelet</SelectItem>
                  <SelectItem value="COIN">Coin</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Metal Type *</Label>
              <Select {...register('metalType')} onValueChange={(v) => setValue('metalType', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Karat</Label>
              <Select {...register('karat')} onValueChange={(v) => setValue('karat', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="24">24K</SelectItem>
                  <SelectItem value="22">22K</SelectItem>
                  <SelectItem value="18">18K</SelectItem>
                  <SelectItem value="14">14K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Gross Weight (g) *</Label>
              <Input
                type="number"
                step="0.01"
                {...register('grossWeight', { required: true })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Net Weight (g) *</Label>
              <Input
                type="number"
                step="0.01"
                {...register('netWeight', { required: true })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Stone Weight (g)</Label>
            <Input
              type="number"
              step="0.01"
              {...register('stoneWeight')}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Valuation Amount (₹)</Label>
            <Input
              type="number"
              {...register('valuationAmount')}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Auto-calculated if left empty"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Description</Label>
            <Textarea
              {...register('description')}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? 'Saving...' : 'Save Ornament'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LoanDialog({
  open,
  onClose,
  customers,
  ornaments,
  branches,
  settings,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  ornaments: Ornament[];
  branches: Branch[];
  settings: Settings;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedOrnaments, setSelectedOrnaments] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      customerId: '',
      principalAmount: '',
      interestRate: settings.default_interest_rate || '12',
      interestType: 'MONTHLY',
      tenureMonths: '12',
      branchId: '',
    }
  });

  const principalAmount = watch('principalAmount');

  // Get available ornaments for selected customer
  const availableOrnaments = ornaments.filter(
    (o) => o.customerId === selectedCustomer && o.status === 'AVAILABLE'
  );

  useEffect(() => {
    if (selectedCustomer) {
      setValue('customerId', selectedCustomer);
    }
  }, [selectedCustomer, setValue]);

  useEffect(() => {
    const selected = ornaments.filter((o) => selectedOrnaments.includes(o.id));
    const total = selected.reduce((sum, o) => sum + o.valuationAmount, 0);
    setTotalValue(total);
  }, [selectedOrnaments, ornaments]);

  const ltvRatio = totalValue > 0 ? ((parseFloat(principalAmount) || 0) / totalValue) * 100 : 0;

  const onSubmit = async (data: Record<string, unknown>) => {
    if (selectedOrnaments.length === 0) {
      toast.error('Please select at least one ornament');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ornamentIds: selectedOrnaments,
        }),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to create loan');
      
      toast.success('Loan created successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Loan</DialogTitle>
          <DialogDescription className="text-slate-400">
            Fill in loan details and select ornaments to pledge
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Customer *</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.customerId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Branch</Label>
              <Select {...register('branchId')} onValueChange={(v) => setValue('branchId', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCustomer && availableOrnaments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-300">Select Ornaments to Pledge</Label>
              <ScrollArea className="h-[200px] bg-slate-700/50 rounded-lg p-3">
                {availableOrnaments.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 p-2 hover:bg-slate-600/50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedOrnaments.includes(o.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrnaments([...selectedOrnaments, o.id]);
                        } else {
                          setSelectedOrnaments(selectedOrnaments.filter((id) => id !== o.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-500"
                    />
                    <div className="flex-1">
                      <p className="text-white">{o.name}</p>
                      <p className="text-slate-400 text-sm">
                        {o.metalType} {o.karat}K | {o.netWeight}g
                      </p>
                    </div>
                    <p className="text-amber-400 font-medium">₹{o.valuationAmount.toLocaleString()}</p>
                  </div>
                ))}
              </ScrollArea>
              {selectedOrnaments.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Ornament Value:</span>
                  <span className="text-amber-400 font-medium">₹{totalValue.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Principal Amount *</Label>
              <Input
                type="number"
                {...register('principalAmount', { required: true })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Interest Rate (%) *</Label>
              <Input
                type="number"
                step="0.1"
                {...register('interestRate', { required: true })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Interest Type</Label>
              <Select {...register('interestType')} onValueChange={(v) => setValue('interestType', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Tenure (Months)</Label>
              <Input
                type="number"
                {...register('tenureMonths')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          {totalValue > 0 && principalAmount && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Loan to Value Ratio:</span>
                <span className={cn(
                  "font-medium",
                  ltvRatio > 75 ? "text-red-400" : ltvRatio > 60 ? "text-yellow-400" : "text-green-400"
                )}>
                  {ltvRatio.toFixed(2)}%
                </span>
              </div>
              <Progress value={ltvRatio} className="h-2" />
              {ltvRatio > parseFloat(settings.loan_to_value_ratio || '75') && (
                <p className="text-red-400 text-sm mt-2">
                  LTV exceeds maximum allowed ({settings.loan_to_value_ratio}%)
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || ltvRatio > parseFloat(settings.loan_to_value_ratio || '75')} 
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading ? 'Creating...' : 'Create Loan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({
  open,
  onClose,
  loan,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      paymentType: 'INTEREST',
      amount: '',
      principalAmount: '0',
      interestAmount: '0',
      penaltyAmount: '0',
      paymentMethod: 'CASH',
      transactionId: '',
      notes: '',
    }
  });

  const paymentType = watch('paymentType');

  useEffect(() => {
    if (loan) {
      setValue('interestAmount', String(loan.outstandingInterest || 0));
    }
  }, [loan, setValue]);

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!loan) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          loanId: loan.id,
        }),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Payment failed');
      
      toast.success('Payment recorded successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Record Payment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Loan: {loan.loanReferenceNumber} | Outstanding: ₹{loan.outstandingPrincipal.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-slate-700/50 p-3 rounded-lg">
            <div>
              <p className="text-slate-400 text-sm">Principal Outstanding</p>
              <p className="text-white font-medium">₹{loan.outstandingPrincipal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Interest Outstanding</p>
              <p className="text-amber-400 font-medium">₹{loan.outstandingInterest.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Payment Type</Label>
              <Select {...register('paymentType')} onValueChange={(v) => setValue('paymentType', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="INTEREST">Interest Only</SelectItem>
                  <SelectItem value="PRINCIPAL">Principal Only</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                  <SelectItem value="FULL_CLOSURE">Full Closure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Payment Method</Label>
              <Select {...register('paymentMethod')} onValueChange={(v) => setValue('paymentMethod', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Total Amount *</Label>
            <Input
              type="number"
              {...register('amount', { required: true })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Principal Amount</Label>
              <Input
                type="number"
                {...register('principalAmount')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Interest Amount</Label>
              <Input
                type="number"
                {...register('interestAmount')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Notes</Label>
            <Textarea
              {...register('notes')}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? 'Processing...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RateDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      metalType: 'GOLD',
      karat: '22',
      ratePerGram: '',
    }
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to add rate');
      
      toast.success('Rate added successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add Metal Rate</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter today's metal rate
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Metal Type</Label>
              <Select {...register('metalType')} onValueChange={(v) => setValue('metalType', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Karat</Label>
              <Select {...register('karat')} onValueChange={(v) => setValue('karat', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="24">24K</SelectItem>
                  <SelectItem value="22">22K</SelectItem>
                  <SelectItem value="18">18K</SelectItem>
                  <SelectItem value="14">14K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Rate per Gram (₹) *</Label>
            <Input
              type="number"
              {...register('ratePerGram', { required: true })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? 'Saving...' : 'Add Rate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UserDialog({
  open,
  onClose,
  user,
  branches,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  user: User | null;
  branches: Branch[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      email: '',
      name: '',
      password: '',
      role: 'LOAN_OFFICER',
      branchId: '',
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        name: user.name || '',
        password: '',
        role: user.role,
        branchId: user.branchId || '',
      });
    } else {
      reset({
        username: '',
        email: '',
        name: '',
        password: '',
        role: 'LOAN_OFFICER',
        branchId: '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (!user && !data.password) {
        throw new Error('Password is required for new users');
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Operation failed');
      
      toast.success(user ? 'User updated successfully' : 'User created successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Username *</Label>
              <Input
                {...register('username', { required: true })}
                className="bg-slate-700 border-slate-600 text-white"
                disabled={!!user}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email *</Label>
              <Input
                type="email"
                {...register('email', { required: true })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Name</Label>
            <Input
              {...register('name')}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label className="text-slate-300">Password *</Label>
              <Input
                type="password"
                {...register('password')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Role</Label>
              <Select {...register('role')}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="BRANCH_MANAGER">Branch Manager</SelectItem>
                  <SelectItem value="LOAN_OFFICER">Loan Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Branch</Label>
              <Select {...register('branchId')}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? 'Saving...' : 'Save User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BranchDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
    }
  });

  useEffect(() => {
    reset({
      name: '',
      address: '',
      phone: '',
      email: '',
    });
  }, [reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Operation failed');
      
      toast.success('Branch created successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Branch Name *</Label>
            <Input
              {...register('name', { required: true })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Address</Label>
            <Textarea
              {...register('address')}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Phone</Label>
              <Input
                {...register('phone')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                {...register('email')}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? 'Saving...' : 'Add Branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  open,
  onClose,
  target,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  target: { type: string; id: string; name: string } | null;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!target) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/${target.type}s/${target.id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Delete failed');
      
      toast.success('Deleted successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-slate-800 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Confirm Delete</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Are you sure you want to delete "{target?.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-600 text-slate-300">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

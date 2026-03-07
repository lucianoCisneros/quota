import { Plus, TrendingUp, CreditCard, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 fade-in slide-in-from-bottom-4">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-foreground/60">Overview of your shared subscriptions and pending payments.</p>
        </div>
        <Link href="/subscriptions/new" className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-primary-500/20 hover:shadow-lg hover:-translate-y-0.5">
          <Plus size={20} />
          <span>New Subscription</span>
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-primary-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-600 dark:text-primary-400">
              <TrendingUp size={24} />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
              <ArrowUpRight size={14} /> +2.5%
            </span>
          </div>
          <p className="text-sm text-foreground/60 mb-1">Total Monthly Cost</p>
          <h3 className="text-3xl font-bold">$142.00</h3>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-sm text-foreground/60 mb-1">Active Subscriptions</p>
          <h3 className="text-3xl font-bold">8</h3>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400">
              <Users size={24} />
            </div>
          </div>
          <p className="text-sm text-foreground/60 mb-1">Pending from others</p>
          <h3 className="text-3xl font-bold">$45.50</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Active Subscriptions</h2>
        <button className="text-sm text-primary-600 hover:underline font-medium">View all</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Link href="/subscriptions/1" className="glass p-6 rounded-2xl flex items-center justify-between hover:bg-surface-hover/80 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center relative overflow-hidden">
              <CreditCard size={24} className="relative z-10" />
              <div className="absolute inset-0 bg-red-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg">Netflix Premium</h3>
              <p className="text-sm text-foreground/60">4 participants • Due Mar 25</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-orange-500">$7.99</p>
            <p className="text-xs text-foreground/50">Pending Collection</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

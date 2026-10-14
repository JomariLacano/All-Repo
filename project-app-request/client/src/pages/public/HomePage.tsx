import { Link } from 'react-router-dom';
import { FileEdit, ShieldCheck, ArrowRight, Clock, MessageSquareText } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Clock size={14} />
            Freelance Software Development
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Do you have a project in mind?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Submit your project requirements and contact information. I will review your request and
            contact you to discuss the details.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          <Card className="flex flex-col items-start gap-4 transition-shadow hover:shadow-lg">
            <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <FileEdit size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Submit a Request</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Tell me about your project — no account needed. I'll review it and get back to you.
              </p>
            </div>
            <Link
              to="/request"
              className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Submit a Request
              <ArrowRight size={16} />
            </Link>
          </Card>

          <Card className="flex flex-col items-start gap-4 transition-shadow hover:shadow-lg">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Login</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Already managing requests? Log in to review, update, and track project submissions.
              </p>
            </div>
            <Link
              to="/admin/login"
              className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200"
            >
              Admin Login
              <ArrowRight size={16} />
            </Link>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">How It Works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <FileEdit size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">1. Submit Details</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Fill out the project request form with your requirements and budget.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <MessageSquareText size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">2. Get Contacted</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                I review your request and reach out using your preferred contact method.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <ShieldCheck size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">3. Discuss & Start</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                We agree on the final scope and pricing before any work begins.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

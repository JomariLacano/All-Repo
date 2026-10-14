import { Link } from 'react-router-dom';
import {
  FileEdit,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MessageSquareText,
  SearchCheck,
  Code2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Code2 size={14} />
            Freelance Software Developer — Jomari Lacano
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Turn Your Idea Into a Working Solution
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Submit your project requirements to <strong className="font-semibold text-slate-800 dark:text-slate-100">Jomari Lacano</strong> and track the progress of your request.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Need a web application, documentation, bug fix, or additional feature? Submit your
            requirements and proposed budget. I will review your request and contact you to discuss
            the details.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col items-start gap-4 transition-shadow hover:shadow-lg">
            <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <FileEdit size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Submit a Project Request
              </h2>
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
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <SearchCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Track Your Request</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Already submitted a request? Check its status using your reference number and email.
              </p>
            </div>
            <Link
              to="/track-request"
              className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Track Your Request
              <ArrowRight size={16} />
            </Link>
          </Card>

          <Card className="flex flex-col items-start gap-4 transition-shadow hover:shadow-lg sm:col-span-2 lg:col-span-1">
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
      <section className="border-t border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">How It Works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                <SearchCheck size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">3. Track Progress</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Use your reference number and email anytime to check your request's status.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <Sparkles size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">4. Discuss & Start</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                We agree on the final scope and pricing together before any work begins.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

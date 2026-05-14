export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} ChapaWorks</div>
        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}

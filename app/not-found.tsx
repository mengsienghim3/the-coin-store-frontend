import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-2xl mb-4">
        404
      </div>
      <h1 className="text-2xl font-black text-white mb-2">Page Not Found</h1>
      <p className="text-xs text-slate-400 mb-6 max-w-sm">
        The page you requested could not be found or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-colors"
      >
        Back to Storefront
      </Link>
    </div>
  );
}

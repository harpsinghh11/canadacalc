export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-700">
          Built for Canadians 🍁 | No signup required | No data stored on our
          servers | Updated for 2025 tax year
        </p>
        <p className="mt-4 text-center text-sm text-slate-600">
          <strong>Disclaimer:</strong> The calculators on this site are for
          informational and educational purposes only. Results are estimates and
          should not be considered financial, tax, or legal advice. Always
          consult a qualified professional before making financial decisions.
        </p>
        <p className="mt-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} CanadaCalc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

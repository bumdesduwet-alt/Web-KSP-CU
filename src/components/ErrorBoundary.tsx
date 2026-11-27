import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Terjadi kesalahan pada aplikasi.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-xs font-semibold tracking-wider text-amber-700 uppercase mb-2">
              KSP CU Argomanunggal Santosa
            </p>
            <h1 className="font-serif text-2xl font-semibold text-slate-900 mb-3">
              Terjadi Gangguan Sistem
            </h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Mohon maaf, tampilan mengalami kendala saat memuat data. Silakan muat ulang halaman untuk melanjutkan.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

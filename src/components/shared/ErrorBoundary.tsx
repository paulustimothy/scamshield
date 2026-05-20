'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-6 text-center space-y-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <h2 className="text-lg font-semibold text-red-400">Terjadi Kesalahan Visualisasi</h2>
          <p className="text-sm text-muted-foreground">Komponen gagal merender data AI dengan benar.</p>
          <Button onClick={() => this.setState({ hasError: false })} variant="outline" className="border-border hover:bg-muted">
            Coba Lagi
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

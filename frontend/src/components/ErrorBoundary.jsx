import { Component } from 'react';
import { reportError } from '../lib/errorReporter';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    reportError({
      message: error?.message ?? 'Render error',
      stack: error?.stack ?? info?.componentStack,
      level: 'error',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page. Our team has been notified.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

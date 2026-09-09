import posthog from "posthog-js";
import * as React from "react";

interface Props {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    console.error(_error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    /*
    TODO: Add error reporting
    logErrorToMyService(
      error,
      info.componentStack,
      React.captureOwnerStack(),
    );
    */
    posthog?.captureException(error);
    void info;
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

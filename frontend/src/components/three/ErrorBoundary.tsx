import { Component, type ReactNode } from "react";

interface Props {
  fallback?: ReactNode;
  onError?(e: unknown): void;
  children?: ReactNode;
}

export default class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    this.props.onError?.(e);
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}

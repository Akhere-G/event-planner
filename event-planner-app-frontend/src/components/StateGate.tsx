import React from "react";
import LoadingState, { type LoadingStateProps } from "./LoadingState";
import ErrorState, { type ErrorStateProps } from "./ErrorState";
import EmptyState, { type EmptyStateProps } from "./EmptyState";

interface LoadingProps extends LoadingStateProps {
  customSkeleton?: React.ReactNode;
  isLoading?: boolean;
}

interface ErrorProps extends ErrorStateProps {
  isError?: boolean;
}
interface EmptyProps extends EmptyStateProps {
  isEmpty?: boolean;
}

interface Props {
  emptyStateProps?: EmptyProps;
  loadingStateProps?: LoadingProps;
  errorStateProps?: ErrorProps;
  children: React.ReactNode;
}
export default function StateGate({
  loadingStateProps,
  errorStateProps,
  emptyStateProps,
  children,
}: Props) {
  if (loadingStateProps?.isLoading) {
    if (loadingStateProps?.customSkeleton)
      return loadingStateProps?.customSkeleton;
    return <LoadingState message={loadingStateProps.message} />;
  } else if (errorStateProps?.isError) {
    return (
      <ErrorState
        message={errorStateProps?.message}
        showReload={errorStateProps?.showReload}
      />
    );
  } else if (emptyStateProps?.isEmpty) {
    return <EmptyState {...emptyStateProps} />;
  }
  return children;
}

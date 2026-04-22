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
  containerClasses?: string;
  emptyStateProps?: EmptyProps;
  loadingStateProps?: LoadingProps;
  errorStateProps?: ErrorProps;
  children: React.ReactNode;
}
export default function StateGate({
  containerClasses = "",
  loadingStateProps,
  errorStateProps,
  emptyStateProps,
  children,
}: Props) {
  let mainContent: React.ReactNode = <></>;

  if (loadingStateProps?.isLoading) {
    if (loadingStateProps?.customSkeleton) {
      mainContent = loadingStateProps?.customSkeleton;
    } else {
      mainContent = (
        <div className={containerClasses}>
          <LoadingState message={loadingStateProps.message} />
        </div>
      );
    }
  } else if (errorStateProps?.isError) {
    mainContent = (
      <div className={containerClasses}>
        <ErrorState
          message={errorStateProps?.message}
          showReload={errorStateProps?.showReload}
        />
      </div>
    );
  } else if (emptyStateProps?.isEmpty) {
    mainContent = (
      <div className={containerClasses}>
        <EmptyState {...emptyStateProps} />
      </div>
    );
  } else {
    mainContent = children;
  }

  return mainContent;
}

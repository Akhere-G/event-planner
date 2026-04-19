import React from "react";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

interface Props {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  children: React.ReactNode;
}
export default function StateGate({
  isLoading,
  isError,
  isEmpty,
  loadingText,
  errorText,
  emptyText,
  children,
}: Props) {
  if (isLoading) {
    return <LoadingState message={loadingText} />;
  } else if (isError) {
    return <ErrorState message={errorText} />;
  } else if (isEmpty) {
    return <EmptyState message={emptyText} />;
  }
  return children;
}

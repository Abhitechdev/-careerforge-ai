export const ErrorCatalog = {
  ATS_ANALYSIS_UNAVAILABLE: {
    title: "Analysis Temporarily Unavailable",
    message: "We couldn't process your resume right now. Please try again in a few moments.",
    recoveryAction: "Try Again"
  },
  JOB_SEARCH_FAILED: {
    title: "Unable to Load Jobs",
    message: "Unable to load job listings. Please refresh or try again later.",
    recoveryAction: "Refresh"
  },
  ADVISOR_UNAVAILABLE: {
    title: "Forge is Sleeping",
    message: "Forge is temporarily unavailable. Please try again in a few moments.",
    recoveryAction: "Reconnect"
  },
  RATE_LIMIT_EXCEEDED: {
    title: "Usage Limit Reached",
    message: "You've reached your request limit for this hour. Please try again later.",
    recoveryAction: "View Limits"
  },
  CIRCUIT_BREAKER_TRIPPED: {
    title: "Service Interruption",
    message: "Our AI systems are currently experiencing high load. We've temporarily paused requests to ensure stability.",
    recoveryAction: "Check Status"
  },
  SYSTEM_ERROR: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. We've logged the issue and are looking into it.",
    recoveryAction: "Go Home"
  },
  NETWORK_ERROR: {
    title: "Connection Lost",
    message: "Please check your internet connection and try again.",
    recoveryAction: "Retry Connection"
  }
};

export class AppError extends Error {
  public title: string;
  public recoveryAction: string;
  public code: keyof typeof ErrorCatalog;

  constructor(code: keyof typeof ErrorCatalog) {
    super(ErrorCatalog[code].message);
    this.name = 'AppError';
    this.title = ErrorCatalog[code].title;
    this.recoveryAction = ErrorCatalog[code].recoveryAction;
    this.code = code;
  }
}

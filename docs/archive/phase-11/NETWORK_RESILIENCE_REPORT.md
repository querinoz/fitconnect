# Network Resilience Report

RequestPolicy: retryable vs non-retryable, exponential backoff + jitter, GET dedupe window.
OkHttp timeouts unchanged; cancelAll on ApiClient.
Auth/TLS errors not retried.

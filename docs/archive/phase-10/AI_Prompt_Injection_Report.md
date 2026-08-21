# AI Prompt Injection Report

User-level injection → refused.
Untrusted community payload containing "Ignore previous instructions…" → classified, quarantined, not elevated to system authority.
System prompts centralized in `PromptCatalog` (versioned).
Tests cover both paths in `AiEngineTest`.

# Startup Performance Report

Cold start path now: Application.onCreate → DefaultAppContainer (light) → connectivity + lifecycle → splash.
Feature engines initialize on first navigation into Athlete/Coach OS.
Demo telemetry bootstrap default OFF.
StartupTracer marks: foundation_ready, shell_ready, then lazy *_ready.

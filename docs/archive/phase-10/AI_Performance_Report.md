# AI Performance Report

- AI work on coroutines / Default dispatcher via repositories & ViewModel scopes
- No main-thread provider calls from Compose (LaunchedEffect / scope.launch)
- Context candidate windows bounded; tools timeout 5s
- Streaming helper available (`AiStreamController`) without UI flicker contract
- Local grounded provider keeps demo latency low offline

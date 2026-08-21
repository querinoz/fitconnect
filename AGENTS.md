# FitConnect — Regras de Arquitetura (não negociáveis)

## 1. Conformidade Strava — regra crítica
O acordo de API da Strava em vigor (1 Jun 2026) proíbe:
- mostrar dados de um atleta a QUALQUER pessoa que não seja o próprio atleta;
- usar dados da API para treinar modelos de IA ou ML;
- criar funcionalidades que repliquem ou competam com a Strava.

O FitConnect TEM componente social entre utilizadores. Logo:
- Nenhuma sessão com `provider = 'STRAVA'` pode aparecer em feed, ranking,
  desafio, comparação, badge público, mapa partilhado ou perfil visto por
  terceiros. Sem exceções e sem flags de configuração.
- Isto é imposto na BASE DE DADOS (coluna gerada + RLS), não na UI.
  Uma verificação apenas no frontend é considerada bug de severidade máxima.
- Nenhum dataset de treino de modelos pode conter linhas de origem Strava.

## 2. Arquitetura de providers
- O núcleo de dados é o **Health Connect**. Não a Strava.
- Todo o acesso a dados de treino passa pela interface `FitnessProvider`.
- Nenhum ViewModel, Composable, caso de uso ou query conhece a existência
  da Strava. Conhecem `ProviderId` e `ProviderConstraints`.
- Adicionar um provider = adicionar um adaptador. Nunca tocar no domínio.

## 3. Segurança
- `client_secret` da Strava NUNCA no APK. Exchange e refresh só em edge function.
- Tokens só em `EncryptedSharedPreferences` com chave no Android Keystore.
- Nunca escrever segredos em logs, nem em mensagens de erro.

## 4. Limites de API
- Ler `X-RateLimit-*` e `X-ReadRateLimit-*` em todas as respostas Strava.
- Travar aos 85% de qualquer bucket. Nunca esperar pelo 429.
- Sincronização por webhook + FCM. Polling periódico é rede de segurança
  a 6h, nunca o mecanismo principal.

## 5. Endpoints proibidos
`/clubs/{id}/activities`, `/clubs/{id}/admins`, `/clubs/{id}/members`
(reformados 1 Set 2026), `/segments/explore` (Extended Access),
`/activities/{id}/kudos`, `/activities/{id}/comments` (dados de terceiros).
Qualquer resquício de **Google Fit** é para remover — fim de serviço no
final de 2026.

## 6. Design
- Antes de qualquer decisão visual, consultar a skill `ui-ux-pro-max` via
  `scripts/search.py`. Não inventar paletas, tipografia ou espaçamentos.
- Antes de usar qualquer API de biblioteca, consultar `context7`. A tua
  memória de Compose, Retrofit e Health Connect está desatualizada.
- Material 3 Expressive: navigation drawer, bottom app bar e navigation bar
  antiga estão DEPRECIADOS. Usar navigation rail, docked/floating toolbar e
  flexible navigation bar.
- **IA atleta (2026-08-20):** 4 destinos + acção primária — `Hoje · Análise ·
  Conquistas · Perfil`, com **Treinar** como FAB Menu (não como 5ª aba).
  Compacto: flexible/floating bar + FAB. ≥600dp: rail colapsada. ≥1240dp: rail
  expandida. Zero drawer. Social/squad vivem dentro de Hoje e Análise, não
  como aba de paridade. Paleta canónica `--eos-*` (`#070B14` / `#C8FF00`)
  mantém-se; OLED-dark + um acento saturado, não cyberpunk nem pastéis.

## 7. Processo
- Um PR por bloco. Nunca refatorar fora do âmbito pedido.
- Todo o código novo com teste. Mapeamentos DTO→domínio com teste de tabela.
- Se uma instrução colidir com este ficheiro, PARAR e perguntar.

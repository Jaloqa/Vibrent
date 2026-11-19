# CLAUDE.md

Vibrent: a web app for joining social events by swiping event cards; organizers accept or reject applicants. Monorepo with backend, frontend, API contract and end-to-end tests. Guidance for working in this repository.

The domain description (in Polish) is in [docs/articles/Vibrent-Opis-dziedziny-projektu.md](docs/articles/Vibrent-Opis-dziedziny-projektu.md). It is the source of truth for scope, business rules and the MVP boundary.

## Repository layout

```
.github/        # CI workflows, CODEOWNERS, PR template
backend/        # .NET API (see Architecture)
frontend/       # React web app
contracts/      # openapi.yaml: API contract shared by backend and frontend
e2e/            # Playwright end-to-end tests
docs/           # domain description, stack, diagrams, ADRs, test reports
docker-compose.yml
```

## Stack

The agreed stack is in [docs/STACK.md](docs/STACK.md). Do not introduce libraries outside it without asking. Items marked TBD and items under "Considered for later" need confirmation before use.

- .NET 10, C#, nullable reference types enabled
- ASP.NET Core Minimal APIs
- MediatR 12.5.0 (pinned, last Apache-2.0 release, do not upgrade) for commands, queries and pipeline behaviors
- PostgreSQL with EF Core (Npgsql) for data access and migrations
- FluentValidation
- OpenAPI contract in `contracts/openapi.yaml`, Swagger UI for exploration
- Users are the domain `User` entity; ASP.NET Core Identity is used only for `PasswordHasher`; JWT issued by the API; RBAC through authorization policies
- RustFS (S3 API) for avatars and event images
- Serilog for structured logging
- Testing: xUnit, Shouldly, Moq, Bogus, Testcontainers for PostgreSQL, Playwright for end-to-end, JUnit XML reports
- Docker images, whole system runs locally with Docker Compose
- Central package management (`Directory.Packages.props`), `Directory.Build.props` for shared settings

## Domain rules

These come from the domain description and must hold regardless of how a feature is implemented.

- Roles are `User` and `Admin`. Organizer is not a role: any user who owns an event is its organizer, so one account can be both participant and organizer.
- A swipe is either `like` or `dislike`. Only a `like` creates an application, with status `pending`.
- The pair (UserId, EventId) is unique for swipes and for applications. No double applications.
- An organizer cannot apply to their own event.
- Application statuses: `pending`, `accepted`, `rejected`, `withdrawn`. Both pending and accepted applications can be withdrawn; withdrawing an accepted one frees a seat.
- `AcceptedCount` never exceeds `Capacity`. Accepting when no seats are left is rejected. `Event` and `EventApplication` use PostgreSQL `xmin` as an optimistic concurrency token, so two concurrent accepts of the last seat cannot both succeed; the loser gets 409. A database CHECK constraint backs the rule up.
- Event statuses: active, finished, cancelled. Only `Active` and `Cancelled` are stored; finished is computed from `StartsAt`. Prefer cancelling over deleting; the database blocks deleting an event that has applications.
- The feed skips events the user already swiped, the user's own events and events with no free seats.
- The application (Polish: "zgłoszenie") entity is named `EventApplication` in code to avoid clashing with framework names. The table stays `Applications`.
- Entities guard their own invariants: state changes go through methods (`Event.RecordSwipe`, `EventApplication.Accept`, `Reject`, `Withdraw`, `Event.ChangeCapacity`, `Cancel`) that return a `Result`. Setters are private. Handlers load entities, call these methods and save; ownership checks (is this the organizer, is this the applicant) stay in handlers.

Features marked as extensions in the domain description (map, Super Like, notifications, chat, ratings, payments) are out of MVP scope. Do not build them unless asked.

## Backend architecture: Vertical Slice

Code is organised by feature, not by technical layer. Each use case is a slice that owns everything it needs.

```
backend/
  Vibrent.sln
  Directory.Build.props
  Directory.Packages.props
  Dockerfile
  src/
    Vibrent.Api/                 # host: HTTP, features, pipeline
      Program.cs
      Features/
        <Feature>/               # Auth, Users, Events, Feed, Swipes, Applications, Admin
          <UseCase>/
            <UseCase>Endpoint.cs
            <UseCase>Command.cs | <UseCase>Query.cs
            <UseCase>Handler.cs
            <UseCase>Validator.cs
            <UseCase>Response.cs
          <Feature>Endpoints.cs  # Map<Feature>Endpoints extension
      Middleware/                # exception handling, correlation id, request logging
      Behaviors/                 # Mediator pipeline: validation, logging, transaction
      Extensions/                # service and endpoint registration (AddX / MapX)
      Configuration/             # options classes and their validators
      Common/                    # shared API contracts: pagination, Result to ProblemDetails mapping
    Vibrent.Domain/              # entities, enums, errors, no dependencies
      Common/                    # Result, Error, ErrorType
      Users/ Categories/ Events/ Swipes/ Applications/
    Vibrent.Infrastructure/      # everything that talks to the outside world
      Persistence/
        AppDbContext.cs
        Configurations/          # IEntityTypeConfiguration<T>: unique indexes, check constraints
        Migrations/              # generated, excluded from analyzers
        AppDbContextDesignTimeFactory.cs
      Authentication/
      Storage/                   # RustFS client
      DependencyInjection.cs     # AddInfrastructure extension
  tests/
    Vibrent.Api.UnitTests/
    Vibrent.Api.IntegrationTests/
```

Dependencies flow one way: `Api` -> `Infrastructure` -> `Domain`. `Domain` references nothing. Business logic lives in handlers and domain entities, not in Infrastructure.

Rules:

- A slice must not reference another slice's internals. Share through `Common/` or through the domain entities only.
- No generic repositories and no service layer wrappers. Handlers use `AppDbContext` directly.
- Infrastructure holds technical concerns only (database, auth, storage). Add a folder there per external dependency.
- Do not extract shared abstractions until the same code appears in three slices.
- Endpoints are thin: map the request to a command or query, send it through `IMediator`, map the result to an HTTP response.
- Each feature exposes a `Map<Feature>Endpoints(this IEndpointRouteBuilder)` extension and is registered in `Program.cs`.
- Endpoint routes and payloads follow `contracts/openapi.yaml`. Change the contract first, agree it with the frontend, then implement.
- Validation runs in a Mediator pipeline behavior using FluentValidation, never inside handlers.
- Errors are returned as RFC 9457 `ProblemDetails`. Use a result type for expected failures (no free seats, duplicate application, forbidden action) and exceptions only for unexpected ones. Endpoints turn a failed `Result` into a response with `error.ToProblem()`, which sets the status from `ErrorType` and adds the error `code` (for example `Auth.EmailTaken`) for the frontend.
- Feature-specific errors live next to the feature (`Features/Auth/AuthErrors.cs`); errors shared between features live in the domain (`UserErrors`, `EventErrors`, `ApplicationErrors`).
- Queries use `AsNoTracking` and project to response DTOs with `Select`. Never expose entities from the API.
- Every query that returns a collection is paginated (offset by default, cursor-based for large or infinite lists such as the feed).
- Every endpoint declares its authorization policy explicitly: `.RequireAuthorization(AuthorizationPolicies.User)`, `.RequireAuthorization(AuthorizationPolicies.Admin)` or `.AllowAnonymous()`. The fallback policy requires an authenticated user, so a forgotten declaration fails closed.
- The signed-in user's id comes from the token: take `ClaimsPrincipal` in the endpoint, call `principal.GetUserId()` and pass it into the command. Never accept a user id from the request body for "me" operations.
- JWT settings live in the `Jwt` section (`Issuer`, `Audience`, `ExpiryMinutes` in `appsettings.json`; `SigningKey` from user secrets locally and `JWT_SIGNING_KEY` in Docker Compose). Options are validated on startup. There is no refresh token; signing out means the client drops the token.
- Pass `CancellationToken` through every async call.
- Database changes go through EF Core migrations. Never edit an applied migration. Seed data (categories) lives in `HasData` in the entity configuration.
- Migrations are applied on startup when `Database:MigrateOnStartup` is `true` (set in Docker Compose and integration tests).
- Entities get their timestamps from the `now` argument passed by the handler (use `TimeProvider`), not from `DateTime.UtcNow` inside the domain.

## Frontend

- React, shared by the whole frontend team. Details (build tool, TypeScript) are TBD in [docs/STACK.md](docs/STACK.md).
- Organised by feature (auth, profile, feed, events, applications, organizer, admin), mirroring the backend features.
- API types come from `contracts/openapi.yaml`. Do not hand-write request or response types that the contract already defines.
- Mobile-first and responsive. Swipe gestures always have a button alternative for accessibility.
- Show clear messages for API errors: no free seats, invalid data, connection problems.

## Code style

- All code, identifiers, commit messages and comments are in English. Documentation in `docs/` may be in Polish.
- Do not write comments. Add one only for a genuinely non-obvious or controversial decision, and explain why, not what.
- Prefer clear naming over explanation.
- File-scoped namespaces, primary constructors where they fit, records for commands, queries and responses.
- `sealed` by default for classes.
- Async methods are suffixed with `Async` only when a synchronous counterpart exists.
- Respect `.editorconfig`. Build must pass with warnings as errors.

## Git workflow

- `main` is the only long-lived branch and always builds. Work happens in `feature/*` and `bugfix/*` branches.
- Everything reaches `main` through pull requests with at least one code review.
- Always rebase. Pull requests are merged with rebase merge only (no merge commits, no squash), so `main` keeps a linear history.
- Keep a feature branch up to date by rebasing it onto `main` (`git rebase origin/main`), never by merging `main` into it. Push a rebased feature branch with `git push --force-with-lease`. Never force-push `main`.
- Keep pull requests small and focused on one feature or fix.
- Before opening a pull request, make every commit meaningful: no empty, "fix typo" or "wip" commits.
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`.
- Never mention Claude, AI or any assistant in commit messages, PR titles or descriptions, code comments, or any other artifact. No `Co-Authored-By` trailers, no "Generated with" lines.

## Commands

```
cp .env.example .env
docker compose up -d --build

cd backend
dotnet tool restore
dotnet build
dotnet test --logger junit
dotnet run --project src/Vibrent.Api
dotnet ef migrations add <Name> --project src/Vibrent.Infrastructure --startup-project src/Vibrent.Api --output-dir Persistence/Migrations
dotnet ef database update --project src/Vibrent.Infrastructure --startup-project src/Vibrent.Api
```

Frontend and e2e commands will be added once their tooling is set up.

## Testing

- Domain rules are unit-tested in `Vibrent.Api.UnitTests/Domain`; database constraints and concurrency in `Vibrent.Api.IntegrationTests/Persistence`.
- Endpoint tests live in `Vibrent.Api.IntegrationTests/Features/<Feature>` and call the API over HTTP. Use the helpers in `ApiClientExtensions` (`RegisterAndGetTokenAsync`, `Authorize`, `ReadProblemCodeAsync`) and assert on the error `code`, not only the status.
- Integration test classes share one PostgreSQL container through `[Collection(ApiFixtureDefinition.Name)]`. Create fresh data per test instead of relying on database state.
- Unit-test validators and non-trivial handler logic. Mock dependencies with Moq, build test data with Bogus, assert with Shouldly.
- Integration-test each endpoint against a real PostgreSQL started by Testcontainers, using `WebApplicationFactory`. Do not use the EF in-memory provider.
- Every domain rule above has at least one test, including concurrent accepts against the last free seat.
- End-to-end tests in `e2e/` cover the main flow: register, create event, swipe, accept, withdraw.
- Test names describe behaviour: `Should_ReturnConflict_When_EventHasNoFreeSeats`.

## Configuration and secrets

- Configuration through `appsettings.json`, environment variables and the Options pattern with validation on start.
- Never commit secrets. Use user secrets locally and environment variables in deployed environments. `.env.example` lists every variable without real values.

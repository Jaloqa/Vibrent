# Technology stack

Agreed stack for Vibrent (frontend, backend, infrastructure), aligned with the project domain description in `docs/articles/Vibrent-Opis-dziedziny-projektu.md`. Items marked TBD are not final yet.

## Infrastructure

| Technology | Purpose |
|---|---|
| Docker | Container images and isolated environments |
| Docker Compose | Running the whole system locally: API + database + object storage + frontend |
| RustFS | S3-compatible object storage written in Rust (MinIO alternative), used for avatars and event images |
| GitHub Actions (TBD) | CI: build and tests on every pull request |
| PostGIS (TBD) | Geospatial queries for the radius-based event feed, if plain lat/lng filtering is not enough |

## Frontend

| Technology | Purpose |
|---|---|
| React | Web frontend framework shared by the whole team |
| REST API client | Communication with the backend, JWT attached to requests, API error handling |
| Responsive, mobile-first UI | Works on phones and desktop; swipe gestures with button fallback for accessibility |
| Vite (TBD) | Build tool and dev server |
| TypeScript (TBD) | Static typing, types generated from the OpenAPI contract |
| Leaflet + OpenStreetMap (TBD) | Interactive event map (extension, stage 7) |

## Backend

| Technology | Purpose |
|---|---|
| .NET 10 | Runtime (LTS), Linux containers |
| Minimal APIs | HTTP endpoints without controllers, fits Vertical Slice |
| Vertical Slice | Each feature (`Auth`, `Users`, `Events`, `Feed`, `Swipes`, `Applications`, `Admin`) owns endpoint, handler, model and validation |
| MediatR 12.5.0 | Mediator pattern, CQRS, pipeline behaviors (last Apache-2.0 release, do not upgrade) |
| PostgreSQL | Relational database |
| EF Core + Npgsql | ORM for CRUD and schema migrations |
| Database transactions | Consistency of `AcceptedCount` vs `Capacity` when accepting or withdrawing applications concurrently |
| ASP.NET Core Identity + JWT | Email + password authentication, password hashing, JWT tokens |
| RBAC | Role-based access control: User, Organizer, Admin (one account can be both participant and organizer) |
| FluentValidation | Server-side validation rules in separate classes, run in a MediatR pipeline behavior |
| Pagination | Offset or cursor-based pagination for list endpoints |
| Serilog | Structured logging |
| OpenAPI contract | Shared API specification agreed before implementation (`contracts/openapi.yaml`) |
| Swagger UI | API documentation and exploration served by the API |
| ENV | Configuration through `appsettings` and environment variables, secrets outside the code |

## Testing

| Technology | Purpose |
|---|---|
| xUnit | Unit and integration tests for .NET |
| Testcontainers | Real PostgreSQL (and RustFS) in Docker for integration tests |
| Moq | Mocks in .NET tests |
| Bogus | Realistic fake test data |
| Shouldly | Assertions (free FluentAssertions alternative) |
| Playwright | End-to-end UI tests, cross-browser, responsiveness checks |
| JUnit XML | Test report format for CI |

## Considered for later (not in MVP)

| Technology | When it would make sense |
|---|---|
| Redis | Caching the event feed if performance requires it |
| Dapper | Complex read queries (e.g. the feed) if EF Core is not sufficient |
| Polly / `Microsoft.Extensions.Http.Resilience` | Resilience for outgoing HTTP once external services are added (maps, notifications) |
| Elastic APM | Distributed tracing and metrics if the system grows beyond a single API |
| API versioning (`Asp.Versioning`) | Parallel API versions once there are external clients (e.g. a mobile app) |

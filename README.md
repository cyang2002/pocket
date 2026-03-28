# Card Optimizer

A credit card earn rate comparison tool. Browse all cards, filter by issuer or network, view earn rates by spending category, and compare cards side-by-side to find which card maximizes rewards for each purchase.

## Stack

- **Backend:** Java 21 + Spring Boot 3.2 + SQLite (WAL mode) + Spring Data JDBC + Flyway
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + React Query + React Router

## Prerequisites

- Java 21+ (OpenJDK recommended)
- Maven 3.9+
- Node.js 18+ or [Bun](https://bun.sh)

**macOS (Homebrew):**
```bash
brew install openjdk maven
export JAVA_HOME=$(brew --prefix openjdk)/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$(brew --prefix maven)/bin:$PATH"
```

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd pocket
```

### 2. Configure the backend

The API reads its SQLite database path from the `DB_PATH` environment variable. Set this to point to your populated `cardoptimizer.db` file:

```bash
export DB_PATH=/path/to/your/data/cardoptimizer.db
```

If `DB_PATH` is not set, the API defaults to `./data/cardoptimizer.db` relative to the project root.

### 3. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` if your API runs on a different host or port:

```
VITE_API_BASE_URL=http://localhost:8080
```

## Running

### Backend API (port 8080)

```bash
mvn spring-boot:run
```

### Frontend (port 5173)

```bash
cd frontend
bun install   # or: npm install
bun run dev   # or: npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Tests

```bash
# Java tests
mvn test

# Java integration tests (requires running DB)
mvn test -Dgroups=integration
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cards` | All cards (filters: `issuer`, `isBusiness`, `discontinued`) |
| GET | `/api/cards/{cardId}` | Single card by ID |
| GET | `/api/cards/issuers` | Distinct issuers sorted alphabetically |
| GET | `/api/cards/summary` | Lightweight list (name, issuer, fee, signup bonus) |
| GET | `/api/cards/grid` | Cards joined with earn rates (filters: `issuer`, `isBusiness`, `network`, `maxFee`, `hasEarnRates`) |
| GET | `/api/cards/compare` | Subset of cards for comparison (`ids` param, comma-separated) |
| GET | `/api/cards/{cardId}/earn-rates` | Earn rates for a specific card |
| GET | `/api/categories` | 12 canonical spending category names |

## Configuration

Backend configuration is in `src/main/resources/application.yml`. Key settings:

| Property | Env override | Default | Description |
|----------|-------------|---------|-------------|
| `spring.datasource.url` | `DB_PATH` | `./data/cardoptimizer.db` | SQLite database path |
| `cardapi.cors.allowed-origins` | — | `localhost:3000,localhost:5173` | Allowed CORS origins |
| `cardapi.staleness.threshold-days` | — | `30` | Days before earn rate data is considered stale |
| `cardapi.cache.refresh-ms` | — | `3600000` | Card data cache TTL (ms) |

## Spending Categories

12 locked canonical categories: `business`, `dining`, `drugstore`, `entertainment`, `gas`, `groceries`, `home_improvement`, `online_shopping`, `other`, `streaming`, `transit`, `travel`

# TAF Payroll System

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A comprehensive payroll management system built with <a href="http://nodejs.org" target="_blank">Node.js</a> and <a href="https://nestjs.com" target="_blank">NestJS</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="LICENSE" target="_blank"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D22.x-brightgreen.svg" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/typescript-5.7+-blue.svg" alt="TypeScript Version" />
</p>

## 📋 Table of Contents

- [Description](#description)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Development](#development)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

## Description

TAF Payroll System is a robust, scalable payroll management application designed to handle employee payroll processing, tax calculations, and financial reporting. Built following Domain-Driven Design (DDD) principles with a clean architecture pattern.

## Architecture

The project follows a **Clean Architecture** pattern with **Domain-Driven Design (DDD)** principles:

```
src/
├── domain/          # Domain layer (entities, repositories interfaces)
├── application/      # Application layer (use cases, services)
├── infrastructure/  # Infrastructure layer (database, external services)
├── presentation/    # Presentation layer (controllers, DTOs, filters, interceptors)
└── shared/          # Shared utilities (constants, types, messages)
```

### Key Features

- ✅ **Base Entity** with UUID, timestamps, and soft delete
- ✅ **Base Repository** with common CRUD operations
- ✅ **Sequelize ORM** with PostgreSQL
- ✅ **Global Exception Handling** with consistent error responses
- ✅ **Response Interceptors** for uniform API responses
- ✅ **Request/Response DTOs** with validation
- ✅ **API Versioning**
- ✅ **Swagger Documentation**
- ✅ **Type-safe** with TypeScript
- ✅ **Git Hooks** with Husky for code quality
- ✅ **SonarQube** integration for code analysis

## Tech Stack

- **Framework:** NestJS 11.x
- **Language:** TypeScript 5.7+
- **Database:** PostgreSQL 18
- **ORM:** Sequelize with Sequelize-TypeScript
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger/OpenAPI
- **Code Quality:** ESLint, Prettier, Husky
- **Testing:** Jest
- **Containerization:** Docker & Docker Compose
- **Secrets Management:** HashiCorp Vault
- **Code Analysis:** SonarQube

## Prerequisites

- Node.js 22.x or higher
- Yarn package manager
- Docker & Docker Compose (for local development)
- PostgreSQL 18+ (if not using Docker)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd taf-payroll

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env.local
```

## Configuration

Create a `.env.local` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=taf_payroll
DB_SYNCHRONIZE=false
DB_LOGGING=true
DB_SSL=false

# CORS
CORS_ORIGIN=http://localhost:3000

# Vault
VAULT_PORT=8200
VAULT_ROOT_TOKEN=myroot

# SonarQube
SONAR_PORT=9000
SONAR_DB_USER=sonar
SONAR_DB_PASSWORD=sonar
SONAR_DB_NAME=sonar
```

## Running the Application

### Using Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Vault, SonarQube, Cloudflare Tunnel)
docker-compose up -d

# Start only database
docker-compose up -d postgres

# View logs
docker-compose logs -f app
```

### Local Development

```bash
# Development mode with hot-reload
yarn start:dev

# Production mode
yarn build
yarn start:prod

# Debug mode
yarn start:debug
```

The application will be available at `http://localhost:3000`

## Development

### Available Scripts

```bash
# Build
yarn build

# Code formatting
yarn format                    # Format code
yarn format:check             # Check formatting
yarn format:check:ci          # CI formatting check

# Linting
yarn lint                     # Lint and fix
yarn lint:check               # Lint only

# Type checking
yarn type-check               # TypeScript type checking

# Testing
yarn test                     # Unit tests
yarn test:watch               # Watch mode
yarn test:cov                 # Coverage report
yarn test:e2e                 # E2E tests

# SonarQube
yarn sonar                    # Run SonarQube scanner
```

### Git Hooks

The project uses **Husky** for Git hooks:

- **Pre-commit:** Runs linting and formatting checks
- **Pre-push:** Runs type checking, linting, and formatting checks

These hooks ensure code quality before commits and pushes.

## Testing

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov

# E2E tests
yarn test:e2e

# Debug tests
yarn test:debug
```

## Code Quality

### Pre-commit Checks

Before each commit, the following checks run automatically:
- ESLint validation
- Prettier formatting check

### Pre-push Checks

Before each push, the following checks run automatically:
- TypeScript type checking
- ESLint validation
- Prettier formatting check

### SonarQube

The project includes SonarQube for continuous code quality analysis:

1. **Start SonarQube:**
```bash
docker-compose up -d sonarqube cloudflared
```

2. **Access SonarQube UI:**
   - Local: http://localhost:9000
   - Default credentials: `admin/admin`

3. **Run analysis:**
```bash
yarn sonar
```

For detailed SonarQube setup, see [docs/SONARQUBE_TUNNEL.md](docs/SONARQUBE_TUNNEL.md)

## Docker Setup

### Services

The `docker-compose.yml` includes:

- **postgres:** PostgreSQL database
- **app:** Application container (production)
- **vault:** HashiCorp Vault for secrets management
- **sonarqube-db:** PostgreSQL database for SonarQube
- **sonarqube:** SonarQube server
- **cloudflared:** Cloudflare Tunnel for exposing SonarQube

### Quick Start

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres sonarqube

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Remove volumes (clean slate)
docker-compose down -v
```

## API Documentation

### Swagger UI

When running in development mode, Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

### API Structure

All API endpoints follow this structure:

```
/api/v1/{resource}
```

### Response Format

All API responses follow a consistent format:

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    // Response data
  }
}
```

### Error Format

Error responses follow the same structure:

```json
{
  "status": 400,
  "message": "Error message",
  "data": null
}
```

## Project Structure

```
taf-payroll/
├── src/
│   ├── domain/                 # Domain layer
│   │   ├── entities/          # Domain entities
│   │   │   └── base.entity.ts # Base entity with UUID, timestamps
│   │   └── repositories/      # Repository interfaces
│   │       └── base.repository.interface.ts
│   ├── application/           # Application layer (use cases)
│   ├── infrastructure/        # Infrastructure layer
│   │   ├── database/         # Database configuration
│   │   │   ├── database.config.ts
│   │   │   └── database.module.ts
│   │   └── repositories/     # Repository implementations
│   │       └── base.repository.ts
│   ├── presentation/          # Presentation layer
│   │   ├── dtos/             # Data Transfer Objects
│   │   │   ├── base-request.dto.ts
│   │   │   └── base-response.dto.ts
│   │   ├── filters/          # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/     # Response interceptors
│   │       └── transform.interceptor.ts
│   ├── shared/               # Shared utilities
│   │   ├── constants/       # Application constants
│   │   ├── messages/        # Message constants
│   │   └── types/           # Type definitions
│   ├── app.module.ts        # Root module
│   └── main.ts             # Application entry point
├── test/                    # Test files
├── docs/                   # Documentation
├── docker-compose.yml      # Docker services
├── Dockerfile              # Application container
├── sonar-project.properties # SonarQube configuration
└── package.json
```

## Key Components

### Base Entity

All domain entities extend `BaseEntity` which provides:
- UUID primary key
- `createdAt`, `updatedAt` timestamps
- Soft delete with `deletedAt`

### Base Repository

All repositories extend `BaseRepository` which provides:
- `findAll(options)` - Find all records
- `findById(id, options)` - Find by ID
- `findOne(options)` - Find one record
- `create(data, transaction)` - Create new record
- `update(id, data, transaction)` - Update record
- `delete(id, transaction)` - Hard delete
- `softDelete(id, transaction)` - Soft delete
- `count(options)` - Count records
- `exists(id)` - Check existence

### Global Exception Filter

Automatically handles all exceptions and returns consistent error responses.

### Response Interceptor

Automatically wraps all successful responses in the standard format.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure all tests pass (`yarn test`)
5. Ensure code quality checks pass (pre-commit/pre-push hooks)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all linting and type checks pass

## License

This project is open source and available under the [MIT License](LICENSE).

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Sequelize Documentation](https://sequelize.org)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

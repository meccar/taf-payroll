COMPOSE_BIN ?= docker compose

DEV_FILES := -f docker-compose.yml -f docker-compose.dev.yml
STG_FILES := -f docker-compose.yml -f docker-compose.stg.yml
PROD_FILES := -f docker-compose.yml -f docker-compose.prod.yml

.PHONY: help \
	dev-up dev-down dev-restart dev-logs \
	stg-up stg-down stg-restart stg-logs \
	prod-up prod-down prod-restart prod-logs \
	migrate-up migrate-down \
	clean

help:
	@echo "Available targets:"
	@echo "  dev-up       - Build and start the dev stack (with hot reload)"
	@echo "  dev-down     - Stop the dev stack"
	@echo "  dev-restart  - Restart the dev stack"
	@echo "  dev-logs     - Tail logs for the dev stack"
	@echo "  stg-up       - Build and start the staging stack"
	@echo "  stg-down     - Stop the staging stack"
	@echo "  stg-restart  - Restart the staging stack"
	@echo "  stg-logs     - Tail logs for the staging stack"
	@echo "  prod-up      - Build and start the production stack"
	@echo "  prod-down    - Stop the production stack"
	@echo "  prod-restart - Restart the production stack"
	@echo "  prod-logs    - Tail logs for the production stack"
	@echo "  migrate-up   - Run pending database migrations"
	@echo "  migrate-down - Rollback the last database migration"
	@echo "  clean        - Stop all stacks and remove dangling containers/volumes"

dev-up:
	$(COMPOSE_BIN) $(DEV_FILES) up

dev-down:
	$(COMPOSE_BIN) $(DEV_FILES) down

dev-restart: dev-down dev-up

dev-logs:
	$(COMPOSE_BIN) $(DEV_FILES) logs -f

stg-up:
	$(COMPOSE_BIN) $(STG_FILES) up --build

stg-down:
	$(COMPOSE_BIN) $(STG_FILES) down

stg-restart: stg-down stg-up

stg-logs:
	$(COMPOSE_BIN) $(STG_FILES) logs -f

prod-up:
	$(COMPOSE_BIN) $(PROD_FILES) up --build

prod-down:
	$(COMPOSE_BIN) $(PROD_FILES) down

prod-restart: prod-down prod-up

prod-logs:
	$(COMPOSE_BIN) $(PROD_FILES) logs -f

migrate-up:
	$(COMPOSE_BIN) $(DEV_FILES) run --rm app yarn migration:up

migrate-down:
	$(COMPOSE_BIN) $(DEV_FILES) run --rm app yarn migration:down

clean:
	$(COMPOSE_BIN) $(DEV_FILES) down -v --remove-orphans || true
	$(COMPOSE_BIN) $(STG_FILES) down -v --remove-orphans || true
	$(COMPOSE_BIN) $(PROD_FILES) down -v --remove-orphans || true

lint:
	yarn lint && yarn format && yarn build


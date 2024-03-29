FE_DIR=ui
BE_ENTRYPOINT=cmd/server/main.go
AIR_BIN=./bin/air
BIN=./bin/cryp


build: build-fe build-be ## build everything

install: install-be install-fe install-bins ## install deps for both backend and frontend

dev: ## run dev servers of both backend and frontend
	make -j 2 dev-fe dev-be

install-bins: ## install CLI bins air and golang-migrate
	curl -sSfL https://raw.githubusercontent.com/cosmtrek/air/master/install.sh | sh -s
	brew install golang-migrate


install-be: ## install backend dependencies
	go mod tidy

build-be: ## build backend
	go build -o $(BIN) $(BE_ENTRYPOINT)

dev-be: ## run backend dev server with hot reload
	$(AIR_BIN) $(BE_ENTRYPOINT)

build-fe: ## build the frontend deploy artifacts
	cd $(FE_DIR); bun run build;

install-fe: ## install frontend deps
	cd $(FE_DIR); bun install;

dev-fe: ## run frontend dev vite server with hot reload
	cd $(FE_DIR); bun start;

clean: ## delete all build artifacts
	rm -rf $(BIN)
	rm -rf bin/main
	rm -rf $(FE_DIR)/build

docker-up: ## start docker dependencies
	docker compose up -d
	sh ./scripts/scaffold-local-resources.sh

docker-down: ## stop docker dependencies
	docker compose down

docker-restart: docker-down docker-up

fmt: ## format the files in the repo
	@gofmt -l -w internal cmd
	cd $(FE_DIR); bun run format;

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

migrate: ## migrate database
	sh ./scripts/migrate.sh

.PHONY: help fmt docker-up docker-down docker-restart clean install install-be install-fe build build-fe build-be dev dev-be dev-fe popenv migrate

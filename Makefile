FE_DIR=web
BE_DIR=server

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

yolo:
	cd $(FE_DIR); npm run yolo; cd ../$(BE_DIR); npm run yolo;
up: ## Start docker backing services for local dev
	docker compose up -d
down:
	docker compose down && docker volume rm furizu_postgres_data

format: ## format server + web code
	make format-fe format-be;
format-fe:
	cd $(FE_DIR); npm run format; npm run lint;
format-be:
	cd $(BE_DIR); npm run format; npm run lint;

typecheck:
	cd $(FE_DIR); npm run typecheck; cd $(BE_DIR); npm run typecheck;

generate-migration:
	cd $(BE_DIR); npm run generate-migration;
migrate:
	cd $(BE_DIR); npm run migrate;
generate-client:
	cd $(FE_DIR); npm run generate;


build: ## build everything
	make -j 2 build-fe build-be

dev: ## run dev servers of both backend and frontend
	make -j 2 dev-fe dev-be

dev-be: ## run backend dev server with hot reload
	cd $(BE_DIR); npm run dev;

dev-fe: ## run frontend dev vite server with hot reload
	cd $(FE_DIR); npm run dev;

build-fe: ## run frontend dev vite server with hot reload
	cd $(FE_DIR); npm run build;

build-be: ## run frontend dev vite server with hot reload
	cd $(BE_DIR); npm run build;

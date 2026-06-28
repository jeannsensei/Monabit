.PHONY: dev install build test lint typecheck clean ci

dev:
	@echo "Starting API on :8080 and Web on :5173..."
	cd api && npm run dev & cd web && npm run dev & wait

install:
	cd api && npm install
	cd web && npm install

build:
	cd api && npm run build
	cd web && npm run build

test:
	cd api && npm test
	cd web && npm test

lint:
	cd api && npm run lint
	cd web && npm run lint

typecheck:
	cd api && npm run typecheck
	cd web && npm run typecheck

ci: install lint typecheck test
	@echo "All CI checks passed"

clean:
	rm -rf api/dist
	rm -rf web/dist

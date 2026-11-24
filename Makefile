SHELL := /bin/bash

SERVER_DIR ?= ../geotiff_server
CLIENT_DIR ?= .

.PHONY: help install start dev server client test typecheck build

help:
	@echo "Targets:"
	@echo "  make install    Install client and server dependencies"
	@echo "  make dev        Start the Terracotta server and Vite client"
	@echo "  make start      Alias for make dev"
	@echo "  make server     Start only the Terracotta server ($(SERVER_DIR))"
	@echo "  make client     Start only the Vite client"
	@echo "  make test       Run client tests"
	@echo "  make typecheck  Type-check client .ts and .vue files"
	@echo "  make build      Build the client into dist/"

install:
	cd $(SERVER_DIR) && uv sync
	cd $(CLIENT_DIR) && npm install

start: dev

dev:
	$(MAKE) -j2 server client

server:
	cd $(SERVER_DIR) && uv run server.py

client:
	cd $(CLIENT_DIR) && npm start -- --host 127.0.0.1

test:
	cd $(CLIENT_DIR) && npm test

typecheck:
	cd $(CLIENT_DIR) && npm run typecheck

build:
	cd $(CLIENT_DIR) && npm run build

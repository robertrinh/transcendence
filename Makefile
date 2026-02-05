NAME = ft_transcendence

all: dev-d

#make dev/dev-d starts it with vite server which gives us hot reload
dev:
	@docker-compose -f docker-compose.dev.yaml up --build

#detached mode
dev-d:
	@docker-compose -f docker-compose.dev.yaml up --build -d

#make real starts the nginx server, the one we will use for eval
real:
	@docker-compose -f docker-compose.yaml up --build

frontend:
	@docker-compose -f docker-compose.dev.yaml up --build -d frontend

down:
	@docker-compose -f docker-compose.dev.yaml down
	@docker-compose -f docker-compose.yaml down
	@rm -rf frontend/node_modules

#removes volumes AND images
clean:
	@docker-compose -f docker-compose.dev.yaml down -v --rmi all
	@docker-compose -f docker-compose.yaml down -v --rmi all
	@rm -rf frontend/node_modules

re: clean all

logs:
	@docker-compose logs -f

.PHONY: all dev dev-d real down clean re logs frontend
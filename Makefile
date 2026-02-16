NAME = ft_transcendence

all: dev-d

default:
	./setup.sh

#make dev/dev-d starts it with vite server which gives us hot reload
dev: default
	@docker-compose -f docker-compose.dev.yaml up --build

#detached mode
dev-d: default
	@docker-compose -f docker-compose.dev.yaml up --build -d

#make real starts the nginx server, the one we will use for eval
real: default
	@docker-compose -f docker-compose.yaml up --build

frontend: default
	@docker-compose -f docker-compose.dev.yaml up --build -d frontend

down:
	@docker-compose -f docker-compose.dev.yaml down
	@docker-compose -f docker-compose.yaml down

#removes volumes AND images
clean:
	@docker-compose -f docker-compose.dev.yaml down -v --rmi all
	@docker-compose -f docker-compose.yaml down -v --rmi all

re: clean all

logs:
	@docker-compose logs -f

.PHONY: all dev dev-d real down clean re logs frontend
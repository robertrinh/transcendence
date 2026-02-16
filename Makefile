NAME = ft_transcendence

all: real-d

default:
	./setup.sh

#make dev/dev-d starts it with vite server which gives us hot reload
dev: default
	@docker-compose -f docker-compose.dev.yaml up --build

#detached mode
dev-d: default
	@docker-compose -f docker-compose.dev.yaml up --build -d

real: default
	@docker-compose -f docker-compose.yaml up --build

#make real-d starts the nginx server, detached, the one we will use for eval
real-d: default
	@docker-compose -f docker-compose.yaml up --build -d

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
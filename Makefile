PORT := 8080

.PHONY: all

all:
	docker build -t transcendence .
	docker run --name transcendence -p 127.0.0.1:$(PORT):$(PORT) transcendence

kill:
	docker stop transcendence
	docker rm transcendence

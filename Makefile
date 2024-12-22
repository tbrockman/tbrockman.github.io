current_dir = $(shell pwd)

.phony: clean build run up print-resume print-resume-pdf print-resume-docx print-resume-json

clean:
	rm -f Gemfile.lock
	rm -fr _site

build: 
	docker build -t theo-web .

run:
	docker run -v .:/app -p 4000:4000 --rm --name theo-web -it theo-web

up: 
	docker compose up --wait

down:
	docker compose down

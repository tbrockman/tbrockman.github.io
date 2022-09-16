current_dir = $(shell pwd)

clean:
	rm Gemfile.lock
	rm _site

build:
	docker build -t theo-web .

run:
	docker run -v "$(current_dir)/":/app -p 4000:4000 --rm -it theo-web
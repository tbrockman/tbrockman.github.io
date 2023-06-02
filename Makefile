current_dir = $(shell pwd)

clean:
	rm -f Gemfile.lock
	rm -fr _site

build: 
	docker build -t theo-web .

run:
	docker run -v D:/Dropbox/Workspace\ New/tbrockman.github.io:/app -p 4000:4000 --rm -it theo-web

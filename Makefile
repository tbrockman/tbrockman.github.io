current_dir = $(shell pwd)

clean:
	rm -f Gemfile.lock
	rm -fr _site

build: 
	docker build -t theo-web .

run:
	docker run -v .:/app -p 4000:4000 --rm --name theo-web -it theo-web

up: 
	docker compose up

print-resume: up print-resume-pdf print-resume-json print-resume-docx

print-resume-pdf:
	sh scripts/print-resume.sh resume.pdf

print-resume-docx:
	echo "Not implemented yet"

print-resume-json:
	cp _data/resume.json resume.json
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

print-resume: up print-resume-pdf print-resume-json print-resume-docx down

print-resume-pdf:
	sh scripts/resume/print-pdf.sh resume.pdf

print-resume-docx:
	cd scripts/resume/go-print-docx && go run main.go render ../../../_data/resume.json ../../../resume.docx --license-key=${LICENSE_KEY}

print-resume-json:
	cp _data/resume.json resume.json
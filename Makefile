current_dir = $(shell pwd)

clean:
	rm -f Gemfile.lock
	rm -fr _site

build: 
	docker build -t theo-web .

run:
	docker run -v .:/app -p 4000:4000 --rm --name theo-web -it theo-web

# print-resume:
# 	docker run --rm -p 3000:3000 browserless/chrome
# 	# go to PDF tab
# 	# just navigate to https://theo.lol/resume
# 	# return page.pdf()
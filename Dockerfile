FROM ruby:2.7.6

WORKDIR /app
RUN gem install bundler
COPY Gemfile Gemfile
RUN bundler install
COPY . .
CMD bundler exec jekyll build
ENTRYPOINT [ "bundler", "exec", "jekyll", "serve", "--force_polling", "-H", "0.0.0.0", "-P", "4000" , "--drafts"]
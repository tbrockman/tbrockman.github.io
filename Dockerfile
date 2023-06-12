FROM ruby:2.7.6

WORKDIR /app
RUN gem install bundler
COPY Gemfile Gemfile
RUN bundle install
COPY . .
CMD bundle exec jekyll build
ENTRYPOINT [ "bundle", "exec", "jekyll", "serve", "--force_polling", "-H", "0.0.0.0", "-P", "4000" , "--drafts"]
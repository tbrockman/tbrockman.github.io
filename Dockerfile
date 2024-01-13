FROM ruby:2.7.6

WORKDIR /app
RUN gem install bundler -v 2.4.22
COPY Gemfile Gemfile
RUN bundle install
COPY . .
RUN bundle exec jekyll build
ENTRYPOINT [ "bundle", "exec", "jekyll", "serve", "--force_polling", "-P", "4000", "--drafts"]
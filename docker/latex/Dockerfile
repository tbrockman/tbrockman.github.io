FROM debian:stable-slim

RUN mkdir /texlive-setup
WORKDIR /texlive-setup

RUN apt-get update && apt-get install -y make wget perl-modules
RUN wget https://ftp.math.utah.edu/pub/tex/historic/systems/texlive/2022/tlnet-final/install-tl-unx.tar.gz
RUN mkdir install-tl
RUN tar xzf install-tl-unx.tar.gz -C install-tl --strip-components 1

WORKDIR /texlive-setup/install-tl

COPY texlive.profile texlive.profile
RUN ./install-tl --profile=texlive.profile --location https://ftp.math.utah.edu/pub/tex/historic/systems/texlive/2022/tlnet-final/

ENV PATH="/usr/local/texlive/bin/x86_64-linux:${PATH}"
RUN tlmgr install \
        collection-latex \
        collection-luatex \
        fontspec 
RUN tlmgr install preprint titlesec marvosym enumitem
COPY json.lua /usr/local/share/lua/5.3/json.lua
WORKDIR /src
ENTRYPOINT lualatex *.tex
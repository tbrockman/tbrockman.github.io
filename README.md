# theo.lol

my blog and website

## the resume builder


### making changes
```bash
# make changes to _data/resume.json
code _data/resume.json 
# NOTE: don't forget to update section-item-ordering if adding new project/volunteer items

# license key from https://cloud.unidoc.io/api-keys
# used for generating .docx files
LICENSE_KEY="<unicloud-api-key>" make -s print-resume
```

### how it works

everything is generated from [`_data/resume.json`](_data/resume.json) (which does _**not**_ follow the [jsonresume](https://jsonresume.org/schema) schema)

* [`resume.html`](resume.html) -> standard Jekyll HTML/CSS template
* [`resume.pdf`](resume.pdf) -> rendered using [`browserless`](https://github.com/browserless/browserless) to print `resume.html` as a PDF
* [`resume.docx`](resume.docx) -> rendered using [`scripts/resume/go-print-docx`](scripts/resume/go-print-docx), a [`kong`](https://github.com/alecthomas/kong) cli leveraging [`unioffice`](https://unidoc.io/unioffice/) (for writing .docx) and [`goldmark`](https://github.com/yuin/goldmark) (with a custom inline markdown node -> docx renderer)
* [`resume.json`](resume.json) -> copy of [`_data/resume.json`](_data/resume.json) (not symlinked -- though symlink might be possible, `TODO: verify`)
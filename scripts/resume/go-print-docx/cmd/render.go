package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"print-docx/models"
	"print-docx/utils"
	"strings"
	"time"

	"os"

	"github.com/unidoc/unioffice/common/license"
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
	"github.com/unidoc/unioffice/schema/soo/wml"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/renderer"
	"github.com/yuin/goldmark/util"
)

type Context struct {
	Debug bool
}

type Render struct {
	// Input file
	Input string `arg:"" type:"path" help:"Input JSON file."`
	// Output file
	Output string `arg:"" type:"path" help:"Output .docx file."`
	// LicenseKey key
	LicenseKey string `required:"" help:"Unidoc license key."`
	// Font
	Font string `help:"Font to use." default:"Consolas"`
	// Title size
	Title measurement.Distance `help:"Title size." default:"48"`
	// Subtitle size
	Subtitle measurement.Distance `help:"Subtitle size." default:"14"`
	// H1 size
	H1 measurement.Distance `help:"H1 size." default:"24"`
	// H2 size
	H2 measurement.Distance `help:"H2 size." default:"18"`
	// H3 size
	H3 measurement.Distance `help:"H3 size." default:"14"`
	// H4 size
	H4 measurement.Distance `help:"H4 size." default:"12"`
	// H5 size
	H5 measurement.Distance `help:"H5 size." default:"11"`
	// Normal size
	Normal measurement.Distance `help:"Normal size." default:"12"`
	// Small size
	Small measurement.Distance `help:"Small size." default:"10"`
	// Tiny size
	Tiny measurement.Distance `help:"Tiny size." default:"8"`
}

func (r *Render) addHeading(doc *document.Document, text string, level int) document.Paragraph {
	para := doc.AddParagraph()
	if level > 0 {
		para.SetStyle(fmt.Sprintf("Heading%d", level))
	} else {
		para.SetStyle("Title")
	}
	r.addRun(para, text, r.levelToSize(level))
	return para
}

func (r *Render) levelToSize(level int) measurement.Distance {
	levelToSize := map[int]measurement.Distance{
		0: r.Title,
		1: r.H1,
		2: r.H2,
		3: r.H3,
		4: r.H4,
		5: r.H5,
	}

	def := r.Normal
	if size, ok := levelToSize[level]; ok {
		return size
	}
	return def
}

func (r *Render) addHyperLink(para document.Paragraph, text, tooltip, url string, size measurement.Distance) document.HyperLink {
	hl := para.AddHyperLink()
	hl.SetTarget(url)
	hl.SetToolTip(tooltip)
	r.addHlRun(hl, text, size)
	return hl
}

func (r *Render) addHlRun(hl document.HyperLink, text string, size measurement.Distance) document.Run {
	run := hl.AddRun()
	run.Properties().SetStyle("Hyperlink")
	run.Properties().SetSize(size)
	run.Properties().SetFontFamily(r.Font)
	run.AddText(text)
	return run
}

func (r *Render) addRun(para document.Paragraph, text string, size measurement.Distance) document.Run {

	md := goldmark.New()
	md.Renderer().AddOptions(renderer.WithNodeRenderers(
		util.Prioritized(
			utils.NewNodeRenderer(para, utils.DocxRendererOptions{
				Size: size,
				Font: r.Font,
			}), 500),
	))
	var buf bytes.Buffer
	if err := md.Convert([]byte(text), &buf); err != nil {
		panic(err)
	}
	runs := para.Runs()
	return runs[len(runs)-1]
}

func (r *Render) setDefaultStyles(doc *document.Document) {
	styles := doc.Styles
	nameToSize := map[string]measurement.Distance{
		"Title":     r.Title,
		"Subtitle":  r.Subtitle,
		"Normal":    r.Normal,
		"Hyperlink": r.Normal,
		"Strong":    r.Normal,
		"Emphasis":  r.Normal,
		"Heading1":  r.H1,
		"Heading2":  r.H2,
		"Heading3":  r.H3,
		"Heading4":  r.H4,
		"Heading5":  r.H5,
	}

	for _, style := range styles.Styles() {
		style.RunProperties().SetFontFamily(r.Font)

		if size, ok := nameToSize[style.Name()]; ok {
			style.RunProperties().SetSize(size)
		}
	}

	extras := []string{"Small", "Tiny"}

	for _, extra := range extras {
		style := styles.AddStyle(extra, wml.ST_StyleTypeParagraph, false)
		style.RunProperties().SetFontFamily(r.Font)
		style.RunProperties().SetSize(r.Small)
	}
}

// YYYY-MM-DD -> MMM-Y
func textDateToShortDate(textDate string) string {
	date, err := time.Parse("2006-01-02", textDate)

	if err != nil {
		return ""
	}
	return date.Format("Jan 2006")
}

func (r *Render) Run(ctx *Context) error {
	err := license.SetMeteredKey(r.LicenseKey)

	if err != nil {
		return err
	}

	bytes, err := os.ReadFile(r.Input)

	if err != nil {
		return err
	}

	resume := models.Resume{}
	err = json.Unmarshal(bytes, &resume)

	if err != nil {
		return err
	}

	doc := document.New()
	defer doc.Close()

	doc.CoreProperties.SetAuthor(resume.About.Name)
	doc.CoreProperties.SetTitle(resume.About.Name)
	doc.CoreProperties.SetDescription(resume.About.Description)
	doc.CoreProperties.SetLanguage("en-US")

	r.setDefaultStyles(doc)

	r.addHeading(doc, resume.About.Name, 0)

	para := doc.AddParagraph()
	para.SetStyle("Subtitle")
	run := r.addRun(para, resume.About.Description, r.Subtitle)
	run.Properties().SetItalic(false)

	doc.AddParagraph() // Empty space

	// Create each section

	// About
	para = doc.AddParagraph()
	para.SetStyle("Small")

	for i, contact := range resume.About.Contacts {
		r.addHyperLink(para, fmt.Sprintf("%s %s", contact.Icon, contact.Text), fmt.Sprintf("%s %s", contact.Icon, contact.Label), contact.URL, r.Small)

		if i < len(resume.About.Contacts)-1 && len(resume.About.Contacts) > 1 {
			space := para.AddRun()
			space.AddText(" | ")
		}
	}
	doc.AddParagraph() // Empty space
	doc.AddParagraph() // Empty space

	// Skills

	r.addHeading(doc, resume.Data.SectionTitleMap.Docx.Skills, 1)

	doc.AddParagraph() // Empty space
	doc.AddParagraph() // Empty space

	para = doc.AddParagraph()
	para.SetStyle("Normal")
	r.addRun(para, "**Languages**: ", r.Normal)

	text := strings.Join(resume.Skills.Languages, ", ")
	r.addRun(para, text, r.Normal)

	doc.AddParagraph() // Empty space

	para = doc.AddParagraph()
	para.SetStyle("Normal")
	r.addRun(para, "**Technology**: ", r.Normal)
	text = " " + strings.Join(resume.Skills.Keywords, ", ")
	r.addRun(para, text, r.Normal)

	doc.AddParagraph() // Empty space

	// Projects

	doc.AddParagraph() // Empty space
	r.addHeading(doc, resume.Data.SectionTitleMap.Docx.Projects, 1)
	doc.AddParagraph() // Empty space

	order := resume.Data.SectionItemOrdering.Docx.Projects

	for _, name := range order {

		var project models.Project

		for _, p := range resume.Projects {
			if p.Name == name {
				project = p
				break
			}
		}
		doc.AddParagraph() // Empty space
		r.addHeading(doc, fmt.Sprintf("%s %s", project.Icon, project.Name), 2)

		doc.AddParagraph() // Empty space

		for i, line := range project.Description {
			para = doc.AddParagraph()
			r.addRun(para, line, r.Normal)
			if i < len(project.Description)-1 {
				doc.AddParagraph() // Empty space
			}
		}

		doc.AddParagraph() // Empty space

		para = doc.AddParagraph()

		for i, link := range project.Links {
			r.addHyperLink(para, fmt.Sprintf("%s %s", link.Icon, link.Text), link.Text, link.URL, r.Normal)
			if i < len(project.Links)-1 {
				space := para.AddRun()
				space.AddText(" | ")
			}
		}

		doc.AddParagraph() // Empty space

		para = doc.AddParagraph()
		r.addRun(para, "**tags**: *"+strings.Join(project.Tags, ", ")+"*", r.Normal)
		doc.AddParagraph()
	}

	// Work

	doc.AddParagraph() // Empty space
	r.addHeading(doc, resume.Data.SectionTitleMap.Docx.Work, 1)
	doc.AddParagraph() // Empty space

	for _, work := range resume.Work {
		doc.AddParagraph() // Empty space
		para = r.addHeading(doc, work.Position+", ", 2)
		r.addHyperLink(para, work.Organization, work.Organization, work.URL, r.levelToSize(3))
		r.addRun(para, fmt.Sprintf(" | *%s*", work.Location), r.levelToSize(4))

		para = doc.AddParagraph()
		para.SetStyle("Normal")

		start := textDateToShortDate(work.Start)
		end := "Present"

		if work.End != "" {
			end = textDateToShortDate(work.End)
		}

		r.addRun(para, fmt.Sprintf("%s - %s", start, end), r.Normal)

		for _, highlight := range work.Highlights {
			doc.AddParagraph() // Empty space

			highlightHeading := fmt.Sprintf("%s %s", highlight.Icon, highlight.Label)
			r.addHeading(doc, highlightHeading, 3)

			doc.AddParagraph() // Empty space

			para = doc.AddParagraph()
			para.SetStyle("Normal")
			r.addRun(para, highlight.Text, r.Normal)
		}

		doc.AddParagraph() // Empty space
	}

	// Volunteer

	doc.AddParagraph() // Empty space
	r.addHeading(doc, resume.Data.SectionTitleMap.Docx.Volunteer, 1)
	doc.AddParagraph() // Empty space

	order = resume.Data.SectionItemOrdering.Docx.Volunteer

	for _, item := range order {
		doc.AddParagraph() // Empty space

		var volunteer models.VolunteerExperience

		for _, v := range resume.Volunteer {
			if v.Name == item {
				volunteer = v
				break
			}
		}

		project := fmt.Sprintf("%s %s", volunteer.Icon, volunteer.Name)
		r.addHeading(doc, project, 2)

		doc.AddParagraph() // Empty space

		for i, line := range volunteer.Description {
			para = doc.AddParagraph()
			r.addRun(para, line, r.Normal)
			if i < len(volunteer.Description)-1 {
				doc.AddParagraph() // Empty space
			}
		}

		doc.AddParagraph() // Empty space

		para = doc.AddParagraph()

		for i, link := range volunteer.Links {
			r.addHyperLink(para, fmt.Sprintf("%s %s", link.Icon, link.Text), link.Text, link.URL, r.Normal)
			if i < len(volunteer.Links)-1 {
				space := para.AddRun()
				space.AddText(" | ")
			}
		}
		doc.AddParagraph() // Empty space
	}

	// Save the document
	fmt.Printf("Saving resume to: %s\n", r.Output)
	doc.SaveToFile(r.Output)
	return nil
}

package utils

import (
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/renderer"
	"github.com/yuin/goldmark/util"
)

var _ renderer.NodeRenderer = &DocxRenderer{}

type DocxRendererOptions struct {
	Font string
	Size measurement.Distance
}

type DocxRenderer struct {
	paragraph document.Paragraph
	options   DocxRendererOptions
}

func (r *DocxRenderer) RegisterFuncs(reg renderer.NodeRendererFuncRegisterer) {
	reg.Register(ast.KindText, r.renderText)
}

func (r *DocxRenderer) renderText(w util.BufWriter, source []byte, node ast.Node, entering bool) (ast.WalkStatus, error) {

	if entering {
		return ast.WalkContinue, nil
	}

	parent := node.Parent()
	kind := node.Parent().Kind()

	if kind == ast.KindParagraph {
		run := r.paragraph.AddRun()
		run.AddText(string(node.Text(source)))
		run.Properties().SetSize(r.options.Size)
		run.Properties().SetFontFamily(r.options.Font)
	} else if kind == ast.KindLink {
		node := parent.(*ast.Link)

		link := r.paragraph.AddHyperLink()
		link.SetTarget(string(node.Destination))
		link.SetToolTip(string(node.Title))
		run := link.AddRun()
		run.AddText(string(node.Text(source)))
		run.Properties().SetSize(r.options.Size)
		run.Properties().SetFontFamily(r.options.Font)
	} else if kind == ast.KindEmphasis {
		node := parent.(*ast.Emphasis)
		level := node.Level

		run := r.paragraph.AddRun()
		run.AddText(string(node.Text(source)))
		run.Properties().SetSize(r.options.Size)
		run.Properties().SetFontFamily(r.options.Font)

		if level == 2 {
			run.Properties().SetBold(true)
		} else if level == 1 {
			run.Properties().SetItalic(true)
		}
	} else {
		run := r.paragraph.AddRun()
		run.AddText(string(node.Text(source)))
		run.Properties().SetSize(r.options.Size)
		run.Properties().SetFontFamily(r.options.Font)
	}
	return ast.WalkContinue, nil
}

func NewNodeRenderer(paragraph document.Paragraph, options DocxRendererOptions) renderer.NodeRenderer {
	r := DocxRenderer{
		paragraph: paragraph,
		options:   options,
	}
	return &r
}

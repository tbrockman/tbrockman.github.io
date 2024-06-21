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
		parent := parent.(*ast.Link)

		link := r.paragraph.AddHyperLink()
		link.SetTarget(string(parent.Destination))
		link.SetToolTip(string(parent.Title))
		run := link.AddRun()
		run.AddText(string(node.Text(source)))
		run.Properties().SetSize(r.options.Size)
		run.Properties().SetFontFamily(r.options.Font)
	} else if kind == ast.KindEmphasis {
		parent := parent.(*ast.Emphasis)
		level := parent.Level
		grandParent := parent.Parent()
		grandParentLevel := 0

		if grandParent.Kind() == ast.KindEmphasis {
			grandParentLevel = grandParent.(*ast.Emphasis).Level
		}

		run := r.paragraph.AddRun()
		run.AddText(string(node.Text(source)))
		run.Properties().SetSize(r.options.Size)
		run.Properties().SetFontFamily(r.options.Font)

		if level == 2 || grandParentLevel == 2 {
			run.Properties().SetBold(true)
		}

		if level == 1 {
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

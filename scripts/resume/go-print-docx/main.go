/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package main

import (
	"print-docx/cmd"

	"github.com/alecthomas/kong"
)

var cli struct {
	Debug bool `help:"Enable debug mode."`

	Render cmd.Render `cmd:"" help:"Render a resume from a JSON file."`
}

func main() {
	ctx := kong.Parse(&cli)
	err := ctx.Run(&cmd.Context{Debug: cli.Debug})
	ctx.FatalIfErrorf(err)
}

package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"

	"github.com/goteleport-interview/int-fullstack-jason/api"
)

const listenPort = 443

//go:embed web/dist
var assets embed.FS

func main() {
	webassets, err := fs.Sub(assets, "web/dist")
	if err != nil {
		log.Fatalln("could not embed webassets", err)
	}

	s, err := api.NewServer(webassets)
	if err != nil {
		log.Fatalln(err)
	}

	log.Println("Starting server on port", listenPort)
	log.Fatalln(s.ListenAndServe(fmt.Sprintf("localhost:%d", listenPort)))
}

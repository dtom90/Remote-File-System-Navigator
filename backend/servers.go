package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Server struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Hostname string `json:"hostname"`
	Port     string `json:"port"`
}

var servers = []Server{
	{
		ID:       "1",
		Name:     "Production Server",
		Hostname: "prod.example.com",
		Port:     "22",
	},
	{
		ID:       "2",
		Name:     "Staging Server",
		Hostname: "staging.example.com",
		Port:     "22",
	},
	{
		ID:       "3",
		Name:     "Development Server",
		Hostname: "dev.example.com",
		Port:     "22",
	},
}

func handleGetServers(c *gin.Context) {
	c.JSON(http.StatusOK, servers)
}

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

var servers = map[string]Server{
	"1": {
		Name:     "Production Server",
		Hostname: "prod.example.com",
		Port:     "22",
	},
	"2": {
		Name:     "Staging Server",
		Hostname: "staging.example.com",
		Port:     "22",
	},
	"3": {
		Name:     "Development Server",
		Hostname: "dev.example.com",
		Port:     "22",
	},
}

func handleGetServers(c *gin.Context) {
	// Convert map values to slice for returning all servers
	serversList := make([]Server, 0, len(servers))
	for id, server := range servers {
		server.ID = id // Ensure ID is set
		serversList = append(serversList, server)
	}
	c.JSON(http.StatusOK, serversList)
}

func handleGetServer(c *gin.Context) {
	id := c.Param("id")
	if server, exists := servers[id]; exists {
		server.ID = id // Ensure ID is set
		c.JSON(http.StatusOK, server)
		return
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Server not found"})
}

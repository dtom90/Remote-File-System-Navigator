package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
)

func main() {
	router := gin.Default()

	// Basic health check endpoint
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Origin", "Content-Type", "Accept"},
	})

	// Add file system endpoint
	router.GET("/api/files/*path", func(c *gin.Context) {
		path := c.Param("path")
		if path == "" {
			path = "."
		}

		files, err := listFiles(path)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, files)
	})

	// Start server
	http.ListenAndServe(":8080", c.Handler(router))
}

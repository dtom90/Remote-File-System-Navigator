package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
)

func main() {
	router := gin.Default()

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
	})

	// Basic health check endpoint
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// auth routes
	router.POST("/api/auth/login", handleLogin)
	router.POST("/api/auth/logout", handleLogout)

	// servers routes
	router.GET("/api/servers", authMiddleware(), handleGetServers)
	router.GET("/api/servers/:id", authMiddleware(), handleGetServer)

	// ssh routes
	router.POST("/api/ssh/connect", handleSSHConnect)
	router.GET("/api/files/:sessionId/*path", authMiddleware(), handleListFiles)
	router.DELETE("/api/ssh/disconnect/:sessionID", handleSSHDisconnect)

	// Start server
	http.ListenAndServe(":8080", c.Handler(router))
}

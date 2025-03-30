package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/cors"

	"file-system-navigation/backend/middleware"
)

func main() {
	router := gin.Default()

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
	})

	// Public routes (no auth required)
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})
	router.POST("/api/auth/login", middleware.HandleLogin)

	// Protected routes group (auth required)
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// auth routes
		protected.POST("/auth/logout", middleware.HandleLogout)

		// servers routes
		protected.GET("/servers", handleGetServers)
		protected.GET("/servers/:id", handleGetServer)

		// ssh routes
		protected.POST("/ssh/connect", handleSSHConnect)

		// TODO: sanitize path
		protected.GET("/files/:sessionId/*path", handleListFiles)
		protected.DELETE("/ssh/disconnect/:sessionID", handleSSHDisconnect)
	}

	// Start server
	http.ListenAndServe(":8080", c.Handler(router))
}

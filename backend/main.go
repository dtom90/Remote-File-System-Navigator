package main

import (
	"net/http"

	"fmt"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
	"golang.org/x/crypto/ssh"
)

// Add this type for the request body
type SSHConnectionRequest struct {
	Hostname string `json:"hostname"`
	Port     string `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// Add these at the package level, before the main function
type SSHSession struct {
	Session *ssh.Session
	Client  *ssh.Client
}

var (
	sessions = make(map[string]*SSHSession)
)

// Add this helper function
func generateSessionID() string {
	// Simple UUID v4 generation
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

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

	// Add this before the server start
	router.POST("/api/ssh/connect", func(c *gin.Context) {
		var req SSHConnectionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		config := &ssh.ClientConfig{
			User: req.Username,
			Auth: []ssh.AuthMethod{
				ssh.Password(req.Password),
			},
			HostKeyCallback: ssh.InsecureIgnoreHostKey(), // Note: In production, use proper host key verification
		}

		addr := fmt.Sprintf("%s:%s", req.Hostname, req.Port)
		client, err := ssh.Dial("tcp", addr, config)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer client.Close()

		session, err := client.NewSession()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Generate session ID and store session
		sessionID := generateSessionID()
		sessions[sessionID] = &SSHSession{
			Session: session,
			Client:  client,
		}

		c.JSON(http.StatusOK, gin.H{
			"message":   "SSH connection established successfully",
			"sessionID": sessionID,
		})
	})

	// Add a cleanup endpoint (optional but recommended)
	router.POST("/api/ssh/disconnect/:sessionID", func(c *gin.Context) {
		sessionID := c.Param("sessionID")
		if sshSession, exists := sessions[sessionID]; exists {
			sshSession.Session.Close()
			sshSession.Client.Close()
			delete(sessions, sessionID)
			c.JSON(http.StatusOK, gin.H{"message": "Session closed successfully"})
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		}
	})

	// Start server
	http.ListenAndServe(":8080", c.Handler(router))
}

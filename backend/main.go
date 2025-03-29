package main

import (
	"net/http"

	"fmt"

	"time"

	"strings"

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
	Client  *ssh.Client
	Created time.Time
}

var (
	sshSessions = make(map[string]*SSHSession)
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
		AllowedHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
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

		// Generate session ID and store client
		sessionID := generateSessionID()
		sshSessions[sessionID] = &SSHSession{
			Client:  client,
			Created: time.Now(),
		}

		c.JSON(http.StatusOK, gin.H{
			"message":   "SSH connection established successfully",
			"sessionID": sessionID,
		})
	})

	// Update file system endpoint to create new sessions as needed
	router.GET("/api/files/:sessionId/*path", authMiddleware(), func(c *gin.Context) {
		sessionId := c.Param("sessionId")
		path := c.Param("path")
		if path == "" {
			path = "."
		}

		// Get the SSH session
		sshSession, exists := sshSessions[sessionId]
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}

		// Create a new session for this command
		session, err := sshSession.Client.NewSession()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer session.Close() // Only close this temporary session, not the main client

		// Run ls command
		output, err := session.Output(fmt.Sprintf("ls -la %s", path))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		files := parseLsOutput(string(output))
		c.JSON(http.StatusOK, files)
	})

	// Update disconnect endpoint to properly clean up
	router.DELETE("/api/ssh/disconnect/:sessionID", func(c *gin.Context) {
		sessionID := c.Param("sessionID")
		if sshSession, exists := sshSessions[sessionID]; exists {
			sshSession.Client.Close()
			delete(sshSessions, sessionID)
			c.JSON(http.StatusOK, gin.H{"message": "Session closed successfully"})
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		}
	})

	// Add a session cleanup goroutine
	go func() {
		for {
			time.Sleep(5 * time.Minute)
			now := time.Now()
			for id, session := range sshSessions {
				// Clean up sessions older than 1 hour
				if now.Sub(session.Created) > 1*time.Hour {
					session.Client.Close()
					delete(sshSessions, id)
				}
			}
		}
	}()

	router.POST("/api/auth/login", handleLogin)
	router.POST("/api/auth/logout", handleLogout)

	router.GET("/api/servers", authMiddleware(), handleGetServers)

	// Start server
	http.ListenAndServe(":8080", c.Handler(router))
}

// Add this helper function to parse ls output
func parseLsOutput(output string) []map[string]interface{} {
	var files []map[string]interface{}
	lines := strings.Split(output, "\n")

	// Skip the first line (total) and empty lines
	for _, line := range lines {
		if line == "" || strings.HasPrefix(line, "total") {
			continue
		}

		// Parse ls -la format
		fields := strings.Fields(line)
		if len(fields) >= 9 {
			file := map[string]interface{}{
				"permissions": fields[0],
				"owner":       fields[2],
				"group":       fields[3],
				"size":        fields[4],
				"modified":    fields[5] + " " + fields[6] + " " + fields[7],
				"name":        fields[8],
				"isDir":       strings.HasPrefix(fields[0], "d"),
			}
			files = append(files, file)
		}
	}
	return files
}

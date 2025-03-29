package main

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/ssh"
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

// SSHConnectionRequest represents the request body for SSH connections
type SSHConnectionRequest struct {
	Hostname string `json:"hostname"`
	Port     string `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// SSHSession represents an active SSH session
type SSHSession struct {
	Client  *ssh.Client
	Created time.Time
}

var (
	sshSessions = make(map[string]*SSHSession)
)

// generateSessionID creates a unique session identifier
func generateSessionID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
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

// handleSSHConnect handles new SSH connection requests
func handleSSHConnect(c *gin.Context) {
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

	sessionID := generateSessionID()
	sshSessions[sessionID] = &SSHSession{
		Client:  client,
		Created: time.Now(),
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "SSH connection established successfully",
		"sessionID": sessionID,
	})
}

// handleListFiles handles file listing requests over SSH
func handleListFiles(c *gin.Context) {
	sessionId := c.Param("sessionId")
	path := c.Param("path")
	if path == "" {
		path = "."
	}

	sshSession, exists := sshSessions[sessionId]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}

	session, err := sshSession.Client.NewSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer session.Close()

	output, err := session.Output(fmt.Sprintf("ls -la %s", path))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	files := parseLsOutput(string(output))
	c.JSON(http.StatusOK, files)
}

// handleSSHDisconnect handles SSH disconnection requests
func handleSSHDisconnect(c *gin.Context) {
	sessionID := c.Param("sessionID")
	if sshSession, exists := sshSessions[sessionID]; exists {
		sshSession.Client.Close()
		delete(sshSessions, sessionID)
		c.JSON(http.StatusOK, gin.H{"message": "Session closed successfully"})
	} else {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
	}
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

// startSessionCleanup starts a goroutine that periodically cleans up expired SSH sessions
func startSessionCleanup() {
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
}

// Call this function during initialization (e.g., in init() or when setting up your server)
func init() {
	startSessionCleanup()
}

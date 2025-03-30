package main

import (
	"fmt"
	"log"
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
	Username string `json:"username"`
	Password string `json:"password"`
}

var servers = map[string]Server{
	"1": {
		Name:     "Development Server",
		Hostname: "remote-server",
		Port:     "22",
		Username: "ubuntu",
		Password: "password",
	},
	"2": {
		Name:     "Staging Server",
		Hostname: "staging.example.com",
		Port:     "22",
		Username: "username",
		Password: "password",
	},
	"3": {
		Name:     "Production Server",
		Hostname: "prod.example.com",
		Port:     "22",
		Username: "username",
		Password: "password",
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
	// TODO: rename this
	sshSessions = make(map[string]*SSHSession)
)

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
	log.Printf("handleSSHConnect called with server ID: %s", c.Param("id"))
	serverId := c.Param("id")

	server, exists := servers[serverId]
	if !exists {
		log.Printf("Server not found: %s", serverId)
		c.JSON(http.StatusNotFound, gin.H{"error": "Server not found"})
		return
	}

	sshSession, err := createSSHSession(server)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "SSH connection established successfully",
		"serverId": serverId,
		"session":  sshSession,
	})
}

func createSSHSession(server Server) (*SSHSession, error) {

	config := &ssh.ClientConfig{
		User: server.Username,
		Auth: []ssh.AuthMethod{
			ssh.Password(server.Password),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	log.Printf("Attempting SSH connection to %s:%s as %s", server.Hostname, server.Port, server.Username)
	addr := fmt.Sprintf("%s:%s", server.Hostname, server.Port)
	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		log.Printf("SSH connection failed: %v", err)
		return nil, err
	}

	sshSessions[server.ID] = &SSHSession{
		Client:  client,
		Created: time.Now(), // TODO: generate session ID using uuid
	}

	return sshSessions[server.ID], nil
}

// handleListFiles handles file listing requests over SSH
func handleListFiles(c *gin.Context) {
	serverId := c.Param("id")

	_, exists := servers[serverId]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Server not found"})
		return
	}

	sshSession, exists := sshSessions[serverId]
	if !exists {
		var err error
		sshSession, err = createSSHSession(servers[serverId])
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	session, err := sshSession.Client.NewSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer session.Close()

	path := c.PostForm("path")
	if path == "" {
		path = "."
	}
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
	serverId := c.Param("id")
	if sshSession, exists := sshSessions[serverId]; exists {
		sshSession.Client.Close()
		delete(sshSessions, serverId)
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

// TODO: clean up all sessions when user logs out

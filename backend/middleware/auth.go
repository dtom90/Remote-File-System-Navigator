package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Username string
	Password string // This will store the hashed password
}

type Session struct {
	Username  string
	CreatedAt time.Time
}

var (
	// In-memory storage for users and sessions
	users        = make(map[string]User)
	authSessions = make(map[string]Session)
)

func init() {
	// Create two hardcoded users with hashed passwords
	password1, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	password2, _ := bcrypt.GenerateFromPassword([]byte("password456"), bcrypt.DefaultCost)

	users["admin"] = User{
		Username: "admin",
		Password: string(password1),
	}
	users["user"] = User{
		Username: "user",
		Password: string(password2),
	}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func HandleLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	user, exists := users[req.Username]
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate session token
	sessionToken := generateSessionToken()
	authSessions[sessionToken] = Session{
		Username:  req.Username,
		CreatedAt: time.Now(),
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   sessionToken,
	})
}

func HandleLogout(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No token provided"})
		return
	}

	if _, exists := authSessions[token]; exists {
		delete(authSessions, token)
		c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
	}
}

// Middleware to check if user is authenticated
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
			return
		}

		token = strings.TrimPrefix(token, "Bearer ")

		session, exists := authSessions[token]
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
			return
		}

		// Check if session is expired (24 hours)
		if time.Since(session.CreatedAt) > 24*time.Hour {
			delete(authSessions, token)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Session expired"})
			return
		}

		// Add username to context for use in protected routes
		c.Set("username", session.Username)
		c.Next()
	}
}

// Session cleanup routine
func cleanupSessions() {
	for {
		time.Sleep(1 * time.Hour)
		now := time.Now()
		for token, session := range authSessions {
			if now.Sub(session.CreatedAt) > 24*time.Hour {
				delete(authSessions, token)
			}
		}
	}
}

func generateSessionToken() string {
	return uuid.New().String()
}

func init() {
	go cleanupSessions()
}

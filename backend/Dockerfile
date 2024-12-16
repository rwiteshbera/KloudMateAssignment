# Stage 1: Build
FROM golang:1.23 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files first for dependency caching
COPY go.mod go.sum ./

# Download and cache dependencies
RUN go mod download

# Copy the rest of the application code
COPY . .

# Build the Go application
RUN go build -o main .

# Stage 2: Run
FROM busybox:1.37

# Set the working directory inside the container
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/main .

# Expose the port your app runs on (change the port if needed)
EXPOSE 8080

# Command to run the application
CMD ["./main"]

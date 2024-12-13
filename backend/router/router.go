package router

import (
	"fmt"
	"net/http"
)

type Route struct {
	Method  string
	Path    string
	Handler func(c *Context)
}

type Router struct {
	Routes []*Route
}

func NewRouter() *Router {
	return &Router{
		Routes: make([]*Route, 0),
	}
}

func (r *Router) Handle(method, path string, handler func(c *Context)) {
	r.Routes = append(r.Routes, &Route{
		Method:  method,
		Path:    path,
		Handler: handler,
	})
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	for _, route := range r.Routes {
		if route.Method == req.Method && route.Path == req.URL.Path {
			route.Handler(NewContext(w, req))
			return
		}
	}
	http.NotFound(w, req)
}

func (r *Router) GET(path string, handler func(c *Context)) {
	r.Handle("GET", path, handler)
}

func (r *Router) POST(path string, handler func(c *Context)) {
	r.Handle("POST", path, handler)
}

func (r *Router) PUT(path string, handler func(c *Context)) {
	r.Handle("PUT", path, handler)
}

func (r *Router) DELETE(path string, handler func(c *Context)) {
	r.Handle("DELETE", path, handler)
}

func (r *Router) Start() error {
	fmt.Println("Starting server on default port 8080")
	return http.ListenAndServe(":8080", r)
}

func (r *Router) StartWithPort(PORT string) error {
	fmt.Println("Starting server on custom port", PORT)
	return http.ListenAndServe(PORT, r)
}

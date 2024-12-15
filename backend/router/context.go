package router

import (
	"context"
	"encoding/json"
	"net/http"
)

type Context struct {
	Request  *http.Request
	Response http.ResponseWriter
}

func NewContext(w http.ResponseWriter, r *http.Request) *Context {
	return &Context{
		Request:  r,
		Response: w,
	}
}

func (c *Context) Context() context.Context {
	return c.Request.Context()
}

func (c *Context) JSON(status int, v any) {
	c.Response.Header().Set("Content-Type", "application/json")
	c.Response.WriteHeader(status)
	json.NewEncoder(c.Response).Encode(v)
}

func (c *Context) Bind(v any) error {
	return json.NewDecoder(c.Request.Body).Decode(v)
}

func (c *Context) BindJSON(v any) error {
	return json.NewDecoder(c.Request.Body).Decode(v)
}

func (c *Context) Query(key string) string {
	return c.Request.URL.Query().Get(key)
}

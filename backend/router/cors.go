package router

import "net/http"

func Cors(allowedOrigin, allowedMethods, allowedHeaders, allowedCredentials string) Middleware {
	return func(next http.Handler) http.HandlerFunc {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			w.Header().Set("Access-Control-Allow-Methods", allowedMethods)
			w.Header().Set("Access-Control-Allow-Headers", allowedHeaders)
			w.Header().Set("Access-Control-Allow-Credentials", allowedCredentials)

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func DefaultCors() Middleware {
	return Cors("*", "GET, POST, PUT, DELETE, OPTIONS", "Content-Type, Authorization", "false")
}

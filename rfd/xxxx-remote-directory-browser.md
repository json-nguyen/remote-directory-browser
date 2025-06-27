| authors                                | state |
|----------------------------------------|-------|
| Jason Nguyen (j.nguyen.ce28<!-- -->@gmail.com) | draft |

# RFD X - Remote Directory Browser

## What
A web application that allows authenticated users to browse directory content on a remote server securely.

## Why
To provide a secure way to browse and inspect remote file systems.

## Details

### UX

#### Day 1 User
Alice is a new user. She visits the app and is prompted to log in. Upon successful authentication, she's redirected to a page displaying a table of the root directory's file names, types, and sizes.

She clicks into the `Photos` directory, and the app navigates to `/Photos`. She types "vacation" into the search input, filtering the table to show the matching files. Then, she clicks the size column header to sort the results by size in descending order.

The breadcrumbs at the top of the table currently display `Home > Photos`. She clicks on `Home` to return to the root directory. She goes back into `Photos` and refreshes the browser. The app will reload and retain her position at `Photos`.

Alice clicks the log out button and is redirected to the login page. She logs back in and sits there doing nothing until her session expires. Once it does, she will automatically be logged out and redirected to the login page.

Luckily, Alice has `/Photos` bookmarked and tries to navigate to it. Since she is not authenticated, the app redirects her to the login page. After logging in successfully, she is automatically redirected back to `/Photos` and sees that directory's contents.

#### Wire Frame
![image](https://github.com/user-attachments/assets/99690f29-ecd2-4792-aaf2-b214e6266a20)
![image](https://github.com/user-attachments/assets/a1d58a4c-7983-4ea0-9d58-13cf9a203617)


### API
#### For now, we have 3 endpoints:

`GET /api/dir/folder/another%20dir`

- Accepts directory path as part of the URL.
- The backend will parse and extract the directory path from the URL after the "/dir" prefix.
- Returns the directory metadata and its contents.
  
Example response:

```json
{
  "name": "my-directory",
  "type": "dir",
  "size": 0,
  "contents": [
    { "name": "me-praying-for-an-offer-letter.jpg", "type": "file", "size": 23456 },
    { "name": "another-directory", "type": "dir", "size": 0 }
  ]
}
```

`POST /api/login`

- Accepts `{username, password}`.
- if Successful, returns a session cookie and the user's info

```json
{ "username": "teleport-man" }
```

`POST /api/logout`
- Destroys the session.

`GET /api/validate-session`
- Validates the current session token from the `session` cookie.
- If valid returns, the current user

```json
{ "username": "teleport-man" }
```

### URL Structure

To support state persistence on refresh, the application encodes navigation and filter/sorting state in the URL. 

#### Frontend URL Examples:

```
/files - Displays contents of the root directory.
/files/photos - Displays contents of the `photos` directory.
/files/photos/Cool%20Photos – Displays contents of a nested folder with spaces in the name.
/files/photos?search=vacation&sort=size:desc - Displays `photos` with an active filter and sort applied.
/login - Displays the login page.
```

#### URL Breakdown
The current directory is represented using URL path segments (e.g., `/files/photos/stuff`), with the directory path directly passed into the URL. This path-based approach fully allows React-Router to do a lot of the work for us. Things like updates, routing, and navigation would be done automatically. Whereas with query parameters (files?path=somepath), we would have to do more manual work. For example, setting up a useEffect to track changes in the path query parameter. 

Filtering and sorting state, however, is stored in query parameters (e.g., `/files/photos?search=vacation&sort=size:desc`) since these don't directly affect navigation. 

On page load or refresh, the app parses the path and query parameters to restore the previous state. If a user navigates to a route that doesn't exist, the app displays a `404 Not Found` page.

### Security
#### Authentication
This app will use a simple username + password authentication mechanism via `POST /api/login`. Passwords will be stored as **bcrypt** hashes using Go's bcrypt package. The username/hashed password will be stored and hardcoded into the API. The username and plain text password will be provided for testing. On login, the submitted password is verified using `bcrypt.CompareHashAndPassword`.

Example Storage:
```
mockUserDB := map[string]string{
  "teleport-man": "dlkjfhsalkjfh",
}
```

#### Session Management
On successful login, the backend will generate a secure, random session token. Sessions are stored in an in-memory map with the token as the key and metadata as the value.

Example:
  ```
  sessions["asdf"] = Session{Username: "teleport-man", Expires: time.Now().Add(15 * time.Minute)}
  ```

Session tokens are generated using `crypto/rand` and then encoded using URL-safe base64, making them safe to include in cookies. Tokens are 32 bytes, providing a good balance between length and randomness. 

Token Generation Function:
```
func GenerateSessionToken(length int) (string, error) {
	b := make([]byte, length)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}
```

The session token is sent to the client in a cookie with the following attributes:
- `Name: "session"` - The name of the session cookie.
- `Value: <random token>` - A 32-byte generated token.
- `HttpOnly: true` - Prevents JavaScript from accessing the cookie, protecting from XSS attacks.
- `Secure: true` - Ensures cookie is only sent over HTTPS.
- `SameSite: Lax` - Mitigates most CSRF attacks while allowing deep linking.
- `Max-Age: 900` - Cookie expires after 15 minutes, matching server-side session expiration.
- `Expires: <15 minutes from now>` - To ensure compatibility with older browsers that may not support Max-Age.
- `Path: "/"` - Makes cookie available to the entire application.

The browser stores this cookie and automatically sends it on future requests. The backend validates the session token on every request by looking it up in the session map and checking its expiration through a middleware. 

If the token is missing, invalid, or expired, the request is rejected with a 401. Logging out deletes the session from memory and clears the cookie.

#### TLS Setup
To ensure all data is encrypted in transit, TLS is enabled for all HTTP communication. This implementation uses one-way TLS (server-only certificates). 

The Go backend will be configured to serve HTTPS using `http.Server` with a custom `tls.Config`. While Go provides secure TLS defaults, like curve preferences and cipher suite ordering, configuring `tls.Config` gives us the flexibility over TLS parameters such as future cipher suite configuration and extensibility for mutual TLS if needed. We will use a minimum of TLS 1.3 over TLS 1.2 as it provides stronger security, faster performance, and less error-prone.

```
server := &http.Server{
    Addr:    ":443",
    Handler: handler,
    TLSConfig: &tls.Config{
        MinVersion: tls.VersionTLS13,
    },
}
log.Fatal(server.ListenAndServeTLS("certs/cert.pem", "certs/key.pem"))
```

Self-signed certificates will be generated and used for this application using the following openssl command.

`openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"`

 These certificates `(cert.pem, key.pem)` are loaded in and passed into the TLS listener. For this assessment, the certificate files will be provided and placed in the `certs/` directory of the repository. Normally, these files wouldn't be committed to source control, but they're included to help simplify setup for reviewers.

### Web Vulnerability Protection 

#### Cross-Site Scripting (XSS):
React escapes all user-facing output by default. User input is never rendered as HTML or injected into the DOM unsafely.

#### Server-Side Request Forgery (SSRF): 
The backend does not perform outbound HTTP requests based on input, eliminating SSRF risk.

#### Cross-Site Request Forgery (CSRF):
While implementing CSRF tokens, typically used to protect state-changing endpoints, they aren't necessary here due to the app's limited scope and cookie configuration. Login and Logout operations are protected using `SameSite=Lax`, `HttpOnly`, and `Secure` session cookies. With `SameSite=Lax`, the browser doesn't send cookies on cross-site POSTs and ignores Set-Cookie headers in cross-site responses, which prevents login CSRF. While logout CSRF is possible if implemented as a `GET` request, this app uses a `POST` request, which is also covered by `SameSite=Lax`. The only real concern is outdated browsers that aren't compatible with SameSite. If the app were to grow, CSRF tokens would need to be implemented.

#### Path Traversal Prevention:
Prevents accessing files outside the intended directory scope by manipulating input paths (using `../` or symlinked directories). All incoming paths from `GET /api/dir?path=/somepath` are passed through a function to check if the path is safe. 

For symlinks, the function will resolve the path to check if it's a symlinked directory and make sure that the resulting path is within scope. If the path is not safe or doesn't exist,  `404 Not Found` status will be shown.

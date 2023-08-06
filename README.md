# ❆ furizu.

End-to-end encrypted deep-freeze file storage

### Getting Started

* There are two main components to this application: a frontend made with [Svelte Kit](https://kit.svelte.dev/), and a backend API made with Go and the [Echo web framework](https://echo.labstack.com/).
* The `Makefile` contains most of the commands and serves as a map for the development workflow. Run `make help` from the root of this repository to see what commands are available.

Both frontend and backend require environment variables in order to build and run properly. To set up environment variables locally, use `.env` files. For example:

```
cp .env.example .env
cp ui/.env.example ui/.env
```
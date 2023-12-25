# DDG (Rust without App Framework's Version)

DuckDbGeo

As DuckDB added an spatial extension its become a good way to interact with any vector data that gdal can read/write.

This project is a simple UI to load and query spatial data, with a application/web interface.


# CLI + web server

Rather than a webview app, this version is a CLI that runs a web server to serve the UI. Main benefits over Tauri is not using JSON-RPC (and not shoe-horning other http handlers into tauri, but that could be an option via a custom protocol handler)

```
npm install
npm run dev
```



## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
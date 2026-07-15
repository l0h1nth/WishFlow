# WishFlow

A responsive, static e-commerce catalog with product search, category filtering, and multiple named wishlists. It uses only browser-native HTML, CSS, and JavaScript, so it runs locally or on GitHub Pages without a backend, package install, or build step.

## Run locally

Serve the repository root with any static server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. ES modules do not work reliably when `index.html` is opened directly with a `file://` URL, so a local HTTP server is recommended.

## Verify

The test suite uses Node's built-in test runner and has no third-party dependencies:

```sh
node --test
```

To check JavaScript syntax exactly as CI does:

```sh
find js tests -type f -name '*.js' -print0 | xargs -0 -n1 node --check
```

## Project structure

```text
.
├── .github/workflows/pages.yml  # CI checks and GitHub Pages deployment
├── assets/images/               # Repository-owned product artwork
├── css/                         # Foundations, components, responsive rules
├── js/
│   ├── app.js                   # Routing, events, dialogs, and feedback
│   ├── data/products.js         # Stable product catalog
│   ├── services/                # Defensive localStorage adapter
│   ├── state/                   # Wishlist rules and state transitions
│   └── ui/                      # Reusable HTML templates
├── tests/                       # Dependency-free state and integrity tests
├── index.html                   # Accessible application shell
└── v1-spec.md                   # Verbatim requirements and assumptions
```

## Data model

Wishlists are stored under the versioned `wishflow:wishlists` localStorage key. Existing data under the legacy `kindred-goods:wishlists` key is migrated automatically:

```json
{
  "version": 1,
  "lists": [
    {
      "id": "stable-list-id",
      "name": "Sunday morning",
      "productIds": ["ceramic-morning-mug"]
    }
  ]
}
```

Malformed records, duplicate list identities, duplicate product IDs, and product IDs that are no longer in the catalog are normalized safely on load.

## Deployment

The Pages workflow runs syntax checks, unit tests, static integrity checks, and an HTTP smoke test on pull requests and pushes. A successful push to `main` deploys the unchanged repository files to GitHub Pages.

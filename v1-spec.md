# Version 1 Specification

## Initial requirements (verbatim)

The requirements are mentioned as below for clear and structured codebase , The entire project should follow a defiined code structure so that reuseability and reliability can be maintained at the later part of the project.

Make sure this simple project is structured in a way that it can be deployed with real time environment with CI/CD checks throughout the project for now, implement thsee 


1. Use plain HTML, CSS, and JavaScript so it can run on GitHub Pages without a backend or build step.
2. Display eight sample products with stable IDs, names, prices, categories,descriptions, and locally reliable visuals.
3. Allow users to create and delete named wishlists.
4. Allow a product to be added to a selected wishlist and removed from it.
5. Prevent the same product from appearing twice in the same list.
6. Persist wishlist data in localStorage and safely handle missing or malformed
   stored data.
7. Provide a dedicated wishlist view.
8. Support merging a source list into a destination list.
9. During a merge, combine unique product IDs, retain the destination name,
   delete the source list after confirmation, and persist the result.
10. Prevent a list from being merged into itself.
11. Show useful empty states and feedback messages.
12. Make the interface usable on mobile and with a keyboard.
13. Do not implement login, checkout, payments, or a backend.

Once the first version is implemented give me an overview of how this project is build with the code structure and the techstack is used in this assessment. 

## Assumptions

- The project starts from an empty repository, so the initial file structure will be created from scratch.
- “Real time environment” is interpreted as a production-deployable static website hosted by GitHub Pages; no real-time server communication is introduced because requirements 1 and 13 explicitly exclude a backend.
- CI/CD checks will validate the static HTML, CSS, and JavaScript and may deploy the unchanged files to GitHub Pages. They will not add a required local build step.
- “Locally reliable visuals” means artwork stored inside the repository and referenced with relative paths, so products do not depend on remote image services.
- The dedicated wishlist view will be an in-page application view with its own navigation state. This keeps the experience fast and preserves the no-build, no-backend constraint.
- Wishlist names must contain at least one non-whitespace character, are trimmed before storage, and are compared case-insensitively to prevent confusing duplicate names.
- Deleting a wishlist and completing a merge are destructive operations and therefore require confirmation.
- Product prices are sample values displayed in US dollars; no cart, checkout, tax, shipping, or payment behavior is implied.
- Wishlist state will use a versioned localStorage payload. Unknown product IDs and malformed list records will be discarded during safe normalization.

## Conflict check

No blocking conflicts were found. A static GitHub Pages site can use CI/CD validation and deployment without adding a runtime backend or a local build step.

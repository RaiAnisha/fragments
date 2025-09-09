# fragments

set-up workshop (sem 5)

To set up the project,

1. clone the repository,
2. navigate into its folder, and run npm install to install dependencies.

- On Windows, curl.exe can be used to test the API, and jq can be installed to pretty-print JSON output.

a. npm run lint checks code style using ESLint.
b. npm start runs the server normally.
c. npm run dev runs the server in watch mode for automatic reloads during development
d. npm run debug starts the server with the Node.js inspector for debugging in VSCode.

- Environment variables for development are stored in debug.env, with LOG_LEVEL controlling log verbosity.

The API automatically sets appropriate headers for security and caching.
All changes should be committed to Git and pushed to the private repository.
Testing with browser, curl, and VSCode debugger ensures the server works correctly in all modes.

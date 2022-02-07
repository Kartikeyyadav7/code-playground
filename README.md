# Code Playground

This is a code editor in the browser where you can edit the files, run those files and get the output.
Currently only has support for HTML, CSS and JS

> Currently in DEVELOPMENT

## Tech Stack

**Client:** React, Monaco Editor, Xterm.js

**Server:** Node, WebSockets

## Features

- Code editor built using monaco
- Live terminal connected to backend
- Reflecting changes directly on the IFrame

## Run Locally

Clone this repo for the frontend part

```bash
  git clone https://github.com/Kartikeyyadav7/code-playground.git
```

Clone the backend repo for running the server

```bash
  git clone https://github.com/Kartikeyyadav7/code_editor_backend
```

After clonning both repo install the dependencies in both repo using `npm install` and then run the frontend using `npm start` and for the backend using `npm run dev`

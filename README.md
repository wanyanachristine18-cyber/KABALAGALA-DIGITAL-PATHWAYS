# Kabalagala Digital Pathways

Kabalagala Digital Pathways is a responsive web portal that helps young people in Makindye find verified ICT training opportunities, learn basic digital skills, explore entry-level careers, and practice safer online habits.

## Features

- ICT career matcher quiz
- Searchable and filterable training opportunities
- Fourteen-task digital skills checklist
- Learning progress saved in the browser
- Certificate unlocked at 100% progress
- HTML practice playground
- Online safety and cyber-hygiene guidance
- Dark and light themes
- Mobile-friendly navigation
- Career and opportunity information pages

## Pages

- `index.html` - Main learning hub and interactive portal
- `learn.html` - Digital skills lessons and practice
- `opportunities.html` - Training hubs and opportunities
- `careers.html` - Entry-level ICT career pathways
- `safety.html` - Online safety resources
- `about.html` - Project purpose, sources, and privacy information

## Run Locally

Requirements:

- Node.js 18 or newer
- A modern web browser

Install the test dependency:

```powershell
npm install jsdom
```

Start the local server:

```powershell
node server.js
```

Open `http://localhost:8080/`. The server uses port `8080` by default and automatically tries the next available port if that port is already in use.

You can also open the HTML files directly in a browser, although using the local server is recommended.

## Run Tests

Run the main interaction test suite:

```powershell
node run-tests.js
```

Run the interactive verification script:

```powershell
node test_interactions.js
```

The test suite checks navigation, themes, the career quiz, opportunity filters and search, FAQs, registration, learning progress, and certificate behavior.

## Project Structure

```text
.
|-- index.html
|-- learn.html
|-- opportunities.html
|-- careers.html
|-- safety.html
|-- about.html
|-- styles.css
|-- server.js
|-- run-tests.js
|-- test_interactions.js
|-- images/
|   `-- Logos and project images
`-- ky/
```

## Browser Storage

The portal stores the selected theme and registered student profile in browser `localStorage`. Learning progress is also saved locally in the browser. Clearing browser data removes this saved information.

## Deployment

The project can be deployed to a static web host. Upload the HTML, CSS, JavaScript, image, and `ky` files while preserving the existing folder structure.

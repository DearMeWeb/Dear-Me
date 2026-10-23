# DearMe

**DearMe** is a responsive, student-focused web application that brings academic task management and personal reflection together in one calm, accessible space.

Students can organize coursework and deadlines while making time to check in with their mood and record personal reflections.

## Problem Statement

University students often manage assignments, practical reports, and group projects across different tools. Keeping track of deadlines while also reflecting on personal well-being can be difficult. DearMe aims to bring these everyday activities together in a simple interface.

## Key Features

- **Task management:** create, edit, search, filter, sort, complete, and delete tasks; track deadlines and priorities.
- **Mood check-ins:** record a daily mood and optional note, review mood history, and view a simple weekly summary.
- **Personal journal:** write, edit, search, categorize, and delete journal entries.
- **Focus timer:** use a configurable timer to support focused study sessions.
- **Data backup:** export personal data to a JSON file and import a previously exported backup.
- **Responsive interface:** use the application on desktop and smaller screens.
- **Local storage:** task, mood, and journal data are stored in the browser on the current device.

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage` for client-side persistence

DearMe currently runs as a front-end web application and does not require a server or database to run locally.

## Getting Started

### Requirements

A modern web browser such as Google Chrome, Microsoft Edge, Firefox, or Safari.

### Run locally

1. Download or clone this repository.
2. Keep the following files in the same folder:
   - `index.html`
   - `style.css`
   - `script.js`
3. Open `index.html` in your browser.

For a local development server, you may open the folder in Visual Studio Code and use a local server extension, or run a simple static HTTP server from the project directory.

## How to Use

1. Open the **Tasks** section to add coursework, subjects, deadlines, priorities, and notes.
2. Mark tasks complete when finished, or use search and filters to find a task.
3. Open the **Mood** section to select a mood and optionally write a short note.
4. Open the **Journal** section to record a reflection or personal note.
5. Use the focus timer when you want to work in a dedicated study session.
6. Visit the data/backup section to export a JSON backup regularly.

## Data and Privacy

DearMe stores tasks, mood records, and journal entries in the browser's local storage on the device where the app is used. The current implementation does not include user accounts or cloud synchronization. Data may be lost if browser site data is cleared, so users should export backups when needed. Imported backup files should only come from a trusted source.

## Project Structure

```text
DearMe/
├── index.html   # Application structure and content
├── style.css    # Layout, styling, and responsive rules
├── script.js    # Application interactions and local data handling
└── README.md    # Project documentation
```

## Sustainable Development Goals (SDGs)

DearMe is intended to support student well-being and more organized learning routines. The team should identify and explain the specific SDG target(s) that best match the final project scope and competition submission, and ensure the same selection is used consistently across the poster, presentation, and demo video.

## Limitations

- Data is stored locally in the current browser and is not automatically synchronized between devices.
- The application does not currently provide user authentication or a shared team workspace.
- Browser storage availability and capacity may vary by browser and device.

## Competition Submission

For FunDev International Competition 2026, prepare the required submission materials separately, including the English demo video, presentation slides in PDF and PPTX, code repository link, and signed originality declaration. Check the official guidebook and competition portal for the latest instructions and final submission requirements.

## Originality and Third-Party Resources

The team should review all source code, design assets, icons, fonts, and other third-party resources used in the final project. Add appropriate attributions and license information where required, and make sure the originality declaration accurately reflects the team's work and tools used.

## Team

Add the team name, member names, institution, and contact details here before publishing the repository.

## License

No license has been specified yet. Add a license only after the team has decided how the project may be reused and distributed.

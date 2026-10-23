DearMe
DearMe is a responsive, student-focused web application that brings academic task management and personal reflection together in one calm, accessible space. Students can organize coursework and deadlines while making time to check in with their mood and record personal reflections.

Problem Statement
University students often manage assignments, practical reports, and group projects across different tools. Keeping track of deadlines while also reflecting on personal well-being can be difficult. DearMe aims to bring these everyday activities together in a simple interface.

Key Features
- Task management: create, edit, search, filter, sort, complete, and delete tasks; track deadlines and priorities.
- Mood check-ins: record a daily mood and optional note, review mood history, and view a simple weekly summary.
- Personal journal: write, edit, search, categorize, and delete journal entries.
- Focus timer: use a configurable timer to support focused study sessions.
- Data backup: export personal data to a JSON file and import a previously exported backup.
- Responsive interface: use the application on desktop and smaller screens.
- Local storage: task, mood, and journal data are stored in the browser on the current device.
  
Technology Stack
- HTML5
- CSS3
- Vanilla JavaScript
- Browser localStorage for client-side persistence
DearMe currently runs as a front-end web application and does not require a server or database to run locally.

Getting Started
Requirements
A modern web browser such as Google Chrome, Microsoft Edge, Firefox, or Safari.

Run locally
1. Download or clone this repository.
2. Keep the following files in the same folder:
   - index.html
   - style.css
   - script.js
3. Open index.html in your browser.
For a local development server, you may open the folder in Visual Studio Code and use a local server extension, or run a simple static HTTP server from the project directory.

How to Use
1. Open the Tasks section to add coursework, subjects, deadlines, priorities, and notes.
2. Mark tasks complete when finished, or use search and filters to find a task.
3. Open the Mood section to select a mood and optionally write a short note.
4. Open the Journal section to record a reflection or personal note.
5. Use the focus timer when you want to work in a dedicated study session.
6. Visit the data/backup section to export a JSON backup regularly.
   
Data and Privacy
DearMe stores tasks, mood records, and journal entries in the browser's local storage on the device where the app is used. The current implementation does not include user accounts or cloud synchronization. Data may be lost if browser site data is cleared, so users should export backups when needed. Imported backup files should only come from a trusted source.

Project Structure
DearMe/
├── index.html   # Application structure and content
├── style.css    # Layout, styling, and responsive rules
├── script.js    # Application interactions and local data handling
└── README.md    # Project documentation

Sustainable Development Goals (SDGs)
DearMe may be relevant to the following United Nations Sustainable Development Goals:
- SDG 3 — Good Health and Well-Being: the mood check-in and personal journal provide space for students to reflect on how they feel. DearMe is a self-reflection and organization tool, not a medical or mental-health treatment service.
- SDG 4 — Quality Education: task and deadline management is designed to help students organize their academic responsibilities and study routines.

Team
DearMe is developed by a three-member student team for FunDev International Competition 2026.
- Shadikah Adzirah Lubis
- Chaerunnisa Hajar Harahap
- Wiji Ayu Lestari
  
Team Name: The Inner Circle

Institution: Universitas Islam Negeri Sumatera Utara

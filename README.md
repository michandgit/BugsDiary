# 🐛 Bug Diary

A full-stack web application for tracking and managing coding bugs with a clean dark theme interface.

## Features

- ✅ **Add Bug Entries** - Title, Description, Error message (code block), Solution (code block), Tags, Date, Status
- 🔍 **Search & Filter** - Search by title or tag, filter by status (All/Solved/Unsolved)
- 🃏 **Card Layout** - Clean card-based view of all bugs
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark Theme** - Easy on the eyes with syntax highlighting
- ✏️ **Edit & Delete** - Full CRUD operations
- 💾 **File Storage** - All data stored in `bugs.json` file

## Tech Stack

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (API calls)
- React Syntax Highlighter (code blocks)
- Lucide React (icons)

**Backend:**
- Node.js
- Express.js
- File-based storage (bugs.json)
- UUID for unique IDs
- CORS enabled

## Project Structure

```
Bugsdiary/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── bugs.json
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       └── components/
│           ├── BugCard.jsx
│           ├── BugForm.jsx
│           ├── BugDetails.jsx
│           └── SearchFilter.jsx
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 3. Start the Backend Server

```bash
cd ../backend
npm run dev
```

The backend server will start on `http://localhost:3001`

### 4. Start the Frontend Development Server

Open a new terminal window:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### 5. Open the Application

Open your browser and navigate to `http://localhost:3000`

## Usage

### Adding a Bug

1. Click the "Add Bug" button in the top right
2. Fill in the bug details:
   - **Title**: Brief description (required)
   - **Description**: Detailed explanation (required)
   - **Error Message**: Code or error output (optional)
   - **Solution**: Working fix or solution (optional)
   - **Tags**: Add relevant tags like "React", "CSS", "Python" (optional)
   - **Status**: Solved or Unsolved
3. Click "Save Bug"

### Viewing Bugs

- All bugs are displayed in a card layout
- Click any card to view full details in the sidebar
- Use the search bar to find bugs by title or tags
- Filter by status using the dropdown

### Editing/Deleting Bugs

- Click the edit icon on any card to modify
- Click the delete icon (trash) to remove a bug
- Or use the buttons in the detailed view sidebar

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bugs` | Get all bugs |
| GET | `/api/bugs/:id` | Get single bug |
| POST | `/api/bugs` | Create new bug |
| PUT | `/api/bugs/:id` | Update bug |
| DELETE | `/api/bugs/:id` | Delete bug |
| GET | `/api/health` | Health check |

## Sample Bug Data

The app comes with sample bug entries to demonstrate features:

- React useState Hook issue
- CSS Flexbox centering problem  
- Python performance optimization (unsolved)

## Development

### Backend Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Data Storage

All bug data is stored in `backend/bugs.json`. The file is automatically created when the server starts if it doesn't exist.

Example bug entry:
```json
{
  "id": "uuid-string",
  "title": "React useState Hook Not Updating",
  "description": "State variable not updating immediately...",
  "errorMessage": "const [count, setCount] = useState(0);...",
  "solution": "Use functional update pattern...",
  "tags": ["React", "JavaScript", "Hooks"],
  "status": "Solved",
  "date": "2026-06-01T10:30:00.000Z",
  "createdAt": "2026-06-01T10:30:00.000Z",
  "updatedAt": "2026-06-01T15:45:00.000Z"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
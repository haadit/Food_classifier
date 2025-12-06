# Fresh vs Stale Food Classifier - Frontend

A beautiful React frontend for the AI-powered food freshness detection system. This application allows users to upload images of fruits and vegetables to determine if they are fresh or spoiled using machine learning.

## Features

- 🎨 **Beautiful Modern UI** - Gradient backgrounds, smooth animations, and responsive design
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 🖼️ **Drag & Drop Upload** - Easy image upload with drag-and-drop functionality
- 📊 **Interactive Results** - Detailed confidence breakdown with interactive charts
- ⚡ **Real-time Status** - Server health monitoring with live status indicators
- 🎯 **High Accuracy** - Supports 18 different food categories (fresh/rotten for 9 food types)

## Supported Food Types

- Apples
- Bananas
- Bitter Gourd
- Capsicum
- Cucumber
- Okra
- Oranges
- Potato
- Tomato

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Upload Image**: Drag and drop an image or click to browse for a food image
2. **Analyze**: Click "Analyze Food" to send the image to the AI model
3. **View Results**: See the classification result with confidence scores and detailed breakdown
4. **Reset**: Click "Reset" to upload a new image

## API Integration

The frontend connects to a Flask backend API with the following endpoints:

- `GET /health` - Server health check
- `POST /predict` - Image classification endpoint

## Technologies Used

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API requests
- **Recharts** - Interactive charts for confidence visualization
- **Lucide React** - Beautiful icons
- **CSS3** - Modern styling with gradients and animations

## Project Structure

```
src/
├── components/
│   ├── ImageUpload.jsx      # Image upload component
│   ├── ImageUpload.css      # Upload component styles
│   ├── ResultsDisplay.jsx   # Results visualization
│   └── ResultsDisplay.css   # Results component styles
├── services/
│   └── api.js              # API service layer
├── App.jsx                 # Main application component
├── App.css                 # Main application styles
├── index.css               # Global styles
└── main.jsx                # Application entry point
```

## Customization

### Changing Backend URL

Update the `API_BASE_URL` in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url:port';
```

### Styling

The application uses CSS custom properties and can be easily customized by modifying the color schemes in the CSS files.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Fresh vs Stale Food Classifier system.
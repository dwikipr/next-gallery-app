# Next.js Unsplash Gallery Application

A responsive, modern gallery application built with Next.js 16, TypeScript, Tailwind CSS, and the Unsplash API. Features include infinite scroll pagination, debounced search, favorite images with localStorage persistence, and a full-featured image modal with zoom capabilities.

## Features

- **🖼️ Unsplash Integration**: Browse high-quality photos from Unsplash
- **🔍 Debounced Search**: Real-time search with 500ms debounce
- **📱 Responsive Design**: Mobile-first responsive grid layout
- **❤️ Favorites**: Mark images as favorites with localStorage persistence
- **🔎 Image Modal**: Click any image to view high-resolution version with:
  - Pinch and scroll zoom (1x to 4x)
  - Drag to pan when zoomed
  - Photographer metadata
  - Download functionality
- **♾️ Infinite Scroll**: Automatic pagination as you scroll
- **⚡ Optimistic Updates**: Instant UI feedback for favorite actions
- **♿ Accessible**: ARIA labels, keyboard navigation, focus management
- **🎨 Dark Mode**: Automatic dark mode support
- **🔤 Custom Font**: Poppins font via next/font/google

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **API**: Unsplash REST API

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- An Unsplash API Access Key (free at [unsplash.com/developers](https://unsplash.com/developers))

### Installation

1. **Clone the repository** (or navigate to the project directory):

```bash
cd next-galery-app
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

Replace `your_unsplash_access_key_here` with your actual Unsplash Access Key.

### Running the Application

**Development mode**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production build**:

```bash
npm run build
npm start
```

**Linting**:

```bash
npm run lint
```

## Project Structure

```
next-galery-app/
├── app/
│   ├── layout.tsx          # Root layout with Poppins font
│   ├── page.tsx            # Home page (Gallery component)
│   └── globals.css         # Global styles
├── components/
│   ├── Gallery.tsx         # Main gallery with search and pagination
│   ├── ImageCard.tsx       # Individual image card with favorite button
│   ├── ImageModal.tsx      # Full-screen modal with zoom
│   ├── SearchBar.tsx       # Search input with clear button
│   ├── LoadingSpinner.tsx  # Loading state component
│   └── ErrorMessage.tsx    # Error state component
├── hooks/
│   ├── useDebounce.ts      # Debounce hook for search
│   ├── useLocalStorage.ts  # localStorage sync hook
│   └── useFavorites.ts     # Favorites management hook
├── lib/
│   └── unsplash.ts         # Unsplash API service
├── types/
│   └── unsplash.ts         # TypeScript interfaces
├── .env.local              # Environment variables (not in git)
└── .env.example            # Example environment variables
```

## Features in Detail

### Search Functionality
- Type in the search bar to search Unsplash photos
- 500ms debounce prevents excessive API calls
- Clear button to reset search
- Results update automatically

### Favorites System
- Click the heart icon to favorite/unfavorite an image
- Optimistic updates for instant feedback
- Favorites persist in localStorage
- Survives browser refresh and closing

### Image Modal
- Click any image to open full-resolution view
- **Zoom controls**: Use +/- buttons or scroll wheel
- **Pan**: Drag the image when zoomed in
- **Keyboard shortcuts**: 
  - `Escape` to close
  - `+/=` to zoom in
  - `-/_` to zoom out
- View photographer details and metadata
- Download original image
- Toggle favorite from modal

### Infinite Scroll
- Automatically loads more images as you scroll
- Loading indicator shows when fetching
- Graceful end-of-results message

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management
- Alt text on all images
- Screen reader friendly

## API Rate Limits

Unsplash API free tier includes:
- 50 requests per hour
- Each search or page load = 1 request

The app implements caching to minimize API calls.

## Troubleshooting

**"NEXT_PUBLIC_UNSPLASH_ACCESS_KEY is not set" warning**:
- Make sure `.env.local` exists in the project root
- Ensure the variable name is exactly `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`
- Restart the development server after adding the key

**Images not loading**:
- Verify your Unsplash API key is valid
- Check your internet connection
- Check browser console for API errors

**TypeScript errors**:
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript version matches `package.json`

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- Photos provided by [Unsplash](https://unsplash.com)
- Icons by [Lucide](https://lucide.dev)
- Built with [Next.js](https://nextjs.org)

## Packages
date-fns | To format timestamps beautifully
lucide-react | For all UI icons
react-hook-form | Form management
@hookform/resolvers | Zod validation for forms
framer-motion | Smooth animations and page transitions

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  display: ["var(--font-display)"],
}

API expects dates as strings in JSON but we'll instantiate them to Date objects for UI formatting.
The /api/jobs/check endpoint is used to manually trigger an RSS feed sync.
Craigslist descriptions may contain raw HTML which will be stripped for safe previewing in the UI.

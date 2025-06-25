# TaleForge

TaleForge is a modern AI-powered chat application built with a full-stack TypeScript architecture. Create multiple chat conversations and interact with AI models through a clean, intuitive interface.

## Features

- **AI-Powered Conversations**: Chat with AI models through OpenRouter integration
- **Multiple Chat Sessions**: Create and manage multiple chat conversations
- **Real-time Updates**: Live chat updates powered by Convex
- **User Authentication**: Secure sign-up and sign-in functionality
- **Responsive Design**: Clean, modern UI built with Tailwind CSS and Radix UI

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) with [React 19](https://react.dev/)
- **Backend**: [Convex](https://convex.dev/) for database and server logic
- **Authentication**: [Convex Auth](https://labs.convex.dev/auth)
- **AI Integration**: [OpenRouter API](https://openrouter.ai/) for LLM access
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) components
- **Type Safety**: Full TypeScript support throughout

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- [OpenRouter API key](https://openrouter.ai/) for AI model access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd taleforge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following environment variables:
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `RP_MODEL`: AI model to use (default: `openai/gpt-4o-mini`)
- `TITLE_MODEL`: Model for generating chat titles (default: `openai/gpt-4o-mini`)
- `SITE_URL`: Your site URL (for development: `http://localhost:3000`)
- `SITE_NAME`: Your site name (default: `TaleForge Chat`)

4. Run the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
taleforge/
├── app/                    # Next.js App Router pages
│   ├── chat/              # Chat-related pages
│   ├── signin/            # Authentication pages
│   └── signup/            
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat-related components
│   └── ui/               # Reusable UI components
├── convex/               # Convex backend functions
│   ├── auth.ts           # Authentication logic
│   ├── chat.ts           # Chat message handling
│   ├── chats.ts          # Chat management
│   ├── messages.ts       # Message CRUD operations
│   ├── openai.ts         # OpenRouter/OpenAI integration
│   └── schema.ts         # Database schema
└── lib/                  # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run dev:frontend` - Start only the Next.js frontend
- `npm run dev:backend` - Start only the Convex backend
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

### Documentation
- [Convex Documentation](https://docs.convex.dev/) - Learn about the backend platform
- [Convex Auth](https://labs.convex.dev/auth) - Authentication documentation
- [Next.js Documentation](https://nextjs.org/docs) - Frontend framework docs
- [OpenRouter API](https://openrouter.ai/docs) - AI model API documentation

### Community
- [Convex Discord](https://convex.dev/community) - Get help and connect with developers
- [Next.js Discord](https://nextjs.org/discord) - Next.js community support

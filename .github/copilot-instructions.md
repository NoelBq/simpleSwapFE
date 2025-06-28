<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SimpleSwap DeFi Frontend

This is a NextJS 15 application for interacting with a SimpleSwap smart contract on Sepolia testnet.

## Tech Stack

- Next.js 15 with App Router
- TypeScript with strict typing
- Wagmi v2 for Ethereum interactions
- Viem for low-level Ethereum operations
- TanStack Query for state management
- Tailwind CSS v4 for styling
- BaseUI components for UI primitives

## Smart Contract Details

- SimpleSwap contract: 0x28AD8571EE183401999cd494955530CFe23fcb20
- USDC Mock token: 0x9C59630783129eBC66839D2993aF9162705dA951
- ETH Mock token: 0x6eb9c04d0A94f87201dc49ec20824d96A353DeAb
- Network: Sepolia testnet

## Key Principles

- Use strict TypeScript with proper typing (no `any` types)
- All smart contract interactions should be typed with the provided ABIs
- Follow wagmi best practices for SSR compatibility
- Use modular, reusable components
- Implement proper error handling and loading states
- Use semantic and accessible HTML

## Component Structure

- `/components/ui/` - Base UI components (Button, Input, etc.)
- `/components/` - Feature-specific components (SwapComponent, LiquidityComponent)
- `/hooks/` - Custom hooks for smart contract interactions
- `/types/` - TypeScript types and contract definitions
- `/lib/` - Utility functions and configuration

## Development Notes

- The app uses Bun as the package manager
- Tailwind CSS v4 is configured with CSS variables
- All contract interactions use proper BigInt handling
- The app is SSR-ready with proper hydration

# SimpleSwap DeFi Frontend

A modern, responsive DeFi frontend for the SimpleSwap protocol built with Next.js 15, TypeScript, and Wagmi. This application allows users to swap tokens and provide liquidity on the Sepolia testnet.

## Features

- 🔄 **Token Swapping**: Instantly swap between USDC and ETH mock tokens
- 💧 **Liquidity Management**: Add and remove liquidity from pools
- 🔗 **Wallet Integration**: Connect with MetaMask, WalletConnect, and Coinbase Wallet
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Real-time Updates**: Live price feeds and balance updates
- 🔒 **Type Safety**: Fully typed with TypeScript and contract ABIs

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript
- **Blockchain**: Wagmi v2, Viem, TanStack Query
- **Styling**: Tailwind CSS v4, BaseUI components
- **Package Manager**: Bun

## Smart Contracts (Sepolia Testnet)

- **SimpleSwap**: `0x28AD8571EE183401999cd494955530CFe23fcb20`
- **USDC Mock**: `0x9C59630783129eBC66839D2993aF9162705dA951`
- **ETH Mock**: `0x6eb9c04d0A94f87201dc49ec20824d96A353DeAb`

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- A Web3 wallet (MetaMask, etc.)
- Sepolia testnet ETH for gas fees

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd simpleswapfrontend
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# Get a project ID from https://cloud.walletconnect.com
NEXT_PUBLIC_WC_PROJECT_ID=your-project-id
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
```

4. Start the development server:

```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Swapping Tokens

1. Connect your wallet using any supported connector
2. Navigate to the Swap tab (default)
3. Select tokens to swap from and to
4. Enter the amount you want to swap
5. Approve token spending if needed
6. Execute the swap

### Managing Liquidity

1. Navigate to the Liquidity tab
2. **Adding Liquidity**:
   - Select token pair (USDC/ETH)
   - Enter amounts for both tokens
   - Approve token spending for both tokens
   - Add liquidity to earn fees
3. **Removing Liquidity**:
   - Enter the amount of liquidity tokens to remove
   - Execute the removal to get back underlying tokens

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── ui/                # Base UI components
│   ├── SwapComponent.tsx   # Token swapping interface
│   ├── LiquidityComponent.tsx # Liquidity management
│   └── WalletConnect.tsx   # Wallet connection
├── hooks/                  # Custom React hooks
│   ├── useSimpleSwap.ts   # Smart contract interactions
│   └── useToken.ts        # ERC20 token operations
├── lib/                   # Utilities and configuration
│   ├── wagmi.ts          # Wagmi configuration
│   └── utils.ts          # Helper functions
├── providers/             # React context providers
├── types/                 # TypeScript type definitions
└── styles/               # Global styles
```

## Key Features

### Type Safety

- All smart contract interactions are fully typed using contract ABIs
- Strict TypeScript configuration prevents runtime errors
- Type-safe token amount handling with proper decimals

### User Experience

- Real-time balance updates
- Slippage protection for trades
- Loading states and error handling
- Responsive design for all devices

### Security

- Proper approval flows for token spending
- Slippage tolerance configuration
- Transaction deadline protection
- Input validation and sanitization

## Development

### Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun type-check` - Run TypeScript compiler

### Code Style

This project follows strict TypeScript and React best practices:

- No `any` types allowed
- Proper error boundaries and loading states
- Modular component architecture
- Custom hooks for business logic
- Semantic HTML and accessibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript typing
4. Test thoroughly on Sepolia testnet
5. Submit a pull request

## Safety Notice

⚠️ **This is a testnet application only**. Do not use real funds or deploy to mainnet without proper security audits.

## License

MIT License - see LICENSE file for details.

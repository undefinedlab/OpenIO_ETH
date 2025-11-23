# OpenIO

OpenIO combines the Next.js frontend from the master branch with the TypeScript helpers and wallet utilities added on main. The repo now ships a paid API client that works with the x402 payment flow, alongside the existing experience scaffolded by `create-next-app`.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The page updates automatically as you edit `app/page.tsx`.

## X402 integration

The SDK files under `src/x402` expect the following environment variables:

| Variable | Description |
| --- | --- |
| `X402_API_BASE_URL` | Base URL for the x402 paid endpoints. |
| `X402_PRIVATE_KEY` | Private key that drives `x402Account`. |

Ensure these are set before invoking `callPaidEndpoint` or importing the wallet helper.

## 0G Storage Integration

The application integrates with 0G Storage for decentralized model storage. When saving models in the builder, they are automatically uploaded to 0G Storage.

### Environment Variables

Add the following to your `.env.local` file:

| Variable | Description | Default |
| --- | --- | --- |
| `ZG_PRIVATE_KEY` | Private key for signing 0G Storage transactions (required) | - |
| `NEXT_PUBLIC_0G_EVM_RPC` | EVM RPC endpoint for 0G | `https://evmrpc-testnet.0g.ai` |
| `NEXT_PUBLIC_0G_INDEXER_RPC` | Indexer RPC endpoint for 0G | `https://indexer-storage-testnet-turbo.0g.ai` |

### Usage

1. Set up your `ZG_PRIVATE_KEY` in `.env.local`
2. When saving a model in the builder, it will:
   - Save to localStorage (always)
   - Upload to 0G Storage (if `ZG_PRIVATE_KEY` is configured)
   - Return a root hash that can be used to retrieve the model later

### Features

- **Automatic Upload**: Models are automatically uploaded to 0G Storage when saved
- **Fallback**: If 0G upload fails, models are still saved locally
- **Root Hash**: Each uploaded model receives a unique root hash for retrieval
- **Storage Utilities**: See `lib/storage.ts` for upload/download functions

For more information, see the [0G Storage Documentation](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## Deploy on Vercel

Deploy the app easily on the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Check out [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

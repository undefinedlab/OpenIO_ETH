<div align="left">

# 🔒 OpenIO - The Privacy Compute Hub

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

[![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)](https://react.dev/)

[![Three.js](https://img.shields.io/badge/Three.js-0.181-green?style=for-the-badge&logo=three.js)](https://threejs.org/)

[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.13-blue?style=for-the-badge)](https://ethers.org/)

[![0G Storage](https://img.shields.io/badge/0G_Storage-0.3.3-purple?style=for-the-badge)](https://docs.0g.ai/)

[![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)](LICENSE)

**One Platform. All Privacy Models. Buildable. Deployable. Composable.**

*A Hugging Face for privacy technologies, with the developer experience of Remix and the workflow composition of n8n.*

[🚀 Explore Models](/dapp/models) • [🛠️ Build Workflows](/dapp/builder) • [📚 Documentation](/docs)

---

</div>

## 🎯 The Problem We Solve

### ⚠️ Three Critical Challenges in Privacy Computation:

<table>
<tr>
<td width="33%">

#### 🔀 **Fragmented Ecosystem**

- **ZK, FHE, and iO** exist as separate, incompatible tools
- **No unified platform** for discovering and using privacy primitives
- **High barrier to entry** requiring deep cryptographic expertise

</td>
<td width="33%">

#### 🧮 **Complexity Barrier**

- **Developers must learn** complex math and circuit design
- **Manual integration** of privacy technologies is error-prone
- **No abstraction layer** between research and application

</td>
<td width="33%">

#### 🚫 **Limited Accessibility**

- **Privacy models** scattered across research papers and repos
- **No standard library** of reusable privacy components
- **Difficult to compose** different privacy primitives together

</td>
</tr>
</table>

### 📊 Market Reality

- **$0** truly unified platforms for ZK, FHE, and iO development
- **Fragmented tooling** across multiple specialized frameworks
- **High expertise requirement** prevents mainstream adoption
- **No composable ecosystem** for privacy-first applications

---

## 🚀 The OpenIO Solution

<div align="left">

**OpenIO is the first unified platform that brings together ZK circuits, FHE models, and iO-sealed logic into a single ecosystem—making cryptographic privacy as accessible and composable as modern AI tooling. We're building the Privacy Compute Hub: a global platform where privacy models live, sealed logic flows, and full applications can be built without touching math or cryptography.**

</div>

### ✨ Key Features:

<table>
<tr>
<td width="50%">

#### 🔍 **Privacy Model Hub**

- Hugging Face-style model discovery
- Browse ZK circuits, FHE models, iO modules
- Fork, remix, and deploy instantly
- Versioned, documented components

#### 🛠️ **Full-Stack Builder**

- **Code Mode**: Write JS/TS/Python/Rust
- **Flow Mode**: Visual graph editor
- Remix ergonomics + n8n composition
- Auto-compile to sealed/encrypted logic

</td>
<td width="50%">

#### 🚢 **Runtime & Deployment**

- One-click deployment across environments
- Cloud, edge, local, enclave, and chain
- Hybrid ZK + FHE + iO pipelines
- Sealed logic execution

#### 🔐 **Complete Privacy**

- Your logic stays private
- Your data stays encrypted
- No math. No circuits. Just building.

</td>
</tr>
</table>

---

## 🛠️ Technical Architecture

### 🔧 Core Technologies

<table>
  <tr>
    <td width="33%" align="center">

#### 🎭 **Zero-Knowledge Proofs**  

**ZK Circuits**  

Proves correctness without exposing inputs

  </td>
    <td width="33%" align="center">

#### 🔐 **Fully Homomorphic Encryption**  

**FHE Models**  

Compute on encrypted data without decrypting

  </td>
    <td width="33%" align="center">

#### 🔒 **Indistinguishability Obfuscation**  

**iO-Sealed Logic**  

Seal logic entirely—run but never understand

  </td>
  </tr>
  <tr>
    <td width="33%" align="center">

#### 🌐 **0G Storage**  

**Decentralized Storage**  

Immutable, distributed model storage

  </td>
    <td width="33%" align="center">

#### 💳 **X402 Payment Flow**  

**Paid API Access**  

Seamless payment integration for premium features

  </td>
    <td width="33%" align="center">

#### ⚛️ **React Flow**  

**Visual Workflow Builder**  

Drag-and-drop graph composition

  </td>
  </tr>
</table>

### The Three-Layer Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Runtime & Deployment                               │
│ - Multi-environment deployment (cloud, edge, local, chain) │
│ - Hybrid ZK + FHE + iO pipeline orchestration             │
│ - Sealed logic execution                                    │
│ - Encrypted data pipelines                                  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Full-Stack Builder                                 │
│ - Code Mode: JS/TS/Python/Rust development                 │
│ - Flow Mode: Visual graph editor                            │
│ - Auto-compilation to sealed/encrypted logic               │
│ - Remix ergonomics + n8n composition                       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Privacy Model Hub                                 │
│ - Global registry of ZK circuits, FHE models, iO modules   │
│ - Hugging Face-style discovery and sharing                 │
│ - Versioned, documented components                         │
│ - Public and private repositories                           │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Use Cases

OpenIO enables developers to build:

### 🔐 **Private AI Models**
Deploy ML models that process encrypted data without decryption

### 🛡️ **Sealed Smart Contracts**
Deploy blockchain logic that can't be reverse-engineered

### 🤝 **Secure Multi-Party Systems**
Build applications where multiple parties compute without exposing data

### 🔒 **Proprietary Algorithm Protection**
Protect your algorithms while allowing execution

### 📊 **Encrypted Data Pipelines**
Process sensitive data without decryption

### 👤 **User-Sovereign Computation**
Enable users to run computations without exposing their data

## 📁 Project Structure

```
OpenIO/
│
├── 📂 app/                    # Next.js App Router
│   ├── 📂 about/             # About page
│   ├── 📂 api/               # API routes
│   │   ├── chat/             # Chat API
│   │   ├── compile/          # Compilation API
│   │   ├── deploy/           # Deployment API
│   │   └── models/           # Model management API
│   ├── 📂 components/         # React components
│   │   ├── CardScanner.tsx
│   │   ├── Navbar.tsx
│   │   └── ThreeBackground.tsx
│   ├── 📂 dapp/              # Main dApp pages
│   │   ├── 📂 builder/       # Visual/code builder
│   │   ├── 📂 deploy/        # Deployment interface
│   │   └── 📂 models/        # Model browser
│   └── 📂 page.tsx           # Homepage
│
├── 📂 lib/                   # Utility libraries
│   └── storage.ts            # 0G Storage utilities
│
├── 📂 src/
│   └── 📂 x402/              # X402 payment SDK
│       ├── client.ts         # API client
│       └── wallet.ts         # Wallet utilities
│
├── 📂 public/                # Static assets
│
├── 📂 0g/                    # 0G Storage integration
│
├── 📂 docs/                  # Documentation
│
└── 📄 README.md

```

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** 18+ 
- **npm**, **yarn**, **pnpm**, or **bun**
- **Git**

### ⚡ Installation

```bash
# Clone the repository
git clone https://github.com/undefinedlab/OpenIO.git
cd OpenIO

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

🌐 Open [http://localhost:3000](http://localhost:3000) to see the application.

### 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Start development server |
| `npm run build` | 🏗️ Build for production |
| `npm run start` | ▶️ Start production server |
| `npm run lint` | 🔍 Run ESLint |

### 🔐 Environment Variables

#### X402 Integration

The SDK files under `src/x402` expect the following environment variables:

| Variable | Description |
| --- | --- |
| `X402_API_BASE_URL` | Base URL for the x402 paid endpoints |
| `X402_PRIVATE_KEY` | Private key that drives `x402Account` |

#### 0G Storage Integration

Add the following to your `.env.local` file:

| Variable | Description | Default |
| --- | --- | --- |
| `ZG_PRIVATE_KEY` | Private key for signing 0G Storage transactions (required) | - |
| `NEXT_PUBLIC_0G_EVM_RPC` | EVM RPC endpoint for 0G | `https://evmrpc-testnet.0g.ai` |
| `NEXT_PUBLIC_0G_INDEXER_RPC` | Indexer RPC endpoint for 0G | `https://indexer-storage-testnet-turbo.0g.ai` |

#### 0G Storage Features

- **Automatic Upload**: Models are automatically uploaded to 0G Storage when saved
- **Fallback**: If 0G upload fails, models are still saved locally
- **Root Hash**: Each uploaded model receives a unique root hash for retrieval
- **Storage Utilities**: See `lib/storage.ts` for upload/download functions

For more information, see the [0G Storage Documentation](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk).

---

## 🤝 Contributing

We're building OpenIO as an open, extensible platform that others can build upon. We're committed to making privacy computation accessible, not proprietary.

### 🚀 Getting Started

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 📋 Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

If this resonates with you, we invite you to help shape the future of private computation. The era of unified privacy platforms is just beginning.

---

## 📚 Learn More

### Privacy Technologies

- **Zero-Knowledge Proofs (ZK)**: Verify correctness without exposing inputs
- **Fully Homomorphic Encryption (FHE)**: Compute on encrypted data without decrypting
- **Indistinguishability Obfuscation (iO)**: Seal logic entirely, making programs that can be run but never understood

### Framework Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub repository](https://github.com/vercel/next.js)

### Related Resources

- [0G Storage Documentation](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk)
- [X402 Documentation](https://x402.dev)

---

## 🚀 Deploy on Vercel

Deploy the app easily on the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 💬 The Manifesto

> We believe privacy is becoming the new standard for computation. A world where developers build with privacy like they build with functions, where cryptography becomes invisible, and where sensitive logic can execute safely anywhere. We want to be the standard library of private computation and the default place developers go when building privacy-first software.
>
> The future of privacy isn't a single primitive — it's the unification of ZK, FHE, and iO into a single developer experience. Our platform is that unification.

---

## ⚠️ Important Notes

### 🔬 Research & Development Stage

> **This project is actively under development and represents an exploration of unified privacy computation platforms. While we strive for production-ready code, some features may be experimental.**

### 🛡️ Security Considerations

- Always review cryptographic implementations before production use
- Test thoroughly in development environments
- Follow security best practices for key management
- Keep dependencies up to date

### 📊 Current Status

- **Active Development**: Core features are being built and refined
- **Community Contributions**: Welcome and encouraged
- **Documentation**: Continuously improving
- **Production Readiness**: Varies by feature

---

<div align="center">

### 🌟 **OpenIO - The Privacy Compute Hub**

**Computation without exposure. Privacy without complexity. A new era of invisible applications.**

**Made with ❤️ by the OpenIO team**

[🌐 Website](https://github.com/undefinedlab/OpenIO) • [📚 Docs](/docs) • [💬 Discussions](https://github.com/undefinedlab/OpenIO/discussions) • [🐛 Issues](https://github.com/undefinedlab/OpenIO/issues)

</div>

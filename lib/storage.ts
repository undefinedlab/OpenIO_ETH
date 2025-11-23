import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk'
import { ethers } from 'ethers'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const EVM_RPC = process.env.NEXT_PUBLIC_0G_EVM_RPC || 'https://evmrpc-testnet.0g.ai'
const INDEXER_RPC = process.env.NEXT_PUBLIC_0G_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai'
const PRIVATE_KEY = process.env.ZG_PRIVATE_KEY || '0x417bb2428a2e3cf31e71b048c9f6780bbbd4edf7ef30f131d53dece22e3f4c6b'

export async function uploadJSONTo0G(data: any, tempFileName: string = 'model.json'): Promise<string> {
  if (!PRIVATE_KEY) {
    throw new Error('ZG_PRIVATE_KEY environment variable is required')
  }

  // Use OS temp directory (works on both Unix and Windows)
  const tempDir = os.tmpdir()
  const tempPath = path.join(tempDir, tempFileName)
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2))

  try {
    const provider = new ethers.JsonRpcProvider(EVM_RPC)
    const signer = new ethers.Wallet(PRIVATE_KEY, provider)
    const indexer = new Indexer(INDEXER_RPC)

    const file = await ZgFile.fromFilePath(tempPath)
    const [tx, err] = await indexer.upload(file, EVM_RPC, signer as any)

    if (err !== null) {
      await file.close()
      throw new Error(`Upload failed: ${err}`)
    }

    const [tree, treeErr] = await file.merkleTree()
    if (treeErr !== null || tree === null) {
      await file.close()
      throw new Error(`Failed to get merkle tree: ${treeErr || 'tree is null'}`)
    }

    const rootHash = tree.rootHash()
    await file.close()

    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
    
    return rootHash
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
    throw error
  }
}

export async function downloadJSONFrom0G(rootHash: string): Promise<any> {
  const indexer = new Indexer(INDEXER_RPC)
  const tempDir = os.tmpdir()
  const tempPath = path.join(tempDir, `download-${Date.now()}.json`)

  const err = await indexer.download(rootHash, tempPath, false)

  if (err !== null) {
    throw new Error(`Download failed: ${err}`)
  }

  try {
    const data = JSON.parse(fs.readFileSync(tempPath, 'utf-8'))
    fs.unlinkSync(tempPath)
    return data
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
    throw error
  }
}


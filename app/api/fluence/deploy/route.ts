import { NextRequest, NextResponse } from 'next/server';

// Fluence API Configuration
const FLUENCE_API_BASE = process.env.FLUENCE_API_BASE || 'https://console.fluence.network/api/v1';
const FLUENCE_API_KEY = process.env.FLUENCE_API_KEY || '98d46caf-914b-4143-b5ce-e9f2a8f2135b';

interface FluenceVMConfig {
  cpu: number;
  memory: number;
  disk: number;
  region?: string;
}

interface DeploymentRequest {
  sourceCode?: string;
  config?: FluenceVMConfig;
}

/**
 * Search for available compute resources on Fluence marketplace
 */
async function searchResources() {
  try {
    const response = await fetch(`${FLUENCE_API_BASE}/resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLUENCE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search resources: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching resources:', error);
    throw error;
  }
}

/**
 * Deploy a VM instance on Fluence Network
 */
async function deployVM(config: FluenceVMConfig) {
  try {
    const response = await fetch(`${FLUENCE_API_BASE}/vms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUENCE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpu: config.cpu || 1,
        memory: config.memory || 512,
        disk: config.disk || 10,
        region: config.region || 'us-east-1',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to deploy VM: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deploying VM:', error);
    throw error;
  }
}

/**
 * Get deployment status
 */
async function getDeploymentStatus(vmId: string) {
  try {
    const response = await fetch(`${FLUENCE_API_BASE}/vms/${vmId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLUENCE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get deployment status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting deployment status:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DeploymentRequest = await request.json();
    
    // Default configuration for test compute
    const defaultConfig: FluenceVMConfig = {
      cpu: 1,
      memory: 512, // MB
      disk: 10,   // GB
    };

    const config = body.config || defaultConfig;

    // Step 1: Search for available resources
    setImmediate(() => {
      searchResources().catch(err => console.error('Resource search error:', err));
    });

    // Step 2: Deploy VM
    const deployment = await deployVM(config);

    return NextResponse.json({
      success: true,
      message: 'VM deployment initiated',
      deploymentId: deployment.id || deployment.vm_id || 'pending',
      config: config,
      deployment: deployment,
      statusUrl: deployment.id ? `${FLUENCE_API_BASE}/vms/${deployment.id}` : null,
    });

  } catch (error) {
    console.error('Fluence deployment error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deployment error',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deploymentId = searchParams.get('id');

    if (!deploymentId) {
      return NextResponse.json({
        success: false,
        error: 'Deployment ID is required',
      }, { status: 400 });
    }

    const status = await getDeploymentStatus(deploymentId);

    return NextResponse.json({
      success: true,
      deploymentId: deploymentId,
      status: status.status || status.state || 'unknown',
      deployment: status,
    });

  } catch (error) {
    console.error('Error getting deployment status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}


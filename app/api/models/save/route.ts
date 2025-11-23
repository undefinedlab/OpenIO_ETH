import { NextRequest, NextResponse } from 'next/server';
import { uploadJSONTo0G } from '../../../../lib/storage';

export async function POST(request: NextRequest) {
  try {
    const modelData = await request.json();
    
    // Upload model to 0G Storage
    const rootHash = await uploadJSONTo0G(
      modelData,
      `openio-model-${modelData.id || Date.now()}.json`
    );
    
    return NextResponse.json({
      success: true,
      rootHash,
      message: 'Model saved to 0G Storage successfully',
      modelId: modelData.id,
    });
  } catch (error) {
    console.error('0G Storage upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload to 0G Storage',
    }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { uploadJSONTo0G } from '../../../../lib/storage';

export async function POST(request: NextRequest) {
  try {
    const modelData = await request.json();
    
    // Create a simple test text object to save to 0G Storage
    const testData = {
      testText: 'This is a simple test text saved to 0G Storage',
      timestamp: new Date().toISOString(),
      modelName: modelData.name || 'Untitled Model',
      modelId: modelData.id || `model-${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    
    // Upload test data to 0G Storage
    const rootHash = await uploadJSONTo0G(
      testData,
      `openio-test-${Date.now()}.json`
    );
    
    console.log('✓ Successfully saved to 0G Storage:', rootHash);
    
    return NextResponse.json({
      success: true,
      rootHash,
      message: 'Test text saved to 0G Storage successfully',
      modelId: modelData.id,
      testData,
    });
  } catch (error) {
    console.error('0G Storage upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload to 0G Storage',
    }, { status: 500 });
  }
}


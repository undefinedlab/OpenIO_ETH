'use client';

import { useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import { models, Model, ModelCategory, getModelsByCategory } from '../../data/models';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function ModelsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const filteredModels = useMemo(() => {
    // Exclude operations from all models
    let filtered = models.filter(m => m.category !== 'operation');

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = getModelsByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(lowerQuery) ||
        model.description.toLowerCase().includes(lowerQuery) ||
        model.author.toLowerCase().includes(lowerQuery) ||
        model.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const nonOperationModels = models.filter(m => m.category !== 'operation');
    return {
      all: nonOperationModels.length,
      zk: getModelsByCategory('zk').length,
      fhe: getModelsByCategory('fhe').length,
      io: getModelsByCategory('io').length,
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="models-page">
        <div className="models-container">
          <div className="models-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">Categories</h3>
              <div className="category-list">
                <button
                  className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <div className="category-info">
                    <span className="category-name">All Models</span>
                    <span className="category-count">{categoryCounts.all}</span>
                  </div>
                </button>
                <button
                  className={`category-item ${selectedCategory === 'zk' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('zk')}
                >
                  <div className="category-info">
                    <span className="category-name">ZK Circuits</span>
                    <span className="category-count">{categoryCounts.zk}</span>
                  </div>
                </button>
                <button
                  className={`category-item ${selectedCategory === 'fhe' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('fhe')}
                >
                  <div className="category-info">
                    <span className="category-name">FHE Engines</span>
                    <span className="category-count">{categoryCounts.fhe}</span>
                  </div>
                </button>
                <button
                  className={`category-item ${selectedCategory === 'io' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('io')}
                >
                  <div className="category-info">
                    <span className="category-name">iO Coprocessors</span>
                    <span className="category-count">{categoryCounts.io}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="models-main">
            <div className="models-header">
              <div>
                <h1 className="models-title">Models</h1>
                <p className="models-count">{filteredModels.length.toLocaleString()} models</p>
              </div>
              <div className="models-search">
                <input
                  type="text"
                  placeholder="Filter by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="models-list">
              {filteredModels.map((model) => (
                <div 
                  key={model.id} 
                  className={`model-item ${model.active === false ? 'model-item-inactive' : ''}`}
                  onClick={() => setSelectedModel(model)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="model-avatar">
                    {model.author[0].toUpperCase()}
                  </div>
                  <div className="model-content">
                    <div className="model-header">
                      <h3 className="model-name">{model.name}</h3>
                      <span className={`model-badge model-badge-${model.category}`}>
                        {model.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="model-author">by {model.author}</p>
                    <p className="model-description">{model.description}</p>
                    {model.tags && model.tags.length > 0 && (
                      <div className="model-tags">
                        {model.tags.map((tag, idx) => (
                          <span key={idx} className="model-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="model-meta">
                      <span className="meta-item">
                        <span className="meta-label">Downloads</span>
                        <span className="meta-value">{model.downloads}</span>
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">Likes</span>
                        <span className="meta-value">{model.likes}</span>
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">Updated</span>
                        <span className="meta-value">{model.updated}</span>
                      </span>
                      {model.parameters && (
                        <span className="meta-item">
                          <span className="meta-label">Parameters</span>
                          <span className="meta-value">{model.parameters}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Model Details Modal */}
      {selectedModel && (
        <div className="model-detail-modal-overlay" onClick={() => setSelectedModel(null)}>
          <div className="model-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="model-detail-header">
              <div className="model-detail-title-section">
                <h2 className="model-detail-title">{selectedModel.name}</h2>
                <span className={`model-detail-badge model-badge-${selectedModel.category}`}>
                  {selectedModel.category.toUpperCase()}
                </span>
              </div>
              <button 
                className="model-detail-close"
                onClick={() => setSelectedModel(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="model-detail-content">
              <div className="model-detail-info">
                <div className="model-detail-section">
                  <h3 className="model-detail-section-title">Overview</h3>
                  <p className="model-detail-description">{selectedModel.description}</p>
                  <div className="model-detail-author">
                    <span className="model-detail-author-avatar">
                      {selectedModel.author[0].toUpperCase()}
                    </span>
                    <span className="model-detail-author-name">by {selectedModel.author}</span>
                  </div>
                </div>

                <div className="model-detail-section">
                  <h3 className="model-detail-section-title">Details</h3>
                  <div className="model-detail-stats">
                    <div className="model-detail-stat">
                      <span className="stat-label">Downloads</span>
                      <span className="stat-value">{selectedModel.downloads}</span>
                    </div>
                    <div className="model-detail-stat">
                      <span className="stat-label">Likes</span>
                      <span className="stat-value">{selectedModel.likes}</span>
                    </div>
                    <div className="model-detail-stat">
                      <span className="stat-label">Updated</span>
                      <span className="stat-value">{selectedModel.updated}</span>
                    </div>
                    {selectedModel.parameters && (
                      <div className="model-detail-stat">
                        <span className="stat-label">Parameters</span>
                        <span className="stat-value">{selectedModel.parameters}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedModel.tags && selectedModel.tags.length > 0 && (
                  <div className="model-detail-section">
                    <h3 className="model-detail-section-title">Tags</h3>
                    <div className="model-detail-tags">
                      {selectedModel.tags.map((tag, idx) => (
                        <span key={idx} className="model-detail-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="model-detail-flow">
                <h3 className="model-detail-section-title">Logic Flow Preview</h3>
                <div className="model-flow-container">
                  <ReactFlow
                    nodes={getModelFlowNodes(selectedModel)}
                    edges={getModelFlowEdges(selectedModel)}
                    fitView
                    className="model-flow"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '8px'
                    }}
                  >
                    <Background />
                    <Controls />
                    <MiniMap 
                      nodeColor={(node) => {
                        const categoryColors = {
                          'zk': '#667eea',
                          'fhe': '#764ba2',
                          'io': '#f093fb',
                          'operation': '#4facfe',
                        };
                        return categoryColors[selectedModel.category as keyof typeof categoryColors] || '#667eea';
                      }}
                      maskColor="rgba(0, 0, 0, 0.7)"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
                  </ReactFlow>
                </div>
              </div>
            </div>

            <div className="model-detail-footer">
              <button className="model-detail-action-btn primary">Use in Builder</button>
              <button className="model-detail-action-btn secondary">Download</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Generate flow nodes based on model category
function getModelFlowNodes(model: Model): Node[] {
  const categoryColors = {
    'zk': '#667eea',
    'fhe': '#764ba2',
    'io': '#f093fb',
    'operation': '#4facfe',
  };

  const color = categoryColors[model.category as keyof typeof categoryColors] || '#667eea';

  const nodes: Node[] = [
    {
      id: 'input',
      type: 'default',
      position: { x: 50, y: 150 },
      data: { label: 'Input' },
      style: {
        background: `linear-gradient(135deg, ${color}15, ${color}25)`,
        border: `2px solid ${color}`,
        borderRadius: '12px',
        color: '#ffffff',
        fontWeight: 600,
        fontSize: '14px',
        padding: '15px 20px',
        minWidth: '120px',
        textAlign: 'center' as const,
      },
    },
    {
      id: 'process',
      type: 'default',
      position: { x: 250, y: 150 },
      data: { label: model.name },
      style: {
        background: `linear-gradient(135deg, ${color}25, ${color}35)`,
        border: `2px solid ${color}`,
        borderRadius: '12px',
        color: '#ffffff',
        fontWeight: 600,
        fontSize: '14px',
        padding: '15px 20px',
        minWidth: '180px',
        textAlign: 'center' as const,
        boxShadow: `0 4px 12px ${color}40`,
      },
    },
    {
      id: 'output',
      type: 'default',
      position: { x: 500, y: 150 },
      data: { label: 'Output' },
      style: {
        background: `linear-gradient(135deg, ${color}15, ${color}25)`,
        border: `2px solid ${color}`,
        borderRadius: '12px',
        color: '#ffffff',
        fontWeight: 600,
        fontSize: '14px',
        padding: '15px 20px',
        minWidth: '120px',
        textAlign: 'center' as const,
      },
    },
  ];

  return nodes;
}

// Generate flow edges
function getModelFlowEdges(model: Model): Edge[] {
  const categoryColors = {
    'zk': '#667eea',
    'fhe': '#764ba2',
    'io': '#f093fb',
    'operation': '#4facfe',
  };

  const color = categoryColors[model.category as keyof typeof categoryColors] || '#667eea';

  return [
    {
      id: 'e1-2',
      source: 'input',
      target: 'process',
      type: 'smoothstep',
      style: {
        stroke: color,
        strokeWidth: 3,
      },
      animated: true,
    },
    {
      id: 'e2-3',
      source: 'process',
      target: 'output',
      type: 'smoothstep',
      style: {
        stroke: color,
        strokeWidth: 3,
      },
      animated: true,
    },
  ];
}


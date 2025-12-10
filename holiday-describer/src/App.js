import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [editableData, setEditableData] = useState({});
  const [showListing, setShowListing] = useState(false);
  const [finalListing, setFinalListing] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Create image preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose an image first.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://76fbp6nkjlowmolrprocdec5qa0eryku.lambda-url.us-east-1.on.aws/describe",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(res.data);
      setEditableData(res.data); // Initialize editable data with API response
    } catch (err) {
      console.error(err);
      setError("Error fetching description. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    color: '#333'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    marginBottom: '2rem'
  };

  const titleStyle = {
    textAlign: 'center',
    color: '#2c3e50',
    fontSize: '2.5rem',
    fontWeight: '600',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  };

  const uploadAreaStyle = {
    border: '2px dashed #667eea',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    background: '#f8f9ff',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    marginBottom: '1.5rem'
  };

  const fileInputStyle = {
    display: 'none'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    width: '100%',
    marginTop: '1rem'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    background: '#ccc',
    cursor: 'not-allowed',
    boxShadow: 'none'
  };

  const imagePreviewStyle = {
    maxWidth: '300px',
    maxHeight: '200px',
    borderRadius: '8px',
    margin: '1rem auto',
    display: 'block',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  };

  const resultStyle = {
    marginTop: '2rem',
    textAlign: 'left',
    background: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #e9ecef'
  };

  const errorStyle = {
    color: '#e74c3c',
    background: '#ffeaea',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #f5c6cb',
    marginTop: '1rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    marginTop: '0.5rem',
    transition: 'border-color 0.3s ease',
    background: 'white'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
    lineHeight: '1.6'
  };

  const tagInputStyle = {
    ...inputStyle,
    marginBottom: '0.5rem'
  };

  const saveButtonStyle = {
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
    marginTop: '1.5rem',
    marginRight: '1rem'
  };

  const submitButtonStyle = {
    background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)',
    marginTop: '1.5rem'
  };

  const listingStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  };

  const listingImageStyle = {
    width: '100%',
    maxWidth: '400px',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
  };

  const priceStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#dc3545',
    margin: '1rem 0'
  };

  const badgeStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'inline-block',
    marginBottom: '1rem'
  };

  const updateField = (field, value) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateTags = (tagsString) => {
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    updateField('tags', tagsArray);
  };

  const updateHighlights = (highlightsString) => {
    const highlightsArray = highlightsString.split('\n').map(highlight => highlight.trim()).filter(highlight => highlight);
    updateField('highlights', highlightsArray);
  };

  const handleSubmitListing = () => {
    setFinalListing({
      ...editableData,
      image: imagePreview,
      submittedAt: new Date().toLocaleString()
    });
    setShowListing(true);
  };

  const resetApp = () => {
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setEditableData({});
    setShowListing(false);
    setFinalListing(null);
    setError("");
  };

  if (showListing && finalListing) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ ...titleStyle, marginBottom: 0 }}>
              <span>✅</span>
              Product Listed Successfully!
            </h1>
            <button
              onClick={resetApp}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Create New Listing
            </button>
          </div>
          
          <div style={listingStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
              <div>
                {finalListing.image && (
                  <img 
                    src={finalListing.image} 
                    alt={finalListing.product_name}
                    style={listingImageStyle}
                  />
                )}
                
                {finalListing.tags && finalListing.tags.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {finalListing.tags.map((tag, index) => (
                        <span 
                          key={index}
                          style={{
                            background: '#e8f5e8',
                            color: '#2d5a2d',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            border: '1px solid #c8e6c9'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div style={badgeStyle}>
                  {finalListing.product_category}
                </div>
                
                <h2 style={{ 
                  color: '#2c3e50', 
                  fontSize: '2rem', 
                  marginBottom: '1rem',
                  fontWeight: '700'
                }}>
                  {finalListing.product_name}
                </h2>
                
                <div style={priceStyle}>
                  $49.99 <span style={{ fontSize: '1rem', color: '#6c757d', textDecoration: 'line-through' }}>$59.99</span>
                </div>
                
                <p style={{ 
                  color: '#495057', 
                  lineHeight: '1.6', 
                  fontSize: '1.1rem',
                  marginBottom: '1.5rem'
                }}>
                  {finalListing.product_description}
                </p>
                
                {finalListing.highlights && finalListing.highlights.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: '#2c3e50', marginBottom: '0.75rem' }}>Key Features:</h4>
                    <ul style={{ paddingLeft: '1.5rem', color: '#495057' }}>
                      {finalListing.highlights.map((highlight, index) => (
                        <li key={index} style={{ marginBottom: '0.5rem' }}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {finalListing.brand && (
                  <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                    <strong>Brand:</strong> {finalListing.brand}
                  </p>
                )}
                
                {finalListing.holiday && (
                  <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                    <strong>Perfect for:</strong> {finalListing.holiday}
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
                    flex: 1
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>🛒</span>
                    Add to Cart
                  </button>
                  
                  <button style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                    boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)',
                    flex: 1
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>⚡</span>
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <small style={{ color: '#6c757d' }}>
                Listed on {finalListing.submittedAt} | Generated by AI Product Describer
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          <span>🎄</span>
          Holiday Product Describer
        </h1>
        
        <div style={uploadAreaStyle} onClick={() => document.getElementById('fileInput').click()}>
          <input 
            id="fileInput"
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            style={fileInputStyle}
          />
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
          <p style={{ margin: 0, fontSize: '1.1rem', color: '#667eea' }}>
            {file ? file.name : 'Click to upload product image'}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
            Supports PNG, JPG, JPEG formats
          </p>
        </div>

        {imagePreview && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Preview:</h4>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={imagePreviewStyle}
            />
          </div>
        )}

        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          style={!file || loading ? disabledButtonStyle : buttonStyle}
          onMouseOver={(e) => {
            if (!(!file || loading)) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }
          }}
          onMouseOut={(e) => {
            if (!(!file || loading)) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }
          }}
        >
          {loading ? (
            <span>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}>⏳</span>
              Analyzing Product...
            </span>
          ) : (
            <span>
              <span style={{ marginRight: '0.5rem' }}>🚀</span>
              Generate Product Description
            </span>
          )}
        </button>

        {error && (
          <div style={errorStyle}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}
      </div>

      {result && (
        <div style={cardStyle}>
          <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✨</span>
            AI Generated Product Details:
          </h3>
          <div style={resultStyle}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <strong style={{ color: '#667eea' }}>Product Name:</strong>
                <input
                  type="text"
                  value={editableData.product_name || ''}
                  onChange={(e) => updateField('product_name', e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  placeholder="Enter product name..."
                />
              </div>
              
              <div>
                <strong style={{ color: '#667eea' }}>Description:</strong>
                <textarea
                  value={editableData.product_description || ''}
                  onChange={(e) => updateField('product_description', e.target.value)}
                  style={textareaStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  placeholder="Enter detailed product description..."
                />
              </div>
              
              <div>
                <strong style={{ color: '#667eea' }}>Category:</strong>
                <input
                  type="text"
                  value={editableData.product_category || ''}
                  onChange={(e) => updateField('product_category', e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  placeholder="Enter product category..."
                />
              </div>
              
              <div>
                <strong style={{ color: '#667eea' }}>Highlights:</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  Enter each highlight on a new line
                </p>
                <textarea
                  value={editableData.highlights ? editableData.highlights.join('\n') : ''}
                  onChange={(e) => updateHighlights(e.target.value)}
                  style={textareaStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  placeholder="Enter highlights, one per line..."
                />
                {editableData.highlights && editableData.highlights.length > 0 && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <small style={{ color: '#666' }}>Preview:</small>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      {editableData.highlights.map((highlight, index) => (
                        <li key={index} style={{ marginBottom: '0.25rem' }}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <strong style={{ color: '#667eea' }}>Tags:</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  Enter tags separated by commas
                </p>
                <input
                  type="text"
                  value={editableData.tags ? editableData.tags.join(', ') : ''}
                  onChange={(e) => updateTags(e.target.value)}
                  style={tagInputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  placeholder="Enter tags separated by commas..."
                />
                {editableData.tags && editableData.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {editableData.tags.map((tag, index) => (
                      <span 
                        key={index}
                        style={{
                          background: '#e8f5e8',
                          color: '#2d5a2d',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          border: '1px solid #c8e6c9'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <strong style={{ color: '#667eea' }}>Brand:</strong>
                <input
                  type="text"
                  value={editableData.brand || ''}
                  onChange={(e) => updateField('brand', e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  placeholder="Enter brand name..."
                />
              </div>
              
              <div>
                <strong style={{ color: '#667eea' }}>Holiday:</strong>
                <input
                  type="text"
                  value={editableData.holiday || ''}
                  onChange={(e) => updateField('holiday', e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  placeholder="Enter holiday (e.g., Christmas, Halloween)..."
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                style={saveButtonStyle}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
                }}
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(editableData, null, 2));
                  alert('Product data copied to clipboard!');
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>📋</span>
                Copy Data
              </button>
              
              <button
                style={submitButtonStyle}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.4)';
                }}
                onClick={handleSubmitListing}
              >
                <span style={{ marginRight: '0.5rem' }}>🚀</span>
                Submit Product Listing
              </button>
            </div>
            
            <details style={{ marginTop: '2rem' }}>
              <summary style={{ cursor: 'pointer', color: '#667eea', fontWeight: '600' }}>
                View Original AI Response
              </summary>
              <pre style={{ 
                background: '#f1f3f4', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginTop: '1rem',
                overflow: 'auto',
                fontSize: '0.85rem'
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
            
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', color: '#28a745', fontWeight: '600' }}>
                View Current Edited Data
              </summary>
              <pre style={{ 
                background: '#f8fff8', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginTop: '1rem',
                overflow: 'auto',
                fontSize: '0.85rem',
                border: '1px solid #c3e6cb'
              }}>
                {JSON.stringify(editableData, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
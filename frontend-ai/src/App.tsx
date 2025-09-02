import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { Sparkles, Image, Zap } from 'lucide-react';
import './App.css';

const App: React.FC = () => {
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const generateThumbnail = async () => {
    if (!videoTitle.trim()) {
      setError("Please enter a video title.");
      return;
    }
    setLoading(true);
    setError(null);
    setImageUrl("");
    
    try {
      const token = await getToken();
      const response = await fetch('http://127.0.0.1:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: videoTitle })
      });
      
      if (!response.ok) {
        const errorData: { error: string } = await response.json();
        throw new Error(errorData.error || "Failed to generate image.");
      }
      
      const imageBlob = await response.blob();
      setImageUrl(URL.createObjectURL(imageBlob));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoTitle(e.target.value);
    if (error) setError(null); // Clear error when user starts typing
  };

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `thumbnail-${videoTitle.slice(0, 30)}.png`;
      link.click();
    }
  };

  return (
    <div className="main-container">
      <header className="app-header">
        <div className="logo">
          <h2>✨ Thumbnail AI</h2>
        </div>
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/" 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10",
                userButtonPopoverCard: "shadow-xl border-0",
              }
            }}
          />
        </SignedIn>
      </header>
      
      <main className="app-main">
        <SignedIn>
          <div className="generator-view">
            <section className="generator-controls">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-yellow-500" size={24} />
                <h1>Create Viral Thumbnails</h1>
              </div>
              <p>Transform your video ideas into eye-catching thumbnails that drive clicks and engagement. Just describe your content and watch AI bring it to life.</p>
              
              <div className="input-group">
                <div className="relative">
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={handleTitleChange}
                    placeholder="e.g., 'Epic space battle with dragons and lasers'"
                    onKeyDown={(e) => e.key === 'Enter' && !loading && generateThumbnail()}
                    className={error ? 'border-red-300 bg-red-50' : ''}
                  />
                </div>
                
                <button 
                  onClick={generateThumbnail} 
                  disabled={loading || !videoTitle.trim()}
                  className="generate-btn"
                >
                  <Sparkles size={20} />
                  <span>{loading ? 'Creating Magic...' : 'Generate Thumbnail'}</span>
                </button>
              </div>
              
              {error && (
                <div className="error-message">
                  <strong>Oops!</strong> {error}
                </div>
              )}

              {imageUrl && !loading && (
                <button 
                  onClick={downloadImage}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  <Image size={18} />
                  Download Thumbnail
                </button>
              )}
            </section>
            
            <section className="image-display-area">
              <div className={`image-placeholder ${loading ? 'loading' : ''} ${imageUrl ? 'has-image' : ''}`}>
                {loading && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="spinner"></div>
                    <p className="text-gray-600 font-medium">Generating your thumbnail...</p>
                  </div>
                )}
                
                {imageUrl && !loading && (
                  <div className="w-full h-full relative group">
                    <img 
                      src={imageUrl} 
                      alt="Generated Thumbnail" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                        Click to view full size
                      </div>
                    </div>
                  </div>
                )}
                
                {!imageUrl && !loading && (
                  <div className="empty-state">
                    <div className="mb-4">
                      <Image size={48} className="text-gray-400 mx-auto mb-2" />
                    </div>
                    <p className="text-lg font-medium text-gray-500">Your stunning thumbnail will appear here</p>
                    <p className="text-sm text-gray-400 mt-1">Enter a description and hit generate to see the magic</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </SignedIn>

        <SignedOut>
          <div className="hero-section">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="text-purple-600" size={32} />
                <Image className="text-blue-600" size={32} />
              </div>
              <h1>Instantly Generate Click-Worthy Thumbnails with AI</h1>
            </div>
            <p className="subtitle">
              Transform simple video descriptions into stunning, professional thumbnails that grab attention and drive clicks. 
              Join thousands of creators already using AI to boost their content.
            </p>
            <div className="mb-6">
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <Zap size={20} />
                  Start Creating for Free
                </button>
              </SignInButton>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Sparkles size={16} className="text-yellow-500" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={16} className="text-blue-500" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-1">
                <Image size={16} className="text-green-500" />
                <span>High Quality</span>
              </div>
            </div>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}

export default App;
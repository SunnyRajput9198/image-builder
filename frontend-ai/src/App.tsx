// App.tsx

import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { Sparkles, Image, Zap } from 'lucide-react';
import './index.css'; // Make sure this is imported

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
    if (error) setError(null);
  };

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `thumbnail-${videoTitle.slice(0, 30).replace(/\s/g, '_')}.png`;
      link.click();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#111015 text-gray-200 font-sans overflow-hidden">
      <header className="flex justify-between items-center p-4 md:p-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-400" />
          <h2 className="text-xl font-bold">Thumbnail AI</h2>
        </div>
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/" 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10",
                userButtonPopoverCard: "shadow-xl border-gray-700 bg-gray-800 text-white",
              }
            }}
          />
        </SignedIn>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <SignedIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl mx-auto">
            {/* Controls Section */}
            <section className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-yellow-400" size={32} />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create Viral Thumbnails</h1>
              </div>
              <p className="text-gray-400 mb-6">Transform your video ideas into eye-catching thumbnails that drive clicks and engagement. Just describe your content and watch AI bring it to life.</p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={videoTitle}
                  onChange={handleTitleChange}
                  placeholder="e.g., 'Epic space battle with dragons'"
                  onKeyDown={(e) => e.key === 'Enter' && !loading && generateThumbnail()}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-500 ${error ? 'border-red-500 bg-red-500/10' : ''}`}
                />
                <button 
                  onClick={generateThumbnail} 
                  disabled={loading || !videoTitle.trim()}
                  className="generate-btn flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Sparkles size={20} />
                  <span>{loading ? 'Creating...' : 'Generate'}</span>
                </button>
              </div>
              
              {error && (
                <div className="mt-3 p-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              {imageUrl && !loading && (
                <button 
                  onClick={downloadImage}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  <Image size={18} />
                  Download Thumbnail
                </button>
              )}
            </section>
            
            {/* Image Display Section */}
            <section className="flex items-center justify-center">
              <div className="w-full aspect-video bg-black/20 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center text-center p-4 transition-all duration-300">
                {loading && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="spinner"></div>
                    <p className="text-gray-400 font-medium">Generating your thumbnail...</p>
                  </div>
                )}
                
                {imageUrl && !loading && (
                  <img 
                    src={imageUrl} 
                    alt="Generated Thumbnail" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
                
                {!imageUrl && !loading && (
                  <div className="flex flex-col items-center text-gray-500">
                    <Image size={48} className="mb-4" />
                    <p className="text-lg font-medium text-gray-400">Your stunning thumbnail will appear here</p>
                    <p className="text-sm mt-1">Enter a description to see the magic</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </SignedIn>

        <SignedOut>
          <div className="flex flex-col items-center justify-center text-center max-w-3xl">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Sparkles className="text-purple-400" size={40} />
              <Image className="text-blue-400" size={40} />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-4">Instantly Generate Click-Worthy Thumbnails</h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8">
              Transform simple video descriptions into stunning, professional thumbnails that grab attention and drive clicks.
            </p>
            <SignInButton mode="modal">
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 transform hover:-translate-y-1">
                <Zap size={20} />
                Start Creating for Free
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}

export default App;
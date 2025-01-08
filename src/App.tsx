import React, { useState, useEffect } from 'react';
import { FileText, BarChart, Volume2 } from 'lucide-react';
import { SpaceScene } from './components/SpaceScene';

function App() {
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const handlePointerLockChange = () => {
      setShowControls(document.pointerLockElement === null);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className={showControls ? 'blur-sm' : ''}>
        <SpaceScene />
      </div>
      
      {showControls && (
        <>
          {/* Navigation */}
          <nav className="absolute top-4 left-4 z-10">
            <ul className="flex gap-2">
              <li>
               <a
                  href="https://x.com/FractalAiSolana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800/90 transition-colors flex items-center gap-2 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                  </svg>
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/FractalAISOL/FractalAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800/90 transition-colors flex items-center gap-2 text-sm"
                >
                  <FileText size={14} />
                  Docs
                </a>
              </li>
              <li>
                <a
                  href="https://pump.fun/coin/HCEzcbfwuTr7fjV2MFGe1quXjMCHq1tRYQbHzDSpump"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800/90 transition-colors flex items-center gap-2 text-sm"
                >
                  <BarChart size={14} />
                  Chart
                </a>
              </li>
            </ul>
          </nav>

          {/* Controls UI */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-zinc-900/95 backdrop-blur-sm p-8 rounded-lg text-center space-y-8 w-[320px]">
              <h1 className="text-xl font-normal tracking-wide text-gray-300">
                CLICK TO LOOK AROUND
              </h1>

              <div className="space-y-2">
                <div className="flex justify-center gap-2">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-gray-300">
                    W
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-gray-300">
                    A
                  </div>
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-gray-300">
                    S
                  </div>
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-gray-300">
                    D
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">MOVEMENT</p>
              </div>

              <div className="space-y-2">
                <div className="px-6 py-2 bg-zinc-800 rounded-lg inline-block text-gray-300">
                  MOUSE
                </div>
                <p className="text-sm text-gray-500">LOOK AROUND</p>
              </div>

              <div className="space-y-2">
                <div className="px-6 py-2 bg-zinc-800 rounded-lg inline-block text-gray-300">
                  ESC
                </div>
                <p className="text-sm text-gray-500">EXIT CAMERA</p>
              </div>
            </div>
          </div>

          {/* Volume Control */}
          <div className="absolute bottom-4 right-4">
            <button className="p-2 rounded-md bg-zinc-900/90 hover:bg-zinc-800/90 transition-colors">
              <Volume2 size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;


import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon } from './components/icons';
import ThemeToggle from './components/ThemeToggle';
import HomePage from './HomePage';
import DetectorPage from './DetectorPage';
import IncidentResponsePage from './IncidentResponsePage';
import LearningArenaPage from './LearningArenaPage';
import NewsPage from './NewsPage';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
      window.scrollTo(0, 0); // Scroll to top on page change
    };

    window.addEventListener('hashchange', handleHashChange);
    // Set initial route
    if (!route) {
      window.location.hash = '#/';
    }
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };
  
  let CurrentPage;
  switch (route) {
    case '#/detector':
      CurrentPage = <DetectorPage />;
      break;
    case '#/incident-response':
      CurrentPage = <IncidentResponsePage />;
      break;
    case '#/learning-arena':
      CurrentPage = <LearningArenaPage />;
      break;
    case '#/news':
        CurrentPage = <NewsPage />;
        break;
    default:
      CurrentPage = <HomePage onNavigateToDetector={() => navigateTo('#/detector')} />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex justify-between items-center h-16">
              {/* Left Side */}
              <div className="flex items-center space-x-4">
                <a href="#/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }} className="flex items-center space-x-2 cursor-pointer">
                  <ShieldCheckIcon className="w-7 h-7 text-green-500" />
                  <span className="text-md font-bold text-gray-800 dark:text-gray-200 hidden sm:block">Cyber Secure</span>
                </a>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
                <nav className="hidden md:flex items-center space-x-4">
                    <a href="#/detector" onClick={(e) => { e.preventDefault(); navigateTo('/detector'); }} className={`font-semibold transition-colors ${route === '#/detector' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                        Scam Detector AI
                    </a>
                     <a href="#/incident-response" onClick={(e) => { e.preventDefault(); navigateTo('/incident-response'); }} className={`font-semibold transition-colors ${route === '#/incident-response' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                        Incident Response AI
                    </a>
                    <a href="#/learning-arena" onClick={(e) => { e.preventDefault(); navigateTo('/learning-arena'); }} className={`font-semibold transition-colors ${route === '#/learning-arena' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                        Learning Arena
                    </a>
                     <a href="#/news" onClick={(e) => { e.preventDefault(); navigateTo('/news'); }} className={`font-semibold transition-colors ${route === '#/news' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                        Latest News
                    </a>
                </nav>
              </div>

              {/* Right Side */}
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        {CurrentPage}
    </div>
  );
};

export default App;

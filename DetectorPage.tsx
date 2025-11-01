import React, { useState, useEffect } from 'react';
import { AnalysisResult as AnalysisResultType } from './types';
import { analyzeContent, fileToBase64 } from './services/geminiService';
import InputArea from './components/InputArea';
import AnalysisResultDisplay from './components/AnalysisResult';
import BadgeModal from './components/BadgeModal';
import { BotIcon } from './components/icons';
import useLocalStorage from './hooks/useLocalStorage';

const DetectorPage: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Badge logic
  const [detectionCount, setDetectionCount] = useLocalStorage('detectionCount', 0);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState<{ title: string, description: string } | null>(null);

  const badges = [
    { count: 1, title: "Rookie Detective", description: "You've completed your first scam analysis! Welcome to the fight against fraud." },
    { count: 5, title: "Scam Spotter", description: "You've analyzed 5 potential scams. Your skills are growing!" },
    { count: 10, title: "Cyber Guardian", description: "10 detections! You're becoming a key protector of the digital world." },
  ];

  useEffect(() => {
    const earned = badges.find(b => b.count === detectionCount);
    if (earned) {
      setBadgeEarned(earned);
      setShowBadgeModal(true);
    }
  }, [detectionCount]);

  const handleSubmit = async () => {
    if (!userInput && !imageFile) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        mimeType = imageFile.type;
      }

      const analysisResult = await analyzeContent(userInput, imageBase64, mimeType);
      setResult(analysisResult);
      setDetectionCount(prev => prev + 1);

    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main id="main-app" className="container mx-auto px-4 pb-16 max-w-4xl relative">
        <header className="pt-24 pb-8 text-center">
          <div className="inline-flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full mb-4">
            <BotIcon className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            Ready to Analyze?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Got a suspicious message? Paste it here or upload a screenshot. Our AI will analyze it for signs of a scam and give you a risk report.
          </p>
        </header>

        <div className="mt-8">
          <InputArea
            userInput={userInput}
            setUserInput={setUserInput}
            imageFile={imageFile}
            setImageFile={setImageFile}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading && (
            <div className="text-center p-8">
                <div className="inline-block w-12 h-12 border-4 border-t-purple-600 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Analyzing content... This might take a moment.</p>
            </div>
        )}

        {result && <AnalysisResultDisplay result={result} />}
      </main>

      {showBadgeModal && badgeEarned && (
          <BadgeModal 
              title={badgeEarned.title}
              description={badgeEarned.description}
              onClose={() => setShowBadgeModal(false)}
          />
      )}
    </>
  );
};

export default DetectorPage;

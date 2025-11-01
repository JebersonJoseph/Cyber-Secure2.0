import React from 'react';
import ScrollStory from './components/ScrollStory';

interface HomePageProps {
  onNavigateToDetector: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToDetector }) => {
  return <ScrollStory onNavigateToDetector={onNavigateToDetector} />;
};

export default HomePage;

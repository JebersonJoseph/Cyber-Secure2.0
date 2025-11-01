
import React, { useState } from 'react';
import { BookOpenIcon, BrainIcon, PlusIcon } from './components/icons';
import { ARTICLES, QUIZZES, Quiz, Article } from './data/learningData';
import QuizRunner from './components/QuizRunner';
import useLocalStorage from './hooks/useLocalStorage';
import ArticleModal from './components/ArticleModal';
import CreateArticleModal from './components/CreateArticleModal';
import CreateQuizModal from './components/CreateQuizModal';

type QuizProgress = {
    [quizId: string]: {
        highScore: number;
        lastScore: number;
        attempts: number;
    }
}

const LearningArenaPage: React.FC = () => {
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [quizProgress, setQuizProgress] = useLocalStorage<QuizProgress>('quizProgress', {});
    
    // State for custom content
    const [customArticles, setCustomArticles] = useLocalStorage<Article[]>('customArticles', []);
    const [customQuizzes, setCustomQuizzes] = useLocalStorage<Quiz[]>('customQuizzes', []);

    // State for modals
    const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
    const [isCreateArticleModalOpen, setCreateArticleModalOpen] = useState(false);
    const [isCreateQuizModalOpen, setCreateQuizModalOpen] = useState(false);

    const allArticles = [...ARTICLES, ...customArticles];
    const allQuizzes = [...QUIZZES, ...customQuizzes];

    const handleQuizComplete = (quizId: string, score: number, totalQuestions: number) => {
        const percentage = Math.round((score / totalQuestions) * 100);
        
        setQuizProgress(prev => {
            const existing = prev[quizId] || { highScore: 0, attempts: 0 };
            return {
                ...prev,
                [quizId]: {
                    highScore: Math.max(existing.highScore, percentage),
                    lastScore: percentage,
                    attempts: existing.attempts + 1,
                }
            };
        });
        setActiveQuiz(null); // Return to quiz list
    };

    const handleSaveArticle = (newArticle: Omit<Article, 'id'>) => {
        setCustomArticles(prev => [...prev, { ...newArticle, id: `custom-article-${Date.now()}` }]);
        setCreateArticleModalOpen(false);
    };

    const handleSaveQuiz = (newQuiz: Omit<Quiz, 'id'>) => {
        setCustomQuizzes(prev => [...prev, { ...newQuiz, id: `custom-quiz-${Date.now()}` }]);
        setCreateQuizModalOpen(false);
    };


    if (activeQuiz) {
        return <QuizRunner quiz={activeQuiz} onComplete={(score, total) => handleQuizComplete(activeQuiz.id, score, total)} onExit={() => setActiveQuiz(null)} />;
    }

    return (
        <>
            <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
                <header className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-green-100 dark:bg-green-900/50 p-3 rounded-full mb-4">
                        <BookOpenIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                        Learning Arena
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Sharpen your cybersecurity skills with our collection of articles and quizzes.
                    </p>
                </header>

                {/* Articles Section */}
                <section id="articles" className="mb-16">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <BookOpenIcon className="w-8 h-8 mr-3 text-purple-500" />
                            Knowledge Base
                        </h2>
                        <button onClick={() => setCreateArticleModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm">
                            <PlusIcon className="w-5 h-5" />
                            Create Article
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allArticles.map(article => (
                            <div 
                                key={article.id} 
                                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-shadow hover:shadow-xl cursor-pointer" 
                                onClick={() => setViewingArticle(article)}
                            >
                                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    <img 
                                        src={article.imageUrl} 
                                        alt={`Illustration for ${article.title}`} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{article.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 h-10 overflow-hidden">{article.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quizzes Section */}
                <section id="quizzes" className="mb-16">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <BrainIcon className="w-8 h-8 mr-3 text-purple-500" />
                            Test Your Skills
                        </h2>
                        <button onClick={() => setCreateQuizModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm">
                            <PlusIcon className="w-5 h-5" />
                            Create Quiz
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {allQuizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col justify-between transition-shadow hover:shadow-lg">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{quiz.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{quiz.questions.length} Questions</p>
                                    {quizProgress[quiz.id] && (
                                        <div className="mt-3 text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 p-2 rounded-md">
                                            High Score: {quizProgress[quiz.id].highScore}%
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setActiveQuiz(quiz)} className="mt-4 w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                                    Start Quiz
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <ArticleModal article={viewingArticle} onClose={() => setViewingArticle(null)} />
            <CreateArticleModal isOpen={isCreateArticleModalOpen} onClose={() => setCreateArticleModalOpen(false)} onSave={handleSaveArticle} />
            <CreateQuizModal isOpen={isCreateQuizModalOpen} onClose={() => setCreateQuizModalOpen(false)} onSave={handleSaveQuiz} />
        </>
    );
};

export default LearningArenaPage;


import React, { useState, useEffect } from 'react';
import { NewspaperIcon } from './components/icons';
import { fetchCybersecurityNews } from './services/geminiService';
import { NewsArticle } from './types';

const NewsPage: React.FC = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadNews = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fetchedArticles = await fetchCybersecurityNews();
                const articlesWithIds = fetchedArticles.map((article, index) => ({
                    ...article,
                    id: `news-${index}-${Date.now()}`
                }));
                setArticles(articlesWithIds);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch news articles. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadNews();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center py-20">
                    <div className="inline-block w-12 h-12 border-4 border-t-red-600 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Fetching latest cybersecurity news...</p>
                </div>
            );
        }
    
        if (error) {
             return (
                 <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 rounded-lg max-w-4xl mx-auto">
                    <strong>Error:</strong> {error}
                </div>
             );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map(article => (
                    <div key={article.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-shadow flex flex-col">
                        <img src={article.imageUrl} alt={article.title} className="h-48 w-full object-cover bg-gray-200 dark:bg-gray-700" />
                        <div className="p-6 flex-grow flex flex-col">
                            <div>
                                <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold">{article.source}</div>
                                <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white line-clamp-3">{article.title}</h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex-grow line-clamp-4">{article.summary}</p>
                            </div>
                             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                     <p className="text-xs text-gray-500 dark:text-gray-400">{article.publishedDate}</p>
                                     <a 
                                        href={article.articleUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                                    >
                                        Read More &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
            <header className="text-center mb-12">
                <div className="inline-flex items-center justify-center bg-red-100 dark:bg-red-900/50 p-3 rounded-full mb-4">
                    <NewspaperIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                    Latest Cybersecurity News
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Stay informed about the latest threats, breaches, and security updates from around the web.
                </p>
            </header>
            {renderContent()}
        </main>
    );
};

export default NewsPage;

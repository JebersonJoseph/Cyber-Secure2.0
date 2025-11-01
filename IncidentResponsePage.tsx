

import React, { useState, useEffect, useRef } from 'react';
import { classifyIncident } from './services/geminiService';
// FIX: Imported ShieldCheckIcon to resolve 'Cannot find name' error.
import { 
    BotIcon, ChatBubbleIcon, DownloadIcon, SendIcon, ShieldCheckIcon
} from './components/icons';
import { PLAYBOOKS, IncidentTypeIcon, PlaybookStep } from './data/incidentPlaybooks';

type Message = {
    sender: 'user' | 'bot';
    text?: string;
    component?: React.ReactNode;
};

const IncidentResponsePage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: "Welcome to the Incident Response AI. Please describe the security issue you're facing." }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const [incidentType, setIncidentType] = useState<string | null>(null);
    const [playbook, setPlaybook] = useState<PlaybookStep[] | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [reportLogs, setReportLogs] = useState<string[]>([]);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleUserSubmit = async () => {
        if (!userInput.trim() || isAnalyzing || incidentType) return;

        const newUserMessage: Message = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsAnalyzing(true);
        setReportLogs(prev => [...prev, `User Report: ${userInput}`]);

        try {
            const classification = await classifyIncident(userInput);
            const { incidentType: type, summary, severity } = classification;
            
            setIncidentType(type);
            const selectedPlaybook = PLAYBOOKS[type] || PLAYBOOKS['Unknown'];
            setPlaybook(selectedPlaybook);
            
            const botResponse: Message = { sender: 'bot', text: `Analysis complete. It looks like a potential ${type} incident with ${severity} severity. Summary: "${summary}".\n\nLet's begin the response playbook. Please follow each step carefully.`};
            setMessages(prev => [...prev, botResponse]);
            setReportLogs(prev => [...prev, `AI Analysis: Classified as ${type} (${severity}). Summary: ${summary}`]);

            // Add the first step
            addNextStepMessage(selectedPlaybook, 0);

        } catch (error) {
            console.error(error);
            const errorResponse: Message = { sender: 'bot', text: "Sorry, I couldn't analyze the incident. Please try rephrasing your description." };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const addNextStepMessage = (currentPlaybook: PlaybookStep[], stepIndex: number) => {
        const step = currentPlaybook[stepIndex];
        const stepMessage: Message = {
            sender: 'bot',
            component: (
                <div>
                    <h4 className="font-bold text-lg mb-2 flex items-center">
                        <step.icon className="w-6 h-6 mr-2" /> Step {stepIndex + 1}: {step.title}
                    </h4>
                    <p>{step.description}</p>
                    <div className="mt-4 flex space-x-2">
                        <button onClick={() => handleStepConfirmation(true)} className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700">Yes, Completed</button>
                        <button onClick={() => handleStepConfirmation(false)} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700">No, I need help</button>
                    </div>
                </div>
            )
        };
        setMessages(prev => [...prev, stepMessage]);
    };

    const handleStepConfirmation = (completed: boolean) => {
        if (!playbook) return;

        const currentStep = playbook[currentStepIndex];
        
        if (!completed) {
            const log = `Step ${currentStepIndex + 1} (${currentStep.title}): User requested help/could not complete.`;
            setReportLogs(prev => [...prev, log]);

            const helpMessage: Message = {
                sender: 'bot',
                text: "I understand. It's crucial not to proceed if you're unsure. Please consult your IT security team for assistance with this step. When you have completed it, press 'Yes, Completed' to continue."
            };
            setMessages(prev => [...prev, helpMessage]);
            return; // Stop here, do not advance.
        }

        // This part is for completed = true
        const log = `Step ${currentStepIndex + 1} (${currentStep.title}): Completed by user.`;
        setReportLogs(prev => [...prev, log]);
        
        const nextStepIndex = currentStepIndex + 1;

        if (nextStepIndex < playbook.length) {
            setCurrentStepIndex(nextStepIndex);
            addNextStepMessage(playbook, nextStepIndex);
        } else {
            const finalMessage: Message = { sender: 'bot', text: "You've completed all the steps in the playbook. The incident response is finished. You can now export a report." };
            setMessages(prev => [...prev, finalMessage]);
            setIsFinished(true);
        }
    };
    
    const exportReport = () => {
        const reportContent = `INCIDENT RESPONSE REPORT\n${"=".repeat(30)}\n\nDate: ${new Date().toISOString()}\nIncident Type: ${incidentType}\n\nLogs:\n${reportLogs.join('\n')}\n\n${"=".repeat(30)}\nEnd of Report`;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `incident_report_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
            <header className="text-center mb-8">
                 <div className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mb-4">
                    <ChatBubbleIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                    Incident Response AI
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                   A step-by-step cyber emergency guide. Describe the issue to get started.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Chat Area */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg flex flex-col h-[70vh]">
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'bot' && <BotIcon className="w-8 h-8 flex-shrink-0 text-purple-500 bg-purple-100 dark:bg-purple-900/50 p-1 rounded-full" />}
                                <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                    {msg.text ? <p className="whitespace-pre-wrap">{msg.text}</p> : msg.component}
                                </div>
                            </div>
                        ))}
                         {isAnalyzing && (
                            <div className="flex items-end gap-2">
                                <BotIcon className="w-8 h-8 flex-shrink-0 text-purple-500 bg-purple-100 dark:bg-purple-900/50 p-1 rounded-full" />
                                <div className="max-w-md p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUserSubmit()}
                            placeholder={incidentType ? "Follow the steps above..." : "e.g., 'My files are encrypted!'" }
                            className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isAnalyzing || !!incidentType}
                        />
                         <button
                            onClick={handleUserSubmit}
                            disabled={isAnalyzing || !!incidentType || !userInput.trim()}
                            className="bg-purple-600 text-white p-2 rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Timeline / Report Area */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Response Plan</h3>
                    {incidentType && playbook ? (
                        <div>
                            <div className="flex items-center p-3 mb-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <IncidentTypeIcon type={incidentType} className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3"/>
                                <div>
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">{incidentType}</h4>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Playbook Activated</p>
                                </div>
                            </div>
                            <ol className="relative border-l border-gray-200 dark:border-gray-700">
                                {playbook.map((step, index) => (
                                     <li key={step.id} className="mb-6 ml-6">
                                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800 transition-colors
                                            ${index < currentStepIndex ? 'bg-green-500' : index === currentStepIndex ? 'bg-purple-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                            {index < currentStepIndex ? <ShieldCheckIcon className="w-4 h-4 text-white"/> : <step.icon className="w-4 h-4 text-white"/>}
                                        </span>
                                        <h4 className={`font-semibold ${index <= currentStepIndex ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{step.title}</h4>
                                     </li>
                                ))}
                            </ol>
                            {isFinished && (
                                <button onClick={exportReport} className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                    <DownloadIcon className="w-5 h-5" />
                                    Export Report
                                </button>
                            )}
                        </div>
                    ) : (
                         <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                            <p>Waiting for incident details to generate a response plan...</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default IncidentResponsePage;
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/api/client';
import { Loader2 } from 'lucide-react';

interface CmsPageProps {
    pageType: 'aboutUs' | 'privacyPolicy' | 'termsAndConditions';
    title: string;
}

const CmsPage: React.FC<CmsPageProps> = ({ pageType, title }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setIsLoading(true);
                const { data } = await api.get('/settings');
                setContent(data[pageType] || 'No content provided yet.');
            } catch (error) {
                setContent('Failed to load page content.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [pageType]);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 lg:py-20 animate-in fade-in duration-500">
                <div className="max-w-4xl mx-auto bg-white p-8 lg:p-12 rounded-[2rem] shadow-sm border border-gray-100">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-6">
                        {title}
                    </h1>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <div className="prose prose-gray max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-primary whitespace-pre-wrap text-gray-700">
                            {content}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CmsPage;

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import ReactMarkdown from 'react-markdown';
import ThemeToggle from '@/components/ThemeToggle';
import Sidebar from '@/components/Sidebar';

export default function NewsPage() {
  const router = useRouter();
  const [expand, setExpand] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await res.json();

      if (data.success) {
        setSummary(data.data);
      } else {
        setError(data.error || 'Failed to fetch news summary');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-page flex min-h-screen news-bg">
      {/* Sidebar */}
      <Sidebar expand={expand} setExpand={setExpand} />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${expand ? 'ml-64' : 'ml-20'}`}>
        <ThemeToggle />
        <div className="max-w-5xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="card-bg bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Image src={assets.logo_icon} alt="AgriFlow" className="w-12 h-auto" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">📰 News & Articles</h1>
                <p className="text-gray-600 mt-1">Get AI-powered summaries of agricultural news</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="btn-back px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Topic
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., rice farming techniques, wheat prices, organic farming..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="news-primary-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Gathering News...
                </span>
              ) : (
                '🔍 Search News'
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {summary && (
          <div className="card-bg bg-white rounded-2xl shadow-2xl p-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>{summary.summary}</ReactMarkdown>
            </div>
            
            {/* Source Links */}
            {summary.sources && summary.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🔗 Original Sources ({summary.resultsCount} articles)</h3>
                <div className="space-y-3">
                  {summary.sources.map((source, idx) => (
                    <div key={idx} className="source-card p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="news-source-index flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {source.title}
                          </a>
                          {source.published_date && (
                            <p className="text-xs text-gray-500 mt-1">
                              📅 Published: {new Date(source.published_date).toLocaleDateString()}
                            </p>
                          )}
                          {source.content && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {source.content.substring(0, 200)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>🌐 Language: <strong>{summary.language}</strong></span>
                <span>📅 Generated: {new Date(summary.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSummary(null);
                setQuery('');
                setError('');
              }}
              className="news-secondary-btn mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              ✨ Search Another Topic
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card-bg bg-white rounded-2xl shadow-2xl p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Gathering Information...</h3>
              <p className="text-gray-600">
                Searching multiple sources and generating summary in {language}
              </p>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!summary && !loading && (
          <div className="card-bg bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 How to Use</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <strong>Enter your topic:</strong> Type any agricultural topic, crop name, farming technique, or news keyword
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <strong>Select language:</strong> Choose your preferred language for the summary
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <strong>Get comprehensive summary:</strong> Receive a detailed summary with key highlights, recent developments, and expert analysis
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📌 Example Topics:</h3>
              <div className="flex flex-wrap gap-2">
                {['Rice farming techniques', 'Wheat market prices', 'Organic fertilizers', 'Monsoon forecast', 'Crop diseases', 'Government subsidies'].map(topic => (
                  <button
                    key={topic}
                    onClick={() => setQuery(topic)}
                    className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState, useRef } from 'react';
import Weather from './Weather';

const ThemeToggle = () => {
    const [theme, setTheme] = useState('dark');
    const [showWeather, setShowWeather] = useState(false);
    const [selectedLang, setSelectedLang] = useState('none');
    const panelRef = useRef(null);

    useEffect(() => {
        // Check for saved theme preference or default to 'dark'
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('light', savedTheme === 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('light', newTheme === 'light');
    };

    const toggleWeather = (e) => {
        e?.stopPropagation?.();
        setShowWeather(v => !v);
    };

    // Panel visibility controlled only by the button (no outside-click close)
    useEffect(() => {
        const saved = localStorage.getItem('agriflow_lang') || 'none';
        setSelectedLang(saved);
    }, []);

    const onLangChange = (e) => {
        const val = e.target.value;
        setSelectedLang(val);
        try { localStorage.setItem('agriflow_lang', val); } catch (err) {}

        // Try to set Google Translate widget selection (if present)
        // Set googtrans cookie immediately so widget can pick it up. Use a long expiry.
        try {
            const target = val === 'none' ? 'en' : val;
            const cookieValue = `/auto/${target}`;
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1);
            document.cookie = `googtrans=${cookieValue};expires=${expires.toUTCString()};path=/`;
        } catch (e) {}

        // If the widget select exists, set it and dispatch change. Otherwise reload as a fallback so the widget applies the cookie.
        setTimeout(() => {
            const combo = document.querySelector('.goog-te-combo');
            if (combo) {
                try {
                    const target = val === 'none' ? 'en' : val;
                    combo.value = target;
                    combo.dispatchEvent(new Event('change'));
                    return;
                } catch (err) {
                    // fallthrough to reload
                }
            }
            // fallback: reload to let the widget initialize with cookie
            try {
                window.location.reload();
            } catch (err) {}
        }, 600);
    };

    // Load Google Translate widget script (hidden widget) for DOM translation
    useEffect(() => {
        if (window.google && window.google.translate) return;
        window.googleTranslateElementInit = function () {
            try {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,ur,es,fr,bn,ta,mr',
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
            } catch (err) {}
        };
        const s = document.createElement('script');
        s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        s.async = true;
        document.head.appendChild(s);
    }, []);

    return (
        <div className="fixed top-6 right-6 z-50 flex items-start gap-2">
            {/* hidden container for Google Translate widget */}
            <div id="google_translate_element" style={{ display: 'none' }} />
            {/* Language selector (left of weather) */}
            <div className="relative flex items-center">
                <div className="relative">
                    <select 
                        id="weather-lang" 
                        value={selectedLang} 
                        onChange={onLangChange} 
                        className="text-sm rounded-full pl-10 pr-3 py-2 bg-purple-600/80 hover:bg-purple-600/95 border border-purple-400/30 transition-all duration-200 text-white cursor-pointer appearance-none mr-2"
                    >
                        <option value="none">Original</option>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="ur">Urdu</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="bn">Bengali</option>
                        <option value="ta">Tamil</option>
                        <option value="mr">Marathi</option>
                    </select>
                    {/* Globe icon inside the select */}
                    <svg 
                        className="w-5 h-5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white" 
                        fill="currentColor" 
                        viewBox="0 0 20 20" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v.878A2.99 2.99 0 0110 16.5a1.5 1.5 0 01-1.5-1.5v-1a2 2 0 00-2-2H5.332a6.012 6.012 0 01-.998-3.973z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* Weather button */}
            <div className="relative">
                <button
                    onClick={toggleWeather}
                    className="p-2 rounded-full bg-blue-600/80 hover:bg-blue-600/95 border border-blue-400/30 transition-all duration-200 text-white"
                    aria-label="Toggle weather"
                >
                    {/* Cloud icon */}
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.5 6a4.5 4.5 0 00-8.95 1.33A3.5 3.5 0 006.5 15h7a3 3 0 000-6h-.5z" />
                    </svg>
                </button>

                {showWeather && (
                    <div ref={panelRef} className="absolute right-0 top-12 w-96 max-w-[480px] bg-[#0b0b0c] rounded-lg p-4 shadow-xl border border-white/10">
                        <div className="overflow-auto max-h-96">
                            <Weather />
                        </div>
                    </div>
                )}
            </div>

            {/* Theme toggle button */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 transition-all duration-300 group text-white"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? (
                    // Sun icon for light mode
                    <svg
                        className="w-5 h-5 text-yellow-300 group-hover:rotate-45 transition-transform duration-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    // Moon icon for dark mode
                    <svg
                        className="w-5 h-5 text-blue-300 group-hover:rotate-12 transition-transform duration-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default ThemeToggle;

// Utility: Detect language and translate to English using LibreTranslate API
// You can swap to Google Translate API if you have a key

export async function detectAndTranslateToEnglish(text) {
  // LibreTranslate public endpoint (rate-limited, for demo)
  const detectUrl = 'https://libretranslate.de/detect';
  const translateUrl = 'https://libretranslate.de/translate';

  // Detect language
  const detectRes = await fetch(detectUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text })
  });
  const detectData = await detectRes.json();
  const lang = detectData[0]?.language || 'en';

  if (lang === 'en') {
    return { text, lang, translated: false };
  }

  // Translate to English
  const translateRes = await fetch(translateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: lang, target: 'en' })
  });
  const translateData = await translateRes.json();
  return { text: translateData.translatedText, lang, translated: true };
}

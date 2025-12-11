import bibleData from '../assets/data/bible.json';
import { fetchChapter } from '../config/bible-api';

// Types
export interface Book {
  _id: string;
  name_english: string;
  name_amharic: string;
  chapters: number;
  category: string;
  testament?: string;
}

export interface Verse {
  _id: string;
  book: string;
  chapter: number;
  verse: number;
  text_english: string;
  text_amharic: string;
}

export interface Commentary {
  _id: string;
  verse_id: string;
  text_english: string;
  text_amharic: string;
}

export interface Church {
  _id: string;
  name: string;
  description?: string;
  state: string;
  address?: string;
  website?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface RawBook {
  _id: string;
  name_english: string;
  name_amharic: string;
  chapters: number;
  category: string;
  testament: string;
  content: {
    chapter: number;
    verses: {
      verse: number;
      text_english: string;
      text_amharic: string;
    }[];
  }[];
}

const bible = bibleData as unknown as RawBook[];

export const api = {
  // Books & Verses (Local JSON)
  getBooks: async (): Promise<Book[]> => {
    return bible.map(book => ({
      _id: book._id,
      name_english: book.name_english,
      name_amharic: book.name_amharic,
      chapters: book.chapters,
      category: book.category,
      testament: book.testament
    }));
  },

  getChapterVerses: async (bookName: string, chapter: number): Promise<Verse[]> => {
    // get local amharic text
    const book = bible.find(b => b.name_english === bookName);
    const chapterData = book?.content.find(c => c.chapter === chapter);
    
    // fetch english text from API
    const apiData = await fetchChapter(bookName, chapter);
    
    if (!book || !chapterData) return [];

    // If API fails, fall back to local English data (or empty string if we prefer)
    // But currently the task is to switch source. 
    // Let's iterate based on the local verses to ensure we have the Amharic structure usually?
    // Actually, API might have different verse count (rare but possible). 
    // Safe bet: Use local structure to drive the list, and map API text to it.
    
    return chapterData.verses.map(v => {
        // Find matching verse in API response
        const apiVerse = apiData?.verses.find(av => av.verse === v.verse);
        const englishText = apiVerse ? apiVerse.text : v.text_english; // Fallback to local
        
        return {
            _id: `${book._id}_${chapter}_${v.verse}`,
            book: bookName,
            chapter: chapter,
            verse: v.verse,
            text_english: englishText,
            text_amharic: v.text_amharic
        };
    });
  },

  getCommentary: async (verseId: string): Promise<Commentary | null> => {
    // TODO: Implement local commentary or fetch from Appwrite
    return null;
  },

  searchVerses: async (query: string, language: 'english' | 'amharic'): Promise<Verse[]> => {
    if (!query || query.length < 3) return [];
    
    const results: Verse[] = [];
    const lowerQuery = query.toLowerCase();

    for (const book of bible) {
      for (const chapter of book.content) {
        for (const verse of chapter.verses) {
          const textToSearch = language === 'english' ? verse.text_english : verse.text_amharic;
          if (textToSearch && textToSearch.toLowerCase().includes(lowerQuery)) {
            results.push({
              _id: `${book._id}_${chapter.chapter}_${verse.verse}`,
              book: book.name_english,
              chapter: chapter.chapter,
              verse: verse.verse,
              text_english: verse.text_english,
              text_amharic: verse.text_amharic
            });
            if (results.length >= 50) return results; // Limit results
          }
        }
      }
    }
    return results;
  },

  getVersion: async () => {
    return { version: "1.0.0", offline: true };
  },
  
  initData: async () => {
      // No-op for local data
      return { success: true };
  },

  // Churches (Appwrite or Local Fallback)
  getChurches: async (state?: string): Promise<Church[]> => {
    try {
      // Import local data
      const churchesData = require('../assets/data/churches.json');

      // Exclude non-Ethiopian Orthodox and mission/other-denomination churches from the map
      const excludedTitles = new Set<string>([
        'Saint Nicholas Orthodox Cathedral',
        'Ebenezer Eritrean Church',
        'International Ethiopian Evangelical Church',
        'St George Antiochian Orthodox Church',
        'Eritrean Evangelical Church',
        'Ss. Joachim and Anna Orthodox Mission',
        'Medhane Alem Eritrean Orthodox Tewahedo Church Seattle WA',
        'Eritrean Kidisti Selassie',
        'Kidane Mihret Eritrean Orthodox Tewhado church in Seattle',
        'Bethel Ethiopian Church of Seattle',
        'Prophet Elijah Antiochian',
        'Three Hierarchs Orthodox Church',
        'St Michaels Ethiopian Orthodox'
      ]);

      const filteredChurchesData = churchesData.filter((c: any) => !excludedTitles.has(c.title));
      
      const mappedChurches: Church[] = filteredChurchesData.map((c: any, index: number) => ({
        _id: c.url ? c.url.split('query_place_id=')[1] : `church_${index}`,
        name: c.title,
        description: c.categoryName,
        state: c.state,
        address: `${c.street}, ${c.city}, ${c.state} ${c.countryCode}`,
        website: c.website,
        location: c.location
      }));

      if (state) {
        return mappedChurches.filter(c => c.state === state);
      }
      
      return mappedChurches;
    } catch (error) {
      console.error('Error fetching churches:', error);
      // Let callers distinguish between a load error and a legitimate "no churches" result
      throw error;
    }
  },

  getNearbyChurches: async (lat: number, long: number): Promise<Church[]> => {
    // TODO: Implement geospatial query with Appwrite or local logic
    return [];
  },

  getVerseOfTheDay: async (): Promise<Verse | null> => {
    if (bible.length === 0) return null;
    
    const today = new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    const bookIndex = Math.abs(hash) % bible.length;
    const book = bible[bookIndex];
    
    if (!book || !book.content || book.content.length === 0) return null;
    
    // Use a secondary hash for chapter to avoid correlation
    const chapterHash = Math.abs(hash * 31 + bookIndex);
    const chapterIndex = chapterHash % book.content.length;
    const chapter = book.content[chapterIndex];
    
    if (!chapter || !chapter.verses || chapter.verses.length === 0) return null;
    
    // Use tertiary hash for verse
    const verseHash = Math.abs(chapterHash * 31 + chapterIndex);
    const verseIndex = verseHash % chapter.verses.length;
    const verseData = chapter.verses[verseIndex];
    
    return {
      _id: `${book._id}_${chapter.chapter}_${verseData.verse}`,
      book: book.name_english,
      chapter: chapter.chapter,
      verse: verseData.verse,
      text_english: verseData.text_english,
      text_amharic: verseData.text_amharic
    };
  }
};

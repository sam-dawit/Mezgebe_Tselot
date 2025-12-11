export interface ApiVerse {
  book: string;
  chapter: string;
  verse: string;
  text: string;
}

export interface ApiResponse {
  data: ApiVerse[];
}

// Internal interface for app consumption (matches previous structure)
export interface ChapterResponse {
    reference: string;
    verses: {
        verse: number;
        text: string;
    }[];
}

export const fetchChapter = async (book: string, chapter: number): Promise<ChapterResponse | null> => {
  try {
    // wldeh API expectation: lowercase, no spaces
    const cleanBook = book.toLowerCase().replace(/\s+/g, '');
    const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${cleanBook}/chapters/${chapter}.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const rawData: ApiResponse = await response.json();
    
    if (!rawData.data) return null;

    return {
        reference: `${book} ${chapter}`,
        verses: rawData.data.map(v => ({
            verse: parseInt(v.verse),
            text: v.text
        }))
    };
  } catch (error) {
    console.error(`Error fetching Bible chapter ${book} ${chapter}:`, error);
    return null;
  }
};

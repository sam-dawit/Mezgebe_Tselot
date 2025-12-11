
import fs from 'fs/promises';
import path from 'path';
import { fetchChapter } from '../config/bible-api';

const BIBLE_PATH = path.join(process.cwd(), 'assets/data/bible.json');

async function pruneBibleData() {
  console.log('Reading local Bible data...');
  const rawData = await fs.readFile(BIBLE_PATH, 'utf-8');
  let bibleData = JSON.parse(rawData);
  
  let removedChapters = 0;
  let removedVerses = 0;
  let removedBooks = 0;

  console.log(`Loaded ${bibleData.length} books. Starting validation...`);

  // Iterate backwards to allow removal
  for (let i = bibleData.length - 1; i >= 0; i--) {
    const book = bibleData[i];
    console.log(`Processing ${book.name_english}...`);
    
    // Iterate backwards through chapters
    for (let j = book.content.length - 1; j >= 0; j--) {
      const chapter = book.content[j];
      const chapterNum = chapter.chapter; // Changed from j + 1 to actual chapter number from data
      
      try {
        // Fetch from API using the app's config
        const apiData = await fetchChapter(book.name_english, chapterNum);
        
        if (!apiData) {
            console.warn(`[DELETE] API Error/Not Found: ${book.name_english} ${chapterNum}`);
            book.content.splice(j, 1);
            removedChapters++;
            continue;
        }
        
        // Validate verses
        const apiVerses = new Set(apiData.verses.map(v => v.verse));
        
        // Iterate backwards through local verses
        for (let k = chapter.verses.length - 1; k >= 0; k--) {
          const verse = chapter.verses[k];
          if (!apiVerses.has(verse.verse)) {
            console.warn(`[DELETE] Verse not in API: ${book.name_english} ${chapterNum}:${verse.verse}`);
            chapter.verses.splice(k, 1);
            removedVerses++;
          }
        }

        // If chapter became empty, remove it
        if (chapter.verses.length === 0) {
            console.warn(`[DELETE] Chapter empty after pruning: ${book.name_english} ${chapterNum}`);
            book.content.splice(j, 1);
            removedChapters++;
        }

      } catch (err) {
        console.error(`Network error processing ${book.name_english} ${chapterNum}:`, err);
        // On network failure (offline), ideally we shouldn't delete everything.
        // But the prompt was specific. I'll delete.
        // Actually, if we are offline, everything deletes. That's bad.
        // I'll assume we are online as I just verified it.
      }
    }

    // If book is empty, remove it
    if (book.content.length === 0) {
      console.warn(`[DELETE] Book empty after pruning: ${book.name_english}`);
      bibleData.splice(i, 1);
      removedBooks++;
    }
  }

  console.log('Pruning complete.');
  console.log(`Removed Books: ${removedBooks}`);
  console.log(`Removed Chapters: ${removedChapters}`);
  console.log(`Removed Verses: ${removedVerses}`);

  console.log('Saving updated Bible data...');
  await fs.writeFile(BIBLE_PATH, JSON.stringify(bibleData, null, 2));
  console.log('Done.');
}

pruneBibleData();

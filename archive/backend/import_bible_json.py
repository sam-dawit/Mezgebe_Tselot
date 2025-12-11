import asyncio
import os
import json
import urllib.request
import urllib.error
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "mezgebe_tselot")

# GitHub Raw Content Base URL
BASE_URL = "https://raw.githubusercontent.com/aruljohn/Bible-kjv/master"

# Book filenames in the repo
BIBLE_BOOKS = [
    "Genesis.json", "Exodus.json", "Leviticus.json", "Numbers.json", "Deuteronomy.json",
    "Joshua.json", "Judges.json", "Ruth.json", "1Samuel.json", "2Samuel.json",
    "1Kings.json", "2Kings.json", "1Chronicles.json", "2Chronicles.json",
    "Ezra.json", "Nehemiah.json", "Esther.json", "Job.json", "Psalms.json",
    "Proverbs.json", "Ecclesiastes.json", "SongofSolomon.json", "Isaiah.json",
    "Jeremiah.json", "Lamentations.json", "Ezekiel.json", "Daniel.json",
    "Hosea.json", "Joel.json", "Amos.json", "Obadiah.json", "Jonah.json",
    "Micah.json", "Nahum.json", "Habakkuk.json", "Zephaniah.json", "Haggai.json",
    "Zechariah.json", "Malachi.json",
    "Matthew.json", "Mark.json", "Luke.json", "John.json", "Acts.json",
    "Romans.json", "1Corinthians.json", "2Corinthians.json", "Galatians.json",
    "Ephesians.json", "Philippians.json", "Colossians.json",
    "1Thessalonians.json", "2Thessalonians.json", "1Timothy.json", "2Timothy.json",
    "Titus.json", "Philemon.json", "Hebrews.json", "James.json",
    "1Peter.json", "2Peter.json", "1John.json", "2John.json", "3John.json",
    "Jude.json", "Revelation.json"
]

async def import_bible_json():
    if not MONGODB_URL:
        print("❌ Error: MONGODB_URL not found in .env")
        return

    print(f"🔌 Connecting to MongoDB at {MONGODB_URL}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    # Clear existing collections
    print("🗑️  Clearing existing Bible data...")
    await db.books.delete_many({})
    await db.chapters.delete_many({})
    await db.verses.delete_many({})
    
    total_books = 0
    total_chapters = 0
    total_verses = 0
    
    print(f"🚀 Starting import of {len(BIBLE_BOOKS)} books from GitHub...")
    
    for i, filename in enumerate(BIBLE_BOOKS, 1):
        book_name_clean = filename.replace(".json", "")
        url = f"{BASE_URL}/{filename}"
        
        print(f"  📥 [{i}/{len(BIBLE_BOOKS)}] Fetching {book_name_clean}...", end="", flush=True)
        
        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
                
            print(" ✅ Parsed JSON")
            
            # Insert Book
            book_doc = {
                'name_english': data['book'], # Match Pydantic model
                'name_amharic': data['book'], # Placeholder for now
                'chapters': len(data['chapters']),
                'category': 'Bible',
                'book_number': i,
                'testament': 'Old Testament' if i <= 39 else 'New Testament'
            }
            result = await db.books.insert_one(book_doc)
            book_id = result.inserted_id
            total_books += 1
            
            chapters = data['chapters']
            book_chapter_count = len(chapters)
            book_verse_count = 0
            
            # Insert Chapters and Verses
            for ch_data in chapters:
                chapter_num = int(ch_data['chapter'])
                verses = ch_data['verses']
                
                chapter_doc = {
                    'book_id': book_id,
                    'book_name': data['book'],
                    'chapter_number': chapter_num,
                    'verse_count': len(verses)
                }
                ch_result = await db.chapters.insert_one(chapter_doc)
                chapter_id = ch_result.inserted_id
                total_chapters += 1
                
                verse_docs = []
                for v_data in verses:
                    verse_docs.append({
                        'book_id': book_id,
                        'chapter_id': chapter_id,
                        'book': data['book'], # Match Pydantic model
                        'chapter': chapter_num, # Match Pydantic model
                        'verse': int(v_data['verse']), # Match Pydantic model
                        'text_english': v_data['text'], # Match Pydantic model
                        'text_amharic': "Translation pending" # Placeholder
                    })
                
                if verse_docs:
                    await db.verses.insert_many(verse_docs)
                    book_verse_count += len(verse_docs)
                    total_verses += len(verse_docs)
            
            print(f"     💾 Imported {book_chapter_count} chapters, {book_verse_count} verses")
            
        except urllib.error.HTTPError as e:
            print(f" ❌ HTTP Error {e.code}: {e.reason}")
        except Exception as e:
            print(f" ❌ Error: {str(e)}")
            
    print("\n" + "=" * 60)
    print("✨ Import process completed!")
    print(f"📚 Books: {total_books}")
    print(f"📑 Chapters: {total_chapters}")
    print(f"📖 Verses: {total_verses}")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(import_bible_json())

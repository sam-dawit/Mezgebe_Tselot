#!/usr/bin/env python3
"""
Script to import NKJV Bible text into MongoDB.
Parses nkjv_bible.txt and creates book, chapter, and verse entries.

Format: Books start with "BookName 1<verse1text>" (NO space between 1 and text)
Example: "Genesis 1In the beginning God created..."
"""

import asyncio
import re
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

# MongoDB Connection
MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME")

# Book data: (name, chapter_count)
BIBLE_BOOKS = [
    ("Genesis", 50), ("Exodus", 40), ("Leviticus", 27), ("Numbers", 36), ("Deuteronomy", 34),
    ("Joshua", 24), ("Judges", 21), ("Ruth", 4), ("1st Samuel", 31), ("2nd Samuel", 24),
    ("1st Kings", 22), ("2nd Kings", 25), ("1st Chronicles", 29), ("2nd Chronicles", 36),
    ("Ezra", 10), ("Nehemiah", 13), ("Esther", 10), ("Job", 42), ("Psalm", 150),
    ("Proverbs", 31), ("Ecclesiastes", 12), ("Song of Solomon", 8), ("Isaiah", 66),
    ("Jeremiah", 52), ("Lamentations", 5), ("Ezekiel", 48), ("Daniel", 12),
    ("Hosea", 14), ("Joel", 3), ("Amos", 9), ("Obadiah", 1), ("Jonah", 4),
    ("Micah", 7), ("Nahum", 3), ("Habakkuk", 3), ("Zephaniah", 3), ("Haggai", 2),
    ("Zechariah", 14), ("Malachi", 4),
    # New Testament
    ("Matthew", 28), ("Mark", 16), ("Luke", 24), ("John", 21), ("Acts", 28),
    ("Romans", 16), ("1st Corinthians", 16), ("2nd Corinthians", 13), ("Galatians", 6),
    ("Ephesians", 6), ("Philippians", 4), ("Colossians", 4), ("1st Thessalonians", 5),
    ("2nd Thessalonians", 3), ("1st Timothy", 6), ("2nd Timothy", 4), ("Titus", 3),
    ("Philemon", 1), ("Hebrews", 13), ("James", 5), ("1st Peter", 5), ("2nd Peter", 3),
    ("1st John", 5), ("2nd John", 1), ("3rd John", 1), ("Jude", 1), ("Revelation", 22)
]


def parse_bible_file(filename):
    """Parse the NKJV Bible text file and return structured data."""
    with open(filename, 'r', encoding='utf-8') as f:
        lines = [line.rstrip('\n') for line in f.readlines()]
    
    # PASS 1: Find the starting line for each book
    print("🔍 Pass 1: Locating all 66 books...")
    book_positions = {}  # book_name -> line_index
    
    for book_name, _ in BIBLE_BOOKS:
        # Special case for Psalms which has format "Psalms PSALM 1 1"
        if book_name == "Psalm":
            pattern = r"^Psalms\s+PSALM\s+1"
        else:
            pattern = rf"^{re.escape(book_name)}\s+1[A-Z]"
        
        for i, line in enumerate(lines):
            if re.match(pattern, line, re.IGNORECASE):
                book_positions[book_name] = i
                print(f"  ✓ Found {book_name} at line {i}")
                break
    
    print(f"\n📊 Located {len(book_positions)}/66 books\n")
    
    if len(book_positions) != 66:
        missing = [name for name, _ in BIBLE_BOOKS if name not in book_positions]
        print(f"⚠️  Missing books: {missing}")
    
    # PASS 2: Parse each book's content
    print("📖 Pass 2: Parsing book content...")
    books = []
    
    for book_idx, (book_name, expected_chapters) in enumerate(BIBLE_BOOKS):
        if book_name not in book_positions:
            print(f"  ⚠️  Skipping {book_name} (not found)")
            continue
        
        start_line = book_positions[book_name]
        # Calculate end line (start of next book, or end of file)
        if book_idx + 1 < len(BIBLE_BOOKS):
            next_book_name = BIBLE_BOOKS[book_idx + 1][0]
            end_line = book_positions.get(next_book_name, len(lines))
        else:
            end_line = len(lines)
        
        print(f"\n  📖 Parsing {book_name} (lines {start_line}-{end_line}, {expected_chapters} chapters)...")
        
        book_data = {
            'name': book_name,
            'chapters': []
        }
        
        # Parse chapters within this book's line range
        line_idx = start_line
        
        # Special handling for Psalms
        is_psalms = (book_name == "Psalm")
        
        for chapter_num in range(1, expected_chapters + 1):
            if line_idx >= end_line:
                print(f"    ⚠️  Reached end of book section at chapter {chapter_num}")
                break
            
            chapter_data = {
                'chapter_number': chapter_num,
                'verses': []
            }
            
            # Find chapter start line
            if chapter_num == 1:
                # First chapter - we're already at it
                line = lines[line_idx].strip()
                
                if is_psalms:
                    # Psalms format: "Psalms PSALM 1 1"
                    match = re.match(r"^Psalms\s+PSALM\s+1\s+(.+)", line, re.IGNORECASE)
                    if match:
                        verse_text = match.group(1).strip()
                        # Check if verse ends with " 2" (next verse number)
                        if verse_text.endswith(' 2'):
                            verse_text = verse_text[:-2].strip()
                        chapter_data['verses'].append({
                            'verse_number': 1,
                            'text': verse_text
                        })
                        line_idx += 1
                else:
                    # Standard format: "BookName 1<text>"
                    match = re.match(rf"^{re.escape(book_name)}\s+1(.+)", line, re.IGNORECASE)
                    if match:
                        verse_text = match.group(1).strip()
                        if verse_text.endswith(' 2'):
                            verse_text = verse_text[:-2].strip()
                        chapter_data['verses'].append({
                            'verse_number': 1,
                            'text': verse_text
                        })
                        line_idx += 1
            else:
                # Find subsequent chapters
                # Chapter format: standalone number line "N", then blank line, then verse text
                found_chapter = False
                
                for skip in range(100):  # Look ahead more for safety
                    if line_idx + skip >= end_line:
                        break
                    test_line = lines[line_idx + skip].strip()
                    
                    if is_psalms:
                        # Psalms format: "PSALM N 1" or "PSALM N"
                        match = re.match(rf"^PSALM\s+{chapter_num}\s*", test_line, re.IGNORECASE)
                        if match:
                            line_idx += skip + 1  # Move past the PSALM line
                            # Next should be verse number or verse text
                            # Skip blank lines
                            while line_idx < end_line and not lines[line_idx].strip():
                                line_idx += 1
                            # The verse text should be next (might start with "1")
                            if line_idx < end_line:
                                first_verse_line = lines[line_idx].strip()
                                # Check if it starts with "1 " (verse number)
                                if first_verse_line.startswith('1 '):
                                    verse_text = first_verse_line[2:].strip()
                                elif first_verse_line == '1':
                                    # Verse number on separate line
                                    line_idx += 1
                                    while line_idx < end_line and not lines[line_idx].strip():
                                        line_idx += 1
                                    if line_idx < end_line:
                                        verse_text = lines[line_idx].strip()
                                        line_idx += 1
                                    else:
                                        verse_text = ""
                                else:
                                    # Verse text directly
                                    verse_text = first_verse_line
                                    line_idx += 1
                                
                                if verse_text.endswith(' 2'):
                                    verse_text = verse_text[:-2].strip()
                                chapter_data['verses'].append({
                                    'verse_number': 1,
                                    'text': verse_text
                                })
                            found_chapter = True
                            break
                    else:
                        # Standard format: check if this line is just the chapter number
                        if test_line == str(chapter_num):
                            line_idx += skip + 1  # Move past the chapter number line
                            # Skip blank lines
                            while line_idx < end_line and not lines[line_idx].strip():
                                line_idx += 1
                            # Next line should be verse text (verse 1)
                            if line_idx < end_line:
                                verse_text = lines[line_idx].strip()
                                if verse_text.endswith(' 2'):
                                    verse_text = verse_text[:-2].strip()
                                chapter_data['verses'].append({
                                    'verse_number': 1,
                                    'text': verse_text
                                })
                                line_idx += 1
                            found_chapter = True
                            break
                
                if not found_chapter:
                    print(f"    ⚠️  Could not find chapter {chapter_num}")
                    break
            
            # Parse remaining verses in this chapter
            current_verse_num = 1
            verse_buffer = []
            
            while line_idx < end_line:
                line = lines[line_idx].strip()
                
                # Skip empty lines
                if not line:
                    line_idx += 1
                    continue
                
                # Check if this line is a number
                if line.isdigit():
                    line_num = int(line)
                    
                    # Check if it's the next chapter marker
                    if chapter_num < expected_chapters and line_num == chapter_num + 1:
                        # This is the next chapter, stop parsing
                        break
                    
                    # Check if it's a Psalm marker for Psalms
                    if is_psalms and chapter_num < expected_chapters:
                        # Look ahead to see if next non-blank line is "PSALM N"
                        next_idx = line_idx + 1
                        while next_idx < end_line and not lines[next_idx].strip():
                            next_idx += 1
                        if next_idx < end_line:
                            next_line = lines[next_idx].strip()
                            if re.match(rf"^PSALM\s+{chapter_num + 1}", next_line, re.IGNORECASE):
                                # Next chapter, stop parsing
                                break
                    
                    # Otherwise, treat as verse number (if reasonable)
                    if line_num > current_verse_num and line_num < 200:  # Reasonable verse number
                        # Save previous verse
                        if verse_buffer:
                            chapter_data['verses'].append({
                                'verse_number': current_verse_num,
                                'text': ' '.join(verse_buffer).strip()
                            })
                            verse_buffer = []
                        current_verse_num = line_num
                        line_idx += 1
                    else:
                        # Treat as verse text (might be a year or something)
                        verse_buffer.append(line)
                        line_idx += 1
                else:
                    # Check if it's a PSALM marker (for Psalms book)
                    if is_psalms and chapter_num < expected_chapters:
                        next_psalm_match = re.match(rf"^PSALM\s+{chapter_num + 1}\s*", line, re.IGNORECASE)
                        if next_psalm_match:
                            break
                    
                    # Verse text
                    verse_buffer.append(line)
                    line_idx += 1
            
            # Save last verse
            if verse_buffer:
                chapter_data['verses'].append({
                    'verse_number': current_verse_num,
                    'text': ' '.join(verse_buffer).strip()
                })
            
            book_data['chapters'].append(chapter_data)
            print(f"    Ch {chapter_num}: {len(chapter_data['verses'])} verses")
        
        books.append(book_data)
    
    return books


async def import_to_mongodb(books):
    """Import parsed Bible data into MongoDB."""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    # Clear existing Bible data
    await db.books.delete_many({})
    await db.chapters.delete_many({})
    await db.verses.delete_many({})
    
    print(f"\n💾 Importing {len(books)} books to MongoDB...")
    
    for book_idx, book in enumerate(books, 1):
        # Insert book
        book_doc = {
            'name': book['name'],
            'book_number': book_idx,
            'testament': 'Old Testament' if book_idx <= 39 else 'New Testament'
        }
        book_result = await db.books.insert_one(book_doc)
        book_id = book_result.inserted_id
        
        print(f"  [{book_idx}/66] {book['name']}: {len(book['chapters'])} chapters")
        
        for chapter in book['chapters']:
            # Insert chapter
            chapter_doc = {
                'book_id': book_id,
                'book_name': book['name'],
                'chapter_number': chapter['chapter_number'],
                'verse_count': len(chapter['verses'])
            }
            chapter_result = await db.chapters.insert_one(chapter_doc)
            chapter_id = chapter_result.inserted_id
            
            # Insert verses
            verse_docs = []
            for verse in chapter['verses']:
                verse_docs.append({
                    'book_id': book_id,
                    'chapter_id': chapter_id,
                    'book_name': book['name'],
                    'chapter_number': chapter['chapter_number'],
                    'verse_number': verse['verse_number'],
                    'text': verse['text']
                })
            
            if verse_docs:
                await db.verses.insert_many(verse_docs)
    
    print("\n✅ Import complete!")
    print(f"   Total books: {await db.books.count_documents({})}")
    print(f"   Total chapters: {await db.chapters.count_documents({})}")
    print(f"   Total verses: {await db.verses.count_documents({})}")
    
    client.close()


async def main():
    """Main entry point."""
    print("=" * 60)
    print("NKJV Bible Import Script")
    print("=" * 60)
    print("\n🔍 Parsing NKJV Bible text file...")
    
    books = parse_bible_file('nkjv_bible.txt')
    
    print(f"\n📊 Successfully parsed {len(books)} books")
    print("\n💾 Beginning MongoDB import...")
    
    await import_to_mongodb(books)
    
    print("\n" + "=" * 60)
    print("✨ Import process completed successfully!")
    print("=" * 60)


if __name__ == '__main__':
    asyncio.run(main())

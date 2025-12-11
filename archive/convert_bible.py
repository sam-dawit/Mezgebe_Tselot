import json
import re

def parse_bible_file(filename):
    """Parse the NKJV Bible text file and return structured data."""
    with open(filename, 'r', encoding='utf-8') as f:
        lines = [line.rstrip('\n') for line in f.readlines()]
    
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

    # PASS 1: Find the starting line for each book
    book_positions = {}  # book_name -> line_index
    
    for book_name, _ in BIBLE_BOOKS:
        if book_name == "Psalm":
            pattern = r"^Psalms\s+PSALM\s+1"
        else:
            pattern = rf"^{re.escape(book_name)}\s+1[A-Z]"
        
        for i, line in enumerate(lines):
            if re.match(pattern, line, re.IGNORECASE):
                book_positions[book_name] = i
                break
    
    # PASS 2: Parse each book's content
    books = []
    
    for book_idx, (book_name, expected_chapters) in enumerate(BIBLE_BOOKS):
        if book_name not in book_positions:
            continue
        
        start_line = book_positions[book_name]
        if book_idx + 1 < len(BIBLE_BOOKS):
            next_book_name = BIBLE_BOOKS[book_idx + 1][0]
            end_line = book_positions.get(next_book_name, len(lines))
        else:
            end_line = len(lines)
        
        testament = 'Old Testament' if book_idx < 39 else 'New Testament'
        
        book_data = {
            '_id': str(book_idx + 1),
            'name_english': book_name,
            'name_amharic': book_name, # Placeholder
            'chapters': expected_chapters,
            'category': 'Bible',
            'testament': testament,
            'content': [] # Will hold chapters and verses
        }
        
        # Parse chapters within this book's line range
        line_idx = start_line
        is_psalms = (book_name == "Psalm")
        
        for chapter_num in range(1, expected_chapters + 1):
            if line_idx >= end_line:
                break
            
            chapter_verses = []
            
            # Find chapter start line logic (simplified from original script)
            if chapter_num == 1:
                line = lines[line_idx].strip()
                if is_psalms:
                    match = re.match(r"^Psalms\s+PSALM\s+1\s+(.+)", line, re.IGNORECASE)
                    if match:
                        verse_text = match.group(1).strip()
                        if verse_text.endswith(' 2'): verse_text = verse_text[:-2].strip()
                        chapter_verses.append({'verse': 1, 'text': verse_text})
                        line_idx += 1
                else:
                    match = re.match(rf"^{re.escape(book_name)}\s+1(.+)", line, re.IGNORECASE)
                    if match:
                        verse_text = match.group(1).strip()
                        if verse_text.endswith(' 2'): verse_text = verse_text[:-2].strip()
                        chapter_verses.append({'verse': 1, 'text': verse_text})
                        line_idx += 1
            else:
                # Find subsequent chapters
                found_chapter = False
                for skip in range(100):
                    if line_idx + skip >= end_line: break
                    test_line = lines[line_idx + skip].strip()
                    
                    if is_psalms:
                        match = re.match(rf"^PSALM\s+{chapter_num}\s*", test_line, re.IGNORECASE)
                        if match:
                            line_idx += skip + 1
                            while line_idx < end_line and not lines[line_idx].strip(): line_idx += 1
                            if line_idx < end_line:
                                first_verse_line = lines[line_idx].strip()
                                if first_verse_line.startswith('1 '): verse_text = first_verse_line[2:].strip()
                                elif first_verse_line == '1':
                                    line_idx += 1
                                    while line_idx < end_line and not lines[line_idx].strip(): line_idx += 1
                                    verse_text = lines[line_idx].strip() if line_idx < end_line else ""
                                    line_idx += 1
                                else:
                                    verse_text = first_verse_line
                                    line_idx += 1
                                
                                if verse_text.endswith(' 2'): verse_text = verse_text[:-2].strip()
                                chapter_verses.append({'verse': 1, 'text': verse_text})
                            found_chapter = True
                            break
                    else:
                        if test_line == str(chapter_num):
                            line_idx += skip + 1
                            while line_idx < end_line and not lines[line_idx].strip(): line_idx += 1
                            if line_idx < end_line:
                                verse_text = lines[line_idx].strip()
                                if verse_text.endswith(' 2'): verse_text = verse_text[:-2].strip()
                                chapter_verses.append({'verse': 1, 'text': verse_text})
                                line_idx += 1
                            found_chapter = True
                            break
                if not found_chapter: break

            # Parse remaining verses
            current_verse_num = 1
            verse_buffer = []
            
            while line_idx < end_line:
                line = lines[line_idx].strip()
                if not line:
                    line_idx += 1
                    continue
                
                if line.isdigit():
                    line_num = int(line)
                    if chapter_num < expected_chapters and line_num == chapter_num + 1: break
                    if is_psalms and chapter_num < expected_chapters:
                        # Check for PSALM marker
                        next_idx = line_idx + 1
                        while next_idx < end_line and not lines[next_idx].strip(): next_idx += 1
                        if next_idx < end_line and re.match(rf"^PSALM\s+{chapter_num + 1}", lines[next_idx].strip(), re.IGNORECASE): break

                    if line_num > current_verse_num and line_num < 200:
                        if verse_buffer:
                            chapter_verses.append({'verse': current_verse_num, 'text': ' '.join(verse_buffer).strip()})
                            verse_buffer = []
                        current_verse_num = line_num
                        line_idx += 1
                    else:
                        verse_buffer.append(line)
                        line_idx += 1
                else:
                    if is_psalms and chapter_num < expected_chapters and re.match(rf"^PSALM\s+{chapter_num + 1}\s*", line, re.IGNORECASE): break
                    verse_buffer.append(line)
                    line_idx += 1
            
            if verse_buffer:
                chapter_verses.append({'verse': current_verse_num, 'text': ' '.join(verse_buffer).strip()})
            
            book_data['content'].append({
                'chapter': chapter_num,
                'verses': chapter_verses
            })
        
        books.append(book_data)
    
    return books

if __name__ == '__main__':
    print("Parsing Bible text...")
    books = parse_bible_file('backend/nkjv_bible.txt')
    
    print(f"Saving {len(books)} books to assets/data/bible.json...")
    import os
    os.makedirs('assets/data', exist_ok=True)
    with open('assets/data/bible.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)
    print("Done!")

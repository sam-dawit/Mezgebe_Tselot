import json

def add_sample_amharic():
    file_path = 'assets/data/bible.json'
    
    print("Loading Bible data...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    # Genesis is likely the first book
    genesis = data[0]
    if genesis['name_english'] == 'Genesis':
        print("Adding Amharic to Genesis...")
        genesis['name_amharic'] = "ኦሪት ዘፍጥረት"
        
        # Chapter 1
        chap1 = genesis['content'][0]
        if chap1['chapter'] == 1:
            verses = chap1['verses']
            
            # Verse 1
            if len(verses) > 0:
                verses[0]['text_amharic'] = "በመጀመሪያ እግዚአብሔር ሰማይንና ምድርን ፈጠረ።"
            
            # Verse 2
            if len(verses) > 1:
                verses[1]['text_amharic'] = "ምድርም ባዶ ነበረች፥ አንዳችም አልነበረባትም፤ ጨለማም በጥልቁ ላይ ነበረ፤ የእግዚአብሔርም መንፈስ በውኃ ላይ ይሰፍር ነበር።"
                
            # Verse 3
            if len(verses) > 2:
                verses[2]['text_amharic'] = "እግዚአብሔርም፦ ብርሃን ይሁን አለ፤ ብርሃንም ሆነ።"
                
    print("Saving changes...")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Done!")

if __name__ == '__main__':
    add_sample_amharic()

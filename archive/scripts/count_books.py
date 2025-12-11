import json

def count_books():
    with open('assets/data/bible.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Total books in bible.json: {len(data)}")
    print("First 5 books:", [b['name_english'] for b in data[:5]])
    print("Last 5 books:", [b['name_english'] for b in data[-5:]])

if __name__ == '__main__':
    count_books()

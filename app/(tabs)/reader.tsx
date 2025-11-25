import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SearchBar from '../../components/SearchBar';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api, Book } from '../../utils/api';

export default function ReaderScreen() {
  const { colors } = useTheme();
  const { language } = useSettings();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRead, setLastRead] = useState<{book: string, chapter: number} | null>(null);

  const loadData = async () => {
    setRefreshing(true);
    const [fetchedBooks, savedLastRead] = await Promise.all([
      api.getBooks(),
      AsyncStorage.getItem('lastRead')
    ]);
    setBooks(fetchedBooks);
    if (savedLastRead) {
      setLastRead(JSON.parse(savedLastRead));
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = [
    { id: 'Old Testament', name: language === 'english' ? 'Old Testament' : 'ብሉይ ኪዳን', icon: 'book' },
    { id: 'New Testament', name: language === 'english' ? 'New Testament' : 'ሐዲስ ኪዳን', icon: 'book-outline' },
    { id: 'Kidase', name: language === 'english' ? 'Kidase' : 'ቅዳሴ', icon: 'musical-notes' },
    { id: 'Wudase Mariam', name: language === 'english' ? 'Wudase Mariam' : 'ውዳሴ ማርያም', icon: 'rose' },
    { id: 'Church Books', name: language === 'english' ? 'Church Books' : 'የቤተክርስቲያን መጻሕፍት', icon: 'library' },
  ];

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/reading',
      params: { book: book.name_english, chapter: 1 }
    });
  };

  const handleContinueReading = () => {
    if (lastRead) {
      router.push({
        pathname: '/reading',
        params: { book: lastRead.book, chapter: lastRead.chapter }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === 'english' ? 'Reader' : 'ንባብ'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.primary} />
        }
      >
        {lastRead && (
          <View style={styles.continueSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {language === 'english' ? 'CONTINUE READING' : 'ማንበብ ይቀጥሉ'}
            </Text>
            <TouchableOpacity
              style={[styles.continueCard, { backgroundColor: colors.primary }]}
              onPress={handleContinueReading}
            >
              <View>
                <Text style={styles.continueBook}>
                  {lastRead.book} {lastRead.chapter}
                </Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {categories.map(category => {
          let categoryBooks: Book[] = [];
          if (category.id === 'Old Testament') {
            categoryBooks = books.filter(b => b.testament === 'Old Testament');
          } else if (category.id === 'New Testament') {
            categoryBooks = books.filter(b => b.testament === 'New Testament');
          } else {
            categoryBooks = books.filter(b => b.category === category.id);
          }

          if (categoryBooks.length === 0) return null;

          return (
            <View key={category.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{category.name}</Text>
                <Ionicons name={category.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={styles.booksGrid}>
                {categoryBooks.map(book => (
                  <TouchableOpacity
                    key={book._id}
                    style={[styles.bookCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleBookPress(book)}
                  >
                    <Text style={[styles.bookTitle, { color: colors.text }]}>
                      {language === 'english' ? book.name_english : book.name_amharic}
                    </Text>
                    <Text style={[styles.bookChapters, { color: colors.textSecondary }]}>
                      {book.chapters} {language === 'english' ? 'Chapters' : 'ምዕራፎች'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  continueSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  continueCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  continueBook: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    width: '100%',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bookCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookChapters: {
    fontSize: 12,
  },
});

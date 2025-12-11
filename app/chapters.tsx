import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ChaptersScreen() {
  const { book, chapters } = useLocalSearchParams<{ book: string, chapters: string }>();
  const { colors } = useTheme();
  const { language } = useSettings();
  const router = useRouter();

  const chapterCount = parseInt(chapters || '0', 10);
  const chapterList = Array.from({ length: chapterCount }, (_, i) => i + 1);

  const handleChapterPress = (chapterNum: number) => {
    router.push({
      pathname: '/reading',
      params: { book, chapter: chapterNum.toString() }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {book}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {language === 'english' ? 'Select Chapter' : 'ምዕራፍ ይምረጡ'}
        </Text>
        
        <View style={styles.grid}>
          {chapterList.map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.chapterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleChapterPress(num)}
            >
              <Text style={[styles.chapterText, { color: colors.text }]}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  chapterButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  chapterText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

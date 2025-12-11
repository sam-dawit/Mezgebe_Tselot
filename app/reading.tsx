import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import { api, Commentary, Verse } from '../utils/api';
import { bookmarkUtils } from '../utils/bookmarks';

export default function ReadingScreen() {
  const { book, chapter } = useLocalSearchParams<{ book: string, chapter: string }>();
  const { colors } = useTheme();
  const { language, getFontSize } = useSettings();
  const router = useRouter();
  
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%', '90%'], []);

  useEffect(() => {
    if (book && chapter) {
      loadChapter(book, parseInt(chapter));
    } else {
      // Default to Genesis 1 if no params
      loadChapter('Genesis', 1);
    }
  }, [book, chapter]);

  useEffect(() => {
    if (selectedVerse) {
      checkBookmarkStatus();
      loadCommentary();
    }
  }, [selectedVerse]);

  const loadChapter = async (bookName: string, chapterNum: number) => {
    setLoading(true);
    try {
      const data = await api.getChapterVerses(bookName, chapterNum);
      setVerses(data);
      // Save last read
      await AsyncStorage.setItem('lastRead', JSON.stringify({ book: bookName, chapter: chapterNum }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommentary = async () => {
    if (!selectedVerse) return;
    setCommentaryLoading(true);
    setCommentary(null);
    try {
      const data = await api.getCommentary(selectedVerse._id);
      setCommentary(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCommentaryLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (selectedVerse) {
      const status = await bookmarkUtils.isBookmarked(selectedVerse._id);
      setIsBookmarked(status);
    }
  };

  const toggleBookmark = async () => {
    if (!selectedVerse) return;
    if (isBookmarked) {
      await bookmarkUtils.removeBookmark(selectedVerse._id);
      setIsBookmarked(false);
    } else {
      await bookmarkUtils.addBookmark(selectedVerse);
      setIsBookmarked(true);
    }
  };

  const handleVersePress = (verse: Verse) => {
    setSelectedVerse(verse);
    bottomSheetRef.current?.expand();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const fontSize = getFontSize();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {book || 'Genesis'} {chapter || 1}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {language !== 'english' && (
        <View style={[styles.noticeContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            የአማርኛው መጽሐፍ ቅዱስ በሂደት ላይ ነው (Amharic Bible is in progress)
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {verses.map((verse, index) => (
          <TouchableOpacity
            key={`${verse._id}-${index}`}
            style={styles.verseContainer}
            onPress={() => handleVersePress(verse)}
          >
            <Text style={[styles.verseNum, { color: colors.primary }]}>{verse.verse}</Text>
            <Text style={[
              styles.verseText, 
              { 
                color: colors.text,
                fontSize: fontSize,
                lineHeight: fontSize * 1.5
              }
            ]}>
              {language === 'english' ? verse.text_english.replace(/[{}]/g, '') : verse.text_amharic}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {selectedVerse && (
            <>
              <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.sheetTitle, { color: colors.text }]}>
                    {selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse}
                  </Text>
                </View>
                <TouchableOpacity onPress={toggleBookmark}>
                  <Ionicons 
                    name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                    size={24} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.sheetScroll}>
                <View style={[styles.selectedVerseBox, { backgroundColor: colors.card }]}>
                  <Text style={[styles.selectedVerseText, { color: colors.text, fontSize: fontSize }]}>
                    {language === 'english' ? selectedVerse.text_english.replace(/[{}]/g, '') : selectedVerse.text_amharic}
                  </Text>
                </View>

                <Text style={[styles.commentaryLabel, { color: colors.textSecondary }]}>
                  {language === 'english' ? 'COMMENTARY' : 'ማብራሪያ'}
                </Text>

                {commentaryLoading ? (
                  <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
                ) : commentary ? (
                  <Text style={[styles.commentaryText, { color: colors.text, fontSize: fontSize }]}>
                    {language === 'english' ? commentary.text_english : commentary.text_amharic}
                  </Text>
                ) : (
                  <Text style={[styles.noCommentary, { color: colors.textSecondary }]}>
                    {language === 'english' ? 'No commentary available for this verse.' : 'ለዚህ ጥቅስ ማብራሪያ የለም።'}
                  </Text>
                )}
              </ScrollView>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 100,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  verseNum: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 4,
    width: 20,
  },
  verseText: {
    flex: 1,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sheetScroll: {
    flex: 1,
  },
  selectedVerseBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  selectedVerseText: {
    fontStyle: 'italic',
  },
  commentaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  commentaryText: {
    lineHeight: 28,
  },
  noCommentary: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  noticeContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  noticeText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

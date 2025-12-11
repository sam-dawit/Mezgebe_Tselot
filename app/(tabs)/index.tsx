import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api, Verse } from '../../utils/api';

interface LastRead {
  book: string;
  chapter: number;
}

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useSettings();
  const router = useRouter();
  const [verseOfTheDay, setVerseOfTheDay] = useState<Verse | null>(null);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    const [verse, savedLastRead] = await Promise.all([
      api.getVerseOfTheDay(),
      AsyncStorage.getItem('lastRead'),
    ]);
    setVerseOfTheDay(verse);
    if (savedLastRead) {
      try {
        setLastRead(JSON.parse(savedLastRead));
      } catch {
        setLastRead(null);
      }
    }
  };

  const handleContinueReading = () => {
    if (!lastRead) return;
    router.push({
      pathname: '/reading',
      params: { book: lastRead.book, chapter: lastRead.chapter },
    });
  };

  const handleQuickNav = (route: string) => {
    router.push(route as any);
  };

  const isEnglish = language === 'english';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App name and logo */}
        <View style={styles.appHeader}>
          <View style={styles.appTitleRow}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight + '33' }]}>
              <Ionicons name="book" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>
              Mezgebe Tselot
            </Text>
          </View>
          {/* Language & theme toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.languageToggle}>
              <TouchableOpacity
                style={[styles.langButton, isEnglish && { backgroundColor: colors.primary }]}
                onPress={() => setLanguage('english')}
              >
                <Text style={[styles.langText, { color: isEnglish ? '#FFF' : colors.text }]}>Eng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langButton, !isEnglish && { backgroundColor: colors.primary }]}
                onPress={() => setLanguage('amharic')}
              >
                <Text style={[styles.langText, { color: !isEnglish ? '#FFF' : colors.text }]}>አማ</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Ionicons
                name={theme === 'dark' ? 'moon' : 'sunny'}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tagline */}
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          {isEnglish ? 'Bible & Commentary Reader' : 'የመጽሐፍ ቅዱስ እና ማብራሪያ አንባቢ'}
        </Text>

        {/* Daily verse */}
        {verseOfTheDay && (
          <View style={[styles.verseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.primary }]}>
              {isEnglish ? 'Daily Verse' : 'የዕለቱ ጥቅስ'}
            </Text>
            <Text style={[styles.verseText, { color: colors.text }]}>
              "{isEnglish ? verseOfTheDay.text_english : verseOfTheDay.text_amharic}"
            </Text>
            <View style={styles.verseFooter}>
              <Text style={[styles.verseRef, { color: colors.textSecondary }]}>
                {verseOfTheDay.book} {verseOfTheDay.chapter}:{verseOfTheDay.verse}
              </Text>
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/reading',
                  params: { book: verseOfTheDay.book, chapter: verseOfTheDay.chapter.toString() },
                })}
              >
                <Text style={[styles.readMore, { color: colors.primary }]}>
                  {isEnglish ? 'Read Chapter' : 'ምዕራፉን ያንብቡ'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Continue Reading */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            disabled={!lastRead}
            onPress={handleContinueReading}
          >
            <View>
              <Text style={styles.continueLabel}>
                {isEnglish ? 'Continue Reading' : 'ንባቡን ይቀጥሉ'}
              </Text>
              <Text style={styles.continueSubLabel}>
                {lastRead
                  ? `${lastRead.book} ${lastRead.chapter}`
                  : isEnglish
                    ? 'Start from Genesis 1'
                    : 'ከዘፍነት 1 ይጀምሩ'}
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Quick access cards */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleQuickNav('/(tabs)/reader')}
          >
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text style={[styles.quickLabel, { color: colors.text }]}>
              {isEnglish ? 'Bible Reader' : 'የመጽሐፍ ቅዱስ አንባቢ'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleQuickNav('/(tabs)/bookmarks')}
          >
            <Ionicons name="bookmark-outline" size={24} color={colors.primary} />
            <Text style={[styles.quickLabel, { color: colors.text }]}>
              {isEnglish ? 'Bookmarks' : 'ዕልባቶች'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleQuickNav('/(tabs)/search')}
          >
            <Ionicons name="search-outline" size={24} color={colors.primary} />
            <Text style={[styles.quickLabel, { color: colors.text }]}>
              {isEnglish ? 'Search' : 'ፈልግ'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleQuickNav('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
            <Text style={[styles.quickLabel, { color: colors.text }]}>
              {isEnglish ? 'Settings' : 'ቅንብሮች'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerDisclaimer, { color: colors.textSecondary }]}>
            {isEnglish
              ? 'More features and updates are coming soon.'
              : 'ተጨማሪ ባህሪያትና ዝመናዎች በቅርቡ ይጨመራሉ።'}
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © {new Date().getFullYear()} Mezgebe Tselot
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 999,
    padding: 2,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeToggle: {
    padding: 6,
    borderRadius: 999,
  },
  tagline: {
    fontSize: 14,
    marginBottom: 20,
  },
  verseCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  verseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseRef: {
    fontSize: 14,
    fontWeight: '600',
  },
  readMore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 28,
  },
  continueButton: {
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
  continueLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  continueSubLabel: {
    color: '#E5E7EB',
    marginTop: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  quickCard: {
    width: '48%',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
  footerDisclaimer: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
});

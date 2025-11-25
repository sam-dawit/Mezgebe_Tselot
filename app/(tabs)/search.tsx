import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api, Verse } from '../../utils/api';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { language } = useSettings();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    const data = await api.searchVerses(query, language);
    setResults(data);
    setLoading(false);
  };

  const handlePress = (verse: Verse) => {
    router.push({
      pathname: '/(tabs)/reader',
      params: { book: verse.book, chapter: verse.chapter }
    });
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === 'english' ? 'Search' : 'ፈልግ'}
        </Text>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={language === 'english' ? 'Search verses...' : 'ጥቅሶችን ይፈልጉ...'}
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            {language === 'english' ? 'Searching...' : 'በመፈለግ ላይ...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerState}>
              {hasSearched ? (
                <>
                  <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
                  <Text style={[styles.stateText, { color: colors.textSecondary }]}>
                    {language === 'english' ? 'No results found' : 'ምንም ውጤት አልተገኘም'}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
                  <Text style={[styles.stateText, { color: colors.textSecondary }]}>
                    {language === 'english' ? 'Search the Bible' : 'መጽሐፍ ቅዱስን ይፈልጉ'}
                  </Text>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handlePress(item)}
            >
              <Text style={[styles.resultRef, { color: colors.primary }]}>
                {item.book} {item.chapter}:{item.verse}
              </Text>
              <Text style={[styles.resultText, { color: colors.text }]}>
                {language === 'english' ? item.text_english : item.text_amharic}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </KeyboardAvoidingView>
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 4,
  },
  listContent: {
    padding: 16,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  resultRef: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  stateText: {
    marginTop: 12,
    fontSize: 16,
  },
});

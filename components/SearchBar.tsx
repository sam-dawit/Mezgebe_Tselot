import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import { api, Verse } from '../utils/api';

export default function SearchBar() {
  const { colors } = useTheme();
  const { language } = useSettings();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    const data = await api.searchVerses(query, language);
    setResults(data);
    setLoading(false);
    setShowResults(true);
  };

  const handlePress = (verse: Verse) => {
    setShowResults(false);
    setQuery('');
    router.push({
      pathname: '/reading',
      params: { book: verse.book, chapter: verse.chapter }
    });
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={language === 'english' ? 'Search verses...' : 'ጥቅሶችን ይፈልጉ...'}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (text.length === 0) setShowResults(false);
          }}
          autoCapitalize="none"
          returnKeyType="search"
          onFocus={() => {
            if (query.length >= 2) setShowResults(true);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Modal/Overlay */}
      <Modal
        visible={showResults && query.length >= 2}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResults(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowResults(false)}
        >
          <View style={[styles.resultsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {loading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={item => item._id}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.centerState}>
                    <Text style={[styles.stateText, { color: colors.textSecondary }]}>
                      {language === 'english' ? 'No results found' : 'ምንም ውጤት አልተገኘም'}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.resultItem, { borderBottomColor: colors.border }]}
                    onPress={() => handlePress(item)}
                  >
                    <Text style={[styles.resultRef, { color: colors.primary }]}>
                      {item.book} {item.chapter}:{item.verse}
                    </Text>
                    <Text style={[styles.resultText, { color: colors.text }]} numberOfLines={2}>
                      {language === 'english' ? item.text_english : item.text_amharic}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingTop: 120, // Adjust based on header height
    paddingHorizontal: 16,
  },
  resultsContainer: {
    maxHeight: 400,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  centerState: {
    padding: 20,
    alignItems: 'center',
  },
  stateText: {
    fontSize: 14,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultRef: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  resultText: {
    fontSize: 14,
  },
});

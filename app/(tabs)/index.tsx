import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SearchBar from '../../components/SearchBar';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { language } = useSettings();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {language === 'english' ? 'Welcome' : 'እንኳን ደህና መጡ'}
          </Text>
          <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
            {language === 'english' ? 'Read and Meditate' : 'ያንብቡ እና ያሰላስሉ'}
          </Text>
        </View>

        <SearchBar />
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
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 16,
    marginTop: 4,
  },
});

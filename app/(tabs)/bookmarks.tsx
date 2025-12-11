import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Bookmark, bookmarkUtils, ChurchBookmark } from '../../utils/bookmarks';

export default function BookmarksScreen() {
  const { colors } = useTheme();
  const { language } = useSettings();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [churchBookmarks, setChurchBookmarks] = useState<ChurchBookmark[]>([]);
  const [activeTab, setActiveTab] = useState<'verses' | 'churches'>('verses');
  const [refreshing, setRefreshing] = useState(false);

  const loadBookmarks = async () => {
    setRefreshing(true);
    const verseData = await bookmarkUtils.getBookmarks();
    const churchData = await bookmarkUtils.getChurchBookmarks();
    
    // Sort by newest first
    setBookmarks(verseData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setChurchBookmarks(churchData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const handleDelete = (id: string, type: 'verse' | 'church') => {
    Alert.alert(
      language === 'english' ? 'Delete Bookmark' : 'ዕልባት ሰርዝ',
      language === 'english' ? 'Are you sure you want to remove this bookmark?' : 'ይህን ዕልባት ማስወገድ ይፈልጋሉ?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (type === 'verse') {
              await bookmarkUtils.removeBookmark(id);
            } else {
              await bookmarkUtils.removeChurchBookmark(id);
            }
            loadBookmarks();
          }
        }
      ]
    );
  };

  const handlePress = (bookmark: Bookmark) => {
    router.push({
      pathname: '/reading',
      params: { book: bookmark.book, chapter: bookmark.chapter }
    });
  };

  const handleChurchPress = (church: ChurchBookmark) => {
    // Navigate to map and maybe pass params to center on church?
    // For now just go to map, user can find it. 
    // Ideally we'd pass coordinates but map screen needs to handle params.
    router.push({
      pathname: '/(tabs)/map',
      params: { churchId: church._id }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === 'english' ? 'Bookmarks' : 'ዕልባቶች'}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'verses' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('verses')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'verses' ? colors.primary : colors.textSecondary }]}>
            {language === 'english' ? 'Verses' : 'ጥቅሶች'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'churches' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('churches')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'churches' ? colors.primary : colors.textSecondary }]}>
            {language === 'english' ? 'Churches' : 'አብያተ ክርስቲያናት'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'verses' ? (
        <FlatList
          data={bookmarks}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadBookmarks} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {language === 'english' ? 'No saved verses' : 'ምንም የተቀመጡ ጥቅሶች የሉም'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handlePress(item)}
              onLongPress={() => handleDelete(item._id, 'verse')}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.reference, { color: colors.primary }]}>
                  {item.book} {item.chapter}:{item.verse}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text 
                style={[styles.previewText, { color: colors.text }]} 
                numberOfLines={3}
              >
                {language === 'english' ? item.text_english : item.text_amharic}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={churchBookmarks}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadBookmarks} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {language === 'english' ? 'No saved churches' : 'ምንም የተቀመጡ አብያተ ክርስቲያናት የሉም'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleChurchPress(item)}
              onLongPress={() => handleDelete(item._id, 'church')}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.reference, { color: colors.primary, flex: 1 }]}>
                  {item.name}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.state}
              </Text>
              {item.address && (
                <Text style={[styles.previewText, { color: colors.text, marginTop: 4 }]} numberOfLines={2}>
                  {item.address}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Will be overridden by theme border color if needed, but simple gray is fine for now
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reference: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    fontSize: 12,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});

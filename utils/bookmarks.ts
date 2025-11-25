import AsyncStorage from '@react-native-async-storage/async-storage';
import { Church, Verse } from './api';

export interface Bookmark extends Verse {
  createdAt: string;
}

export interface ChurchBookmark extends Church {
  createdAt: string;
}

const BOOKMARKS_KEY = 'bible_bookmarks';
const CHURCH_BOOKMARKS_KEY = 'church_bookmarks';

export const bookmarkUtils = {
  // Verse Bookmarks
  getBookmarks: async (): Promise<Bookmark[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading bookmarks', e);
      return [];
    }
  },

  addBookmark: async (verse: Verse): Promise<void> => {
    try {
      const bookmarks = await bookmarkUtils.getBookmarks();
      if (bookmarks.some(b => b._id === verse._id)) return;

      const newBookmark: Bookmark = {
        ...verse,
        createdAt: new Date().toISOString(),
      };

      const newBookmarks = [newBookmark, ...bookmarks];
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    } catch (e) {
      console.error('Error adding bookmark', e);
    }
  },

  removeBookmark: async (id: string): Promise<void> => {
    try {
      const bookmarks = await bookmarkUtils.getBookmarks();
      const newBookmarks = bookmarks.filter(b => b._id !== id);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    } catch (e) {
      console.error('Error removing bookmark', e);
    }
  },

  isBookmarked: async (id: string): Promise<boolean> => {
    try {
      const bookmarks = await bookmarkUtils.getBookmarks();
      return bookmarks.some(b => b._id === id);
    } catch (e) {
      console.error('Error checking bookmark', e);
      return false;
    }
  },

  // Church Bookmarks
  getChurchBookmarks: async (): Promise<ChurchBookmark[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(CHURCH_BOOKMARKS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading church bookmarks', e);
      return [];
    }
  },

  addChurchBookmark: async (church: Church): Promise<void> => {
    try {
      const bookmarks = await bookmarkUtils.getChurchBookmarks();
      if (bookmarks.some(b => b._id === church._id)) return;

      const newBookmark: ChurchBookmark = {
        ...church,
        createdAt: new Date().toISOString(),
      };

      const newBookmarks = [newBookmark, ...bookmarks];
      await AsyncStorage.setItem(CHURCH_BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    } catch (e) {
      console.error('Error adding church bookmark', e);
    }
  },

  removeChurchBookmark: async (id: string): Promise<void> => {
    try {
      const bookmarks = await bookmarkUtils.getChurchBookmarks();
      const newBookmarks = bookmarks.filter(b => b._id !== id);
      await AsyncStorage.setItem(CHURCH_BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    } catch (e) {
      console.error('Error removing church bookmark', e);
    }
  },

  isChurchBookmarked: async (id: string): Promise<boolean> => {
    try {
      const bookmarks = await bookmarkUtils.getChurchBookmarks();
      return bookmarks.some(b => b._id === id);
    } catch (e) {
      console.error('Error checking church bookmark', e);
      return false;
    }
  }
};

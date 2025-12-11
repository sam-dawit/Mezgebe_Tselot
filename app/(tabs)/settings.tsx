import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../utils/api';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors, autoTheme, setAutoTheme } = useTheme();
  const { language, setLanguage, fontSize, setFontSize } = useSettings();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckUpdate = async () => {
    setLoading(true);
    const version = await api.getVersion();
    setLoading(false);
    if (version) {
      Alert.alert(
        language === 'english' ? 'Content Version' : 'የይዘት ስሪት',
        `${language === 'english' ? 'Version' : 'ስሪት'}: ${version.version}\n${language === 'english' ? 'Last Updated' : 'መጨረሻ የተሻሻለው'}: ${new Date(version.last_updated).toLocaleDateString()}`
      );
    } else {
      Alert.alert('Error', 'Failed to fetch version info');
    }
  };

  const handleInitData = async () => {
      setLoading(true);
      const result = await api.initData();
      setLoading(false);
      if (result) {
          Alert.alert('Success', 'Sample data initialized');
      } else {
          Alert.alert('Error', 'Failed to initialize data');
      }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: colors.text }]}>
          {language === 'english' ? 'Settings' : 'ቅንብሮች'}
        </Text>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {language === 'english' ? 'ACCOUNT' : 'መለያ'}
          </Text>
          
          {(!user || !user.email) ? (
            <TouchableOpacity 
              style={styles.actionRow} 
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={[styles.actionLabel, { color: colors.primary }]}>
                {language === 'english' ? 'Create Account' : 'መለያ ይፍጠሩ'}
              </Text>
              <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.actionRow} 
              onPress={signOut}
            >
              <Text style={[styles.actionLabel, { color: '#FF3B30' }]}>
                {language === 'english' ? 'Log Out' : 'ውጣ'}
              </Text>
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {language === 'english' ? 'APPEARANCE' : 'ገጽታ'}
          </Text>
          
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLabel}>
              <Ionicons name="time-outline" size={22} color={colors.text} />
              <Text style={[styles.label, { color: colors.text }]}>
                {language === 'english' ? 'Auto Theme (Time-based)' : 'በሰዓት የሚለዋወጥ ገጽታ'}
              </Text>
            </View>
            <Switch
              value={autoTheme}
              onValueChange={setAutoTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#f4f3f4'}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: 'transparent' }]}>
            <View style={styles.rowLabel}>
              <Ionicons name="moon-outline" size={22} color={colors.text} />
              <Text style={[styles.label, { color: colors.text }]}>
                {language === 'english' ? 'Dark Mode' : 'ጨለማ ሁነታ'}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              disabled={autoTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {language === 'english' ? 'READING' : 'ንባብ'}
          </Text>

          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>
              {language === 'english' ? 'Language' : 'ቋንቋ'}
            </Text>
            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[styles.toggleBtn, language === 'english' && { backgroundColor: colors.primary }]}
                onPress={() => setLanguage('english')}
              >
                <Text style={[styles.toggleText, language === 'english' && { color: '#FFF' }, {color: colors.text}]}>Eng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, language === 'amharic' && { backgroundColor: colors.primary }]}
                onPress={() => setLanguage('amharic')}
              >
                <Text style={[styles.toggleText, language === 'amharic' && { color: '#FFF' }, {color: colors.text}]}>አማ</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.row, { borderBottomColor: 'transparent' }]}>
            <Text style={[styles.label, { color: colors.text }]}>
              {language === 'english' ? 'Font Size' : 'የፊደል መጠን'}
            </Text>
            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[styles.toggleBtn, fontSize === 'small' && { backgroundColor: colors.primary }]}
                onPress={() => setFontSize('small')}
              >
                <Text style={[styles.toggleText, { fontSize: 14 }, fontSize === 'small' && { color: '#FFF' }, {color: colors.text}]}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, fontSize === 'medium' && { backgroundColor: colors.primary }]}
                onPress={() => setFontSize('medium')}
              >
                <Text style={[styles.toggleText, { fontSize: 18 }, fontSize === 'medium' && { color: '#FFF' }, {color: colors.text}]}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, fontSize === 'large' && { backgroundColor: colors.primary }]}
                onPress={() => setFontSize('large')}
              >
                <Text style={[styles.toggleText, { fontSize: 22 }, fontSize === 'large' && { color: '#FFF' }, {color: colors.text}]}>A</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {language === 'english' ? 'CONTENT' : 'ይዘት'}
          </Text>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleCheckUpdate}>
            <Text style={[styles.actionLabel, { color: colors.primary }]}>
              {loading ? 'Checking...' : (language === 'english' ? 'Check for Updates' : 'ዝመናዎችን ይፈትሹ')}
            </Text>
            <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

           <TouchableOpacity style={styles.actionRow} onPress={handleInitData}>
            <Text style={[styles.actionLabel, { color: colors.primary }]}>
              {language === 'english' ? 'Initialize Sample Data' : 'የናሙና መረጃ አስገባ'}
            </Text>
            <Ionicons name="refresh-circle-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

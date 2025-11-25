import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    ethiopianToGregorian,
    getEthiopianMonthName,
    getEthiopianTime,
    getEthiopianWeekday,
    getGregorianMonthName,
    shiftToEthiopianTimezone,
    toEthiopian,
    WEEKDAYS_AM,
    WEEKDAYS_EN
} from '../../utils/calendar';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const { language } = useSettings();
  const [calendarType, setCalendarType] = useState<'gregorian' | 'ethiopian'>('gregorian');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ethiopianDate, setEthiopianDate] = useState(toEthiopian(shiftToEthiopianTimezone(new Date())));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (calendarType === 'ethiopian') {
      // If switching to/updating Ethiopian, use shifted time
      setEthiopianDate(toEthiopian(shiftToEthiopianTimezone(currentDate)));
    } else {
      setEthiopianDate(toEthiopian(currentDate));
    }
  }, [currentDate, calendarType]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarGrid = () => {
    if (calendarType === 'gregorian') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      
      const days = [];
      // Empty slots for previous month
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      // Days of current month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }
      return days;
    } else {
      // Ethiopian Calendar Logic
      const year = ethiopianDate.year;
      const month = ethiopianDate.month;
      
      // Days in month: 30 for 1-12. 13th month is 5 or 6.
      let daysInMonth = 30;
      if (month === 13) {
        daysInMonth = year % 4 === 3 ? 6 : 5;
      }

      // First day of the month
      const firstDay = getEthiopianWeekday(year, month, 1);
      
      const days = [];
      // Empty slots for previous month
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      // Days of current month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }
      return days;
    }
  };

  const renderDay = ({ item }: { item: number | null }) => {
    if (!item) return <View style={styles.dayCell} />;
    
    let isToday = false;
    const today = new Date();
    
    if (calendarType === 'gregorian') {
      isToday = 
        item === today.getDate() && 
        currentDate.getMonth() === today.getMonth() && 
        currentDate.getFullYear() === today.getFullYear();
    } else {
      const todayEth = toEthiopian(today);
      isToday = 
        item === todayEth.day &&
        ethiopianDate.month === todayEth.month &&
        ethiopianDate.year === todayEth.year;
    }

    return (
      <View style={[styles.dayCell, isToday && { backgroundColor: colors.primary, borderRadius: 20 }]}>
        <Text style={[styles.dayText, { color: isToday ? '#FFF' : colors.text }]}>
          {item}
        </Text>
      </View>
    );
  };

  const changeMonth = (increment: number) => {
    if (calendarType === 'gregorian') {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + increment);
      setCurrentDate(newDate);
    } else {
      // Ethiopian Navigation
      let newMonth = ethiopianDate.month + increment;
      let newYear = ethiopianDate.year;

      if (newMonth > 13) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 13;
        newYear--;
      }

      // Convert 1st of new Ethiopian month to Gregorian
      // This ensures we land in the correct month view
      const newGregorianDate = ethiopianToGregorian(newYear, newMonth, 1);
      setCurrentDate(newGregorianDate);
    }
  };

  const renderClock = () => {
    if (calendarType === 'gregorian') {
      return (
        <Text style={[styles.clockText, { color: colors.primary }]}>
          {currentTime.toLocaleTimeString()}
        </Text>
      );
    } else {
      const ethTime = getEthiopianTime(shiftToEthiopianTimezone(currentTime), language);
      const h = ethTime.hours.toString().padStart(2, '0');
      const m = ethTime.minutes.toString().padStart(2, '0');
      const s = ethTime.seconds.toString().padStart(2, '0');
      return (
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.clockText, { color: colors.primary }]}>
            {h}:{m}:{s}
          </Text>
          <Text style={[styles.periodText, { color: colors.textSecondary }]}>
            {ethTime.period}
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === 'english' ? 'Calendar' : 'ቀን መቁጠሪያ'}
        </Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, calendarType === 'gregorian' && { backgroundColor: colors.primary }]}
            onPress={() => setCalendarType('gregorian')}
          >
            <Text style={[styles.toggleText, calendarType === 'gregorian' && { color: '#FFF' }, {color: colors.text}]}>GC</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, calendarType === 'ethiopian' && { backgroundColor: colors.primary }]}
            onPress={() => setCalendarType('ethiopian')}
          >
            <Text style={[styles.toggleText, calendarType === 'ethiopian' && { color: '#FFF' }, {color: colors.text}]}>EC</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {renderClock()}
        <View style={styles.dateDisplay}>
          <Text style={[styles.bigDate, { color: colors.primary }]}>
            {calendarType === 'gregorian' ? currentDate.getDate() : ethiopianDate.day}
          </Text>
          <View>
            <Text style={[styles.monthYear, { color: colors.text }]}>
              {calendarType === 'gregorian' 
                ? `${getGregorianMonthName(currentDate.getMonth(), language)} ${currentDate.getFullYear()}`
                : `${getEthiopianMonthName(ethiopianDate.month, 'amharic')} ${ethiopianDate.year}`
              }
            </Text>
            <Text style={[styles.weekday, { color: colors.textSecondary }]}>
              {language === 'english' && calendarType === 'gregorian'
                ? WEEKDAYS_EN[currentDate.getDay()] 
                : WEEKDAYS_AM[currentDate.getDay()]
              }
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.calendarContainer, { backgroundColor: colors.card }]}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.calendarTitle, { color: colors.text }]}>
            {calendarType === 'gregorian'
              ? `${getGregorianMonthName(currentDate.getMonth(), language)} ${currentDate.getFullYear()}`
              : `${getEthiopianMonthName(ethiopianDate.month, 'amharic')} ${ethiopianDate.year}`
            }
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdaysRow}>
          {(calendarType === 'gregorian' && language === 'english' ? WEEKDAYS_EN : WEEKDAYS_AM).map((day, index) => (
            <Text key={index} style={[styles.weekdayLabel, { color: colors.textSecondary }]}>{day}</Text>
          ))}
        </View>

        <FlatList
          data={generateCalendarGrid()}
          renderItem={renderDay}
          keyExtractor={(item, index) => index.toString()}
          numColumns={7}
          contentContainerStyle={styles.grid}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleText: {
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  clockText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  periodText: {
    fontSize: 16,
    marginTop: 4,
  },
  bigDate: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  monthYear: {
    fontSize: 24,
    fontWeight: '600',
  },
  weekday: {
    fontSize: 18,
  },
  calendarContainer: {
    borderRadius: 16,
    padding: 16,
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayLabel: {
    width: 40,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12, // Reduced font size to fit Amharic text
  },
  grid: {
    alignItems: 'center',
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  dayText: {
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  subInfo: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

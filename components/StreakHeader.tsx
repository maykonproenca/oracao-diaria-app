import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';

interface StreakHeaderProps {
  title: string;
}

export function StreakHeader({ title }: StreakHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
        height: Platform.OS === 'ios' ? 44 + insets.top : 56,
      }
    ]}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    justifyContent: 'flex-end',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
});

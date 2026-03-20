import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { sizing, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Option = { label: string; sublabel?: string; value: string; };

type Props = {
  options: Option[];
  selected: string | null | Set<string>;
  onSelect: (value: string) => void;
  columns: 2 | 3 | 4;
  multiSelect?: boolean;
};

export function SegmentSelector({ options, selected, onSelect, columns, multiSelect }: Props) {
  const isSelected = (value: string) => {
    if (multiSelect && selected instanceof Set) {
      return selected.has(value);
    }
    return selected === value;
  };

  return (
    <View style={[styles.container, { gap: spacing.sm }]}>
      {options.map((option) => {
        const optionSelected = isSelected(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              { flex: 1, minWidth: `${100 / columns - 2}%` },
              optionSelected ? styles.selected : styles.unselected,
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.75}
          >
            <Text
              style={[typography.segmentLabel, optionSelected ? styles.selectedText : styles.unselectedText]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {option.label}
            </Text>
            {option.sublabel && (
              <Text
                style={[typography.segmentSub, optionSelected ? styles.selectedText : styles.unselectedText]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {option.sublabel}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    minHeight: sizing.segmentHeight,
    borderRadius: sizing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  selected: {
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  unselected: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedText: {
    color: colors.accent,
  },
  unselectedText: {
    color: colors.textDim,
  },
});

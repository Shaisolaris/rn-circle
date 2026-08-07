import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { parseRichText } from '../core/text';
import { useTheme } from '../theme/ThemeContext';

interface RichTextProps extends TextProps {
  text: string;
}

/** Renders post/comment text with @mentions and #hashtags highlighted in the accent color. */
export function RichText({ text, style, ...rest }: RichTextProps) {
  const theme = useTheme();
  const spans = parseRichText(text);

  return (
    <Text style={[styles.base, { color: theme.colors.text }, style]} {...rest}>
      {spans.map((span, index) => {
        if (span.type === 'text') {
          return <Text key={`${index}-${span.value}`}>{span.value}</Text>;
        }
        return (
          <Text key={`${index}-${span.value}`} style={{ color: theme.colors.accent, fontWeight: '600' }}>
            {span.value}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 15,
    lineHeight: 21,
  },
});

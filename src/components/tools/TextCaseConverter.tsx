// src/components/tools/TextCaseConverter.tsx
// Convert text between different cases

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

type CaseType = 'lower' | 'upper' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab';

export const TextCaseConverter: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [copiedType, setCopiedType] = useState<CaseType | null>(null);

    const copyToClipboard = async (text: string, type: CaseType) => {
        await Clipboard.setStringAsync(text);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 1500);
    };

    const convertCase = useCallback((text: string, type: CaseType): string => {
        if (!text) return '';

        switch (type) {
            case 'lower':
                return text.toLowerCase();
            case 'upper':
                return text.toUpperCase();
            case 'title':
                return text.replace(/\w\S*/g, (txt) =>
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
            case 'sentence':
                return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            case 'camel':
                return text.toLowerCase()
                    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
            case 'snake':
                return text.toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-zA-Z0-9_]/g, '');
            case 'kebab':
                return text.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-zA-Z0-9-]/g, '');
            default:
                return text;
        }
    }, []);

    const cases: { type: CaseType; label: string; example: string }[] = [
        { type: 'lower', label: 'lowercase', example: 'hello world' },
        { type: 'upper', label: 'UPPERCASE', example: 'HELLO WORLD' },
        { type: 'title', label: 'Title Case', example: 'Hello World' },
        { type: 'sentence', label: 'Sentence case', example: 'Hello world' },
        { type: 'camel', label: 'camelCase', example: 'helloWorld' },
        { type: 'snake', label: 'snake_case', example: 'hello_world' },
        { type: 'kebab', label: 'kebab-case', example: 'hello-world' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.inputSection}>
                <Text style={styles.label}>INPUT TEXT</Text>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type or paste text here..."
                    placeholderTextColor={colors.secondary}
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.resultsGrid}>
                {cases.map((c) => {
                    const result = inputText ? convertCase(inputText, c.type) : c.example;
                    return (
                        <TouchableOpacity
                            key={c.type}
                            style={styles.resultCard}
                            onPress={() => copyToClipboard(result, c.type)}
                            activeOpacity={0.7}
                        >
                            {copiedType === c.type && (
                                <View style={styles.copiedBadge}>
                                    <Text style={styles.copiedText}>Copied!</Text>
                                </View>
                            )}
                            <Text style={styles.resultLabel}>{c.label}</Text>
                            <Text style={styles.resultValue} numberOfLines={2}>{result}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 16 },
    inputSection: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        gap: 8,
    },
    label: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
    },
    input: {
        fontFamily,
        fontSize: 16,
        color: colors.primary,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    resultsGrid: {
        gap: 8,
    },
    resultCard: {
        backgroundColor: colors.input,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.subtle,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultLabel: {
        fontFamily,
        fontSize: 12,
        fontWeight: '600',
        color: colors.secondary,
    },
    resultValue: {
        fontFamily,
        fontSize: 14,
        color: colors.primary,
        flex: 1,
        textAlign: 'right',
        marginLeft: 12,
    },
    copiedBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        zIndex: 1,
    },
    copiedText: {
        color: colors.main,
        fontSize: 10,
        fontWeight: '600',
    },
});

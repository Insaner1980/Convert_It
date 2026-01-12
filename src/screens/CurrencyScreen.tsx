import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Pressable,
    FlatList,
} from 'react-native';
import { MarqueeInput } from '../components/MarqueeInput';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftRight, RefreshCw, Plus, Search, X, Check } from 'lucide-react-native';

import { CURRENCY_INFO, DEFAULT_CURRENCIES, TIMING } from '../constants';
import { colors } from '../theme/colors';
import { fontFamily, getDynamicFontSize } from '../theme/typography';
import { shadows } from '../theme';
import { PickerButton } from '../components/PickerButton';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CopiedBadge } from '../components/CopiedBadge';
import { useClipboard, useSafeTimeout, useMounted } from '../hooks';
import { API_ENDPOINTS, fetchWithTimeout } from '../config';

interface ExchangeRates {
    [key: string]: number;
}

export const CurrencyScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { copied, copyToClipboard } = useClipboard();
    const { safeSetTimeout } = useSafeTimeout();
    const isMounted = useMounted();
    const [value, setValue] = useState<string>('100');
    const [fromCurrency, setFromCurrency] = useState('EUR');
    const [toCurrency, setToCurrency] = useState('USD');

    const [fromModalVisible, setFromModalVisible] = useState(false);
    const [toModalVisible, setToModalVisible] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [addedCurrency, setAddedCurrency] = useState<string | null>(null);

    // Favorite currencies (user's selected currencies)
    const [favoriteCurrencies, setFavoriteCurrencies] = useState<string[]>(DEFAULT_CURRENCIES);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{ visible: boolean; code: string; name: string }>({
        visible: false,
        code: '',
        name: '',
    });

    // API state
    const [rates, setRates] = useState<ExchangeRates>({});
    const [baseCurrency, setBaseCurrency] = useState('EUR');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Toast notification state
    const [toast, setToast] = useState<string | null>(null);

    const showToast = useCallback((message: string) => {
        setToast(message);
        safeSetTimeout(() => setToast(null), TIMING.TOAST_DURATION);
    }, [safeSetTimeout]);

    const fetchRates = async (base: string = 'EUR') => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchWithTimeout(API_ENDPOINTS.exchangeRates(base));
            if (!response.ok) throw new Error('Failed to fetch rates');
            const data = await response.json();

            if (data.result !== 'success') {
                throw new Error(data['error-type'] || 'API error');
            }

            if (!isMounted.current) return;
            setRates(data.conversion_rates);
            setBaseCurrency(base);
            const updateDate = new Date(data.time_last_update_utc);
            setLastUpdated(updateDate.toLocaleDateString('en-CA'));
        } catch {
            if (!isMounted.current) return;
            setError('Could not load exchange rates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates('EUR');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentionally run only once on mount

    const result = useMemo(() => {
        const val = parseFloat(value);
        if (isNaN(val) || Object.keys(rates).length === 0) return '---';

        const fromRate = rates[fromCurrency];
        const toRate = rates[toCurrency];

        if (!fromRate || !toRate) return '---';

        const inBase = val / fromRate;
        const final = inBase * toRate;

        return final.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        });
    }, [value, fromCurrency, toCurrency, rates]);

    const exchangeRate = useMemo(() => {
        if (Object.keys(rates).length === 0) return null;
        const fromRate = rates[fromCurrency];
        const toRate = rates[toCurrency];
        if (!fromRate || !toRate) return null;
        return (toRate / fromRate).toFixed(4);
    }, [fromCurrency, toCurrency, rates]);

    const handleSwap = useCallback(() => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    }, [fromCurrency, toCurrency]);

    const addCurrency = useCallback((code: string) => {
        if (!favoriteCurrencies.includes(code)) {
            setFavoriteCurrencies([...favoriteCurrencies, code]);
            // Show confirmation
            setAddedCurrency(code);
            safeSetTimeout(() => setAddedCurrency(null), TIMING.ADDED_BADGE_DURATION);
        }
        setSearchModalVisible(false);
        setSearchQuery('');
    }, [favoriteCurrencies, safeSetTimeout]);

    const removeCurrency = useCallback((code: string) => {
        // Don't allow removing if it's currently selected
        if (code === fromCurrency || code === toCurrency) {
            showToast(`${code} is currently in use`);
            return;
        }
        // Keep at least 2 currencies
        if (favoriteCurrencies.length <= 2) {
            showToast('You need at least 2 currencies');
            return;
        }
        // Show confirm dialog
        const info = CURRENCY_INFO[code];
        const name = info?.name || code;
        setConfirmDialog({ visible: true, code, name });
    }, [fromCurrency, toCurrency, favoriteCurrencies, showToast]);

    const handleConfirmRemove = useCallback(() => {
        setFavoriteCurrencies(favoriteCurrencies.filter(c => c !== confirmDialog.code));
        setConfirmDialog({ visible: false, code: '', name: '' });
    }, [favoriteCurrencies, confirmDialog.code]);

    const handleCancelRemove = useCallback(() => {
        setConfirmDialog({ visible: false, code: '', name: '' });
    }, []);

    // Memoized currency data to prevent creating new objects on each render
    const fromCurrencyData = useMemo(() =>
        CURRENCY_INFO[fromCurrency] || { name: fromCurrency, symbol: fromCurrency },
        [fromCurrency]
    );

    const toCurrencyData = useMemo(() =>
        CURRENCY_INFO[toCurrency] || { name: toCurrency, symbol: toCurrency },
        [toCurrency]
    );

    // Favorite currency options for picker
    const favoriteOptions = useMemo(() => {
        return favoriteCurrencies.map(code => {
            const info = CURRENCY_INFO[code];
            const name = info?.name || code;
            return { label: `${code} - ${name}`, value: code };
        });
    }, [favoriteCurrencies]);

    // All currencies for search (excluding already added)
    const searchResults = useMemo(() => {
        const allCodes = Object.keys(rates).length > 0 ? Object.keys(rates) : Object.keys(CURRENCY_INFO);
        const query = searchQuery.toLowerCase();

        return allCodes
            .filter(code => {
                if (favoriteCurrencies.includes(code)) return false;
                if (!searchQuery) return true;
                const info = CURRENCY_INFO[code];
                const name = info?.name || '';
                return code.toLowerCase().includes(query) || name.toLowerCase().includes(query);
            })
            .sort((a, b) => a.localeCompare(b))
            .slice(0, 50); // Limit results
    }, [rates, searchQuery, favoriteCurrencies]);

    // Custom Picker Modal with long press to delete
    const renderPickerModal = (
        visible: boolean,
        onClose: () => void,
        title: string,
        selectedValue: string,
        onSelect: (value: string) => void
    ) => (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={favoriteOptions}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    selectedValue === item.value && styles.modalOptionSelected
                                ]}
                                onPress={() => {
                                    onSelect(item.value);
                                    onClose();
                                }}
                                onLongPress={() => removeCurrency(item.value)}
                                delayLongPress={TIMING.LONG_PRESS_DELAY}
                            >
                                <View style={styles.modalOptionLeft}>
                                    <Text style={[
                                        styles.modalOptionText,
                                        selectedValue === item.value && styles.modalOptionTextSelected
                                    ]}>
                                        {item.label}
                                    </Text>
                                </View>
                                {selectedValue === item.value && (
                                    <Check size={20} color={colors.accent} />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            onClose();
                            setSearchModalVisible(true);
                        }}
                    >
                        <View style={styles.addButtonIcon}>
                            <Plus size={18} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );

    // Search Modal for adding currencies
    const renderSearchModal = () => (
        <Modal visible={searchModalVisible} transparent animationType="slide" onRequestClose={() => setSearchModalVisible(false)}>
            <View style={styles.searchModalContainer}>
                <View style={styles.searchModalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Currency</Text>
                        <TouchableOpacity onPress={() => {
                            setSearchModalVisible(false);
                            setSearchQuery('');
                        }}>
                            <X size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.searchInputContainer}>
                        <Search size={20} color={colors.secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search currencies..."
                            placeholderTextColor={colors.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={20} color={colors.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => {
                            const info = CURRENCY_INFO[item];
                            const name = info?.name || item;
                            const symbol = info?.symbol || item;
                            return (
                                <TouchableOpacity
                                    style={styles.searchResultItem}
                                    onPress={() => addCurrency(item)}
                                >
                                    <View style={styles.searchResultLeft}>
                                        <Text style={styles.searchResultCode}>{item}</Text>
                                        <Text style={styles.searchResultName}>{name}</Text>
                                    </View>
                                    <Text style={styles.searchResultSymbol}>{symbol}</Text>
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <View style={styles.emptySearch}>
                                <Text style={styles.emptySearchText}>
                                    {searchQuery ? 'No currencies found' : 'Type to search'}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Currency</Text>
                <Text style={styles.headerSubtitle}>
                    {loading ? 'Loading rates...' :
                     error ? error :
                     lastUpdated ? `Rates from ${lastUpdated}` : 'Rates are approximate'}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                {loading && Object.keys(rates).length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={styles.loadingText}>Loading exchange rates...</Text>
                    </View>
                ) : (
                    <>
                        {/* Input Section */}
                        <View style={styles.inputSection}>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={() => fetchRates(baseCurrency)}
                                disabled={loading}
                            >
                                <RefreshCw
                                    size={18}
                                    color={loading ? colors.secondary : colors.accent}
                                />
                            </TouchableOpacity>
                            <View style={styles.inputRow}>
                                <Text style={styles.currencySymbol}>{fromCurrencyData.symbol}</Text>
                                <MarqueeInput
                                    containerStyle={styles.inputFieldContainer}
                                    fontSize={48}
                                    value={value}
                                    onChangeText={setValue}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    maxLength={15}
                                />
                            </View>
                            <Text style={styles.inputLabel}>{fromCurrencyData.name}</Text>
                        </View>

                        {/* Currency Selection */}
                        <View style={styles.currencyContainer}>
                            <View style={styles.currencyField}>
                                <Text style={styles.currencyLabel}>FROM</Text>
                                <PickerButton
                                    value={`${fromCurrency} - ${fromCurrencyData.name}`}
                                    onPress={() => setFromModalVisible(true)}
                                />
                            </View>

                            <AnimatedPressable style={styles.swapButton} onPress={handleSwap}>
                                <ArrowLeftRight color={colors.accent} size={20} />
                                <Text style={styles.swapButtonText}>Swap</Text>
                            </AnimatedPressable>

                            <View style={styles.currencyField}>
                                <Text style={styles.currencyLabel}>TO</Text>
                                <PickerButton
                                    value={`${toCurrency} - ${toCurrencyData.name}`}
                                    onPress={() => setToModalVisible(true)}
                                />
                            </View>
                        </View>

                        {/* Result */}
                        <TouchableOpacity
                            style={styles.resultContainer}
                            onPress={() => copyToClipboard(`${toCurrencyData.symbol}${result}`)}
                            activeOpacity={0.7}
                        >
                            {copied && <CopiedBadge />}
                            <View style={styles.resultRow}>
                                <Text style={styles.resultSymbol}>{toCurrencyData.symbol}</Text>
                                <Text style={[styles.resultValue, { fontSize: getDynamicFontSize(result) }]}>{result}</Text>
                            </View>
                            <Text style={styles.resultCurrency}>{toCurrencyData.name}</Text>
                        </TouchableOpacity>

                        {/* Exchange Rate Info */}
                        {exchangeRate && (
                            <View style={styles.rateInfo}>
                                <Text style={styles.rateText}>
                                    1 {fromCurrency} = {exchangeRate} {toCurrency}
                                </Text>
                            </View>
                        )}

                        {/* My Currencies */}
                        <View style={styles.myCurrenciesSection}>
                            <View style={styles.currencyPillsContainer}>
                                {favoriteCurrencies.map(code => {
                                    const info = CURRENCY_INFO[code];
                                    const isInUse = code === fromCurrency || code === toCurrency;
                                    const isJustAdded = code === addedCurrency;
                                    return (
                                        <TouchableOpacity
                                            key={code}
                                            style={[
                                                styles.currencyPill,
                                                isInUse && styles.currencyPillActive,
                                                isJustAdded && styles.currencyPillAdded,
                                            ]}
                                            onPress={() => {
                                                // Quick select as TO currency
                                                if (code !== fromCurrency) {
                                                    setToCurrency(code);
                                                }
                                            }}
                                            onLongPress={() => removeCurrency(code)}
                                            delayLongPress={TIMING.LONG_PRESS_DELAY}
                                        >
                                            <Text style={[
                                                styles.currencyPillText,
                                                isInUse && styles.currencyPillTextActive,
                                            ]}>
                                                {info?.symbol || code}
                                            </Text>
                                            <Text style={[
                                                styles.currencyPillCode,
                                                isInUse && styles.currencyPillCodeActive,
                                            ]}>
                                                {code}
                                            </Text>
                                            {isJustAdded && (
                                                <View style={styles.addedBadge}>
                                                    <Text style={styles.addedBadgeText}>NEW</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {renderPickerModal(
                fromModalVisible,
                () => setFromModalVisible(false),
                'Select From Currency',
                fromCurrency,
                setFromCurrency
            )}
            {renderPickerModal(
                toModalVisible,
                () => setToModalVisible(false),
                'Select To Currency',
                toCurrency,
                setToCurrency
            )}
            {renderSearchModal()}

            <ConfirmDialog
                visible={confirmDialog.visible}
                title="Remove Currency"
                message={`Remove ${confirmDialog.code} (${confirmDialog.name}) from your list?`}
                confirmText="Remove"
                cancelText="Cancel"
                onConfirm={handleConfirmRemove}
                onCancel={handleCancelRemove}
                destructive
            />

            {/* Toast notification */}
            {toast && (
                <View style={styles.toast}>
                    <Text style={styles.toastText}>{toast}</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.main },
    header: { paddingHorizontal: 16, paddingVertical: 16 },
    headerTitle: { fontFamily, fontSize: 28, fontWeight: '600', color: colors.primary },
    headerSubtitle: { fontSize: 12, color: colors.secondary },
    refreshButton: { position: 'absolute', top: 8, right: 8, padding: 8, zIndex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, gap: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, gap: 16 },
    loadingText: { fontSize: 14, color: colors.secondary },
    inputSection: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        paddingTop: 32,
        paddingBottom: 16,
        gap: 4,
        ...shadows.card,
    },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    currencySymbol: { fontSize: 32, fontWeight: '300', color: colors.secondary },
    inputFieldContainer: { flex: 1, minHeight: 50, textAlignVertical: 'center' },
    inputLabel: { fontSize: 14, color: colors.secondary },
    currencyContainer: { gap: 12 },
    currencyField: { gap: 8 },
    currencyLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
    swapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        backgroundColor: colors.card,
        alignSelf: 'center',
        ...shadows.button,
    },
    swapButtonText: { fontSize: 14, fontWeight: '600', color: colors.accent },
    resultContainer: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 8,
        ...shadows.card,
    },
    resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    resultSymbol: { fontSize: 32, fontWeight: '300', color: colors.primary },
    resultValue: { fontSize: 48, fontWeight: '600', color: colors.primary },
    resultCurrency: { fontSize: 16, color: colors.secondary },
    rateInfo: { alignItems: 'center', padding: 16 },
    rateText: { fontSize: 14, color: colors.secondary },
    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.subtle },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.primary },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.subtle + '40' },
    modalOptionSelected: {},
    modalOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    modalOptionText: { fontSize: 16, color: colors.primary },
    modalOptionTextSelected: { color: colors.accent, fontWeight: '600' },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: colors.subtle, backgroundColor: colors.elevated },
    addButtonIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.button,
    },

    // Search modal styles
    searchModalContainer: { flex: 1, backgroundColor: colors.overlay },
    searchModalContent: { flex: 1, backgroundColor: colors.main, marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.elevated, margin: 16, paddingHorizontal: 16, borderRadius: 12, gap: 12 },
    searchInput: { flex: 1, paddingVertical: 14, color: colors.primary, fontSize: 16 },
    searchResultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.subtle + '40' },
    searchResultLeft: { gap: 4 },
    searchResultCode: { fontSize: 16, fontWeight: '600', color: colors.primary },
    searchResultName: { fontSize: 13, color: colors.secondary },
    searchResultSymbol: { fontSize: 20, color: colors.secondary },
    emptySearch: { padding: 40, alignItems: 'center' },
    emptySearchText: { fontSize: 14, color: colors.secondary },

    // My Currencies section
    myCurrenciesSection: { gap: 8 },
    currencyPillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    currencyPill: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        minWidth: 60,
        ...shadows.button,
    },
    currencyPillActive: {
        backgroundColor: colors.accent,
    },
    currencyPillAdded: {
        backgroundColor: colors.accent,
    },
    currencyPillText: { fontSize: 18, fontWeight: '600', color: colors.secondary },
    currencyPillTextActive: { color: colors.primary },
    currencyPillCode: { fontSize: 11, color: colors.secondary, marginTop: 2 },
    currencyPillCodeActive: { color: colors.primary },
    addedBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.accent,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 6,
    },
    addedBadgeText: { fontSize: 8, fontWeight: '700', color: colors.main },

    // Toast styles
    toast: {
        position: 'absolute',
        bottom: 100,
        left: 16,
        right: 16,
        backgroundColor: colors.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        ...shadows.card,
    },
    toastText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});

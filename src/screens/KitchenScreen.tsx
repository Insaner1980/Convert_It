import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Search, Plus, Minus, ChevronDown } from 'lucide-react-native';

import { KITCHEN_UNITS, INGREDIENTS, TIMING } from '../constants';
import { KitchenIngredient } from '../types';
import { colors } from '../theme/colors';
import { fontFamily, getDynamicFontSize } from '../theme/typography';
import { shadows } from '../theme';
import { PickerModal } from '../components/PickerModal';
import { PickerButton } from '../components/PickerButton';
import {
    YeastConverter,
    ButterConverter,
    ServingSizeAdjuster,
} from '../components/kitchen';
import { useClipboard, useSafeTimeout, useMounted } from '../hooks';
import { API_ENDPOINTS, fetchWithTimeout } from '../config';
import { MarqueeInput } from '../components/MarqueeInput';
import { CopiedBadge } from '../components/CopiedBadge';

type KitchenTab = 'ingredients' | 'oven' | 'special';

// Extracted to module scope to prevent re-creation on each render
interface TabButtonProps {
    tab: KitchenTab;
    label: string;
    activeTab: KitchenTab;
    onPress: (tab: KitchenTab) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, label, activeTab, onPress }) => (
    <TouchableOpacity
        onPress={() => onPress(tab)}
        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
    >
        <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
            {label}
        </Text>
    </TouchableOpacity>
);

// USDA Food Search Result type
interface USDAFood {
    fdcId: number;
    description: string;
    dataType: string;
    brandName?: string;
}

interface USDAFoodPortion {
    gramWeight: number;
    portionDescription: string;
    modifier?: string;
}

export const KitchenScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { copied, copyToClipboard } = useClipboard();
    const { safeSetTimeout } = useSafeTimeout();
    const isMounted = useMounted();
    const [activeTab, setActiveTab] = useState<KitchenTab>('ingredients');
    const [value, setValue] = useState<string>('1');
    const [ingredientId, setIngredientId] = useState(INGREDIENTS[0].id);
    const [fromUnitId, setFromUnitId] = useState('cup');
    const [toUnitId, setToUnitId] = useState('g');
    const [ovenTemp, setOvenTemp] = useState(200); // Always stored as Conventional °C
    const [ovenMode, setOvenMode] = useState<'conventional' | 'fan' | 'fahrenheit'>('conventional');
    const [ovenInputText, setOvenInputText] = useState(''); // For editable input
    const [ovenInputFocused, setOvenInputFocused] = useState(false);

    // Custom ingredients added by user
    const [customIngredients, setCustomIngredients] = useState<KitchenIngredient[]>([]);

    const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
    const [fromModalVisible, setFromModalVisible] = useState(false);
    const [toModalVisible, setToModalVisible] = useState(false);

    // USDA Search state
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<USDAFood[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Toast notification state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        safeSetTimeout(() => setToast(null), TIMING.TOAST_DURATION);
    }, [safeSetTimeout]);

    // All ingredients (built-in + custom)
    const allIngredients = useMemo(() => {
        return [...INGREDIENTS, ...customIngredients];
    }, [customIngredients]);

    const ingredient = useMemo(() =>
        allIngredients.find(i => i.id === ingredientId) || INGREDIENTS[0]
        , [ingredientId, allIngredients]);

    const result = useMemo(() => {
        const val = parseFloat(value);
        if (isNaN(val)) return '---';

        const fromUnit = KITCHEN_UNITS.find(u => u.id === fromUnitId);
        const toUnit = KITCHEN_UNITS.find(u => u.id === toUnitId);

        if (!fromUnit || !toUnit) return '---';

        let grams: number;
        if (fromUnit.type === 'volume') {
            const cups = val * fromUnit.factor;
            grams = cups * ingredient.density;
        } else if (fromUnit.type === 'weight') {
            grams = val * fromUnit.factor;
        } else {
            grams = val * fromUnit.factor;
        }

        let finalValue: number;
        if (toUnit.type === 'volume') {
            const cups = grams / ingredient.density;
            finalValue = cups / toUnit.factor;
        } else if (toUnit.type === 'weight') {
            finalValue = grams / toUnit.factor;
        } else {
            finalValue = grams / toUnit.factor;
        }

        return finalValue.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
        });
    }, [value, fromUnitId, toUnitId, ingredient]);

    // USDA API Search
    const searchUSDA = useCallback(async () => {
        if (searchQuery.trim().length < 2) return;

        setIsSearching(true);
        try {
            const response = await fetchWithTimeout(API_ENDPOINTS.usdaSearch(searchQuery));

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            if (!isMounted.current) return;
            setSearchResults(data.foods || []);
        } catch {
            if (!isMounted.current) return;
            showToast('Could not search USDA database', 'error');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, isMounted, showToast]);

    // Auto-search when typing (debounced)
    useEffect(() => {
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        searchTimerRef.current = setTimeout(() => {
            searchUSDA();
        }, 500);

        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, [searchQuery, searchUSDA]);

    // Get food details and add to custom ingredients
    const addFoodFromUSDA = useCallback(async (food: USDAFood) => {
        setIsLoadingDetails(true);
        try {
            const response = await fetchWithTimeout(API_ENDPOINTS.usdaFoodDetail(food.fdcId));

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            if (!isMounted.current) return;

            // Find cup portion
            let density = 200; // Default fallback (grams per cup)

            if (data.foodPortions && data.foodPortions.length > 0) {
                // Look for cup measurement
                const cupPortion = data.foodPortions.find((p: USDAFoodPortion) =>
                    p.portionDescription?.toLowerCase().includes('cup') ||
                    p.modifier?.toLowerCase().includes('cup')
                );

                if (cupPortion && cupPortion.gramWeight) {
                    density = cupPortion.gramWeight;
                } else {
                    // Use first portion and estimate
                    const firstPortion = data.foodPortions[0];
                    if (firstPortion.gramWeight) {
                        // If it's a tablespoon, multiply by 16 to get cup
                        if (firstPortion.portionDescription?.toLowerCase().includes('tbsp') ||
                            firstPortion.portionDescription?.toLowerCase().includes('tablespoon')) {
                            density = firstPortion.gramWeight * 16;
                        } else {
                            density = firstPortion.gramWeight;
                        }
                    }
                }
            }

            // Create new ingredient
            const newIngredient: KitchenIngredient = {
                id: `usda_${food.fdcId}`,
                name: food.description,
                category: 'Custom (USDA)',
                density: Math.round(density),
            };

            // Check if already added
            if (customIngredients.some(i => i.id === newIngredient.id)) {
                showToast('This ingredient is already in your list', 'info');
            } else {
                setCustomIngredients(prev => [...prev, newIngredient]);
                setIngredientId(newIngredient.id);
                showToast(`Added: ${food.description}`, 'success');
            }

            setSearchModalVisible(false);
            setSearchQuery('');
            setSearchResults([]);
        } catch {
            if (!isMounted.current) return;
            showToast('Could not get ingredient details', 'error');
        } finally {
            setIsLoadingDetails(false);
        }
    }, [customIngredients, isMounted, showToast]);

    const handleTabChange = useCallback((tab: KitchenTab) => {
        setActiveTab(tab);
    }, []);

    // Memoized options to prevent unnecessary re-renders
    const ingredientOptions = useMemo(() =>
        allIngredients.map(i => ({
            label: i.category === 'Custom (USDA)' ? `⭐ ${i.name}` : i.name,
            value: i.id
        })),
        [allIngredients]
    );

    const unitOptions = useMemo(() =>
        KITCHEN_UNITS.map(u => ({ label: u.label, value: u.id })),
        []
    );

    const renderIngredients = () => (
        <View style={styles.content}>
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>INGREDIENT</Text>
                <PickerButton
                    value={ingredient.name}
                    onPress={() => setIngredientModalVisible(true)}
                />
                <Text style={styles.densityInfo}>
                    Density: {ingredient.density}g per cup
                </Text>
            </View>

            <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Amount</Text>
                <MarqueeInput
                    containerStyle={styles.inputFieldContainer}
                    value={value}
                    onChangeText={setValue}
                    keyboardType="numeric"
                    placeholder="0"
                    maxLength={15}
                />
            </View>

            <View style={styles.unitsContainer}>
                <View style={styles.unitField}>
                    <Text style={styles.unitLabel}>FROM</Text>
                    <TouchableOpacity
                        style={styles.staticPickerButton}
                        onPress={() => setFromModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.staticPickerButtonText} numberOfLines={1}>
                            {KITCHEN_UNITS.find(u => u.id === fromUnitId)?.label || ''}
                        </Text>
                        <ChevronDown size={18} color={colors.secondary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.unitField}>
                    <Text style={styles.unitLabel}>TO</Text>
                    <TouchableOpacity
                        style={styles.staticPickerButton}
                        onPress={() => setToModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.staticPickerButtonText} numberOfLines={1}>
                            {KITCHEN_UNITS.find(u => u.id === toUnitId)?.label || ''}
                        </Text>
                        <ChevronDown size={18} color={colors.secondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles.resultContainer}
                onPress={() => copyToClipboard(result)}
                activeOpacity={0.7}
            >
                {copied && <CopiedBadge />}
                <Text style={[styles.resultValue, { fontSize: getDynamicFontSize(result) }]}>{result}</Text>
                <Text style={styles.resultUnit}>
                    {KITCHEN_UNITS.find(u => u.id === toUnitId)?.label}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderOven = () => {
        // Calculate all values based on the stored Conventional °C
        const conv = ovenTemp;
        const fan = conv >= 100 ? conv - 20 : (conv > 50 ? conv - 10 : conv);
        const faren = Math.round((conv * 9 / 5) + 32);

        // Define the data for each mode
        // COLORS: Active = colors.accent (Red), Inactive = colors.secondary (Gray)
        const modes = {
            conventional: { label: 'Conventional Oven', value: `${conv}°C`, id: 'conventional' },
            fan: { label: 'Fan / Convection', value: `${fan}°C`, id: 'fan' },
            fahrenheit: { label: 'Fahrenheit', value: `${faren}°F`, id: 'fahrenheit' }
        };

        const current = modes[ovenMode];

        const adjustTemp = (direction: 1 | -1) => {
            let newConv = conv;

            if (ovenMode === 'conventional' || ovenMode === 'fan') {
                // 1°C step for Celsius modes
                newConv = conv + direction;
            } else {
                // 1°F step for Fahrenheit - convert back to C
                const targetF = faren + direction;
                newConv = Math.round((targetF - 32) * 5 / 9);
            }

            setOvenTemp(Math.max(0, Math.min(300, newConv)));
        };

        // Handle direct temperature input
        const handleTempInput = (text: string) => {
            // Allow only digits, update input text state
            const cleaned = text.replace(/[^0-9]/g, '');
            setOvenInputText(cleaned);

            // Update actual temp if valid number
            if (cleaned === '') return;
            const num = parseInt(cleaned);
            if (isNaN(num)) return;

            let newConv = num;

            if (ovenMode === 'fan') {
                // Fan shows conv - 20, so to set fan temp, add 20
                newConv = num + 20;
            } else if (ovenMode === 'fahrenheit') {
                // Convert F to C
                newConv = Math.round((num - 32) * 5 / 9);
            }

            setOvenTemp(Math.max(0, Math.min(300, newConv)));
        };

        // Handle input focus
        const handleInputFocus = () => {
            setOvenInputFocused(true);
            // Pre-fill with current value
            if (ovenMode === 'fahrenheit') {
                setOvenInputText(faren.toString());
            } else if (ovenMode === 'fan') {
                setOvenInputText(fan.toString());
            } else {
                setOvenInputText(conv.toString());
            }
        };

        // Handle input blur
        const handleInputBlur = () => {
            setOvenInputFocused(false);
            setOvenInputText('');
        };

        // Get current numeric value for input
        const getCurrentNumericValue = () => {
            // When focused, show what user is typing (can be empty)
            if (ovenInputFocused) return ovenInputText;
            // When not focused, show calculated value
            if (ovenMode === 'fahrenheit') return faren.toString();
            if (ovenMode === 'fan') return fan.toString();
            return conv.toString();
        };

        // Handle mode switch - reset input state
        const handleModeSwitch = (modeKey: 'conventional' | 'fan' | 'fahrenheit') => {
            setOvenInputFocused(false);
            setOvenInputText('');
            setOvenMode(modeKey);
        };

        // Helper to render a result card that acts as a mode switch
        const renderResultCard = (modeKey: 'conventional' | 'fan' | 'fahrenheit') => {
            if (modeKey === ovenMode) return null;
            const m = modes[modeKey];
            return (
                <TouchableOpacity
                    key={modeKey}
                    style={[styles.ovenResultCard, { borderColor: colors.subtle }]}
                    onPress={() => handleModeSwitch(modeKey)}
                >
                    <Text style={[styles.ovenResultLabel, { color: colors.secondary }]}>{m.label}</Text>
                    <Text style={[styles.ovenResultValue, { color: colors.primary }]}>{m.value}</Text>
                </TouchableOpacity>
            );
        };

        return (
            <View style={styles.content}>
                <View style={[styles.section, styles.sectionLargeGap]}>
                    <Text style={styles.sectionLabel}>ELECTRIC OVEN CONVERTER</Text>

                    {/* Main Control */}
                    <View style={[styles.ovenControlCard, { borderColor: colors.subtle }]}>
                        <Text style={[styles.ovenControlLabel, { color: colors.secondary }]}>{current.label}</Text>
                        <View style={styles.ovenControlRow}>
                            <TouchableOpacity onPress={() => adjustTemp(-1)} style={styles.tempButton}>
                                <Minus size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <View style={styles.ovenValueContainer}>
                                <TextInput
                                    style={styles.ovenMainInput}
                                    value={getCurrentNumericValue()}
                                    onChangeText={handleTempInput}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    selectTextOnFocus
                                />
                                <Text style={styles.ovenUnit}>{ovenMode === 'fahrenheit' ? '°F' : '°C'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => adjustTemp(1)} style={styles.tempButton}>
                                <Plus size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Results / Switches */}
                    <View style={styles.ovenResultsRow}>
                        {renderResultCard('conventional')}
                        {renderResultCard('fan')}
                        {renderResultCard('fahrenheit')}
                    </View>
                </View>
            </View>
        );
    };

    const renderSpecial = () => (
        <View style={styles.content}>
            {/* Serving Size Adjuster */}
            <ServingSizeAdjuster />

            {/* Yeast Converter */}
            <YeastConverter />

            {/* Butter Converter */}
            <ButterConverter />

            {/* Quick Reference Card */}
            <View style={styles.specialCard}>
                <Text style={styles.specialTitle}>Quick Reference</Text>
                {[
                    { label: '1 US Cup', value: '= 236.59 ml = 16 tbsp' },
                    { label: '1 UK Cup', value: '= 284 ml' },
                    { label: '1 Tablespoon', value: '= 15 ml = 3 tsp' },
                    { label: '1 Teaspoon', value: '= 5 ml' },
                ].map((item, idx) => (
                    <View key={idx} style={styles.specialItem}>
                        <Text style={styles.specialLabel}>{item.label}</Text>
                        <Text style={styles.specialValue}>{item.value}</Text>
                    </View>
                ))}
            </View>

            {customIngredients.length > 0 && (
                <View style={styles.specialCard}>
                    <Text style={styles.specialTitle}>Your Custom Ingredients</Text>
                    {customIngredients.map((item) => (
                        <View key={item.id} style={styles.specialItem}>
                            <Text style={styles.specialLabel}>{item.name}</Text>
                            <Text style={styles.specialValue}>{item.density}g / cup</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    // USDA Search Modal
    const renderSearchModal = () => (
        <Modal
            visible={searchModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setSearchModalVisible(false)}
        >
            <View style={styles.searchModalContainer}>
                <View style={styles.searchModalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Search USDA Database</Text>
                        <TouchableOpacity onPress={() => {
                            setSearchModalVisible(false);
                            setSearchQuery('');
                            setSearchResults([]);
                        }}>
                            <X size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchInputContainer}>
                        <Search size={20} color={colors.secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search ingredients..."
                            placeholderTextColor={colors.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {isSearching && (
                            <ActivityIndicator size="small" color={colors.accent} />
                        )}
                    </View>


                    {isLoadingDetails && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={colors.accent} />
                            <Text style={styles.loadingText}>Getting ingredient details...</Text>
                        </View>
                    )}

                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.fdcId.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.searchResultItem}
                                onPress={() => addFoodFromUSDA(item)}
                            >
                                <View style={styles.searchResultInfo}>
                                    <Text style={styles.searchResultName} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                    <Text style={styles.searchResultType}>
                                        {item.dataType} {item.brandName ? `• ${item.brandName}` : ''}
                                    </Text>
                                </View>
                                <View style={styles.searchResultAddButton}>
                                    <Plus size={18} color={colors.primary} />
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            searchQuery.length > 0 && !isSearching ? (
                                <Text style={styles.noResults}>No results found. Try a different search term.</Text>
                            ) : null
                        }
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kitchen</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.tabContainer}>
                    <TabButton tab="ingredients" label="Ingredients" activeTab={activeTab} onPress={handleTabChange} />
                    <TabButton tab="oven" label="Oven" activeTab={activeTab} onPress={handleTabChange} />
                    <TabButton tab="special" label="Quick Ref" activeTab={activeTab} onPress={handleTabChange} />
                </View>

                {activeTab === 'ingredients' && renderIngredients()}
                {activeTab === 'oven' && renderOven()}
                {activeTab === 'special' && renderSpecial()}
            </ScrollView>

            <PickerModal
                visible={ingredientModalVisible}
                onClose={() => setIngredientModalVisible(false)}
                title="Select Ingredient"
                options={ingredientOptions}
                selectedValue={ingredientId}
                onSelect={setIngredientId}
                onAdd={() => {
                    setIngredientModalVisible(false);
                    setSearchModalVisible(true);
                }}
            />
            <PickerModal
                visible={fromModalVisible}
                onClose={() => setFromModalVisible(false)}
                title="Select From Unit"
                options={unitOptions}
                selectedValue={fromUnitId}
                onSelect={setFromUnitId}
            />
            <PickerModal
                visible={toModalVisible}
                onClose={() => setToModalVisible(false)}
                title="Select To Unit"
                options={unitOptions}
                selectedValue={toUnitId}
                onSelect={setToUnitId}
            />

            {renderSearchModal()}

            {/* Toast notification */}
            {toast && (
                <View style={[
                    styles.toast,
                    toast.type === 'error' && styles.toastError,
                    toast.type === 'success' && styles.toastSuccess,
                ]}>
                    <Text style={styles.toastText}>{toast.message}</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.main },
    header: { paddingHorizontal: 16, paddingVertical: 16 },
    headerTitle: { fontFamily, fontSize: 28, fontWeight: '600', color: colors.primary },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, gap: 16 },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 4,
        ...shadows.card,
    },
    tabButton: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    tabButtonActive: { backgroundColor: colors.accent },
    tabButtonText: { fontSize: 12, fontWeight: '500', color: colors.secondary },
    tabButtonTextActive: { color: colors.primary },
    content: { gap: 20 },
    section: { gap: 8 },
    sectionLargeGap: { gap: 24 },
    ovenValueContainer: { alignItems: 'center' },
    sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
    densityInfo: { fontSize: 12, color: colors.secondary, marginLeft: 4 },
    inputSection: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        ...shadows.card,
        gap: 8,
    },
    inputLabel: { fontSize: 14, fontWeight: '500', color: colors.secondary },
    inputFieldContainer: { flex: 1, minHeight: 58 },
    unitsContainer: { gap: 12 },
    unitField: { gap: 8 },
    unitLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
    staticPickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 18,
        ...shadows.card,
    },
    staticPickerButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.primary,
        flex: 1,
    },
    resultContainer: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 8,
        ...shadows.card,
    },
    resultValue: { fontSize: 48, fontWeight: '600', color: colors.primary },
    resultUnit: { fontSize: 18, color: colors.secondary },
    specialCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 24,
        gap: 16,
        ...shadows.card,
    },
    specialTitle: { fontSize: 18, fontWeight: '600', color: colors.primary, marginBottom: 8 },
    specialItem: { gap: 4 },
    specialLabel: { fontSize: 14, fontWeight: '600', color: colors.primary },
    specialValue: { fontSize: 14, color: colors.secondary },
    // Search modal styles
    searchModalContainer: { flex: 1, backgroundColor: colors.overlay },
    searchModalContent: { flex: 1, backgroundColor: colors.main, marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.subtle },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.primary },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.input,
        margin: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        gap: 12,
    },
    searchInput: { flex: 1, color: colors.primary, fontSize: 16, paddingVertical: 16 },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: colors.input,
        borderRadius: 12,
        gap: 12,
    },
    searchResultInfo: { flex: 1 },
    searchResultName: { fontSize: 15, fontWeight: '500', color: colors.primary },
    searchResultType: { fontSize: 12, color: colors.secondary, marginTop: 4 },
    searchResultAddButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.button,
    },
    noResults: { color: colors.secondary, textAlign: 'center', padding: 40 },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: { color: colors.primary, marginTop: 16, fontSize: 16 },

    // Oven Converter Styles
    ovenControlCard: { backgroundColor: colors.card, borderRadius: 24, padding: 24, gap: 16, ...shadows.card },
    ovenControlLabel: { fontSize: 14, fontWeight: '600', color: colors.secondary, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
    ovenControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    tempButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', ...shadows.button },
    ovenMainInput: { fontSize: 56, fontWeight: '300', color: colors.primary, textAlign: 'center', minWidth: 100 },
    ovenUnit: { fontSize: 24, fontWeight: '300', color: colors.primary },
    ovenResultsRow: { flexDirection: 'row', gap: 12 },
    ovenResultCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: 'center', gap: 4, ...shadows.card },
    ovenResultLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
    ovenResultValue: { fontSize: 28, fontWeight: '600', color: colors.primary, marginTop: 4 },
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
    toastError: {
        backgroundColor: colors.card,
    },
    toastSuccess: {
        backgroundColor: colors.accent,
        ...shadows.glow,
    },
    toastText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});

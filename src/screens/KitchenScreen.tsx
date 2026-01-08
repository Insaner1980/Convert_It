import React, { useState, useMemo, useCallback } from 'react';
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
    Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Scale, Sparkles, X, Search, Plus, Minus } from 'lucide-react-native';

import { KITCHEN_UNITS, INGREDIENTS } from '../constants';
import { KitchenIngredient } from '../types';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { PickerModal } from '../components/PickerModal';
import { PickerButton } from '../components/PickerButton';
import {
    YeastConverter,
    ButterConverter,
    ServingSizeAdjuster,
} from '../components/kitchen';

// USDA API Key - Get yours free at: https://fdc.nal.usda.gov/api-key-signup.html
const USDA_API_KEY = 'sB18vYGMnhcTSZhVkJRgM4NhGduy9jgAs9luiKbE'; // Replace with your API key

type KitchenTab = 'ingredients' | 'oven' | 'special';

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
    const [activeTab, setActiveTab] = useState<KitchenTab>('ingredients');
    const [value, setValue] = useState<string>('1');
    const [ingredientId, setIngredientId] = useState(INGREDIENTS[0].id);
    const [fromUnitId, setFromUnitId] = useState('cup');
    const [toUnitId, setToUnitId] = useState('g');
    const [ovenTemp, setOvenTemp] = useState(200); // Always stored as Conventional °C
    const [ovenMode, setOvenMode] = useState<'conventional' | 'fan' | 'fahrenheit'>('conventional');

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
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

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
            const response = await fetch(
                `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(searchQuery)}&dataType=Foundation,SR%20Legacy&pageSize=20`
            );

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            setSearchResults(data.foods || []);
        } catch (error) {
            console.error('USDA search error:', error);
            Alert.alert('Search Error', 'Could not search USDA database. Check your API key or internet connection.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery]);

    // Get food details and add to custom ingredients
    const addFoodFromUSDA = useCallback(async (food: USDAFood) => {
        setIsLoadingDetails(true);
        try {
            const response = await fetch(
                `https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${USDA_API_KEY}`
            );

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();

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
                Alert.alert('Already Added', 'This ingredient is already in your list.');
            } else {
                setCustomIngredients(prev => [...prev, newIngredient]);
                setIngredientId(newIngredient.id);
                Alert.alert(
                    'Ingredient Added!',
                    `${food.description}\nDensity: ${Math.round(density)}g per cup`
                );
            }

            setSearchModalVisible(false);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error('USDA detail error:', error);
            Alert.alert('Error', 'Could not get ingredient details.');
        } finally {
            setIsLoadingDetails(false);
        }
    }, [customIngredients]);

    const TabButton = ({ tab, icon, label }: { tab: KitchenTab; icon: React.ReactNode; label: string }) => (
        <TouchableOpacity
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
        >
            {icon}
            <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const ingredientOptions = allIngredients.map(i => ({
        label: i.category === 'Custom (USDA)' ? `⭐ ${i.name}` : i.name,
        value: i.id
    }));
    const unitOptions = KITCHEN_UNITS.map(u => ({ label: u.label, value: u.id }));

    const renderIngredients = () => (
        <View style={styles.content}>
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>INGREDIENT</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setSearchModalVisible(true)}
                    >
                        <Plus size={16} color={colors.accent} />
                        <Text style={styles.addButtonText}>Add from USDA</Text>
                    </TouchableOpacity>
                </View>
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
                <TextInput
                    style={styles.inputField}
                    value={value}
                    onChangeText={setValue}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.secondary}
                />
            </View>

            <View style={styles.unitsContainer}>
                <View style={styles.unitField}>
                    <Text style={styles.unitLabel}>FROM</Text>
                    <PickerButton
                        value={KITCHEN_UNITS.find(u => u.id === fromUnitId)?.label || ''}
                        onPress={() => setFromModalVisible(true)}
                    />
                </View>
                <View style={styles.unitField}>
                    <Text style={styles.unitLabel}>TO</Text>
                    <PickerButton
                        value={KITCHEN_UNITS.find(u => u.id === toUnitId)?.label || ''}
                        onPress={() => setToModalVisible(true)}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={styles.resultContainer}
                onPress={() => copyToClipboard(result)}
                activeOpacity={0.7}
            >
                {copied && (
                    <View style={styles.copiedBadge}>
                        <Text style={styles.copiedText}>Copied!</Text>
                    </View>
                )}
                <Text style={styles.resultValue}>{result}</Text>
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
            conventional: { label: 'Conventional Oven', value: `${conv}°C`, hint: 'Standard setting', id: 'conventional' },
            fan: { label: 'Fan / Convection', value: `${fan}°C`, hint: 'Air circulation active', id: 'fan' },
            fahrenheit: { label: 'Fahrenheit', value: `${faren}°F`, hint: 'US Recipes', id: 'fahrenheit' }
        };

        const current = modes[ovenMode];

        const adjustTemp = (direction: 1 | -1) => {
            let amount = 5; // Default C step
            if (ovenMode === 'fahrenheit') amount = 10; // F step

            let newConv = conv;

            if (ovenMode === 'conventional' || ovenMode === 'fan') {
                newConv = conv + (5 * direction);
            } else {
                // Adjust F directly-ish
                const targetF = faren + (amount * direction);
                // Convert back to C and round to nearest 5
                newConv = Math.round((targetF - 32) * 5 / 9 / 5) * 5;
            }

            setOvenTemp(Math.max(0, Math.min(300, newConv)));
        };

        // Helper to render a result card that acts as a mode switch
        const renderResultCard = (modeKey: 'conventional' | 'fan' | 'fahrenheit') => {
            if (modeKey === ovenMode) return null;
            const m = modes[modeKey];
            return (
                <TouchableOpacity
                    key={modeKey}
                    style={[styles.ovenResultCard, { borderColor: colors.subtle }]}
                    onPress={() => setOvenMode(modeKey)}
                >
                    <Text style={[styles.ovenResultLabel, { color: colors.secondary }]}>{m.label}</Text>
                    <Text style={[styles.ovenResultValue, { color: colors.primary }]}>{m.value}</Text>
                    <Text style={styles.ovenResultHint}>Tap to switch</Text>
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
                                <Minus size={24} color={colors.accent} />
                            </TouchableOpacity>
                            <View style={styles.ovenValueContainer}>
                                <Text style={[styles.ovenMainValue, { color: colors.primary }]}>{current.value}</Text>
                            </View>
                            <TouchableOpacity onPress={() => adjustTemp(1)} style={[styles.tempButton, { backgroundColor: colors.accent + '20', borderColor: colors.subtle }]}>
                                <Plus size={24} color={colors.accent} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.ovenHint}>{current.hint}</Text>
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
                            placeholder="Search ingredients (e.g., flour, sugar)..."
                            placeholderTextColor={colors.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={searchUSDA}
                            returnKeyType="search"
                            autoFocus
                        />
                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={searchUSDA}
                            disabled={isSearching}
                        >
                            {isSearching ? (
                                <ActivityIndicator size="small" color={colors.accent} />
                            ) : (
                                <Text style={styles.searchButtonText}>Search</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.searchHint}>
                        Data from USDA FoodData Central
                    </Text>

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
                                <Plus size={20} color={colors.accent} />
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
                    <TabButton
                        tab="ingredients"
                        icon={<Scale size={16} color={activeTab === 'ingredients' ? colors.main : colors.secondary} />}
                        label="Ingredients"
                    />
                    <TabButton
                        tab="oven"
                        icon={<Flame size={16} color={activeTab === 'oven' ? colors.main : colors.secondary} />}
                        label="Oven"
                    />
                    <TabButton
                        tab="special"
                        icon={<Sparkles size={16} color={activeTab === 'special' ? colors.main : colors.secondary} />}
                        label="Quick Ref"
                    />
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
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    tabButtonActive: { backgroundColor: colors.accent },
    tabButtonText: { fontSize: 12, fontWeight: '500', color: colors.secondary },
    tabButtonTextActive: { color: colors.main },
    content: { gap: 20 },
    section: { gap: 8 },
    sectionLargeGap: { gap: 24 },
    ovenValueContainer: { alignItems: 'center' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addButtonText: { fontSize: 12, fontWeight: '600', color: colors.accent },
    densityInfo: { fontSize: 12, color: colors.secondary, marginLeft: 4 },
    inputSection: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        gap: 8,
    },
    inputLabel: { fontSize: 14, fontWeight: '500', color: colors.secondary },
    inputField: { fontSize: 48, fontWeight: '300', color: colors.primary },
    unitsContainer: { gap: 12 },
    unitField: { gap: 8 },
    unitLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
    resultContainer: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        alignItems: 'center',
        gap: 8,
    },
    resultValue: { fontSize: 48, fontWeight: '600', color: colors.primary },
    resultUnit: { fontSize: 18, color: colors.secondary },
    specialCard: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.subtle,
        gap: 16,
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
    searchButton: {
        backgroundColor: colors.accent,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    searchButtonText: { color: colors.main, fontWeight: '600', fontSize: 14 },
    searchHint: { fontSize: 12, color: colors.secondary, textAlign: 'center', marginBottom: 16 },
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
    ovenControlCard: { backgroundColor: colors.input, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.subtle, gap: 16 },
    ovenControlLabel: { fontSize: 14, fontWeight: '600', color: colors.secondary, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
    ovenControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    tempButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.subtle + '40', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.subtle },
    ovenMainValue: { fontSize: 56, fontWeight: '300', color: colors.primary },
    ovenHint: { fontSize: 13, color: colors.secondary, textAlign: 'center', marginTop: 8 },

    ovenResultsRow: { flexDirection: 'row', gap: 12 },
    ovenResultCard: { flex: 1, backgroundColor: colors.input, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.subtle, alignItems: 'center', gap: 4 },
    ovenResultLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
    ovenResultValue: { fontSize: 28, fontWeight: '600', color: colors.primary, marginTop: 4 },
    ovenResultHint: { fontSize: 11, color: colors.secondary, textAlign: 'center' },
    copiedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    copiedText: {
        color: colors.main,
        fontSize: 12,
        fontWeight: '600',
    },
});

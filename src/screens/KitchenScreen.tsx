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
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Scale, Sparkles, ChevronDown, Check, X, Search, Plus } from 'lucide-react-native';

import { KITCHEN_UNITS, INGREDIENTS, OVEN_MARKS } from '../constants';
import { KitchenIngredient } from '../types';

const colors = {
    main: '#09090b',
    card: '#18181b',
    input: '#27272a',
    subtle: '#3f3f46',
    primary: '#ffffff',
    secondary: '#a1a1aa',
    accent: '#FDDA0D',
};

// USDA API Key - Get yours free at: https://fdc.nal.usda.gov/api-key-signup.html
const USDA_API_KEY = 'sB18vYGMnhcTSZhVkJRgM4NhGduy9jgAs9luiKbE'; // Replace with your API key

type KitchenTab = 'ingredients' | 'oven' | 'special';

// Custom Picker Modal
const PickerModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    title: string;
    options: { label: string; value: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
}> = ({ visible, onClose, title, options, selectedValue, onSelect }) => (
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
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.modalOption, selectedValue === item.value && styles.modalOptionSelected]}
                            onPress={() => { onSelect(item.value); onClose(); }}
                        >
                            <Text style={[styles.modalOptionText, selectedValue === item.value && styles.modalOptionTextSelected]}>
                                {item.label}
                            </Text>
                            {selectedValue === item.value && <Check size={20} color={colors.accent} />}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Pressable>
    </Modal>
);

const PickerButton: React.FC<{ value: string; onPress: () => void }> = ({ value, onPress }) => (
    <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
        <Text style={styles.pickerButtonText} numberOfLines={1}>{value}</Text>
        <ChevronDown size={18} color={colors.secondary} />
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
    const [activeTab, setActiveTab] = useState<KitchenTab>('ingredients');
    const [value, setValue] = useState<string>('1');
    const [ingredientId, setIngredientId] = useState(INGREDIENTS[0].id);
    const [fromUnitId, setFromUnitId] = useState('cup');
    const [toUnitId, setToUnitId] = useState('g');

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
    }, [value, ingredientId, fromUnitId, toUnitId, ingredient]);

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

            <View style={styles.resultContainer}>
                <Text style={styles.resultValue}>{result}</Text>
                <Text style={styles.resultUnit}>
                    {KITCHEN_UNITS.find(u => u.id === toUnitId)?.label}
                </Text>
            </View>
        </View>
    );

    const renderOven = () => (
        <View style={styles.content}>
            <View style={styles.ovenTable}>
                <View style={styles.ovenHeader}>
                    <Text style={styles.ovenHeaderCell}>Gas Mark</Text>
                    <Text style={styles.ovenHeaderCell}>°C</Text>
                    <Text style={styles.ovenHeaderCell}>°F</Text>
                </View>
                {OVEN_MARKS.map((mark, idx) => (
                    <View key={idx} style={styles.ovenRow}>
                        <Text style={styles.ovenCell}>{mark.gas}</Text>
                        <Text style={[styles.ovenCell, styles.ovenCellHighlight]}>{mark.c}°</Text>
                        <Text style={styles.ovenCell}>{mark.f}°</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderSpecial = () => (
        <View style={styles.content}>
            <View style={styles.specialCard}>
                <Text style={styles.specialTitle}>Quick Conversions</Text>
                {[
                    { label: '1 Stick Butter', value: '= 113g = ½ cup = 8 tbsp' },
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
                        icon={<Scale size={16} color={activeTab === 'ingredients' ? colors.accent : colors.secondary} />}
                        label="Ingredients"
                    />
                    <TabButton
                        tab="oven"
                        icon={<Flame size={16} color={activeTab === 'oven' ? colors.accent : colors.secondary} />}
                        label="Oven"
                    />
                    <TabButton
                        tab="special"
                        icon={<Sparkles size={16} color={activeTab === 'special' ? colors.accent : colors.secondary} />}
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
    header: { paddingHorizontal: 24, paddingVertical: 16 },
    headerTitle: { fontSize: 28, fontWeight: '600', color: colors.primary },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, gap: 20 },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.accent,
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
    tabButtonActive: { backgroundColor: colors.subtle },
    tabButtonText: { fontSize: 12, fontWeight: '500', color: colors.secondary },
    tabButtonTextActive: { color: colors.accent },
    content: { gap: 20 },
    section: { gap: 8 },
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
        backgroundColor: colors.accent + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addButtonText: { fontSize: 12, fontWeight: '600', color: colors.accent },
    densityInfo: { fontSize: 12, color: colors.secondary, marginLeft: 4 },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.input,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.accent,
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    pickerButtonText: { fontSize: 14, fontWeight: '500', color: colors.primary, flex: 1 },
    inputSection: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.accent,
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
        padding: 24,
        borderWidth: 1,
        borderColor: colors.accent,
        alignItems: 'center',
        gap: 8,
    },
    resultValue: { fontSize: 48, fontWeight: '600', color: colors.accent },
    resultUnit: { fontSize: 18, color: colors.secondary },
    ovenTable: {
        backgroundColor: colors.input,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.accent,
        overflow: 'hidden',
    },
    ovenHeader: {
        flexDirection: 'row',
        backgroundColor: colors.subtle + '33',
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    ovenHeaderCell: { flex: 1, padding: 16, fontSize: 12, fontWeight: '700', color: colors.secondary, textAlign: 'center' },
    ovenRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.subtle + '33' },
    ovenCell: { flex: 1, padding: 16, fontSize: 16, color: colors.secondary, textAlign: 'center' },
    ovenCellHighlight: { color: colors.accent, fontWeight: '600' },
    specialCard: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.accent,
        gap: 16,
    },
    specialTitle: { fontSize: 18, fontWeight: '600', color: colors.primary, marginBottom: 8 },
    specialItem: { gap: 4 },
    specialLabel: { fontSize: 14, fontWeight: '600', color: colors.primary },
    specialValue: { fontSize: 14, color: colors.secondary },
    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.primary },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle + '40',
    },
    modalOptionSelected: { backgroundColor: colors.accent + '15' },
    modalOptionText: { fontSize: 16, color: colors.primary },
    modalOptionTextSelected: { color: colors.accent, fontWeight: '600' },
    // Search modal styles
    searchModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
    searchModalContent: { flex: 1, backgroundColor: colors.main, marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
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
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: { color: colors.primary, marginTop: 16, fontSize: 16 },
});

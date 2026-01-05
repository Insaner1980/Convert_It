import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    FlatList,
    Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shirt, Footprints, Baby, Ruler, Globe, ChevronDown, Check, X } from 'lucide-react-native';

import {
    SHOE_SIZES_MEN, SHOE_SIZES_WOMEN, SHOE_SIZES_KIDS,
    CLOTHING_WOMEN_TOPS, CLOTHING_WOMEN_BOTTOMS,
    CLOTHING_MEN_TOPS, CLOTHING_MEN_PANTS, CLOTHING_KIDS,
    BRA_BANDS_EU, BRA_CUPS_EU, BRA_BAND_MAP, BRA_CUP_MAP
} from '../constants';
import { Gender, SizeCategory, SizeRow } from '../types';

const colors = {
    main: '#09090b',
    card: '#18181b',
    input: '#27272a',
    subtle: '#3f3f46',
    primary: '#ffffff',
    secondary: '#a1a1aa',
    accent: '#FDDA0D',
};

const REGIONS = [
    { id: 'eu', label: 'Europe (EU)' },
    { id: 'us', label: 'US / Canada' },
    { id: 'uk', label: 'UK' },
    { id: 'fr', label: 'France / Spain' },
    { id: 'au', label: 'Australia / NZ' },
];

// Custom Picker Modal Component
interface PickerModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: { label: string; value: any }[];
    selectedValue: any;
    onSelect: (value: any) => void;
}

const PickerModal: React.FC<PickerModalProps> = ({
    visible, onClose, title, options, selectedValue, onSelect
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
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
                        keyExtractor={(item) => String(item.value)}
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
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    selectedValue === item.value && styles.modalOptionTextSelected
                                ]}>
                                    {item.label}
                                </Text>
                                {selectedValue === item.value && (
                                    <Check size={20} color={colors.accent} />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Pressable>
        </Modal>
    );
};

// Custom Picker Button
interface PickerButtonProps {
    label: string;
    value: string;
    onPress: () => void;
}

const PickerButton: React.FC<PickerButtonProps> = ({ label, value, onPress }) => (
    <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
        <Text style={styles.pickerButtonText}>{value}</Text>
        <ChevronDown size={18} color={colors.secondary} />
    </TouchableOpacity>
);

export const SizesScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [gender, setGender] = useState<Gender>('women');
    const [category, setCategory] = useState<SizeCategory>('shoes');
    const [bandEu, setBandEu] = useState(75);
    const [cupEu, setCupEu] = useState('B');
    const [inputRegion, setInputRegion] = useState('eu');
    const [outputRegion, setOutputRegion] = useState('us');

    // Modal states
    const [regionModalVisible, setRegionModalVisible] = useState(false);
    const [bandModalVisible, setBandModalVisible] = useState(false);
    const [cupModalVisible, setCupModalVisible] = useState(false);

    const availableCategories = useMemo((): SizeCategory[] => {
        switch (gender) {
            case 'women': return ['shoes', 'tops', 'bottoms', 'bras'];
            case 'men': return ['shoes', 'tops', 'bottoms'];
            case 'kids': return ['shoes', 'baby'];
            default: return ['shoes'];
        }
    }, [gender]);

    useEffect(() => {
        if (!availableCategories.includes(category)) {
            setCategory(availableCategories[0]);
        }
    }, [gender, availableCategories, category]);

    const data: SizeRow[] = useMemo(() => {
        if (gender === 'men') {
            if (category === 'shoes') return SHOE_SIZES_MEN;
            if (category === 'tops') return CLOTHING_MEN_TOPS;
            if (category === 'bottoms') return CLOTHING_MEN_PANTS;
        }
        if (gender === 'women') {
            if (category === 'shoes') return SHOE_SIZES_WOMEN;
            if (category === 'tops') return CLOTHING_WOMEN_TOPS;
            if (category === 'bottoms') return CLOTHING_WOMEN_BOTTOMS;
        }
        if (gender === 'kids') {
            if (category === 'shoes') return SHOE_SIZES_KIDS;
            if (category === 'baby') return CLOTHING_KIDS;
        }
        return [];
    }, [gender, category]);

    const getCategoryIcon = (cat: SizeCategory) => {
        const iconProps = { size: 16, color: category === cat ? colors.accent : colors.secondary };
        switch (cat) {
            case 'shoes': return <Footprints {...iconProps} />;
            case 'tops': return <Shirt {...iconProps} />;
            case 'bottoms': return <Ruler {...iconProps} />;
            case 'baby': return <Baby {...iconProps} />;
            default: return null;
        }
    };

    const getBandLabel = (eu: number, region: string) => {
        const map = BRA_BAND_MAP[eu];
        if (!map) return eu.toString();
        if (region === 'eu') return eu.toString();
        if (region === 'us' || region === 'uk') return map.us.toString();
        if (region === 'fr') return map.fr.toString();
        if (region === 'au') return map.au.toString();
        return eu.toString();
    };

    const getCupLabel = (eu: string, region: string) => {
        const map = BRA_CUP_MAP[eu];
        if (!map) return eu;
        if (region === 'eu' || region === 'fr') return eu;
        if (region === 'us') return map.us;
        if (region === 'uk' || region === 'au') return map.uk;
        return eu;
    };

    const getFullSize = (region: string) => {
        const bandInfo = BRA_BAND_MAP[bandEu];
        const cupInfo = BRA_CUP_MAP[cupEu];
        if (!bandInfo || !cupInfo) return '---';

        switch (region) {
            case 'eu': return `${bandEu}${cupEu}`;
            case 'us': return `${bandInfo.us}${cupInfo.us}`;
            case 'uk': return `${bandInfo.us}${cupInfo.uk}`;
            case 'fr': return `${bandInfo.fr}${cupEu}`;
            case 'au': return `${bandInfo.au}${cupInfo.uk}`;
            default: return '---';
        }
    };

    const renderBraCalculator = () => {
        const bandInfo = BRA_BAND_MAP[bandEu];
        const cupInfo = BRA_CUP_MAP[cupEu];

        if (!bandInfo || !cupInfo) return null;

        return (
            <View style={styles.braContainer}>
                {/* Input Region Selector */}
                <View style={styles.braControls}>
                    <View style={styles.braField}>
                        <Text style={styles.braLabel}>
                            <Globe size={12} color={colors.secondary} /> INPUT REGION
                        </Text>
                        <PickerButton
                            label="Region"
                            value={REGIONS.find(r => r.id === inputRegion)?.label || ''}
                            onPress={() => setRegionModalVisible(true)}
                        />
                    </View>

                    <View style={styles.braRow}>
                        <View style={styles.braFieldHalf}>
                            <Text style={styles.braLabel}>BAND</Text>
                            <PickerButton
                                label="Band"
                                value={getBandLabel(bandEu, inputRegion)}
                                onPress={() => setBandModalVisible(true)}
                            />
                        </View>
                        <View style={styles.braFieldHalf}>
                            <Text style={styles.braLabel}>CUP</Text>
                            <PickerButton
                                label="Cup"
                                value={getCupLabel(cupEu, inputRegion)}
                                onPress={() => setCupModalVisible(true)}
                            />
                        </View>
                    </View>
                </View>

                {/* Output Region Selection - NOW INTERACTIVE */}
                <Text style={styles.sectionTitle}>SELECT OUTPUT REGION</Text>
                {REGIONS.filter(region => region.id !== inputRegion).map(region => {
                    const isSelected = outputRegion === region.id;
                    return (
                        <TouchableOpacity
                            key={region.id}
                            style={[
                                styles.resultRow,
                                isSelected && styles.resultRowSelected
                            ]}
                            onPress={() => setOutputRegion(region.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.resultRowLeft}>
                                <Text style={[
                                    styles.resultRowLabel,
                                    isSelected && styles.resultRowLabelSelected
                                ]}>
                                    {region.label}
                                </Text>
                                {isSelected && (
                                    <View style={styles.selectedBadge}>
                                        <Text style={styles.selectedBadgeText}>SELECTED</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[
                                styles.resultRowValue,
                                isSelected && styles.resultRowValueSelected
                            ]}>
                                {getFullSize(region.id)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

                {/* Modals */}
                <PickerModal
                    visible={regionModalVisible}
                    onClose={() => setRegionModalVisible(false)}
                    title="Select Input Region"
                    options={REGIONS.map(r => ({ label: r.label, value: r.id }))}
                    selectedValue={inputRegion}
                    onSelect={setInputRegion}
                />
                <PickerModal
                    visible={bandModalVisible}
                    onClose={() => setBandModalVisible(false)}
                    title="Select Band Size"
                    options={BRA_BANDS_EU.map(b => ({
                        label: getBandLabel(b, inputRegion),
                        value: b
                    }))}
                    selectedValue={bandEu}
                    onSelect={setBandEu}
                />
                <PickerModal
                    visible={cupModalVisible}
                    onClose={() => setCupModalVisible(false)}
                    title="Select Cup Size"
                    options={BRA_CUPS_EU.map(c => ({
                        label: getCupLabel(c, inputRegion),
                        value: c
                    }))}
                    selectedValue={cupEu}
                    onSelect={setCupEu}
                />
            </View>
        );
    };

    const renderTable = () => {
        if (data.length === 0) return <Text style={styles.emptyText}>Select a category</Text>;

        const headerKeys = Object.keys(data[0]).filter(k => k !== 'label');

        return (
            <View style={styles.tableContainer}>
                {/* Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.tableLabelCell]}>Size</Text>
                    {headerKeys.map(k => (
                        <Text key={k} style={styles.tableHeaderCell}>{k.toUpperCase()}</Text>
                    ))}
                </View>

                {/* Rows */}
                {data.map((row, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.tableLabelCell, styles.tableCellLabel]}>{row.label}</Text>
                        {headerKeys.map(k => (
                            <Text key={k} style={styles.tableCell}>{row[k]}</Text>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Size Charts</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 120 + insets.bottom }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Gender Switcher */}
                <View style={styles.genderContainer}>
                    {(['women', 'men', 'kids'] as Gender[]).map(g => (
                        <TouchableOpacity
                            key={g}
                            onPress={() => setGender(g)}
                            style={[
                                styles.genderButton,
                                gender === g && styles.genderButtonActive
                            ]}
                        >
                            <Text style={[
                                styles.genderButtonText,
                                gender === g && styles.genderButtonTextActive
                            ]}>
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Category Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryScrollContent}
                >
                    {availableCategories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setCategory(cat)}
                            style={[
                                styles.categoryPill,
                                category === cat && styles.categoryPillActive
                            ]}
                        >
                            {getCategoryIcon(cat)}
                            <Text style={[
                                styles.categoryPillText,
                                category === cat && styles.categoryPillTextActive
                            ]}>
                                {cat === 'baby' ? 'Clothing' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Content */}
                {category === 'bras' ? renderBraCalculator() : renderTable()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.main,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 20,
    },
    genderContainer: {
        flexDirection: 'row',
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
    },
    genderButtonActive: {
        backgroundColor: colors.subtle,
    },
    genderButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.secondary,
    },
    genderButtonTextActive: {
        color: colors.accent,
    },
    categoryScroll: {
        marginHorizontal: -24,
    },
    categoryScrollContent: {
        paddingHorizontal: 24,
        gap: 8,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: colors.input,
        borderWidth: 1,
        borderColor: colors.subtle,
        marginRight: 8,
    },
    categoryPillActive: {
        backgroundColor: colors.subtle,
        borderColor: colors.accent,
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.secondary,
    },
    categoryPillTextActive: {
        color: colors.accent,
    },
    tableContainer: {
        backgroundColor: colors.input,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.accent,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.subtle + '33',
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    tableHeaderCell: {
        flex: 1,
        padding: 16,
        fontSize: 11,
        fontWeight: '700',
        color: colors.secondary,
        textAlign: 'center',
        letterSpacing: 1,
    },
    tableLabelCell: {
        minWidth: 60,
        flex: 0,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle + '33',
    },
    tableCell: {
        flex: 1,
        padding: 16,
        fontSize: 13,
        color: colors.secondary,
        textAlign: 'center',
    },
    tableCellLabel: {
        fontWeight: '700',
        color: colors.primary,
    },
    emptyText: {
        color: colors.secondary,
        textAlign: 'center',
        padding: 40,
    },
    braContainer: {
        gap: 16,
    },
    braControls: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.accent,
        gap: 16,
    },
    braRow: {
        flexDirection: 'row',
        gap: 16,
    },
    braField: {
        gap: 8,
    },
    braFieldHalf: {
        flex: 1,
        gap: 8,
    },
    braLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
        marginTop: 8,
        marginLeft: 4,
    },
    // Custom Picker Button
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.main,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.accent + '80',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    pickerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    // Result Rows - NOW INTERACTIVE
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: colors.subtle,
    },
    resultRowSelected: {
        borderColor: colors.accent,
        backgroundColor: colors.accent + '15',
    },
    resultRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    resultRowLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.secondary,
    },
    resultRowLabelSelected: {
        color: colors.primary,
    },
    selectedBadge: {
        backgroundColor: colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    selectedBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.main,
        letterSpacing: 0.5,
    },
    resultRowValue: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
    },
    resultRowValueSelected: {
        color: colors.accent,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle + '40',
    },
    modalOptionSelected: {
        backgroundColor: colors.accent + '15',
    },
    modalOptionText: {
        fontSize: 16,
        color: colors.primary,
    },
    modalOptionTextSelected: {
        color: colors.accent,
        fontWeight: '600',
    },
});

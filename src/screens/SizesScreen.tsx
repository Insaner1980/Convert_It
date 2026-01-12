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
import { Globe, Check, X } from 'lucide-react-native';

import {
    SHOE_SIZES_MEN, SHOE_SIZES_WOMEN, SHOE_SIZES_KIDS,
    CLOTHING_WOMEN_TOPS, CLOTHING_WOMEN_BOTTOMS,
    CLOTHING_MEN_TOPS, CLOTHING_MEN_PANTS, CLOTHING_KIDS,
    BRA_BANDS_EU, BRA_CUPS_EU, BRA_BAND_MAP, BRA_CUP_MAP
} from '../constants';
import { Gender, SizeCategory, SizeRow } from '../types';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { shadows } from '../theme';
import { PickerButton } from '../components/PickerButton';

const REGIONS = [
    { id: 'eu', label: 'Europe (EU)' },
    { id: 'us', label: 'US / Canada' },
    { id: 'uk', label: 'UK' },
    { id: 'fr', label: 'France / Spain' },
    { id: 'au', label: 'Australia / NZ' },
];

// Local Picker Modal with mixed value types (specific to SizesScreen for number/string mix)
type SizeValue = string | number;

interface PickerModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: { label: string; value: SizeValue }[];
    selectedValue: SizeValue;
    onSelect: (value: SizeValue) => void;
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
                <View style={styles.outputRegionHeader}>
                    <Text style={styles.outputRegionHeaderText}>SELECT OUTPUT REGION</Text>
                </View>
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
                            <Text style={[
                                styles.resultRowLabel,
                                isSelected && styles.resultRowLabelSelected
                            ]}>
                                {region.label}
                            </Text>
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
                    onSelect={(v) => setInputRegion(v as string)}
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
                    onSelect={(v) => setBandEu(v as number)}
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
                    onSelect={(v) => setCupEu(v as string)}
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
                        <Text
                            key={k}
                            style={[
                                styles.tableHeaderCell,
                                k === 'cm' && styles.tableCmCell
                            ]}
                        >
                            {k.toUpperCase()}
                        </Text>
                    ))}
                </View>

                {/* Rows */}
                {data.map((row, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.tableLabelCell, styles.tableCellLabel]}>{row.label}</Text>
                        {headerKeys.map(k => (
                            <Text
                                key={k}
                                style={[
                                    styles.tableCell,
                                    k === 'cm' && styles.tableCmCell
                                ]}
                                numberOfLines={1}
                            >
                                {row[k]}
                            </Text>
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
                <Text style={styles.headerTitle}>Sizes</Text>
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
                {/* Category Pills */}
                <View style={styles.categoryContainer}>
                    {availableCategories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setCategory(cat)}
                            style={[
                                styles.categoryPill,
                                category === cat && styles.categoryPillActive
                            ]}
                        >
                            <Text style={[
                                styles.categoryPillText,
                                category === cat && styles.categoryPillTextActive
                            ]}>
                                {cat === 'baby' ? 'Clothing' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

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
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerTitle: {
        fontFamily,
        fontSize: 28,
        fontWeight: '600',
        color: colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 16,
    },
    genderContainer: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 4,
        ...shadows.card,
    },
    genderButton: {
        flexGrow: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderRadius: 12,
    },
    genderButtonActive: {
        backgroundColor: colors.accent,
    },
    genderButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.secondary,
    },
    genderButtonTextActive: {
        color: colors.primary,
    },
    categoryContainer: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 4,
        ...shadows.card,
    },
    categoryPill: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    categoryPillActive: {
        backgroundColor: colors.accent,
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.secondary,
    },
    categoryPillTextActive: {
        color: colors.primary,
    },
    tableContainer: {
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        ...shadows.card,
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
    tableCmCell: {
        flex: 1.3,
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
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        gap: 16,
        ...shadows.card,
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
    outputRegionHeader: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    outputRegionHeaderText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 1,
    },
    // Result Rows - NOW INTERACTIVE
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        ...shadows.card,
    },
    resultRowSelected: {
        backgroundColor: colors.accent,
    },
    resultRowLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.secondary,
    },
    resultRowLabelSelected: {
        color: colors.primary,
        fontWeight: '700',
    },
    resultRowValue: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.secondary, // Inactive Gray
    },
    resultRowValueSelected: {
        color: colors.primary, // Active White
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
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

import React, { useState, useMemo, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Palette,
    Globe,
    HardDrive,
    ArrowLeftRight,
    X,
    Check,
    ChevronDown,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import { WORLD_CITIES, DATA_UNITS } from '../constants';
import { WorldCity } from '../types';

const colors = {
    main: '#09090b',
    card: '#18181b',
    input: '#27272a',
    subtle: '#3f3f46',
    primary: '#ffffff',
    secondary: '#a1a1aa',
    accent: '#FDDA0D',
};

type ToolTab = 'colors' | 'time' | 'data';

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

export const ToolsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<ToolTab>('colors');

    const TabButton = ({ tab, icon, label }: { tab: ToolTab; icon: React.ReactNode; label: string }) => (
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tools</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.tabContainer}>
                    <TabButton
                        tab="colors"
                        icon={<Palette size={16} color={activeTab === 'colors' ? colors.accent : colors.secondary} />}
                        label="Colors"
                    />
                    <TabButton
                        tab="data"
                        icon={<HardDrive size={16} color={activeTab === 'data' ? colors.accent : colors.secondary} />}
                        label="Data"
                    />
                    <TabButton
                        tab="time"
                        icon={<Globe size={16} color={activeTab === 'time' ? colors.accent : colors.secondary} />}
                        label="Time"
                    />
                </View>

                {activeTab === 'colors' && <ColorConverter />}
                {activeTab === 'data' && <DataConverter />}
                {activeTab === 'time' && <TimeZones />}
            </ScrollView>
        </SafeAreaView>
    );
};

// Color Converter
const ColorConverter: React.FC = () => {
    const [r, setR] = useState(253);
    const [g, setG] = useState(218);
    const [b, setB] = useState(13);
    const [copied, setCopied] = useState(false);

    const rgbToHex = (r: number, g: number, b: number) => {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    };

    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    };

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <View style={styles.content}>
            <TouchableOpacity
                onPress={() => copyToClipboard(hex)}
                style={[styles.colorPreview, { backgroundColor: `rgb(${r},${g},${b})` }]}
            >
                {copied && (
                    <View style={styles.copiedBadge}>
                        <Text style={styles.copiedText}>Copied!</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.colorValuesRow}>
                <TouchableOpacity onPress={() => copyToClipboard(hex)} style={styles.colorValueCard}>
                    <Text style={styles.colorValueLabel}>HEX</Text>
                    <Text style={styles.colorValueText}>{hex.toUpperCase()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => copyToClipboard(hsl)} style={styles.colorValueCard}>
                    <Text style={styles.colorValueLabel}>HSL</Text>
                    <Text style={styles.colorValueTextSmall}>{hsl}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.slidersCard}>
                <SliderRow label="Red" value={r} onChange={setR} color="#ef4444" />
                <SliderRow label="Green" value={g} onChange={setG} color="#22c55e" />
                <SliderRow label="Blue" value={b} onChange={setB} color="#3b82f6" />
            </View>
        </View>
    );
};

const SliderRow = ({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) => (
    <View style={styles.sliderRow}>
        <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>{label}</Text>
            <Text style={styles.sliderValue}>{value}</Text>
        </View>
        <View style={styles.sliderContainer}>
            <View style={[styles.sliderTrack, { backgroundColor: color + '40' }]}>
                <View style={[styles.sliderFill, { width: `${(value / 255) * 100}%`, backgroundColor: color }]} />
            </View>
            <TextInput
                style={styles.sliderInput}
                value={value.toString()}
                onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    onChange(Math.min(255, Math.max(0, num)));
                }}
                keyboardType="numeric"
                maxLength={3}
            />
        </View>
    </View>
);

// Data Converter
const DataConverter: React.FC = () => {
    const [value, setValue] = useState<string>('1');
    const [fromUnit, setFromUnit] = useState('gb');
    const [toUnit, setToUnit] = useState('mb');
    const [fromModalVisible, setFromModalVisible] = useState(false);
    const [toModalVisible, setToModalVisible] = useState(false);

    const result = useMemo(() => {
        const val = parseFloat(value);
        if (isNaN(val)) return '---';
        const from = DATA_UNITS.find(u => u.id === fromUnit);
        const to = DATA_UNITS.find(u => u.id === toUnit);
        if (!from || !to) return '---';
        const baseValue = val * from.factor;
        const finalValue = baseValue / to.factor;
        if (finalValue < 0.0001 && finalValue > 0) return finalValue.toExponential(4);
        if (finalValue > 1e12) return finalValue.toExponential(4);
        return finalValue.toLocaleString('en-US', { maximumFractionDigits: 6, minimumFractionDigits: 0 });
    }, [value, fromUnit, toUnit]);

    const handleSwap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };
    const unitOptions = DATA_UNITS.map(u => ({ label: u.label, value: u.id }));

    return (
        <View style={styles.content}>
            <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput style={styles.inputField} value={value} onChangeText={setValue} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.secondary} />
            </View>

            <View style={styles.unitsContainer}>
                <View style={styles.unitField}>
                    <Text style={styles.unitLabel}>FROM</Text>
                    <PickerButton value={DATA_UNITS.find(u => u.id === fromUnit)?.label || ''} onPress={() => setFromModalVisible(true)} />
                </View>
                <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                    <ArrowLeftRight color={colors.accent} size={20} />
                    <Text style={styles.swapButtonText}>Swap</Text>
                </TouchableOpacity>
                <View style={styles.unitField}>
                    <Text style={styles.unitLabel}>TO</Text>
                    <PickerButton value={DATA_UNITS.find(u => u.id === toUnit)?.label || ''} onPress={() => setToModalVisible(true)} />
                </View>
            </View>

            <View style={styles.resultContainer}>
                <Text style={styles.resultValue}>{result}</Text>
                <Text style={styles.resultUnit}>{DATA_UNITS.find(u => u.id === toUnit)?.label}</Text>
            </View>

            <PickerModal visible={fromModalVisible} onClose={() => setFromModalVisible(false)} title="Select From Unit" options={unitOptions} selectedValue={fromUnit} onSelect={setFromUnit} />
            <PickerModal visible={toModalVisible} onClose={() => setToModalVisible(false)} title="Select To Unit" options={unitOptions} selectedValue={toUnit} onSelect={setToUnit} />
        </View>
    );
};

// Time Zones
const TimeZones: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [cities, setCities] = useState<WorldCity[]>(WORLD_CITIES.slice(0, 6));

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const removeCity = (id: string) => { setCities(prev => prev.filter(c => c.id !== id)); };

    return (
        <View style={styles.content}>
            {cities.map((city) => {
                let timeString = '--:--';
                let dateString = '---';
                try {
                    timeString = currentTime.toLocaleTimeString('en-US', { timeZone: city.timezone, hour: '2-digit', minute: '2-digit', hour12: false });
                    dateString = currentTime.toLocaleDateString('en-US', { timeZone: city.timezone, weekday: 'short', day: 'numeric', month: 'short' });
                } catch (e) { timeString = 'Error'; }

                return (
                    <View key={city.id} style={styles.cityCard}>
                        <View style={styles.cityInfo}>
                            <Text style={styles.cityName}>{city.name}</Text>
                            <Text style={styles.cityRegion}>{city.region} • {dateString}</Text>
                        </View>
                        <Text style={styles.cityTime}>{timeString}</Text>
                        <TouchableOpacity style={styles.cityRemove} onPress={() => removeCity(city.id)}>
                            <X size={14} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.main },
    header: { paddingHorizontal: 24, paddingVertical: 16 },
    headerTitle: { fontSize: 28, fontWeight: '600', color: colors.primary },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, gap: 20 },
    tabContainer: { flexDirection: 'row', backgroundColor: colors.input, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: colors.accent },
    tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
    tabButtonActive: { backgroundColor: colors.subtle },
    tabButtonText: { fontSize: 12, fontWeight: '500', color: colors.secondary },
    tabButtonTextActive: { color: colors.accent },
    content: { gap: 16 },
    colorPreview: { height: 160, borderRadius: 24, borderWidth: 1, borderColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
    copiedBadge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    copiedText: { color: colors.primary, fontWeight: '500' },
    colorValuesRow: { flexDirection: 'row', gap: 16 },
    colorValueCard: { flex: 1, backgroundColor: colors.input, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', gap: 4 },
    colorValueLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1 },
    colorValueText: { fontSize: 20, fontWeight: '600', color: colors.primary },
    colorValueTextSmall: { fontSize: 12, fontWeight: '500', color: colors.primary },
    slidersCard: { backgroundColor: colors.input, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.accent, gap: 24 },
    sliderRow: { gap: 8 },
    sliderHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    sliderLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1 },
    sliderValue: { fontSize: 13, fontWeight: '600', color: colors.primary },
    sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sliderTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    sliderFill: { height: '100%', borderRadius: 4 },
    sliderInput: { width: 50, backgroundColor: colors.main, borderRadius: 8, padding: 8, color: colors.primary, textAlign: 'center', fontSize: 14 },
    inputSection: { backgroundColor: colors.input, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.accent, gap: 8 },
    inputLabel: { fontSize: 14, fontWeight: '500', color: colors.secondary },
    inputField: { fontSize: 48, fontWeight: '300', color: colors.primary },
    unitsContainer: { gap: 12 },
    unitField: { gap: 8 },
    unitLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
    pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.input, borderRadius: 16, borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 16, paddingVertical: 18 },
    pickerButtonText: { fontSize: 16, fontWeight: '500', color: colors.primary, flex: 1 },
    swapButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, backgroundColor: colors.input, borderWidth: 1, borderColor: colors.accent, alignSelf: 'center' },
    swapButtonText: { fontSize: 14, fontWeight: '600', color: colors.accent },
    resultContainer: { backgroundColor: colors.input, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', gap: 8 },
    resultValue: { fontSize: 40, fontWeight: '600', color: colors.accent },
    resultUnit: { fontSize: 16, color: colors.secondary },
    cityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.input, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.subtle },
    cityInfo: { flex: 1 },
    cityName: { fontSize: 18, fontWeight: '500', color: colors.primary },
    cityRegion: { fontSize: 12, color: colors.secondary, marginTop: 2 },
    cityTime: { fontSize: 28, fontWeight: '300', color: colors.primary, marginRight: 12 },
    cityRemove: { padding: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.subtle },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.primary },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.subtle + '40' },
    modalOptionSelected: { backgroundColor: colors.accent + '15' },
    modalOptionText: { fontSize: 16, color: colors.primary },
    modalOptionTextSelected: { color: colors.accent, fontWeight: '600' },
});

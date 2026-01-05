import React, { useState, useMemo, useEffect, useRef } from 'react';
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
// Slider removed - using custom gesture-based slider
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Palette,
    Globe,
    HardDrive,
    ArrowLeftRight,
    X,
    Check,
    ChevronDown,
    Clock,
    RotateCcw,
    MapPin,
    Plus,
    Search // Added Search icon
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';

import { WORLD_CITIES, DATA_UNITS } from '../constants';
import { WorldCity } from '../types';
import { colors } from '../theme/colors';
import { PickerButton } from '../components/PickerButton';

type ToolTab = 'colors' | 'time' | 'data';

// Custom Searchable Picker Modal with Online Search AND GPS
const PickerModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    title: string;
    isCitySearch?: boolean; // New flag to enable online search
    options: { label: string; value: string }[]; // Static options (for other pickers)
    selectedValue: string;
    onSelect: (value: string, cityData?: WorldCity) => void; // Updated callback
    onDetectLocation?: () => void; // New prop for GPS
}> = ({ visible, onClose, title, isCitySearch, options, selectedValue, onSelect, onDetectLocation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [onlineResults, setOnlineResults] = useState<WorldCity[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search timer
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setSearchQuery('');
            setOnlineResults([]);
            setIsSearching(false);
        }
    }, [visible]);

    // Handle text change
    const handleSearch = (text: string) => {
        setSearchQuery(text);

        if (!isCitySearch) return;

        if (timer) clearTimeout(timer);

        if (text.length < 3) {
            setOnlineResults([]);
            return;
        }

        setIsSearching(true);
        const newTimer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=10&language=en&format=json`
                );
                const data = await response.json();

                if (data.results) {
                    const mappedCities: WorldCity[] = data.results.map((item: any) => ({
                        id: `geo_${item.id}`,
                        name: item.name,
                        region: item.country || item.admin1 || 'Unknown',
                        timezone: item.timezone || 'UTC'
                    })).filter((c: WorldCity) => c.timezone); // Ensure timezone exists
                    setOnlineResults(mappedCities);
                } else {
                    setOnlineResults([]);
                }
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms delay
        setTimer(newTimer);
    };

    const displayOptions = isCitySearch
        ? onlineResults.map(c => ({ label: `${c.name}, ${c.region}`, value: c.id, data: c }))
        : options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Search size={20} color={colors.secondary} style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={isCitySearch ? "Type city (e.g. Oulu)..." : "Search..."}
                            placeholderTextColor={colors.secondary}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <X size={16} color={colors.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* GPS Button for City Search */}
                    {isCitySearch && onDetectLocation && (
                        <TouchableOpacity style={styles.gpsButton} onPress={() => { onDetectLocation(); onClose(); }}>
                            <MapPin size={18} color={colors.main} />
                            <Text style={styles.gpsButtonText}>Use GPS Location</Text>
                        </TouchableOpacity>
                    )}

                    {isSearching && (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: colors.secondary }}>Searching...</Text>
                        </View>
                    )}

                    <FlatList
                        data={displayOptions}
                        keyExtractor={(item) => item.value}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.modalOption, selectedValue === item.value && styles.modalOptionSelected]}
                                onPress={() => {
                                    // @ts-ignore
                                    onSelect(item.value, item.data);
                                    onClose();
                                }}
                            >
                                <Text style={[styles.modalOptionText, selectedValue === item.value && styles.modalOptionTextSelected]}>
                                    {item.label}
                                </Text>
                                {selectedValue === item.value && <Check size={20} color={colors.accent} />}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            isSearching ? null : (
                                <View style={styles.emptySearch}>
                                    <Text style={styles.emptySearchText}>
                                        {isCitySearch && searchQuery.length < 3
                                            ? "Type at least 3 characters"
                                            : "No results found"}
                                    </Text>
                                </View>
                            )
                        }
                    />
                </View>
            </Pressable>
        </Modal>
    );
};

// Time Picker Modal
const TimePickerModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    hour: number;
    minute: number;
    onConfirm: (h: number, m: number) => void;
}> = ({ visible, onClose, hour, minute, onConfirm }) => {
    const [hourStr, setHourStr] = useState(hour.toString().padStart(2, '0'));
    const [minuteStr, setMinuteStr] = useState(minute.toString().padStart(2, '0'));
    const minuteInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            setHourStr(hour.toString().padStart(2, '0'));
            setMinuteStr(minute.toString().padStart(2, '0'));
        }
    }, [visible, hour, minute]);

    const handleHourChange = (text: string) => {
        // Only allow digits
        const clean = text.replace(/[^0-9]/g, '');
        if (clean === '') {
            setHourStr('');
            return;
        }

        const val = parseInt(clean);
        // Validate range 0-23
        if (val > 23) {
            // If they type "3" it's fine, but "39" is not
            // Allow single digit, clamp double digit
            if (clean.length === 1) {
                setHourStr(clean);
            } else {
                setHourStr('23');
                minuteInputRef.current?.focus();
            }
            return;
        }

        setHourStr(clean);

        // Auto-focus to minute when 2 valid digits entered
        if (clean.length === 2) {
            minuteInputRef.current?.focus();
        }
    };

    const handleMinuteChange = (text: string) => {
        // Only allow digits
        const clean = text.replace(/[^0-9]/g, '');
        if (clean === '') {
            setMinuteStr('');
            return;
        }

        const val = parseInt(clean);
        // Validate range 0-59
        if (val > 59) {
            if (clean.length === 1) {
                setMinuteStr(clean);
            } else {
                setMinuteStr('59');
            }
            return;
        }

        setMinuteStr(clean);
    };

    const handleConfirm = () => {
        let h = parseInt(hourStr);
        let m = parseInt(minuteStr);

        if (isNaN(h)) h = 0;
        if (isNaN(m)) m = 0;

        h = Math.max(0, Math.min(23, h));
        m = Math.max(0, Math.min(59, m));

        onConfirm(h, m);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <ScrollView
                contentContainerStyle={styles.timeModalOverlay}
                keyboardShouldPersistTaps="always"
            >
                <Pressable style={styles.timeModalOverlay} onPress={onClose}>
                    <View style={styles.timePickerContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.timePickerTitle}>Set Time</Text>
                        <View style={styles.timeInputsRow}>
                            <View style={styles.timeInputColumn}>
                                <Text style={styles.timeInputLabel}>Hour</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={hourStr}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    onChangeText={handleHourChange}
                                    selectTextOnFocus
                                />
                            </View>
                            <Text style={styles.timeColon}>:</Text>
                            <View style={styles.timeInputColumn}>
                                <Text style={styles.timeInputLabel}>Minute</Text>
                                <TextInput
                                    ref={minuteInputRef}
                                    style={styles.timeInput}
                                    value={minuteStr}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    onChangeText={handleMinuteChange}
                                    selectTextOnFocus
                                />
                            </View>
                        </View>
                        <View style={styles.timePickerButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirm}
                            >
                                <Text style={styles.confirmButtonText}>Set</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </ScrollView>
        </Modal>
    );
};

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
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 120 + insets.bottom }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.tabContainer}>
                    <TabButton
                        tab="colors"
                        icon={<Palette size={16} color={activeTab === 'colors' ? colors.main : colors.secondary} />}
                        label="Colors"
                    />
                    <TabButton
                        tab="data"
                        icon={<HardDrive size={16} color={activeTab === 'data' ? colors.main : colors.secondary} />}
                        label="Data"
                    />
                    <TabButton
                        tab="time"
                        icon={<Globe size={16} color={activeTab === 'time' ? colors.main : colors.secondary} />}
                        label="World Time"
                    />
                </View>

                {activeTab === 'colors' && <ColorConverter />}
                {activeTab === 'data' && <DataConverter />}
                {activeTab === 'time' && <TimeZones />}
            </ScrollView>
        </SafeAreaView>
    );
};

// Color Converter code remains same...
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

const SliderRow = ({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) => {
    const [trackWidth, setTrackWidth] = useState(0);

    const updateValue = (x: number) => {
        if (trackWidth > 0) {
            const newValue = Math.round((x / trackWidth) * 255);
            onChange(Math.min(255, Math.max(0, newValue)));
        }
    };

    const panGesture = Gesture.Pan()
        .onStart((e) => {
            updateValue(e.x);
        })
        .onUpdate((e) => {
            updateValue(e.x);
        })
        .runOnJS(true);

    const tapGesture = Gesture.Tap()
        .onEnd((e) => {
            updateValue(e.x);
        })
        .runOnJS(true);

    const composedGesture = Gesture.Race(panGesture, tapGesture);

    return (
        <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>{label}</Text>
            <View style={styles.sliderContainer}>
                <GestureDetector gesture={composedGesture}>
                    <View
                        style={styles.customSliderContainer}
                        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                    >
                        {/* Background Track */}
                        <View style={[styles.customSliderTrack, { backgroundColor: color + '30' }]} />

                        {/* Filled Track */}
                        <View
                            style={[
                                styles.customSliderFill,
                                {
                                    backgroundColor: color,
                                    width: `${(value / 255) * 100}%`
                                }
                            ]}
                        />

                        {/* Thumb */}
                        <View
                            style={[
                                styles.customSliderThumb,
                                {
                                    backgroundColor: color,
                                    left: trackWidth > 0 ? Math.max(0, (value / 255) * trackWidth - 10) : 0,
                                }
                            ]}
                        />
                    </View>
                </GestureDetector>
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
};

// Data Converter code remains same...
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

// IMPROVED Time Zones Component
const TimeZones: React.FC = () => {
    // Base State
    const [now, setNow] = useState(new Date()); // Always runs in background
    const [manualOffsetMinutes, setManualOffsetMinutes] = useState<number | null>(null);
    const [baseCityId, setBaseCityId] = useState<string | null>(null); // null = Device Location

    // Selection States
    const [cities, setCities] = useState<WorldCity[]>(WORLD_CITIES.slice(0, 4));
    const [citySelectorVisible, setCitySelectorVisible] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [baseCitySelectorVisible, setBaseCitySelectorVisible] = useState(false);

    // GPS State
    const [isLocating, setIsLocating] = useState(false);

    // Update "real time" every second
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Detect GPS Location
    const detectUserLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            // We use Open-Meteo Reverse Geocoding via their Search API with lat/lon? No, search uses text.
            // For coordinates, we can just guess or use a proper reverse geocoder.
            // Open-Meteo has no direct reverse geocoding endpoint in free tier as simply as search.
            // BUT, 'expo-location' has reverseGeocodeAsync!

            let address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (address && address.length > 0) {
                const place = address[0];
                const cityName = place.city || place.region || place.name || "Unknown Location";
                const regionName = place.country || "Unknown Country";

                // Construct a temporary city object
                const newCity: WorldCity = {
                    id: `gps_${new Date().getTime()}`,
                    name: cityName,
                    region: regionName,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Assume device setting matches location
                };

                setCustomBaseCity(newCity);
                setBaseCityId(newCity.id);
                setBaseCitySelectorVisible(false); // Close modal
            }
        } catch (e) {
            console.error("Location Error", e);
        } finally {
            setIsLocating(false);
        }
    };


    // Custom base city state (must be before baseCity and displayTime)
    const [customBaseCity, setCustomBaseCity] = useState<WorldCity | null>(null);

    // Computed base city
    const baseCity = useMemo(() => {
        if (customBaseCity && baseCityId === customBaseCity.id) return customBaseCity;
        return baseCityId ? WORLD_CITIES.find(c => c.id === baseCityId) : null;
    }, [baseCityId, customBaseCity]);

    // The calculated "Reference Time" to display and compare against
    const referenceTime = useMemo(() => {
        const baseDate = new Date(now.getTime() + (manualOffsetMinutes ? manualOffsetMinutes * 60000 : 0));

        // If we have a base city, we need to adjust the time so it LOOKS like that city's time
        // But actually, we just want a "Universal Moment" that we are visualizing.
        // Let's stick to UTC manipulation.

        return baseDate;
    }, [now, manualOffsetMinutes]);

    // Helper to get time object for a specific timezone
    const validTimeZone = (tz: string) => {
        try {
            // Test if timezone is valid
            new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
            return tz;
        } catch (e) {
            return 'UTC';
        }
    };

    const getTimeInZone = (date: Date, timezone: string) => {
        try {
            const tz = validTimeZone(timezone);
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false,
            });

            // Try formatToParts (modern standard)
            if (formatter.formatToParts) {
                const parts = formatter.formatToParts(date);
                const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
                return new Date(getPart('year'), getPart('month') - 1, getPart('day'), getPart('hour'), getPart('minute'), getPart('second'));
            }

            // Fallback for older engines: Parse string "M/D/YYYY, HH:MM:SS"
            const dateString = formatter.format(date);
            // Remove any non-ascii characters (some devices add invisible directional markers)
            const cleanString = dateString.replace(/[^\x00-\x7F]/g, "");

            const d = new Date(cleanString);
            if (!isNaN(d.getTime())) return d;

            // Last resort: manual parse of "MM/DD/YYYY, HH:MM:SS"
            const [datePart, timePart] = cleanString.includes(',') ? cleanString.split(', ') : cleanString.split(' ');
            if (datePart && timePart) {
                const [m, day, y] = datePart.split('/').map(n => parseInt(n));
                const [h, min, s] = timePart.split(':').map(n => parseInt(n));
                return new Date(y, m - 1, day, h, min, s);
            }

            return date; // Fail safe
        } catch (e) {
            console.log("Date error", e);
            return date;
        }
    }

    // Calculate the "Visual Time" to show in the big clock
    const displayTime = useMemo(() => {
        const tz = baseCity ? baseCity.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
        return getTimeInZone(referenceTime, tz);
    }, [referenceTime, baseCity]);

    const handleTimeChange = (h: number, m: number) => {
        // Determine target time in the Base City's timezone
        const currentDisplay = displayTime;

        // Calculate difference
        const targetDate = new Date(currentDisplay);
        targetDate.setHours(h);
        targetDate.setMinutes(m);

        const diffMs = targetDate.getTime() - currentDisplay.getTime();

        // Add to existing offset
        setManualOffsetMinutes(prev => (prev || 0) + (diffMs / 60000));
    };

    const resetTime = () => {
        setManualOffsetMinutes(null);
    };

    const addCity = (cityId: string, cityData?: WorldCity) => {
        // If it's a dynamic city from online search
        if (cityData) {
            setCities(prev => {
                if (prev.some(c => c.id === cityData.id)) return prev;
                return [...prev, cityData];
            });
            return;
        }

        // Existing logic for static cities
        const city = WORLD_CITIES.find(c => c.id === cityId);
        if (city && !cities.some(c => c.id === city.id)) {
            setCities(prev => [...prev, city]);
        }
    };

    const removeCity = (id: string) => {
        setCities(prev => prev.filter(c => c.id !== id));
    };

    const selectBaseCity = (cityId: string, cityData?: WorldCity) => {
        if (cityData) {
            // If the dynamic city isn't in WORLD_CITIES, we can just set it as a temporary state or add it to a "recent" list.
            // For now, let's treat the baseCityId as the source of truth, but we need to store the OBJECT if it's dynamic.
            // Actually, let's keep it simple: just update the Base City Obj directly if possible, or add to a lookaside list.
            // Simplest: Add to global cities if not there? No, that pollutes.
            // Better: Create a separate 'customBaseCity' state.
            setBaseCityId(cityId);
            // If it's a new city, we might need a way to resolve it later. 
            // Hack: Add it to WORLD_CITIES array in memory (not persistent)? Or just set a "customBaseCity" state.
            setCustomBaseCity(cityData);
        } else {
            setBaseCityId(cityId || null);
            setCustomBaseCity(null);
        }
    };

    // customBaseCity and baseCity moved earlier (before displayTime)


    // ... inside TimeZones component

    // ... (previous helper functions)

    // ... inside TimeZones component

    const [sortMethod, setSortMethod] = useState<'smart' | 'name' | 'region'>('smart');

    const sortedCities = useMemo(() => {
        return [...cities].sort((a, b) => {
            if (sortMethod === 'name') {
                return a.name.localeCompare(b.name);
            }
            if (sortMethod === 'region') {
                const regionCompare = a.region.localeCompare(b.region);
                if (regionCompare !== 0) return regionCompare;
                return a.name.localeCompare(b.name);
            }

            // Smart Sort (Request: Finland -> Europe -> USA -> Rest)
            const getPriority = (c: WorldCity) => {
                // Priority 0: Finland
                if (c.region.includes('Finland') || c.name === 'Helsinki' || c.timezone.includes('Helsinki')) return 0;

                // Priority 1: Europe (excluding Finland)
                if (c.timezone.startsWith('Europe/')) return 1;

                // Priority 2: USA
                if (c.region === 'USA' || c.region === 'United States' || c.timezone.startsWith('America/New_York') || c.timezone.startsWith('America/Los_Angeles') || c.timezone.startsWith('America/Chicago') || c.timezone.startsWith('America/Denver')) return 2;

                // Rest of the world by continent approx
                if (c.timezone.startsWith('Asia/')) return 3;
                if (c.timezone.startsWith('Australia/') || c.timezone.startsWith('Pacific/')) return 4;
                if (c.timezone.startsWith('Africa/')) return 5;

                return 6; // Others (e.g. South America)
            };

            const pA = getPriority(a);
            const pB = getPriority(b);

            if (pA !== pB) return pA - pB;

            // Secondary: inside group, sort by Name
            return a.name.localeCompare(b.name);
        });
    }, [cities, sortMethod, referenceTime]);

    // Cycle through sort methods
    const toggleSort = () => {
        if (sortMethod === 'smart') setSortMethod('name');
        else if (sortMethod === 'name') setSortMethod('region');
        else setSortMethod('smart');
    };

    const getSortLabel = () => {
        if (sortMethod === 'smart') return "Sort: Smart";
        if (sortMethod === 'name') return "Sort: Name";
        return "Sort: Country";
    };

    return (
        <View style={styles.content}>
            {/* Reference Card (Control Panel) */}
            <View style={styles.referenceCard}>
                <View style={styles.refHeader}>
                    <Text style={styles.refLabel}>REFERENCE LOCATION</Text>
                    {manualOffsetMinutes !== null && (
                        <TouchableOpacity onPress={resetTime} style={styles.resetButton}>
                            <RotateCcw size={12} color={colors.accent} />
                            <Text style={styles.resetText}>Reset to Now</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* City Selector */}
                <TouchableOpacity
                    style={styles.baseCitySelector}
                    onPress={() => setBaseCitySelectorVisible(true)}
                >
                    <MapPin size={20} color={colors.accent} />
                    <Text style={styles.baseCityName}>
                        {baseCity ? baseCity.name : "My Local Location"}
                    </Text>
                    <ChevronDown size={20} color={colors.secondary} />
                </TouchableOpacity>

                {/* Time Display & Changer */}
                <TouchableOpacity
                    style={styles.bigClock}
                    onPress={() => setTimePickerVisible(true)}
                >
                    <Text style={styles.bigTime}>
                        {displayTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </Text>
                    <View style={styles.editTimeBadge}>
                        <Clock size={12} color={colors.main} />
                        <Text style={styles.editTimeText}>EDIT</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.refDate}>
                    {displayTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>
            </View>

            {/* Comparison List */}
            <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>COMPARED TO</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
                        <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setCitySelectorVisible(true)} style={styles.addCityButton}>
                        <Plus size={14} color={colors.accent} />
                        <Text style={styles.addCityText}>Add City</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {sortedCities.map((city) => {
                const cityTime = getTimeInZone(referenceTime, city.timezone);

                // Calculate offset from base display time
                const diffHrs = (cityTime.getTime() - displayTime.getTime()) / 3600000;
                const offsetStr = diffHrs === 0 ? "Same time" : diffHrs > 0 ? `+${diffHrs.toFixed(1).replace('.0', '')}h` : `${diffHrs.toFixed(1).replace('.0', '')}h`;

                return (
                    <View key={city.id} style={styles.cityCard}>
                        {/* ... card content same as before ... */}
                        <View style={styles.cityInfo}>
                            <Text style={styles.cityName}>{city.name}</Text>
                            <Text style={styles.cityRegion}>
                                {cityTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {city.region}
                            </Text>
                        </View>

                        <View style={styles.cityRight}>
                            <Text style={styles.cityTime}>
                                {cityTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </Text>
                            <View style={[styles.offsetBadge, diffHrs === 0 ? styles.offsetBadgeNeutral : diffHrs > 0 ? styles.offsetBadgePlus : styles.offsetBadgeMinus]}>
                                <Text style={[styles.offsetText, diffHrs !== 0 && { color: colors.main }]}>{offsetStr}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.cityRemove} onPress={() => removeCity(city.id)}>
                            <X size={16} color={colors.subtle} />
                        </TouchableOpacity>
                    </View>
                );
            })}

            {/* Modals */}
            <TimePickerModal
                visible={timePickerVisible}
                onClose={() => setTimePickerVisible(false)}
                hour={displayTime.getHours()}
                minute={displayTime.getMinutes()}
                onConfirm={handleTimeChange}
            />

            <PickerModal
                visible={baseCitySelectorVisible}
                onClose={() => setBaseCitySelectorVisible(false)}
                title="Select Reference City"
                isCitySearch={true}
                onDetectLocation={detectUserLocation} // Pass GPS function
                options={[
                    { label: "📍 My Local Location", value: "" },
                    ...WORLD_CITIES.map(c => ({ label: c.name, value: c.id }))
                ]}
                selectedValue={baseCityId || ""}
                onSelect={selectBaseCity}
            />

            <PickerModal
                visible={citySelectorVisible}
                onClose={() => setCitySelectorVisible(false)}
                title="Search & Add City"
                isCitySearch={true}
                options={WORLD_CITIES.map(c => ({ label: c.name, value: c.id }))}
                selectedValue=""
                onSelect={addCity}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.main },
    header: { paddingHorizontal: 24, paddingVertical: 16 },
    headerTitle: { fontSize: 28, fontWeight: '600', color: colors.primary },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, gap: 20 },
    tabContainer: { flexDirection: 'row', backgroundColor: colors.input, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: colors.subtle },
    tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
    tabButtonActive: { backgroundColor: colors.accent },
    tabButtonText: { fontSize: 12, fontWeight: '500', color: colors.secondary },
    tabButtonTextActive: { color: colors.main },
    content: { gap: 16 },

    // Reference Card Styles
    referenceCard: {
        backgroundColor: colors.input,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.subtle,
        gap: 16,
    },
    refHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    refLabel: { fontSize: 11, fontWeight: '700', color: colors.secondary, letterSpacing: 1 },
    resetButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accent + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    resetText: { fontSize: 11, color: colors.accent, fontWeight: '600' },
    baseCitySelector: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.input, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.subtle },
    baseCityName: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.primary },
    bigClock: { alignItems: 'center', marginVertical: 8, position: 'relative' },
    bigTime: { fontSize: 64, fontWeight: '300', color: colors.primary, letterSpacing: 2 },
    editTimeBadge: { position: 'absolute', top: 10, right: 0, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    editTimeText: { fontSize: 10, fontWeight: '700', color: colors.main },
    refDate: { fontSize: 16, color: colors.secondary, textAlign: 'center', fontWeight: '500' },

    // List Styles
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: colors.secondary, letterSpacing: 1 },
    sortButton: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.input, borderWidth: 1, borderColor: colors.subtle },
    sortButtonText: { fontSize: 11, fontWeight: '600', color: colors.secondary },
    addCityButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    addCityText: { color: colors.accent, fontWeight: '600', fontSize: 14 },

    cityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.subtle, gap: 12 },
    cityInfo: { flex: 1 },
    cityName: { fontSize: 16, fontWeight: '600', color: colors.primary },
    cityRegion: { fontSize: 12, color: colors.secondary, marginTop: 2 },
    cityRight: { alignItems: 'flex-end', gap: 4 },
    cityTime: { fontSize: 24, fontWeight: '300', color: colors.primary },
    cityRemove: { padding: 4 },

    offsetBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    offsetBadgeNeutral: { backgroundColor: colors.subtle },
    offsetBadgePlus: { backgroundColor: colors.accent },
    offsetBadgeMinus: { backgroundColor: colors.accent }, // White for minus
    offsetText: { fontSize: 12, fontWeight: '700', color: colors.secondary },

    // Style fixes from previous steps
    inputSection: { backgroundColor: colors.input, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.subtle, gap: 8 },
    inputLabel: { fontSize: 14, fontWeight: '500', color: colors.secondary },
    inputField: { fontSize: 48, fontWeight: '300', color: colors.primary },
    unitsContainer: { gap: 12 },
    unitField: { gap: 8 },
    unitLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
    pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.input, borderRadius: 16, borderWidth: 1, borderColor: colors.subtle, paddingHorizontal: 16, paddingVertical: 18 },
    pickerButtonText: { fontSize: 16, fontWeight: '500', color: colors.primary, flex: 1 },
    swapButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, backgroundColor: colors.input, borderWidth: 1, borderColor: colors.subtle, alignSelf: 'center' },
    swapButtonText: { fontSize: 14, fontWeight: '600', color: colors.accent },
    resultContainer: { backgroundColor: colors.input, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.subtle, alignItems: 'center', gap: 8 },
    resultValue: { fontSize: 40, fontWeight: '600', color: colors.primary },
    resultUnit: { fontSize: 16, color: colors.secondary },

    // Other existing styles
    colorPreview: { height: 160, borderRadius: 24, borderWidth: 1, borderColor: colors.subtle, justifyContent: 'center', alignItems: 'center' },
    copiedBadge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    copiedText: { color: colors.primary, fontWeight: '500' },
    colorValuesRow: { flexDirection: 'row', gap: 16 },
    colorValueCard: { flex: 1, backgroundColor: colors.input, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.subtle, alignItems: 'center', gap: 4 },
    colorValueLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1 },
    colorValueText: { fontSize: 20, fontWeight: '600', color: colors.primary },
    colorValueTextSmall: { fontSize: 12, fontWeight: '500', color: colors.primary },
    slidersCard: { backgroundColor: colors.input, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.subtle, gap: 24 },
    sliderRow: { gap: 8 },
    sliderHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    sliderLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1 },
    sliderValue: { fontSize: 13, fontWeight: '600', color: colors.primary },
    sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sliderTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    sliderFill: { height: '100%', borderRadius: 4 },
    sliderInput: { width: 50, backgroundColor: colors.main, borderRadius: 8, padding: 8, color: colors.primary, textAlign: 'center', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.subtle },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.primary },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.subtle + '40' },
    modalOptionSelected: { backgroundColor: colors.accent + '15' },
    modalOptionText: { fontSize: 16, color: colors.primary },
    modalOptionTextSelected: { color: colors.accent, fontWeight: '600' },

    // Search styles
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.input, margin: 20, marginBottom: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.subtle },
    searchInput: { flex: 1, paddingVertical: 12, color: colors.primary, fontSize: 16 },
    gpsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.accent, marginHorizontal: 20, marginBottom: 20, padding: 12, borderRadius: 12 },
    gpsButtonText: { color: colors.main, fontWeight: '600', fontSize: 16 },
    emptySearch: { padding: 40, alignItems: 'center' },
    emptySearchText: { color: colors.secondary, fontSize: 16 },

    // Time Picker Modal Styles
    timeModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timePickerContent: {
        width: '80%',
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.subtle,
        // Removed fixed positioning
    },
    timePickerTitle: { fontSize: 20, fontWeight: '600', color: colors.primary, textAlign: 'center', marginBottom: 24 },
    timeInputsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 32 },
    timeInputColumn: { alignItems: 'center', gap: 8 },
    timeInputLabel: { fontSize: 12, color: colors.secondary },
    timeInput: { width: 80, height: 80, borderRadius: 16, backgroundColor: colors.input, color: colors.accent, fontSize: 40, fontWeight: '300', textAlign: 'center', borderWidth: 1, borderColor: colors.subtle },
    timeColon: { fontSize: 40, color: colors.secondary, marginTop: 24 },
    timePickerButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.input, alignItems: 'center' },
    cancelButtonText: { color: colors.secondary, fontWeight: '600' },
    confirmButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center' },
    confirmButtonText: { color: colors.main, fontWeight: '600' },

    // Custom Slider Styles
    customSliderContainer: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        position: 'relative',
    },
    customSliderTrack: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 12,
        borderRadius: 6,
    },
    customSliderFill: {
        position: 'absolute',
        left: 0,
        height: 12,
        borderRadius: 6,
    },
    customSliderThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    customSliderTouchLayer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
});

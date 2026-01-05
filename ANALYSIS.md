# Convert_It Koodipohjan Analyysi

**Päivämäärä:** 2026-01-05  
**Analysoija:** AI Assistant

---

## 📋 Yhteenveto

Koodipohja on toimiva mutta sisältää merkittäviä parannusmahdollisuuksia. Pääongelmat ovat:
1. **Koodin toisteisuus (~40%)** - Samat komponentit ja tyylit toistetaan jokaisessa näkymässä
2. **Värimäärittelyiden hajauttaminen** - `colors`-objekti määritelty 6 kertaa eri tiedostoissa
3. **Lint-virheet** - 2 aktiivista TypeScript-virhettä ToolsScreen.tsx:ssä
4. **Käyttämätön koodi** - Slider import jäänyt vaikka käytetään custom-slideria

---

## 🔴 KRIITTISET VIRHEET (Korjattava)

### 1. Block-scoped variable error (`ToolsScreen.tsx:734`)
```
Block-scoped variable 'baseCity' used before its declaration.
```
**Sijainti:** Rivi 734  
**Ongelma:** `baseCity` käytetään `displayTime` useMemo:ssa ennen kuin se on määritelty (rivi 797).  
**Korjaus:** Siirrä `baseCity` useMemo ylemmäs ennen `displayTime`:a.

### 2. FlatList ListEmptyComponent type error (`ToolsScreen.tsx:181`)
```
Type 'false | Element' is not assignable to type...
```
**Sijainti:** Rivi 181  
**Ongelma:** `ListEmptyComponent` saa arvon `!isSearching && (...)` joka voi olla `false`.  
**Korjaus:** Käytä ternary: `ListEmptyComponent={isSearching ? null : <View>...</View>}`

---

## 🟠 KOODIN TOISTEISUUS (Refaktoroitava)

### 1. Colors-objekti (6 kopiota)

| Tiedosto | Rivi |
|----------|------|
| App.tsx | 26-34 |
| ConverterScreen.tsx | 24-32 |
| SizesScreen.tsx | 23-31 |
| KitchenScreen.tsx | 21-29 |
| CurrencyScreen.tsx | 18-26 |
| ToolsScreen.tsx | 36-44 |

**Ratkaisu:** Luo `src/theme/colors.ts` ja importtaa kaikkialta.

```typescript
// src/theme/colors.ts
export const colors = {
    main: '#09090b',
    card: '#18181b',
    input: '#27272a',
    subtle: '#3f3f46',
    primary: '#ffffff',
    secondary: '#a1a1aa',
    accent: '#50C878',
};
```

### 2. PickerModal-komponentti (5 kopiota)

Sama `PickerModal`-komponentti on kopioitu jokaiseen näkymään:
- ConverterScreen.tsx (rivit 44-91)
- SizesScreen.tsx (rivit 51-98)
- KitchenScreen.tsx (rivit 37-72)
- CurrencyScreen.tsx (rivit 38-68)
- ToolsScreen.tsx (rivit 48-197) - laajin versio hakutoiminnolla

**Ratkaisu:** Luo `src/components/PickerModal.tsx` ja käytä sitä kaikkialla.

### 3. PickerButton-komponentti (5 kopiota)

Sama `PickerButton`-komponentti toistetaan:
- ConverterScreen.tsx (rivit 95-103)
- SizesScreen.tsx (rivit 108-113)
- KitchenScreen.tsx (rivit 74-79)
- CurrencyScreen.tsx (rivit 70-75)
- ToolsScreen.tsx (rivit 200-205)

**Ratkaisu:** Luo `src/components/PickerButton.tsx`.

### 4. Modal-tyylit (5 kopiota)

Jokainen näkymä määrittelee samat modal-tyylit:
- `modalOverlay`
- `modalContent`
- `modalHeader`
- `modalTitle`
- `modalOption`
- `modalOptionSelected`
- `modalOptionText`
- `modalOptionTextSelected`

**Ratkaisu:** Luo `src/styles/modalStyles.ts` jaetuksi tyyleiksi.

### 5. Header-rakenne

Jokainen näkymä käyttää samanlaista header-rakennetta:
```tsx
<View style={styles.header}>
    <Text style={styles.headerTitle}>Title</Text>
</View>
```

**Ratkaisu:** Luo `src/components/ScreenHeader.tsx`.

---

## 🟡 UI EPÄJOHDONMUKAISUUDET

### 1. Header-tyylit vaihtelevat

| Näkymä | Header-tyyli |
|--------|--------------|
| ConverterScreen | Sisältää headerDot + avatar |
| SizesScreen | Pelkkä otsikko |
| KitchenScreen | Pelkkä otsikko |
| CurrencyScreen | Pelkkä otsikko |
| ToolsScreen | Pelkkä otsikko |

**Suositus:** Yhtenäistä joko lisäämällä samat elementit kaikkialle tai poistamalla ConverterScreenistä.

### 2. ScrollView paddingBottom

Jokainen näkymä käyttää `paddingBottom: 120 + insets.bottom`, mutta arvo on kovakoodattu eri tavoin:
- Jotkut käyttävät `paddingBottom: 100 + insets.bottom`
- Jotkut `paddingBottom: 120 + insets.bottom`

**Suositus:** Määrittele vakio `BOTTOM_TAB_HEIGHT` ja käytä `paddingBottom: BOTTOM_TAB_HEIGHT + insets.bottom`.

### 3. InputField borderRadius

- ConverterScreen: `borderRadius: 16`
- KitchenScreen: `borderRadius: 16`
- CurrencyScreen: `borderRadius: 16`
- ToolsScreen: `borderRadius: 12` (eri!)

**Suositus:** Yhtenäistä kaikki käyttämään samaa arvoa.

### 4. CategoryButton vs TabButton

- ConverterScreen käyttää `CategoryButton`
- KitchenScreen käyttää `TabButton`
- ToolsScreen käyttää `TabButton`

Nämä ovat käytännössä sama komponentti eri nimillä.

**Suositus:** Luo yksi `SegmentedControl` tai `TabBar` komponentti.

---

## 🟢 KÄYTTÄMÄTÖN KOODI

### 1. Slider import (`ToolsScreen.tsx:13`)
```typescript
import Slider from '@react-native-community/slider';
```
Tämä importataan mutta sitä ei enää käytetä, koska custom slider otettiin käyttöön.

**Toimenpide:** Poista import.

### 2. ALL_CITIES array (`constants/index.ts:295-485`)
Laaja `ALL_CITIES` array (190 kaupunkia) on määritelty mutta sitä ei käytetä missään. Sovellus käyttää API-hakua kaupungeille.

**Toimenpide:** Arvioi tarvitaanko sitä vai voiko poistaa.

### 3. Duplikaatti WORLD_CITIES
`WORLD_CITIES` (rivit 278-292) ja `ALL_CITIES` (rivit 295-485) sisältävät päällekkäisiä kaupunkeja.

---

## 🔵 PARANNUSEHDOTUKSET

### 1. Kansiorakenne

**Nykyinen:**
```
src/
  components/    (tyhjä!)
  constants/
  screens/
  styles/       (tyhjä!)
  types/
```

**Ehdotettu:**
```
src/
  components/
    PickerModal.tsx
    PickerButton.tsx
    ScreenHeader.tsx
    TabBar.tsx
    SliderRow.tsx
  theme/
    colors.ts
    spacing.ts
    typography.ts
  styles/
    modalStyles.ts
    commonStyles.ts
  constants/
    index.ts
  screens/
    ConverterScreen.tsx
    ...
  types/
    index.ts
  utils/
    formatting.ts
    timeZones.ts
```

### 2. Jaetut tyylit

Luo `src/styles/commonStyles.ts`:
```typescript
export const commonStyles = StyleSheet.create({
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
        fontWeight: '700',
        color: colors.primary,
    },
    // ... jne
});
```

### 3. Custom Hooks

Useat näkymät käyttävät samankaltaista logiikkaa:
- `useSafeAreaInsets()` jokaisessa
- `useState` modal-tiloille

Voisi luoda:
```typescript
// src/hooks/usePickerModal.ts
export const usePickerModal = () => {
    const [visible, setVisible] = useState(false);
    return {
        visible,
        open: () => setVisible(true),
        close: () => setVisible(false),
    };
};
```

### 4. TimeZones-komponentin jakaminen

`ToolsScreen.tsx` on 1165 riviä pitkä. `TimeZones`-komponentti (rivit 595-900+) voitaisiin siirtää omaksi tiedostokseen `src/components/TimeZones.tsx`.

---

## 📊 Tilastot

| Metriikka | Arvo |
|-----------|------|
| Tiedostoja | 8 |
| Rivejä yhteensä | ~3600 |
| Duplikaattirivejä (arvio) | ~1200 (33%) |
| Lint-virheitä | 2 |
| Käyttämättömiä importeja | 1 |
| Toistetut komponentit | 5 (PickerModal, PickerButton, colors, modal-tyylit, header) |

---

## ✅ Toimenpiteiden priorisointi

### Kriittiset (Tee heti)
1. Korjaa `baseCity` declaration order error
2. Korjaa FlatList ListEmptyComponent type error
3. Poista käyttämätön Slider import

### Korkea prioriteetti (Seuraava sprintti)
4. Luo `src/theme/colors.ts` ja refaktoroi kaikki näkymät
5. Luo `src/components/PickerModal.tsx`
6. Luo `src/components/PickerButton.tsx`

### Keskiprioriteetti (Kun aikaa)
7. Luo jaetut modal-tyylit
8. Yhtenäistä header-rakenne
9. Jaa ToolsScreen pienempiin osiin

### Matala prioriteetti (Nice-to-have)
10. Arvioi ALL_CITIES tarpeellisuus
11. Luo custom hooks
12. Yhtenäistä borderRadius-arvot

---

## 🎯 Hyödyt refaktoroinnista

| Hyöty | Kuvaus |
|-------|--------|
| **Vähemmän koodia** | ~30% vähennys duplikaattien poistolla |
| **Helpompi ylläpito** | Värimuutos yhdessä paikassa vaikuttaa kaikkialle |
| **Vähemmän bugeja** | Yksi PickerModal = yksi paikka korjata |
| **Parempi testattavuus** | Jaetut komponentit helpompi testata |
| **Nopeampi kehitys** | Uudet näkymät käyttävät valmiita komponentteja |

---

*Tämä analyysi perustuu koodipohjan läpikäyntiin 2026-01-05. Suositukset ovat ehdotuksia ja niiden toteuttaminen on vapaaehtoista.*

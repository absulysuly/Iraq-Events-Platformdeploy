import type { City, Category } from './types';

// NOTE: All dynamic data (events, users) has been moved to the backend.
// This data is now fetched via `services/apiService.ts`.
// City and Category data could also be moved to API endpoints in a production app.

// This list contains the 19 cities and governorates specified for the application.
export const cities: City[] = [
    { id: 'city-baghdad', name: { en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' }, image: 'https://picsum.photos/seed/baghdad/200' },
    { id: 'city-basra', name: { en: 'Basra', ar: 'البصرة', ku: 'بەسرە' }, image: 'https://picsum.photos/seed/basra/200' },
    { id: 'city-mosul', name: { en: 'Mosul', ar: 'الموصل', ku: 'مووسڵ' }, image: 'https://picsum.photos/seed/mosul/200' },
    { id: 'city-erbil', name: { en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' }, image: 'https://picsum.photos/seed/erbil/200' },
    { id: 'city-sulaymaniyah', name: { en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' }, image: 'https://picsum.photos/seed/sulaymaniyah/200' },
    { id: 'city-duhok', name: { en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' }, image: 'https://picsum.photos/seed/duhok/200' },
    { id: 'city-kirkuk', name: { en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' }, image: 'https://picsum.photos/seed/kirkuk/200' },
    { id: 'city-fallujah', name: { en: 'Fallujah', ar: 'الفلوجة', ku: 'فەللوجە' }, image: 'https://picsum.photos/seed/fallujah/200' },
    { id: 'city-babylon', name: { en: 'Babylon', ar: 'بابل', ku: 'بابیلۆن' }, image: 'https://picsum.photos/seed/babylon/200' },
    { id: 'city-najaf', name: { en: 'Najaf', ar: 'النجف', ku: 'نەجەف' }, image: 'https://picsum.photos/seed/najaf/200' },
    { id: 'city-karbala', name: { en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' }, image: 'https://picsum.photos/seed/karbala/200' },
    { id: 'city-maysan', name: { en: 'Maysan', ar: 'ميسان', ku: 'میسان' }, image: 'https://picsum.photos/seed/maysan/200' },
    { id: 'city-dhi-qar', name: { en: 'Dhi Qar', ar: 'ذي قار', ku: 'زیقار' }, image: 'https://picsum.photos/seed/dhi-qar/200' },
    { id: 'city-muthanna', name: { en: 'Muthanna', ar: 'المثنى', ku: 'موسەننا' }, image: 'https://picsum.photos/seed/muthanna/200' },
    { id: 'city-qadisiyyah', name: { en: 'Qadisiyyah', ar: 'القادسية', ku: 'قادسیە' }, image: 'https://picsum.photos/seed/qadisiyyah/200' },
    { id: 'city-wasit', name: { en: 'Wasit', ar: 'واسط', ku: 'واست' }, image: 'https://picsum.photos/seed/wasit/200' },
    { id: 'city-diyala', name: { en: 'Diyala', ar: 'ديالى', ku: 'دیالە' }, image: 'https://picsum.photos/seed/diyala/200' },
    { id: 'city-samarra', name: { en: 'Samarra', ar: 'سامراء', ku: 'سامەڕا' }, image: 'https://picsum.photos/seed/samarra/200' },
    { id: 'city-al-kut', name: { en: 'Al-Kut', ar: 'الكوت', ku: 'کووت' }, image: 'https://picsum.photos/seed/al-kut/200' },
];

export const categories: Category[] = [
    { id: 'all', name: { en: 'All Events', ar: 'جميع الفعاليات', ku: 'هەموو ڕووداوەکان' }, image: 'https://picsum.photos/seed/all/200' },
    { id: 'cat-1', name: { en: 'Music', ar: 'موسيقى', ku: 'مۆسیقا' }, translation_key: 'music', icon: 'MusicIcon', image: 'https://picsum.photos/seed/music/200' },
    { id: 'cat-2', name: { en: 'Art & Culture', ar: 'فن وثقافة', ku: 'هونەر و کەلتور' }, translation_key: 'art_culture', icon: 'ArtIcon', image: 'https://picsum.photos/seed/art/200' },
    { id: 'cat-3', name: { en: 'Food & Drink', ar: 'طعام وشراب', ku: 'خواردن و خواردنەوە' }, translation_key: 'food_drink', icon: 'FoodIcon', image: 'https://picsum.photos/seed/food/200' },
    { id: 'cat-4', name: { en: 'Tech', ar: 'تكنولوجيا', ku: 'تەکنەلۆژیا' }, translation_key: 'tech', icon: 'TechIcon', image: 'https://picsum.photos/seed/tech/200' },
];

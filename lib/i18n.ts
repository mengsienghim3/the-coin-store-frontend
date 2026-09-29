export type Language = "en" | "km";

export interface Translations {
  // Navigation
  searchPlaceholder: string;
  navGames: string;
  navGiftCards: string;
  navHotDeals: string;
  navFaq: string;
  navSupport: string;
  navAdmin: string;

  // Catalog Section
  tabGames: string;
  tabGiftCards: string;
  instantBadge: string;
  digitalCodeBadge: string;
  officialBadge: string;
  fromPrice: string;
  reloadAction: string;
  buyAction: string;
  noGamesFound: string;
  noGiftCardsFound: string;
  searchEmptyHint: string;

  // Hero & Banners
  heroTag: string;
  heroLivePromo: string;

  // Modal / Checkout
  modalTitleTopup: string;
  modalTitleGiftCard: string;
  step1Game: string;
  step1GiftCard: string;
  playerIdLabel: string;
  playerIdPlaceholder: string;
  zoneIdLabel: string;
  zoneIdPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  step2SelectPackage: string;
  step3Payment: string;
  paymentKhqr: string;
  paymentAba: string;
  paymentCard: string;
  totalDue: string;
  checkoutActionGame: string;
  checkoutActionGiftCard: string;
  processing: string;
  successTitleGame: string;
  successTitleGiftCard: string;
  successDescGame: string;
  successDescGiftCard: string;
  closeBtn: string;

  // Footer
  footerDesc: string;
  securePayments: string;
  instantDelivery: string;
  support247: string;
  allRightsReserved: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    searchPlaceholder: "Search game diamonds, vouchers, gift cards...",
    navGames: "Games",
    navGiftCards: "Gift Cards",
    navHotDeals: "Hot Deals",
    navFaq: "FAQ",
    navSupport: "VIP Support 24/7",
    navAdmin: "Admin Hub",

    // Catalog Section
    tabGames: "Game Diamonds Top-Up",
    tabGiftCards: "Digital Gift Cards",
    instantBadge: "⚡ Instant",
    digitalCodeBadge: "🎁 Digital Code",
    officialBadge: "Official",
    fromPrice: "From",
    reloadAction: "Reload",
    buyAction: "Buy",
    noGamesFound: "No games found matching your search",
    noGiftCardsFound: "No gift cards found matching your search",
    searchEmptyHint: "Try searching with a different game or voucher title",

    // Hero & Banners
    heroTag: "Official Digital Marketplace",
    heroLivePromo: "Live Promotional Campaign",

    // Modal / Checkout
    modalTitleTopup: "Instant Account Reload",
    modalTitleGiftCard: "Digital Gift Card Purchase",
    step1Game: "1. Player Account Details",
    step1GiftCard: "1. Delivery Information",
    playerIdLabel: "Player ID (UID)",
    playerIdPlaceholder: "Enter your in-game Player ID",
    zoneIdLabel: "Zone ID / Server ID",
    zoneIdPlaceholder: "e.g. 1234",
    emailLabel: "Recipient Email Address",
    emailPlaceholder: "name@example.com (Voucher sent here)",
    step2SelectPackage: "2. Select Recharge Package",
    step3Payment: "3. Choose Payment Method",
    paymentKhqr: "Bakong KHQR (All Banks)",
    paymentAba: "ABA Pay Direct",
    paymentCard: "Credit / Debit Card",
    totalDue: "Total Payable",
    checkoutActionGame: "Confirm & Reload Diamonds",
    checkoutActionGiftCard: "Confirm & Buy Gift Card",
    processing: "Processing Order...",
    successTitleGame: "Top-Up Successful!",
    successTitleGiftCard: "Order Placed Successfully!",
    successDescGame:
      "Your diamonds have been dispatched to your game account instantly.",
    successDescGiftCard:
      "Your digital code voucher has been sent to your email.",
    closeBtn: "Done & Close",

    // Footer
    footerDesc:
      "Cambodia's premier gaming currency & digital gift cards reseller with lightning-fast delivery and secure payments.",
    securePayments: "Secure Local & Global Payments",
    instantDelivery: "Instant Automated Delivery",
    support247: "24/7 Dedicated Support",
    allRightsReserved: "All rights reserved.",
  },
  km: {
    // Navigation
    searchPlaceholder: "ស្វែងរកពេជ្រហ្គេម ប័ណ្ណទូទាត់ កាតកាដូឌីជីថល...",
    navGames: "ហ្គេមទាំងអស់",
    navGiftCards: "កាតកាដូ",
    navHotDeals: "ប្រូម៉ូសិនពិសេស",
    navFaq: "សំណួរញឹកញាប់",
    navSupport: "សេវាបម្រើ ២៤/៧",
    navAdmin: "ផ្ទាំងគ្រប់គ្រង",

    // Catalog Section
    tabGames: "បញ្ចូលពេជ្រហ្គេម",
    tabGiftCards: "កាតកាដូឌីជីថល",
    instantBadge: "⚡ ភ្លាមៗ",
    digitalCodeBadge: "🎁 កូដឌីជីថល",
    officialBadge: "ផ្លូវការ",
    fromPrice: "ចាប់ពី",
    reloadAction: "បញ្ចូល",
    buyAction: "ទិញ",
    noGamesFound: "មិនមានហ្គេមត្រូវនឹងការស្វែងរករបស់អ្នកទេ",
    noGiftCardsFound: "មិនមានកាតកាដូត្រូវនឹងការស្វែងរករបស់អ្នកទេ",
    searchEmptyHint: "សូមព្យាយាមស្វែងរកជាមួយឈ្មោះហ្គេម ឬប័ណ្ណទូទាត់ផ្សេងទៀត",

    // Hero & Banners
    heroTag: "ទីផ្សារទំនិញឌីជីថលផ្លូវការ",
    heroLivePromo: "យុទ្ធនាការប្រូម៉ូសិនពិសេស",

    // Modal / Checkout
    modalTitleTopup: "បញ្ចូលទឹកប្រាក់ភ្លាមៗ",
    modalTitleGiftCard: "ទិញកាតកាដូឌីជីថល",
    step1Game: "១. ព័ត៌មានគណនីហ្គេម",
    step1GiftCard: "១. ព័ត៌មានទទួលកូដ",
    playerIdLabel: "លេខសម្គាល់ Player ID (UID)",
    playerIdPlaceholder: "បញ្ចូលលេខសម្គាល់ Player ID របស់អ្នក",
    zoneIdLabel: "លេខតំបន់ Zone ID / Server",
    zoneIdPlaceholder: "ឧទាហរណ៍៖ 1234",
    emailLabel: "អ៊ីមែលសម្រាប់ទទួលកូដ",
    emailPlaceholder: "name@example.com (កូដនឹងផ្ញើទៅទីនេះ)",
    step2SelectPackage: "២. ជ្រើសរើសកញ្ចប់ពេជ្រ",
    step3Payment: "៣. ជ្រើសរើសវិធីសាស្ត្រទូទាត់",
    paymentKhqr: "បាគង KHQR (គ្រប់ធនាគារ)",
    paymentAba: "ABA Pay ផ្ទាល់",
    paymentCard: "កាតឥណទាន / ឥណពន្ធ",
    totalDue: "ទឹកប្រាក់សរុប",
    checkoutActionGame: "បញ្ជាក់ និងបញ្ចូលពេជ្រភ្លាមៗ",
    checkoutActionGiftCard: "បញ្ជាក់ និងទិញកាតកាដូ",
    processing: "កំពុងដំណើរការការកុម្ម៉ង់...",
    successTitleGame: "ការបញ្ចូលពេជ្របានជោគជ័យ!",
    successTitleGiftCard: "ការកុម្ម៉ង់ទទួលបានជោគជ័យ!",
    successDescGame: "ពេជ្ររបស់អ្នកត្រូវបានបញ្ចូលទៅក្នុងគណនីហ្គេមរួចរាល់ហើយ។",
    successDescGiftCard:
      "កូដឌីជីថលត្រូវបានផ្ញើជូនទៅកាន់អ៊ីមែលរបស់អ្នករួចរាល់ហើយ។",
    closeBtn: "រួចរាល់ និងបិទ",

    // Footer
    footerDesc:
      "ទីផ្សារទំនិញឌីជីថល និងពេជ្រហ្គេមឈានមុខគេនៅកម្ពុជា ជាមួយនឹងការផ្ទេរភ្លាមៗ និងសុវត្ថិភាពខ្ពស់។",
    securePayments: "ការទូទាត់មានសុវត្ថិភាព",
    instantDelivery: "ផ្ទេរទំនិញស្វ័យប្រវត្តភ្លាមៗ",
    support247: "សេវាបម្រើអតិថិជន ២៤/៧",
    allRightsReserved: "រក្សាសិទ្ធិគ្រប់យ៉ាង។",
  },
};

export function getDisplayName(
  item: { name: string; nameKh?: string | null } | null | undefined,
  lang: Language,
): string {
  if (!item) return "";
  if (lang === "km" && item.nameKh && item.nameKh.trim() !== "") {
    return item.nameKh.trim();
  }
  return item.name;
}

export function getDescription(
  item:
    | { description?: string | null; descriptionKh?: string | null }
    | null
    | undefined,
  lang: Language,
): string {
  if (!item) return "";
  if (lang === "km" && item.descriptionKh && item.descriptionKh.trim() !== "") {
    return item.descriptionKh.trim();
  }
  return item.description || "";
}

export function getBannerTitle(
  banner: { title: string; titleKh?: string | null } | null | undefined,
  lang: Language,
): string {
  if (!banner) return "";
  if (lang === "km" && banner.titleKh && banner.titleKh.trim() !== "") {
    return banner.titleKh.trim();
  }
  return banner.title;
}

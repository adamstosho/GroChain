export interface TranslationKeys {
  // Authentication
  welcome: string;
  login: string;
  register: string;
  logout: string;
  email: string;
  password: string;
  phone: string;
  forgot_password: string;
  reset_password: string;
  verify_email: string;
  
  // Common
  success: string;
  error: string;
  loading: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  view: string;
  create: string;
  update: string;
  
  // Navigation
  dashboard: string;
  harvest: string;
  marketplace: string;
  orders: string;
  payments: string;
  analytics: string;
  settings: string;
  profile: string;
  
  // Harvest
  harvest_logged: string;
  crop_type: string;
  quantity: string;
  date: string;
  location: string;
  batch_id: string;
  qr_code: string;
  
  // Marketplace
  product: string;
  price: string;
  seller: string;
  buy_now: string;
  add_to_cart: string;
  out_of_stock: string;
  
  // Orders
  order_placed: string;
  order_confirmed: string;
  order_shipped: string;
  order_delivered: string;
  order_cancelled: string;
  
  // Payments
  payment_successful: string;
  payment_failed: string;
  payment_pending: string;
  amount: string;
  currency: string;
  
  // Notifications
  notification: string;
  message: string;
  alert: string;
  info: string;
  warning: string;
  
  // Errors
  something_went_wrong: string;
  try_again: string;
  network_error: string;
  server_error: string;
  validation_error: string;
  
  // Success Messages
  data_saved: string;
  data_updated: string;
  data_deleted: string;
  operation_successful: string;
  
  // Form Validation
  required_field: string;
  invalid_email: string;
  password_too_short: string;
  phone_invalid: string;
  
  // Offline
  offline_mode: string;
  sync_pending: string;
  sync_completed: string;
  sync_failed: string;
  data_queued: string;
}

export class TranslationService {
  private static translations: Record<string, Partial<TranslationKeys>> = {
    en: {
      // Authentication
      welcome: "Welcome to GroChain",
      login: "Login",
      register: "Register",
      logout: "Logout",
      email: "Email",
      password: "Password",
      phone: "Phone",
      forgot_password: "Forgot Password",
      reset_password: "Reset Password",
      verify_email: "Verify Email",
      
      // Common
      success: "Success",
      error: "Error",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      create: "Create",
      update: "Update",
      
      // Navigation
      dashboard: "Dashboard",
      harvest: "Harvest",
      marketplace: "Marketplace",
      orders: "Orders",
      payments: "Payments",
      analytics: "Analytics",
      settings: "Settings",
      profile: "Profile",
      
      // Harvest
      harvest_logged: "Harvest Logged Successfully",
      crop_type: "Crop Type",
      quantity: "Quantity",
      date: "Date",
      location: "Location",
      batch_id: "Batch ID",
      qr_code: "QR Code",
      
      // Marketplace
      product: "Product",
      price: "Price",
      seller: "Seller",
      buy_now: "Buy Now",
      add_to_cart: "Add to Cart",
      out_of_stock: "Out of Stock",
      
      // Orders
      order_placed: "Order Placed",
      order_confirmed: "Order Confirmed",
      order_shipped: "Order Shipped",
      order_delivered: "Order Delivered",
      order_cancelled: "Order Cancelled",
      
      // Payments
      payment_successful: "Payment Successful",
      payment_failed: "Payment Failed",
      payment_pending: "Payment Pending",
      amount: "Amount",
      currency: "Currency",
      
      // Notifications
      notification: "Notification",
      message: "Message",
      alert: "Alert",
      info: "Information",
      warning: "Warning",
      
      // Errors
      something_went_wrong: "Something went wrong",
      try_again: "Please try again",
      network_error: "Network error",
      server_error: "Server error",
      validation_error: "Validation error",
      
      // Success Messages
      data_saved: "Data saved successfully",
      data_updated: "Data updated successfully",
      data_deleted: "Data deleted successfully",
      operation_successful: "Operation completed successfully",
      
      // Form Validation
      required_field: "This field is required",
      invalid_email: "Please enter a valid email",
      password_too_short: "Password must be at least 6 characters",
      phone_invalid: "Please enter a valid phone number",
      
      // Offline
      offline_mode: "Offline Mode",
      sync_pending: "Sync Pending",
      sync_completed: "Sync Completed",
      sync_failed: "Sync Failed",
      data_queued: "Data Queued for Sync"
    },
    
    yo: {
      // Authentication
      welcome: "Kaabo si GroChain",
      login: "Wo ile",
      register: "Forukọsilẹ",
      logout: "Jade",
      email: "Imẹli",
      password: "Ọrọ igbaniwọle",
      phone: "Foonu",
      forgot_password: "Gbagbe ọrọ igbaniwọle",
      reset_password: "Tun ọrọ igbaniwọle",
      verify_email: "Ṣe imẹli",
      
      // Common
      success: "Aṣeyọri",
      error: "Aṣiṣe",
      loading: "N ṣiṣẹ...",
      save: "Fi pamọ",
      cancel: "Fagilee",
      edit: "Ṣatunkọ",
      delete: "Pa",
      view: "Wo",
      create: "Dá",
      update: "Tunṣe",
      
      // Navigation
      dashboard: "Ibi iṣẹ",
      harvest: "Igbese",
      marketplace: "Oja",
      orders: "Àṣẹ",
      payments: "Ìsànwó",
      analytics: "Ìtọsọna",
      settings: "Ètò",
      profile: "Ìwé ìtàn",
      
      // Harvest
      harvest_logged: "A fi igbese si iwe",
      crop_type: "Iru ọkà",
      quantity: "Ìye",
      date: "Ọjọ",
      location: "Ibi",
      batch_id: "ID ìdíje",
      qr_code: "Koodu QR",
      
      // Marketplace
      product: "Ọjà",
      price: "Ọya",
      seller: "Olutaja",
      buy_now: "Ra bayi",
      add_to_cart: "Fi si kàtì",
      out_of_stock: "Kò sí nínú ìtura",
      
      // Orders
      order_placed: "A fi àṣẹ",
      order_confirmed: "A fọwọsi àṣẹ",
      order_shipped: "A fi àṣẹ ránṣẹ́",
      order_delivered: "A fi àṣẹ gbé",
      order_cancelled: "A fagilee àṣẹ",
      
      // Payments
      payment_successful: "Ìsànwó aṣeyọri",
      payment_failed: "Ìsànwó kùnà",
      payment_pending: "Ìsànwó n dẹ́rọ",
      amount: "Ìye",
      currency: "Owo",
      
      // Notifications
      notification: "Ìfọrọwérọ",
      message: "Ìfọrọwérọ",
      alert: "Ìkìlọ",
      info: "Ìmọ",
      warning: "Ìkìlọ",
      
      // Errors
      something_went_wrong: "Nkan kan ṣẹlẹ",
      try_again: "Gbiyanju lẹẹkan si",
      network_error: "Aṣiṣe nẹtiwọọki",
      server_error: "Aṣiṣe sẹẹfà",
      validation_error: "Aṣiṣe ìdánilójú",
      
      // Success Messages
      data_saved: "A fi data pamọ",
      data_updated: "A tunṣe data",
      data_deleted: "A pa data",
      operation_successful: "Iṣẹ aṣeyọri",
      
      // Form Validation
      required_field: "A nílò àyè yìí",
      invalid_email: "Jọ̀ọ́ fi imẹli tọ́",
      password_too_short: "Ọrọ igbaniwọle gbọdọ jẹ́ o kere ju 6 lọ",
      phone_invalid: "Jọ̀ọ́ fi nọmba foonu tọ́",
      
      // Offline
      offline_mode: "Ipo Offline",
      sync_pending: "Ìdapọ n dẹ́rọ",
      sync_completed: "Ìdapọ pari",
      sync_failed: "Ìdapọ kùnà",
      data_queued: "Data n dẹ́rọ fun ìdapọ"
    },
    
    ha: {
      // Authentication
      welcome: "Barka da zuwa GroChain",
      login: "Shiga",
      register: "Yin rajista",
      logout: "Fita",
      email: "Imel",
      password: "Kalmar sirri",
      phone: "Wayar hannu",
      forgot_password: "Manta kalmar sirri",
      reset_password: "Sake saita kalmar sirri",
      verify_email: "Tabbatar da imel",
      
      // Common
      success: "Nasara",
      error: "Kuskure",
      loading: "Ana yin aiki...",
      save: "Ajiye",
      cancel: "Soke",
      edit: "Gyara",
      delete: "Share",
      view: "Duba",
      create: "Ƙirƙiri",
      update: "Sabunta",
      
      // Navigation
      dashboard: "Dashboard",
      harvest: "Girbi",
      marketplace: "Kasuwa",
      orders: "Umarni",
      payments: "Biyan kuɗi",
      analytics: "Bincike",
      settings: "Saiti",
      profile: "Bayanin mutum",
      
      // Harvest
      harvest_logged: "An rubuta girbi da nasara",
      crop_type: "Nau'in amfanin gona",
      quantity: "Yawa",
      date: "Kwanan wata",
      location: "Wuri",
      batch_id: "ID na batch",
      qr_code: "Lambar QR",
      
      // Marketplace
      product: "Samfur",
      price: "Farashin",
      seller: "Mai sayarwa",
      buy_now: "Saya yanzu",
      add_to_cart: "Ƙara zuwa cart",
      out_of_stock: "Ba a samu ba",
      
      // Orders
      order_placed: "An sanya umarni",
      order_confirmed: "An tabbatar da umarni",
      order_shipped: "An aika umarni",
      order_delivered: "An isar da umarni",
      order_cancelled: "An soke umarni",
      
      // Payments
      payment_successful: "Biyan kuɗi ya yi nasara",
      payment_failed: "Biyan kuɗi ya gaza",
      payment_pending: "Biyan kuɗi yana jiran",
      amount: "Adadin",
      currency: "Kuɗi",
      
      // Notifications
      notification: "Sanarwa",
      message: "Saƙo",
      alert: "Faɗakarwa",
      info: "Bayanin",
      warning: "Gargadi",
      
      // Errors
      something_went_wrong: "Wani abu ya ɓace",
      try_again: "Ka sake gwadawa",
      network_error: "Kuskuren hanyar sadarwa",
      server_error: "Kuskuren server",
      validation_error: "Kuskuren tabbatarwa",
      
      // Success Messages
      data_saved: "An ajiye bayanai da nasara",
      data_updated: "An sabunta bayanai da nasara",
      data_deleted: "An share bayanai da nasara",
      operation_successful: "Aikin ya yi nasara",
      
      // Form Validation
      required_field: "Ana buƙatar wannan filin",
      invalid_email: "Ka shigar da imel mai inganci",
      password_too_short: "Kalmar sirri dole ta zama aƙalla haruffa 6",
      phone_invalid: "Ka shigar da lambar waya mai inganci",
      
      // Offline
      offline_mode: "Yanayin Offline",
      sync_pending: "Haɗin yana jiran",
      sync_completed: "Haɗin ya kammala",
      sync_failed: "Haɗin ya gaza",
      data_queued: "Bayanai suna jiran haɗin"
    },
    
    ig: {
      // Authentication
      welcome: "Nnọọ na GroChain",
      login: "Banye",
      register: "Debanye aha",
      logout: "Pụọ",
      email: "Email",
      password: "Okwuntughe",
      phone: "Ekwentị",
      forgot_password: "Chefu okwuntughe",
      reset_password: "Tọgharịa okwuntughe",
      verify_email: "Kwenye email",
      
      // Common
      success: "Ihe ịga nke ọma",
      error: "Njehie",
      loading: "Na-arụ ọrụ...",
      save: "Chekwaa",
      cancel: "Kagbuo",
      edit: "Dezie",
      delete: "Hichapụ",
      view: "Lelee",
      create: "Kepụta",
      update: "Melite",
      
      // Navigation
      dashboard: "Dashboard",
      harvest: "Iwe Ubi",
      marketplace: "Ahịa",
      orders: "Iwu",
      payments: "Ịkwụ ụgwọ",
      analytics: "Nchịkọta",
      settings: "Ntọala",
      profile: "Profaịlụ",
      
      // Harvest
      harvest_logged: "E dekọrọ iwe ubi nke ọma",
      crop_type: "Ụdị ihe ọkụkụ",
      quantity: "Ọnụ ọgụgụ",
      date: "Ụbọchị",
      location: "Ebe",
      batch_id: "ID nke batch",
      qr_code: "Koodu QR",
      
      // Marketplace
      product: "Ngwaahịa",
      price: "Ọnụ ahịa",
      seller: "Onye na-ere",
      buy_now: "Zụta ugbu a",
      add_to_cart: "Tinye na ụgbọ",
      out_of_stock: "Agwụla",
      
      // Orders
      order_placed: "E nyere iwu",
      order_confirmed: "E kwadoro iwu",
      order_shipped: "E zigara iwu",
      order_delivered: "E nyefere iwu",
      order_cancelled: "E kagburu iwu",
      
      // Payments
      payment_successful: "Ịkwụ ụgwọ gara nke ọma",
      payment_failed: "Ịkwụ ụgwọ dara",
      payment_pending: "Ịkwụ ụgwọ na-echere",
      amount: "Ọnụ ego",
      currency: "Ego",
      
      // Notifications
      notification: "Ọkwa",
      message: "Ozi",
      alert: "Ịdọ aka ná ntị",
      info: "Ozi",
      warning: "Ịdọ aka ná ntị",
      
      // Errors
      something_went_wrong: "Ihe ọjọọ mere",
      try_again: "Gbalịa ọzọ",
      network_error: "Njehie netwọk",
      server_error: "Njehie sava",
      validation_error: "Njehie nkwado",
      
      // Success Messages
      data_saved: "E chekwara data nke ọma",
      data_updated: "E melitere data nke ọma",
      data_deleted: "E hichapụrụ data nke ọma",
      operation_successful: "Ọrụ gara nke ọma",
      
      // Form Validation
      required_field: "Achọrọ ubi a",
      invalid_email: "Biko tinye email ziri ezi",
      password_too_short: "Okwuntughe ga-abụrịrị opekata mpe mkpụrụedemede 6",
      phone_invalid: "Biko tinye nọmba ekwentị ziri ezi",
      
      // Offline
      offline_mode: "Ọnọdụ Offline",
      sync_pending: "Mmekọrịta na-echere",
      sync_completed: "Mmekọrịta ezuola",
      sync_failed: "Mmekọrịta dara",
      data_queued: "Data na-echere mmekọrịta"
    }
  };

  /**
   * Get translation for a specific key and language
   * @param key - Translation key
   * @param language - Language code (en, yo, ha, ig)
   * @returns Translated string or fallback to English
   */
  static translate(key: keyof TranslationKeys, language: string = 'en'): string {
    const lang = this.translations[language] || this.translations.en;
    return lang[key] || this.translations.en[key] || key;
  }

  /**
   * Get all translations for a specific key
   * @param key - Translation key
   * @returns Object with all language translations
   */
  static getAllTranslations(key: keyof TranslationKeys): Record<string, string> {
    const result: Record<string, string> = {};
    Object.keys(this.translations).forEach(lang => {
      result[lang] = this.translate(key, lang);
    });
    return result;
  }

  /**
   * Get supported languages
   * @returns Array of supported language codes
   */
  static getSupportedLanguages(): string[] {
    return Object.keys(this.translations);
  }

  /**
   * Check if language is supported
   * @param language - Language code to check
   * @returns Boolean indicating if language is supported
   */
  static isLanguageSupported(language: string): boolean {
    return Object.keys(this.translations).includes(language);
  }

  /**
   * Get default language
   * @returns Default language code
   */
  static getDefaultLanguage(): string {
    return 'en';
  }
}

export type Language = 'en' | 'fr';

export interface TranslationKeys {
  // Common terms
  'common': {
    'dashboard': string;
    'login': string;
    'logout': string;
    'settings': string;
    'save': string;
    'cancel': string;
    'delete': string;
    'edit': string;
    'create': string;
    'search': string;
    'filter': string;
    'sort': string;
    'yes': string;
    'no': string;
    'ok': string;
    'close': string;
    'loading': string;
    'error': string;
    'success': string;
    'warning': string;
    'info': string;
    'notifications': string;
    'markAsRead': string;
    'noNewNotifications': string;
    'userProfile': string;
  },

  // Navigation
  'nav': {
    'dashboard': string;
    'sales': string;
    'inventory': string;
    'transactions': string;
    'reports': string;
    'users': string;
    'settings': string;
    'maintenance': string;
    'pumps': string;
    'tanks': string;
    'products': string;
    'customers': string;
    'profile': string;
  },

  // Dashboard
  'dashboard': {
    'title': string;
    'welcome': string;
    'activePumps': string;
    'fuelLevels': string;
    'dailySales': string;
    'transactions': string;
    'recentActivity': string;
    'quickActions': string;
    'viewReports': string;
    'manageInventory': string;
    'checkMaintenance': string;
    'manageUsers': string;
  },

  // Authentication
  'auth': {
    'loginTitle': string;
    'username': string;
    'password': string;
    'loginButton': string;
    'logoutButton': string;
    'accessDenied': string;
    'unauthorized': string;
  },

  // Gas Station specific
  'gasStation': {
    'pumps': string;
    'tanks': string;
    'fuelLevel': string;
    'product': string;
    'quantity': string;
    'price': string;
    'sales': string;
    'transactions': string;
    'userRole': string;
  }
}

// English translations
export const enTranslations: TranslationKeys = {
  common: {
    dashboard: 'Dashboard',
    login: 'Login',
    logout: 'Logout',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    notifications: 'Notifications',
    markAsRead: 'Mark as read',
    noNewNotifications: 'No new notifications',
    userProfile: 'User Profile',
  },

  nav: {
    dashboard: 'Dashboard',
    sales: 'Sales',
    inventory: 'Inventory',
    transactions: 'Transactions',
    reports: 'Reports',
    users: 'Users',
    settings: 'Settings',
    maintenance: 'Maintenance',
    pumps: 'Pumps',
    tanks: 'Tanks',
    products: 'Products',
    customers: 'Customers',
    profile: 'Profile',
  },

  dashboard: {
    title: 'Gas Station Dashboard',
    welcome: 'Welcome, {name}!',
    activePumps: 'Active Pumps',
    fuelLevels: 'Fuel Levels',
    dailySales: 'Daily Sales',
    transactions: 'Transactions',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    viewReports: 'View Reports',
    manageInventory: 'Manage Inventory',
    checkMaintenance: 'Check Maintenance',
    manageUsers: 'Manage Users',
  },

  auth: {
    loginTitle: 'Sign in to your account',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    logoutButton: 'Logout',
    accessDenied: 'Access Denied',
    unauthorized: 'Unauthorized',
  },

  gasStation: {
    pumps: 'Pumps',
    tanks: 'Tanks',
    fuelLevel: 'Fuel Level',
    product: 'Product',
    quantity: 'Quantity',
    price: 'Price',
    sales: 'Sales',
    transactions: 'Transactions',
    userRole: 'Gas Station Manager',
  }
};

// French translations
export const frTranslations: TranslationKeys = {
  common: {
    dashboard: 'Tableau de bord',
    login: 'Connexion',
    logout: 'Déconnexion',
    settings: 'Paramètres',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    yes: 'Oui',
    no: 'Non',
    ok: 'OK',
    close: 'Fermer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Info',
    notifications: 'Notifications',
    markAsRead: 'Marquer comme lu',
    noNewNotifications: 'Aucune nouvelle notification',
    userProfile: 'Profil utilisateur',
  },

  nav: {
    dashboard: 'Tableau de bord',
    sales: 'Ventes',
    inventory: 'Inventaire',
    transactions: 'Transactions',
    reports: 'Rapports',
    users: 'Utilisateurs',
    settings: 'Paramètres',
    maintenance: 'Maintenance',
    pumps: 'Pompes',
    tanks: 'Réservoirs',
    products: 'Produits',
    customers: 'Clients',
    profile: 'Profil',
  },

  dashboard: {
    title: 'Tableau de bord Station-Service',
    welcome: 'Bienvenue, {name} !',
    activePumps: 'Pompes Actives',
    fuelLevels: 'Niveaux de Carburant',
    dailySales: 'Ventes du Jour',
    transactions: 'Transactions',
    recentActivity: 'Activité Récente',
    quickActions: 'Actions Rapides',
    viewReports: 'Voir les Rapports',
    manageInventory: 'Gérer l\'Inventaire',
    checkMaintenance: 'Vérifier la Maintenance',
    manageUsers: 'Gérer les Utilisateurs',
  },

  auth: {
    loginTitle: 'Connectez-vous à votre compte',
    username: 'Identifiant',
    password: 'Mot de passe',
    loginButton: 'Connexion',
    logoutButton: 'Déconnexion',
    accessDenied: 'Accès Refusé',
    unauthorized: 'Non Autorisé',
  },

  gasStation: {
    pumps: 'Pompes',
    tanks: 'Réservoirs',
    fuelLevel: 'Niveau de Carburant',
    product: 'Produit',
    quantity: 'Quantité',
    price: 'Prix',
    sales: 'Ventes',
    transactions: 'Transactions',
    userRole: 'Gérant de Station-Service',
  }
};
export type Locale = 'en' | 'so';

export const translations = {
  en: {
    appTitle: 'Bakka Farm Operations',
    appSubtitle: 'Agricultural Management System',
    // Navigation
    navDashboard: 'Dashboard',
    navFields: 'Fields & Plots',
    navSeasons: 'Seasons',
    navCrops: 'Crops & Planting',
    navTasks: 'Tasks & Labor',
    navIrrigation: 'Irrigation',
    navInventory: 'Stock & Inputs',
    navHarvest: 'Harvest & Produce',
    navSales: 'Sales & Customers',
    navExpenses: 'Expenses',
    navReports: 'Reports',
    navStaff: 'Staff Management',
    navSettings: 'Farm Settings',
    logout: 'Log Out',

    // Roles
    roleAdmin: 'Farm Administrator',
    roleManager: 'Farm Manager',
    roleSupervisor: 'Field Supervisor',
    roleWorker: 'Farm Worker',
    roleStorekeeper: 'Storekeeper',
    roleAccountant: 'Accountant',

    // Dashboard Cards & Stats
    activeSeason: 'Active Season',
    activeFields: 'Active Fields',
    growingBatches: 'Growing Batches',
    tasksDueToday: 'Tasks Due Today',
    overdueTasks: 'Overdue Tasks',
    lowStockAlerts: 'Low Stock Alerts',
    totalSalesInvoiced: 'Total Sales Invoiced',
    totalCashCollected: 'Cash Collected',
    customerDebts: 'Customer Balances',
    totalExpenses: 'Total Farm Expenses',
    cashInHand: 'Cash & Bank Balance',
    syncConflicts: 'Sync Conflicts',

    // Actions
    addRecord: 'Add Record',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save Changes',
    confirm: 'Confirm Action',
    syncNow: 'Sync Now',
    exportCsv: 'Export CSV',
    searchPlaceholder: 'Search by name, code or reference...',

    // Sync States
    onlineState: 'Online & Synced',
    offlineState: 'Offline (Airplane Mode)',
    syncingState: 'Synchronizing...',
    pendingChanges: 'Pending Changes',
    conflictState: 'Sync Conflicts Need Attention',

    // Messages
    emptyTable: 'No records found for the current selection.',
    confirmDelete: 'Are you sure you want to delete this record? This action cannot be undone.',
    offlineNotice: 'All actions are securely saved locally to IndexedDB and will sync once connection returns.'
  },
  so: {
    appTitle: 'Nidaamka Maamulka Beerta Bakka',
    appSubtitle: 'Maareynta Howlaha Beeraha',
    // Navigation
    navDashboard: 'Xogta Guud (Dashboard)',
    navFields: 'Beeraha & Qeybaha',
    navSeasons: 'Xilliyada Beerashada',
    navCrops: 'Dalagyada & Beerista',
    navTasks: 'Shaqooyinka & Howlaha',
    navIrrigation: 'Waraabka Beeraha',
    navInventory: 'Keydka & Qalabka',
    navHarvest: 'Goosashada Dalagga',
    navSales: 'Iibka & Macaamiisha',
    navExpenses: 'Kharashaadka',
    navReports: 'Warbixinnada',
    navStaff: 'Maamulka Shaqaalaha',
    navSettings: 'Dejinta Beerta',
    logout: 'Ka Bax (Log Out)',

    // Roles
    roleAdmin: 'Maamulaha Guud ee Beerta',
    roleManager: 'Maareeyaha Beerta',
    roleSupervisor: 'Kormeeraha Beeraha',
    roleWorker: 'Shaqaalaha Beerta',
    roleStorekeeper: 'Khasnajiga Bakhaarka',
    roleAccountant: 'Xisaabiyaha Beerta',

    // Dashboard Cards & Stats
    activeSeason: 'Xilliga Hadda Socda',
    activeFields: 'Qeybaha Beeran',
    growingBatches: 'Dalagyada Baxaya',
    tasksDueToday: 'Shaqooyinka Maanta',
    overdueTasks: 'Shaqooyinka Dib u Dhacay',
    lowStockAlerts: 'Digniin: Alaab Dhamaanaysa',
    totalSalesInvoiced: 'Wadarta Iibka La Jaray',
    totalCashCollected: 'Lacagta Gacanta Soo Gashay',
    customerDebts: 'Deymaha Macaamiisha',
    totalExpenses: 'Wadarta Kharashaadka',
    cashInHand: 'Lacagta Keydka / Bangiga',
    syncConflicts: 'Is-khilaaf Is-waafajinta',

    // Actions
    addRecord: 'Ku dar Xog Cusub',
    edit: 'Wax ka beddel',
    delete: 'Tirtir',
    cancel: 'Ka noqo',
    save: 'Keydi Isbeddelka',
    confirm: 'Xaqiiji Talaabada',
    syncNow: 'Is-waafaji Hadda',
    exportCsv: 'U bixi CSV',
    searchPlaceholder: 'Raadi magac, sumad ama tixraac...',

    // Sync States
    onlineState: 'Khadka ayaa furan & Waafaqsan',
    offlineState: 'Khadka waa xiran yahay (Offline)',
    syncingState: 'Waxaa socda is-waafajin...',
    pendingChanges: 'Isbeddello Sugaya Gudbinta',
    conflictState: 'Is-khilaaf u baahan xallin',

    // Messages
    emptyTable: 'Wax xog ah laguma helin xilligan.',
    confirmDelete: 'Ma hubtaa inaad tirtirto xogtan? Talaabadan dib looma noqon karo.',
    offlineNotice: 'Dhammaan howlahu si nabad ah ayaa loogu keydiyaa aaladda, waxaana la gudbin doonaa marka khadku soo laabto.'
  }
};

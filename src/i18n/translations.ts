interface TranslationSet {
  nav: {
    dashboard: string;
    projects: string;
    materialsLibrary: string;
    templates: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    newProject: string;
    quickCalc: string;
  };
  dashboard: {
    workshopOverview: string;
    totalProjects: string;
    activeShop: string;
    avgBuildCost: string;
    laborHours: string;
    monthlyRev: string;
    monthlyBreakdown: string;
    recentProjects: string;
    performanceHighlights: string;
    shopFloorTasks: string;
  };
  projects: {
    projectName: string;
    status: string;
    totalCost: string;
    action: string;
    inspect: string;
    allCategories: string;
    allStatus: string;
    searchProjects: string;
  };
  calculator: {
    projectInfo: string;
    materialsList: string;
    sheetOptimization: string;
    laborEffort: string;
    adjustments: string;
    liveFinancialSummary: string;
    materials: string;
    laborCost: string;
    subtotal: string;
    markup: string;
    discount: string;
    finalPrice: string;
    saveProject: string;
    saveAsTemplate: string;
    printToPdf: string;
    hoursEstimated: string;
    hourlyRate: string;
    markupMultiplier: string;
    loyaltyDiscount: string;
    addFromLibrary: string;
    addComponent: string;
    buyerClient: string;
    projectType: string;
  };
  materials: {
    materialName: string;
    category: string;
    unit: string;
    basePrice: string;
    newMaterial: string;
    variants: string;
    addToProject: string;
  };
  status: {
    planning: string;
    inProgress: string;
    completed: string;
    onHold: string;
  };
  units: {
    meter: string;
    sheet: string;
    liter: string;
    piece: string;
    kg: string;
    m2: string;
  };
  projectTypes: {
    furniture: string;
    cabinet: string;
    shelf: string;
    table: string;
    custom: string;
  };
  auth: {
    welcomeBack: string;
    signInSubtitle: string;
    continueWithGoogle: string;
    secureLogin: string;
    precisionWorkshop: string;
    precisionSubtitle: string;
    loading: string;
  };
  shop: {
    createShop: string;
    joinShop: string;
    shopName: string;
    shopDescription: string;
    members: string;
    invitations: string;
    generateInvite: string;
    copyLink: string;
    revoke: string;
    role: string;
    manager: string;
    member: string;
    removeFromShop: string;
    makeManager: string;
    makeMember: string;
    switchShop: string;
    shopSettings: string;
    createNew: string;
  };
  onboarding: {
    welcome: string;
    createOrJoin: string;
    createDescription: string;
    joinDescription: string;
    enterInviteCode: string;
    inviteAccepted: string;
    invalidInvite: string;
    alreadyMember: string;
  };
  admin: {
    title: string;
    allShops: string;
    adminManagement: string;
    grantAdmin: string;
    revokeAdmin: string;
    accessDenied: string;
  };
}

interface Translations {
  en: TranslationSet;
  he: TranslationSet;
}

export const translations: Translations = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      projects: 'Projects',
      materialsLibrary: 'Materials Library',
      templates: 'Templates',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      newProject: 'New Project',
      quickCalc: 'Quick Calc',
    },
    dashboard: {
      workshopOverview: 'Workshop Overview',
      totalProjects: 'Total Projects',
      activeShop: 'Active Shop',
      avgBuildCost: 'Avg Build Cost',
      laborHours: 'Labor Hours',
      monthlyRev: 'Monthly Revenue',
      monthlyBreakdown: 'Monthly Breakdown',
      recentProjects: 'Recent Projects',
      performanceHighlights: 'Performance Highlights',
      shopFloorTasks: 'Shop Floor Tasks',
    },
    projects: {
      projectName: 'Project Name',
      status: 'Status',
      totalCost: 'Total Cost',
      action: 'Action',
      inspect: 'Inspect',
      allCategories: 'All Categories',
      allStatus: 'All Status',
      searchProjects: 'Search Projects',
    },
    calculator: {
      projectInfo: 'Project Info',
      materialsList: 'Materials List',
      sheetOptimization: 'Sheet Optimization',
      laborEffort: 'Labor & Effort',
      adjustments: 'Adjustments',
      liveFinancialSummary: 'Live Financial Summary',
      materials: 'Materials',
      laborCost: 'Labor Cost',
      subtotal: 'Subtotal',
      markup: 'Markup',
      discount: 'Discount',
      finalPrice: 'Final Price',
      saveProject: 'Save Project',
      saveAsTemplate: 'Save as Template',
      printToPdf: 'Print to PDF',
      hoursEstimated: 'Hours Estimated',
      hourlyRate: 'Hourly Rate',
      markupMultiplier: 'Markup Multiplier',
      loyaltyDiscount: 'Loyalty Discount',
      addFromLibrary: 'Add from Library',
      addComponent: 'Add Component',
      buyerClient: 'Buyer / Client',
      projectType: 'Project Type',
    },
    materials: {
      materialName: 'Material Name',
      category: 'Category',
      unit: 'Unit',
      basePrice: 'Base Price',
      newMaterial: 'New Material',
      variants: 'Variants',
      addToProject: 'Add to Project',
    },
    status: {
      planning: 'Planning',
      inProgress: 'In Progress',
      completed: 'Completed',
      onHold: 'On Hold',
    },
    units: {
      meter: 'Meter',
      sheet: 'Sheet',
      liter: 'Liter',
      piece: 'Piece',
      kg: 'Kg',
      m2: 'm\u00B2',
    },
    projectTypes: {
      furniture: 'Furniture',
      cabinet: 'Cabinet',
      shelf: 'Shelf',
      table: 'Table',
      custom: 'Custom',
    },
    auth: {
      welcomeBack: 'Welcome Back',
      signInSubtitle: 'Sign in to access your workshop',
      continueWithGoogle: 'Continue with Google',
      secureLogin: 'Secure login powered by Google',
      precisionWorkshop: 'THE PRECISION WORKSHOP',
      precisionSubtitle: 'Precision analytics for the modern craftsman.',
      loading: 'Loading...',
    },
    shop: {
      createShop: 'Create Workshop',
      joinShop: 'Join Workshop',
      shopName: 'Workshop Name',
      shopDescription: 'Description',
      members: 'Members',
      invitations: 'Invitations',
      generateInvite: 'Generate Invite Link',
      copyLink: 'Copy Link',
      revoke: 'Revoke',
      role: 'Role',
      manager: 'Manager',
      member: 'Member',
      removeFromShop: 'Remove from Workshop',
      makeManager: 'Make Manager',
      makeMember: 'Make Member',
      switchShop: 'Switch Workshop',
      shopSettings: 'Workshop Settings',
      createNew: 'Create New',
    },
    onboarding: {
      welcome: 'Welcome to the Workshop',
      createOrJoin: 'Create a new workshop or join an existing one',
      createDescription: 'Set up your own workshop and invite your team',
      joinDescription: 'Enter an invite code to join an existing workshop',
      enterInviteCode: 'Enter Invite Code',
      inviteAccepted: 'Invitation accepted successfully',
      invalidInvite: 'Invalid or expired invite code',
      alreadyMember: 'You are already a member of this workshop',
    },
    admin: {
      title: 'Admin Panel',
      allShops: 'All Workshops',
      adminManagement: 'Admin Management',
      grantAdmin: 'Grant Admin',
      revokeAdmin: 'Revoke Admin',
      accessDenied: 'Access denied. Admin privileges required.',
    },
  },
  he: {
    nav: {
      dashboard: '\u05DC\u05D5\u05D7 \u05D1\u05E7\u05E8\u05D4',
      projects: '\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD',
      materialsLibrary: '\u05E1\u05E4\u05E8\u05D9\u05D9\u05EA \u05D7\u05D5\u05DE\u05E8\u05D9\u05DD',
      templates: '\u05EA\u05D1\u05E0\u05D9\u05D5\u05EA',
    },
    common: {
      save: '\u05E9\u05DE\u05D9\u05E8\u05D4',
      cancel: '\u05D1\u05D9\u05D8\u05D5\u05DC',
      delete: '\u05DE\u05D7\u05D9\u05E7\u05D4',
      edit: '\u05E2\u05E8\u05D9\u05DB\u05D4',
      add: '\u05D4\u05D5\u05E1\u05E4\u05D4',
      search: '\u05D7\u05D9\u05E4\u05D5\u05E9',
      newProject: '\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8 \u05D7\u05D3\u05E9',
      quickCalc: '\u05D7\u05D9\u05E9\u05D5\u05D1 \u05DE\u05D4\u05D9\u05E8',
    },
    dashboard: {
      workshopOverview: '\u05E1\u05E7\u05D9\u05E8\u05EA \u05E1\u05D3\u05E0\u05D4',
      totalProjects: '\u05E1\u05DA \u05D4\u05DB\u05DC \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD',
      activeShop: '\u05E1\u05D3\u05E0\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4',
      avgBuildCost: '\u05E2\u05DC\u05D5\u05EA \u05D1\u05E0\u05D9\u05D9\u05D4 \u05DE\u05DE\u05D5\u05E6\u05E2\u05EA',
      laborHours: '\u05E9\u05E2\u05D5\u05EA \u05E2\u05D1\u05D5\u05D3\u05D4',
      monthlyRev: '\u05D4\u05DB\u05E0\u05E1\u05D4 \u05D7\u05D5\u05D3\u05E9\u05D9\u05EA',
      monthlyBreakdown: '\u05E4\u05D9\u05E8\u05D5\u05D8 \u05D7\u05D5\u05D3\u05E9\u05D9',
      recentProjects: '\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD \u05D0\u05D7\u05E8\u05D5\u05E0\u05D9\u05DD',
      performanceHighlights: '\u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05D1\u05D9\u05E6\u05D5\u05E2',
      shopFloorTasks: '\u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05D1\u05E1\u05D3\u05E0\u05D4',
    },
    projects: {
      projectName: '\u05E9\u05DD \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8',
      status: '\u05E1\u05D8\u05D8\u05D5\u05E1',
      totalCost: '\u05E2\u05DC\u05D5\u05EA \u05DB\u05D5\u05DC\u05DC\u05EA',
      action: '\u05E4\u05E2\u05D5\u05DC\u05D4',
      inspect: '\u05E6\u05E4\u05D9\u05D9\u05D4',
      allCategories: '\u05DB\u05DC \u05D4\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA',
      allStatus: '\u05DB\u05DC \u05D4\u05E1\u05D8\u05D8\u05D5\u05E1\u05D9\u05DD',
      searchProjects: '\u05D7\u05D9\u05E4\u05D5\u05E9 \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD',
    },
    calculator: {
      projectInfo: '\u05E4\u05E8\u05D8\u05D9 \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8',
      materialsList: '\u05E8\u05E9\u05D9\u05DE\u05EA \u05D7\u05D5\u05DE\u05E8\u05D9\u05DD',
      sheetOptimization: '\u05D0\u05D5\u05E4\u05D8\u05D9\u05DE\u05D9\u05D6\u05E6\u05D9\u05D4 \u05E9\u05DC \u05DC\u05D5\u05D7\u05D5\u05EA',
      laborEffort: '\u05E2\u05D1\u05D5\u05D3\u05D4 \u05D5\u05DE\u05D0\u05DE\u05E5',
      adjustments: '\u05D4\u05EA\u05D0\u05DE\u05D5\u05EA',
      liveFinancialSummary: '\u05E1\u05D9\u05DB\u05D5\u05DD \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9 \u05D7\u05D9',
      materials: '\u05D7\u05D5\u05DE\u05E8\u05D9\u05DD',
      laborCost: '\u05E2\u05DC\u05D5\u05EA \u05E2\u05D1\u05D5\u05D3\u05D4',
      subtotal: '\u05E1\u05DB\u05D5\u05DD \u05D1\u05D9\u05E0\u05D9\u05D9\u05DD',
      markup: '\u05DE\u05E8\u05D5\u05D5\u05D7',
      discount: '\u05D4\u05E0\u05D7\u05D4',
      finalPrice: '\u05DE\u05D7\u05D9\u05E8 \u05E1\u05D5\u05E4\u05D9',
      saveProject: '\u05E9\u05DE\u05D9\u05E8\u05EA \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8',
      saveAsTemplate: '\u05E9\u05DE\u05D9\u05E8\u05D4 \u05DB\u05EA\u05D1\u05E0\u05D9\u05EA',
      printToPdf: '\u05D4\u05D3\u05E4\u05E1\u05D4 \u05DC-PDF',
      hoursEstimated: '\u05E9\u05E2\u05D5\u05EA \u05DE\u05E9\u05D5\u05E2\u05E8\u05D5\u05EA',
      hourlyRate: '\u05EA\u05E2\u05E8\u05D9\u05E3 \u05DC\u05E9\u05E2\u05D4',
      markupMultiplier: '\u05DE\u05DB\u05E4\u05D9\u05DC \u05DE\u05E8\u05D5\u05D5\u05D7',
      loyaltyDiscount: '\u05D4\u05E0\u05D7\u05EA \u05E0\u05D0\u05DE\u05E0\u05D5\u05EA',
      addFromLibrary: '\u05D4\u05D5\u05E1\u05E4\u05D4 \u05DE\u05D4\u05E1\u05E4\u05E8\u05D9\u05D9\u05D4',
      addComponent: '\u05D4\u05D5\u05E1\u05E4\u05EA \u05E8\u05DB\u05D9\u05D1',
      buyerClient: '\u05E7\u05D5\u05E0\u05D4 / \u05DC\u05E7\u05D5\u05D7',
      projectType: '\u05E1\u05D5\u05D2 \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8',
    },
    materials: {
      materialName: '\u05E9\u05DD \u05D7\u05D5\u05DE\u05E8',
      category: '\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4',
      unit: '\u05D9\u05D7\u05D9\u05D3\u05D4',
      basePrice: '\u05DE\u05D7\u05D9\u05E8 \u05D1\u05E1\u05D9\u05E1',
      newMaterial: '\u05D7\u05D5\u05DE\u05E8 \u05D7\u05D3\u05E9',
      variants: '\u05D2\u05E8\u05E1\u05D0\u05D5\u05EA',
      addToProject: '\u05D4\u05D5\u05E1\u05E4\u05D4 \u05DC\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8',
    },
    status: {
      planning: '\u05D1\u05EA\u05DB\u05E0\u05D5\u05DF',
      inProgress: '\u05D1\u05D1\u05D9\u05E6\u05D5\u05E2',
      completed: '\u05D4\u05D5\u05E9\u05DC\u05DD',
      onHold: '\u05D1\u05D4\u05DE\u05EA\u05E0\u05D4',
    },
    units: {
      meter: '\u05DE\u05D8\u05E8',
      sheet: '\u05DC\u05D5\u05D7',
      liter: '\u05DC\u05D9\u05D8\u05E8',
      piece: '\u05D9\u05D7\u05D9\u05D3\u05D4',
      kg: '\u05E7\u05F4\u05D2',
      m2: '\u05DE\u05F4\u05E8',
    },
    projectTypes: {
      furniture: '\u05E8\u05D4\u05D9\u05D8',
      cabinet: '\u05D0\u05E8\u05D5\u05DF',
      shelf: '\u05DE\u05D3\u05E3',
      table: '\u05E9\u05D5\u05DC\u05D7\u05DF',
      custom: '\u05DE\u05D5\u05EA\u05D0\u05DD \u05D0\u05D9\u05E9\u05D9\u05EA',
    },
    auth: {
      welcomeBack: '\u05D1\u05E8\u05D5\u05DA \u05D4\u05D1\u05D0',
      signInSubtitle: '\u05D4\u05EA\u05D7\u05D1\u05E8 \u05DC\u05D2\u05E9\u05EA \u05DC\u05E1\u05D3\u05E0\u05D4 \u05E9\u05DC\u05DA',
      continueWithGoogle: '\u05D4\u05DE\u05E9\u05DA \u05E2\u05DD Google',
      secureLogin: '\u05D4\u05EA\u05D7\u05D1\u05E8\u05D5\u05EA \u05DE\u05D0\u05D5\u05D1\u05D8\u05D7\u05EA \u05D1\u05D0\u05DE\u05E6\u05E2\u05D5\u05EA Google',
      precisionWorkshop: '\u05E1\u05D3\u05E0\u05EA \u05D4\u05D3\u05D9\u05D5\u05E7',
      precisionSubtitle: '\u05D0\u05E0\u05DC\u05D9\u05D8\u05D9\u05E7\u05D4 \u05DE\u05D3\u05D5\u05D9\u05E7\u05EA \u05DC\u05D0\u05D5\u05DE\u05DF \u05D4\u05DE\u05D5\u05D3\u05E8\u05E0\u05D9.',
      loading: '\u05D8\u05D5\u05E2\u05DF...',
    },
    shop: {
      createShop: '\u05D9\u05E6\u05D9\u05E8\u05EA \u05E1\u05D3\u05E0\u05D4',
      joinShop: '\u05D4\u05E6\u05D8\u05E8\u05E4\u05D5\u05EA \u05DC\u05E1\u05D3\u05E0\u05D4',
      shopName: '\u05E9\u05DD \u05D4\u05E1\u05D3\u05E0\u05D4',
      shopDescription: '\u05EA\u05D9\u05D0\u05D5\u05E8',
      members: '\u05D7\u05D1\u05E8\u05D9\u05DD',
      invitations: '\u05D4\u05D6\u05DE\u05E0\u05D5\u05EA',
      generateInvite: '\u05D9\u05E6\u05D9\u05E8\u05EA \u05E7\u05D9\u05E9\u05D5\u05E8 \u05D4\u05D6\u05DE\u05E0\u05D4',
      copyLink: '\u05D4\u05E2\u05EA\u05E7\u05EA \u05E7\u05D9\u05E9\u05D5\u05E8',
      revoke: '\u05D1\u05D9\u05D8\u05D5\u05DC',
      role: '\u05EA\u05E4\u05E7\u05D9\u05D3',
      manager: '\u05DE\u05E0\u05D4\u05DC',
      member: '\u05D7\u05D1\u05E8',
      removeFromShop: '\u05D4\u05E1\u05E8\u05D4 \u05DE\u05D4\u05E1\u05D3\u05E0\u05D4',
      makeManager: '\u05DE\u05D9\u05E0\u05D5\u05D9 \u05DC\u05DE\u05E0\u05D4\u05DC',
      makeMember: '\u05DE\u05D9\u05E0\u05D5\u05D9 \u05DC\u05D7\u05D1\u05E8',
      switchShop: '\u05D4\u05D7\u05DC\u05E4\u05EA \u05E1\u05D3\u05E0\u05D4',
      shopSettings: '\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05E1\u05D3\u05E0\u05D4',
      createNew: '\u05D9\u05E6\u05D9\u05E8\u05D4 \u05D7\u05D3\u05E9\u05D4',
    },
    onboarding: {
      welcome: '\u05D1\u05E8\u05D5\u05DB\u05D9\u05DD \u05D4\u05D1\u05D0\u05D9\u05DD \u05DC\u05E1\u05D3\u05E0\u05D4',
      createOrJoin: '\u05E6\u05E8\u05D5 \u05E1\u05D3\u05E0\u05D4 \u05D7\u05D3\u05E9\u05D4 \u05D0\u05D5 \u05D4\u05E6\u05D8\u05E8\u05E4\u05D5 \u05DC\u05E1\u05D3\u05E0\u05D4 \u05E7\u05D9\u05D9\u05DE\u05EA',
      createDescription: '\u05D4\u05E7\u05D9\u05DE\u05D5 \u05E1\u05D3\u05E0\u05D4 \u05DE\u05E9\u05DC\u05DB\u05DD \u05D5\u05D4\u05D6\u05DE\u05D9\u05E0\u05D5 \u05D0\u05EA \u05D4\u05E6\u05D5\u05D5\u05EA',
      joinDescription: '\u05D4\u05D6\u05D9\u05E0\u05D5 \u05E7\u05D5\u05D3 \u05D4\u05D6\u05DE\u05E0\u05D4 \u05DC\u05D4\u05E6\u05D8\u05E8\u05E4\u05D5\u05EA \u05DC\u05E1\u05D3\u05E0\u05D4 \u05E7\u05D9\u05D9\u05DE\u05EA',
      enterInviteCode: '\u05D4\u05D6\u05D9\u05E0\u05D5 \u05E7\u05D5\u05D3 \u05D4\u05D6\u05DE\u05E0\u05D4',
      inviteAccepted: '\u05D4\u05D4\u05D6\u05DE\u05E0\u05D4 \u05D4\u05EA\u05E7\u05D1\u05DC\u05D4 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4',
      invalidInvite: '\u05E7\u05D5\u05D3 \u05D4\u05D6\u05DE\u05E0\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D0\u05D5 \u05E4\u05D2 \u05EA\u05D5\u05E7\u05E3',
      alreadyMember: '\u05D0\u05EA\u05DD \u05DB\u05D1\u05E8 \u05D7\u05D1\u05E8\u05D9\u05DD \u05D1\u05E1\u05D3\u05E0\u05D4 \u05D6\u05D5',
    },
    admin: {
      title: '\u05E4\u05D0\u05E0\u05DC \u05E0\u05D9\u05D4\u05D5\u05DC',
      allShops: '\u05DB\u05DC \u05D4\u05E1\u05D3\u05E0\u05D0\u05D5\u05EA',
      adminManagement: '\u05E0\u05D9\u05D4\u05D5\u05DC \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD',
      grantAdmin: '\u05D4\u05E2\u05E0\u05E7\u05EA \u05D4\u05E8\u05E9\u05D0\u05D5\u05EA \u05DE\u05E0\u05D4\u05DC',
      revokeAdmin: '\u05D1\u05D9\u05D8\u05D5\u05DC \u05D4\u05E8\u05E9\u05D0\u05D5\u05EA \u05DE\u05E0\u05D4\u05DC',
      accessDenied: '\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4. \u05E0\u05D3\u05E8\u05E9\u05D5\u05EA \u05D4\u05E8\u05E9\u05D0\u05D5\u05EA \u05DE\u05E0\u05D4\u05DC.',
    },
  },
};

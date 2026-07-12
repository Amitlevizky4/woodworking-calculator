interface TranslationSet {
  nav: {
    dashboard: string;
    projects: string;
    materialsLibrary: string;
    templates: string;
    expenses: string;
    settings: string;
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
    targetHourlyRate: string;
    meetsTarget: string;
    belowTarget: string;
  };
  expenses: {
    title: string;
    addExpense: string;
    editExpense: string;
    date: string;
    amount: string;
    category: string;
    supplier: string;
    description: string;
    linkedProject: string;
    noProject: string;
    recurringRules: string;
    addRecurring: string;
    dayOfMonth: string;
    active: string;
    inactive: string;
    pendingRecurring: string;
    generateNow: string;
    exportCsv: string;
    month: string;
    allMonths: string;
    allCategories: string;
    noExpenses: string;
    total: string;
  };
  expenseCategory: {
    workshop_rent: string;
    materials: string;
    consumables: string;
    tools: string;
    insurance: string;
    marketing: string;
    transport: string;
    fees: string;
    other: string;
  };
  leadSource: {
    instagram: string;
    facebook_group: string;
    marketplace: string;
    word_of_mouth: string;
    designer: string;
    friends_family: string;
    other: string;
  };
  income: {
    payments: string;
    quotedPrice: string;
    agreedPrice: string;
    depositAmount: string;
    depositPaid: string;
    balancePaid: string;
    delivered: string;
    actualHours: string;
    leadSource: string;
    notSet: string;
  };
  pnl: {
    title: string;
    revenue: string;
    expenses: string;
    fixed: string;
    variable: string;
    netProfit: string;
    profitTarget: string;
    ceilingTitle: string;
    ceilingSubtitle: string;
    ceilingWarning: string;
    ceilingExceeded: string;
    trend: string;
    effectiveRate: string;
    profitByType: string;
    count: string;
    avgPrice: string;
    avgRate: string;
    totalProfit: string;
  };
  settings: {
    title: string;
    subtitle: string;
    monthlyProfitTarget: string;
    vatExemptCeiling: string;
    targetHourlyRate: string;
    weeklyHoursBudget: string;
    saved: string;
  };
  materials: {
    materialName: string;
    category: string;
    unit: string;
    basePrice: string;
    newMaterial: string;
    variants: string;
    variantLabel: string;
    addToProject: string;
  };
  status: {
    lead: string;
    quoted: string;
    depositPaid: string;
    inProduction: string;
    ready: string;
    delivered: string;
    closed: string;
    onHold: string;
  };
  pipeline: {
    title: string;
    onHold: string;
    markOnHold: string;
    resume: string;
    empty: string;
    quote: string;
  };
  productTypes2: {
    title: string;
    newType: string;
    name: string;
    assignHint: string;
    none: string;
  };
  reports: {
    title: string;
    quarter: string;
    allTime: string;
    productProfitability: string;
    leadSourceRoi: string;
    channelRoi: string;
    spend: string;
    revenue: string;
    net: string;
    projects: string;
    noData: string;
  };
  timeLog: {
    title: string;
    addEntry: string;
    hours: string;
    note: string;
    totalLogged: string;
    empty: string;
  };
  quote: {
    title: string;
    preparedFor: string;
    date: string;
    item: string;
    total: string;
    depositDue: string;
    balanceDue: string;
    estDelivery: string;
    terms: string;
    termsText: string;
    print: string;
  };
  capacity: {
    title: string;
    earliestStart: string;
    backlog: string;
    availableNow: string;
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
      expenses: 'Expenses',
      settings: 'Settings',
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
      targetHourlyRate: 'Target Hourly Rate',
      meetsTarget: 'Meets target rate',
      belowTarget: 'Below target rate',
    },
    expenses: {
      title: 'Expenses',
      addExpense: 'Add Expense',
      editExpense: 'Edit Expense',
      date: 'Date',
      amount: 'Amount',
      category: 'Category',
      supplier: 'Supplier',
      description: 'Description',
      linkedProject: 'Linked Project',
      noProject: 'No project',
      recurringRules: 'Recurring Expenses',
      addRecurring: 'Add Recurring',
      dayOfMonth: 'Day of Month',
      active: 'Active',
      inactive: 'Inactive',
      pendingRecurring: 'recurring expense(s) due',
      generateNow: 'Generate now',
      exportCsv: 'Export CSV',
      month: 'Month',
      allMonths: 'All Months',
      allCategories: 'All Categories',
      noExpenses: 'No expenses recorded',
      total: 'Total',
    },
    expenseCategory: {
      workshop_rent: 'Workshop Rent',
      materials: 'Materials',
      consumables: 'Consumables',
      tools: 'Tools',
      insurance: 'Insurance',
      marketing: 'Marketing',
      transport: 'Transport',
      fees: 'Fees',
      other: 'Other',
    },
    leadSource: {
      instagram: 'Instagram',
      facebook_group: 'Facebook Group',
      marketplace: 'Marketplace',
      word_of_mouth: 'Word of Mouth',
      designer: 'Designer Referral',
      friends_family: 'Friends & Family',
      other: 'Other',
    },
    income: {
      payments: 'Payments & Delivery',
      quotedPrice: 'Quoted Price',
      agreedPrice: 'Agreed Price',
      depositAmount: 'Deposit',
      depositPaid: 'Deposit Paid',
      balancePaid: 'Balance Paid',
      delivered: 'Delivered',
      actualHours: 'Actual Hours',
      leadSource: 'Lead Source',
      notSet: 'Not set',
    },
    pnl: {
      title: 'Monthly P&L',
      revenue: 'Revenue Received',
      expenses: 'Expenses',
      fixed: 'Fixed',
      variable: 'Variable',
      netProfit: 'Net Profit',
      profitTarget: 'Profit Target',
      ceilingTitle: 'Osek Patur Ceiling',
      ceilingSubtitle: 'Trailing 12 months',
      ceilingWarning: 'Approaching ceiling — plan for Osek Murshe',
      ceilingExceeded: 'Ceiling exceeded — switch to Osek Murshe',
      trend: '6-Month Trend',
      effectiveRate: 'Effective ₪/hr',
      profitByType: 'Profitability by Type',
      count: 'Sold',
      avgPrice: 'Avg Price',
      avgRate: 'Avg ₪/hr',
      totalProfit: 'Total Profit',
    },
    settings: {
      title: 'Business Settings',
      subtitle: 'Targets that drive your dashboard',
      monthlyProfitTarget: 'Monthly Profit Target',
      vatExemptCeiling: 'Osek Patur Annual Ceiling',
      targetHourlyRate: 'Target Hourly Rate',
      weeklyHoursBudget: 'Weekly Production Hours',
      saved: 'Settings saved',
    },
    materials: {
      materialName: 'Material Name',
      category: 'Category',
      unit: 'Unit',
      basePrice: 'Base Price',
      newMaterial: 'New Material',
      variants: 'Variants',
      variantLabel: 'Label',
      addToProject: 'Add to Project',
    },
    status: {
      lead: 'Lead',
      quoted: 'Quoted',
      depositPaid: 'Deposit Paid',
      inProduction: 'In Production',
      ready: 'Ready',
      delivered: 'Delivered',
      closed: 'Closed',
      onHold: 'On Hold',
    },
    pipeline: {
      title: 'Pipeline',
      onHold: 'On Hold',
      markOnHold: 'Put on hold',
      resume: 'Resume',
      empty: 'Nothing here',
      quote: 'Quote',
    },
    productTypes2: {
      title: 'Product Types',
      newType: 'New Type',
      name: 'Name',
      assignHint: 'Assign types to projects to unlock profitability by product.',
      none: 'None',
    },
    reports: {
      title: 'Reports',
      quarter: 'Quarter',
      allTime: 'All Time',
      productProfitability: 'Profitability by Product Type',
      leadSourceRoi: 'Lead Source ROI',
      channelRoi: 'Marketing Channel ROI',
      spend: 'Spend',
      revenue: 'Revenue',
      net: 'Net',
      projects: 'Projects',
      noData: 'No data for this period',
    },
    timeLog: {
      title: 'Time Log',
      addEntry: 'Add Entry',
      hours: 'Hours',
      note: 'Note',
      totalLogged: 'Total Logged',
      empty: 'No hours logged yet',
    },
    quote: {
      title: 'Quote',
      preparedFor: 'Prepared for',
      date: 'Date',
      item: 'Item',
      total: 'Total',
      depositDue: '50% Deposit Due',
      balanceDue: 'Balance on Delivery',
      estDelivery: 'Estimated Delivery',
      terms: 'Terms',
      termsText:
        'A 50% deposit confirms your order. The balance is due on delivery. Lead times are estimates and may vary with material availability.',
      print: 'Print / Save PDF',
    },
    capacity: {
      title: 'Capacity',
      earliestStart: 'Earliest realistic start',
      backlog: 'Committed backlog',
      availableNow: 'Available now',
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
      expenses: '\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA',
      settings: '\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA',
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
      targetHourlyRate: '\u05EA\u05E2\u05E8\u05D9\u05E3 \u05E9\u05E2\u05D4 \u05D9\u05E2\u05D3',
      meetsTarget: '\u05E2\u05D5\u05DE\u05D3 \u05D1\u05EA\u05E2\u05E8\u05D9\u05E3 \u05D4\u05D9\u05E2\u05D3',
      belowTarget: '\u05DE\u05EA\u05D7\u05EA \u05DC\u05EA\u05E2\u05E8\u05D9\u05E3 \u05D4\u05D9\u05E2\u05D3',
    },
    expenses: {
      title: '\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA',
      addExpense: '\u05D4\u05D5\u05E1\u05E4\u05EA \u05D4\u05D5\u05E6\u05D0\u05D4',
      editExpense: '\u05E2\u05E8\u05D9\u05DB\u05EA \u05D4\u05D5\u05E6\u05D0\u05D4',
      date: '\u05EA\u05D0\u05E8\u05D9\u05DA',
      amount: '\u05E1\u05DB\u05D5\u05DD',
      category: '\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4',
      supplier: '\u05E1\u05E4\u05E7',
      description: '\u05EA\u05D9\u05D0\u05D5\u05E8',
      linkedProject: '\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8 \u05DE\u05E7\u05D5\u05E9\u05E8',
      noProject: '\u05DC\u05DC\u05D0 \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8',
      recurringRules: '\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05E7\u05D1\u05D5\u05E2\u05D5\u05EA',
      addRecurring: '\u05D4\u05D5\u05E1\u05E4\u05EA \u05D4\u05D5\u05E6\u05D0\u05D4 \u05E7\u05D1\u05D5\u05E2\u05D4',
      dayOfMonth: '\u05D9\u05D5\u05DD \u05D1\u05D7\u05D5\u05D3\u05E9',
      active: '\u05E4\u05E2\u05D9\u05DC',
      inactive: '\u05DC\u05D0 \u05E4\u05E2\u05D9\u05DC',
      pendingRecurring: '\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05E7\u05D1\u05D5\u05E2\u05D5\u05EA \u05DC\u05D7\u05D9\u05D5\u05D1',
      generateNow: '\u05E6\u05D5\u05E8 \u05E2\u05DB\u05E9\u05D9\u05D5',
      exportCsv: '\u05D9\u05D9\u05E6\u05D5\u05D0 CSV',
      month: '\u05D7\u05D5\u05D3\u05E9',
      allMonths: '\u05DB\u05DC \u05D4\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD',
      allCategories: '\u05DB\u05DC \u05D4\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA',
      noExpenses: '\u05DC\u05D0 \u05E0\u05E8\u05E9\u05DE\u05D5 \u05D4\u05D5\u05E6\u05D0\u05D5\u05EA',
      total: '\u05E1\u05DA \u05D4\u05DB\u05DC',
    },
    expenseCategory: {
      workshop_rent: '\u05E9\u05DB\u05D9\u05E8\u05D5\u05EA \u05E1\u05D3\u05E0\u05D4',
      materials: '\u05D7\u05D5\u05DE\u05E8\u05D9\u05DD',
      consumables: '\u05DE\u05EA\u05DB\u05DC\u05D9\u05DD',
      tools: '\u05DB\u05DC\u05D9\u05DD',
      insurance: '\u05D1\u05D9\u05D8\u05D5\u05D7',
      marketing: '\u05E9\u05D9\u05D5\u05D5\u05E7',
      transport: '\u05D4\u05D5\u05D1\u05DC\u05D4',
      fees: '\u05E2\u05DE\u05DC\u05D5\u05EA',
      other: '\u05D0\u05D7\u05E8',
    },
    leadSource: {
      instagram: '\u05D0\u05D9\u05E0\u05E1\u05D8\u05D2\u05E8\u05DD',
      facebook_group: '\u05E7\u05D1\u05D5\u05E6\u05EA \u05E4\u05D9\u05D9\u05E1\u05D1\u05D5\u05E7',
      marketplace: '\u05DE\u05E8\u05E7\u05D8\u05E4\u05DC\u05D9\u05D9\u05E1',
      word_of_mouth: '\u05DE\u05E4\u05D4 \u05DC\u05D0\u05D5\u05D6\u05DF',
      designer: '\u05D4\u05DE\u05DC\u05E6\u05EA \u05DE\u05E2\u05E6\u05D1',
      friends_family: '\u05D7\u05D1\u05E8\u05D9\u05DD \u05D5\u05DE\u05E9\u05E4\u05D7\u05D4',
      other: '\u05D0\u05D7\u05E8',
    },
    income: {
      payments: '\u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD \u05D5\u05DE\u05E1\u05D9\u05E8\u05D4',
      quotedPrice: '\u05DE\u05D7\u05D9\u05E8 \u05D4\u05E6\u05E2\u05D4',
      agreedPrice: '\u05DE\u05D7\u05D9\u05E8 \u05E1\u05D5\u05E4\u05D9',
      depositAmount: '\u05DE\u05E7\u05D3\u05DE\u05D4',
      depositPaid: '\u05DE\u05E7\u05D3\u05DE\u05D4 \u05E9\u05D5\u05DC\u05DE\u05D4',
      balancePaid: '\u05D9\u05EA\u05E8\u05D4 \u05E9\u05D5\u05DC\u05DE\u05D4',
      delivered: '\u05E0\u05DE\u05E1\u05E8',
      actualHours: '\u05E9\u05E2\u05D5\u05EA \u05D1\u05E4\u05D5\u05E2\u05DC',
      leadSource: '\u05DE\u05E7\u05D5\u05E8 \u05D4\u05E4\u05E0\u05D9\u05D4',
      notSet: '\u05DC\u05D0 \u05D4\u05D5\u05D2\u05D3\u05E8',
    },
    pnl: {
      title: '\u05E8\u05D5\u05D5\u05D7 \u05D5\u05D4\u05E4\u05E1\u05D3 \u05D7\u05D5\u05D3\u05E9\u05D9',
      revenue: '\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA \u05E9\u05D4\u05EA\u05E7\u05D1\u05DC\u05D5',
      expenses: '\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA',
      fixed: '\u05E7\u05D1\u05D5\u05E2\u05D5\u05EA',
      variable: '\u05DE\u05E9\u05EA\u05E0\u05D5\u05EA',
      netProfit: '\u05E8\u05D5\u05D5\u05D7 \u05E0\u05E7\u05D9',
      profitTarget: '\u05D9\u05E2\u05D3 \u05E8\u05D5\u05D5\u05D7',
      ceilingTitle: '\u05EA\u05E7\u05E8\u05EA \u05E2\u05D5\u05E1\u05E7 \u05E4\u05D8\u05D5\u05E8',
      ceilingSubtitle: '12 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD \u05D0\u05D7\u05E8\u05D5\u05E0\u05D9\u05DD',
      ceilingWarning: '\u05DE\u05EA\u05E7\u05E8\u05D1 \u05DC\u05EA\u05E7\u05E8\u05D4 \u2014 \u05D4\u05D9\u05E2\u05E8\u05DA \u05DC\u05DE\u05E2\u05D1\u05E8 \u05DC\u05E2\u05D5\u05E1\u05E7 \u05DE\u05D5\u05E8\u05E9\u05D4',
      ceilingExceeded: '\u05D7\u05E8\u05D9\u05D2\u05D4 \u05DE\u05D4\u05EA\u05E7\u05E8\u05D4 \u2014 \u05D9\u05E9 \u05DC\u05E2\u05D1\u05D5\u05E8 \u05DC\u05E2\u05D5\u05E1\u05E7 \u05DE\u05D5\u05E8\u05E9\u05D4',
      trend: '\u05DE\u05D2\u05DE\u05EA 6 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD',
      effectiveRate: '\u20AA \u05DC\u05E9\u05E2\u05D4 \u05D1\u05E4\u05D5\u05E2\u05DC',
      profitByType: '\u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA \u05DC\u05E4\u05D9 \u05E1\u05D5\u05D2',
      count: '\u05E0\u05DE\u05DB\u05E8\u05D5',
      avgPrice: '\u05DE\u05D7\u05D9\u05E8 \u05DE\u05DE\u05D5\u05E6\u05E2',
      avgRate: '\u20AA/\u05E9\u05E2\u05D4 \u05DE\u05DE\u05D5\u05E6\u05E2',
      totalProfit: '\u05E8\u05D5\u05D5\u05D7 \u05DB\u05D5\u05DC\u05DC',
    },
    settings: {
      title: '\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05E2\u05E1\u05E7',
      subtitle: '\u05D9\u05E2\u05D3\u05D9\u05DD \u05E9\u05DE\u05D6\u05D9\u05E0\u05D9\u05DD \u05D0\u05EA \u05DC\u05D5\u05D7 \u05D4\u05D1\u05E7\u05E8\u05D4',
      monthlyProfitTarget: '\u05D9\u05E2\u05D3 \u05E8\u05D5\u05D5\u05D7 \u05D7\u05D5\u05D3\u05E9\u05D9',
      vatExemptCeiling: '\u05EA\u05E7\u05E8\u05EA \u05E2\u05D5\u05E1\u05E7 \u05E4\u05D8\u05D5\u05E8 \u05E9\u05E0\u05EA\u05D9\u05EA',
      targetHourlyRate: '\u05EA\u05E2\u05E8\u05D9\u05E3 \u05E9\u05E2\u05D4 \u05D9\u05E2\u05D3',
      weeklyHoursBudget: '\u05E9\u05E2\u05D5\u05EA \u05D9\u05D9\u05E6\u05D5\u05E8 \u05E9\u05D1\u05D5\u05E2\u05D9\u05D5\u05EA',
      saved: '\u05D4\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05E0\u05E9\u05DE\u05E8\u05D5',
    },
    materials: {
      materialName: '\u05E9\u05DD \u05D7\u05D5\u05DE\u05E8',
      category: '\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4',
      unit: '\u05D9\u05D7\u05D9\u05D3\u05D4',
      basePrice: '\u05DE\u05D7\u05D9\u05E8 \u05D1\u05E1\u05D9\u05E1',
      newMaterial: '\u05D7\u05D5\u05DE\u05E8 \u05D7\u05D3\u05E9',
      variants: '\u05D2\u05E8\u05E1\u05D0\u05D5\u05EA',
      variantLabel: '\u05EA\u05D5\u05D5\u05D9\u05EA',
      addToProject: '\u05D4\u05D5\u05E1\u05E4\u05D4 \u05DC\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8',
    },
    status: {
      lead: '\u05DC\u05D9\u05D3',
      quoted: '\u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8',
      depositPaid: '\u05DE\u05E7\u05D3\u05DE\u05D4 \u05E9\u05D5\u05DC\u05DE\u05D4',
      inProduction: '\u05D1\u05D9\u05D9\u05E6\u05D5\u05E8',
      ready: '\u05DE\u05D5\u05DB\u05DF',
      delivered: '\u05E0\u05DE\u05E1\u05E8',
      closed: '\u05E1\u05D2\u05D5\u05E8',
      onHold: '\u05D1\u05D4\u05DE\u05EA\u05E0\u05D4',
    },
    pipeline: {
      title: '\u05E6\u05E0\u05E8\u05EA \u05D4\u05D6\u05DE\u05E0\u05D5\u05EA',
      onHold: '\u05D1\u05D4\u05DE\u05EA\u05E0\u05D4',
      markOnHold: '\u05D4\u05E2\u05D1\u05E8 \u05DC\u05D4\u05DE\u05EA\u05E0\u05D4',
      resume: '\u05D7\u05D9\u05D3\u05D5\u05E9',
      empty: '\u05D0\u05D9\u05DF \u05DB\u05D0\u05DF \u05E4\u05E8\u05D9\u05D8\u05D9\u05DD',
      quote: '\u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8',
    },
    productTypes2: {
      title: '\u05E1\u05D5\u05D2\u05D9 \u05DE\u05D5\u05E6\u05E8\u05D9\u05DD',
      newType: '\u05E1\u05D5\u05D2 \u05D7\u05D3\u05E9',
      name: '\u05E9\u05DD',
      assignHint: '\u05E9\u05D9\u05D9\u05DB\u05D5 \u05E1\u05D5\u05D2\u05D9\u05DD \u05DC\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD \u05DB\u05D3\u05D9 \u05DC\u05E8\u05D0\u05D5\u05EA \u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA \u05DC\u05E4\u05D9 \u05DE\u05D5\u05E6\u05E8.',
      none: '\u05DC\u05DC\u05D0',
    },
    reports: {
      title: '\u05D3\u05D5\u05D7\u05D5\u05EA',
      quarter: '\u05E8\u05D1\u05E2\u05D5\u05DF',
      allTime: '\u05DB\u05DC \u05D4\u05D6\u05DE\u05DF',
      productProfitability: '\u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA \u05DC\u05E4\u05D9 \u05E1\u05D5\u05D2 \u05DE\u05D5\u05E6\u05E8',
      leadSourceRoi: 'ROI \u05DC\u05E4\u05D9 \u05DE\u05E7\u05D5\u05E8 \u05D4\u05E4\u05E0\u05D9\u05D4',
      channelRoi: 'ROI \u05DC\u05E4\u05D9 \u05E2\u05E8\u05D5\u05E5 \u05E9\u05D9\u05D5\u05D5\u05E7',
      spend: '\u05D4\u05D5\u05E6\u05D0\u05D4',
      revenue: '\u05D4\u05DB\u05E0\u05E1\u05D4',
      net: '\u05E0\u05D8\u05D5',
      projects: '\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD',
      noData: '\u05D0\u05D9\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05DC\u05EA\u05E7\u05D5\u05E4\u05D4 \u05D6\u05D5',
    },
    timeLog: {
      title: '\u05D9\u05D5\u05DE\u05DF \u05E9\u05E2\u05D5\u05EA',
      addEntry: '\u05D4\u05D5\u05E1\u05E4\u05EA \u05E8\u05D9\u05E9\u05D5\u05DD',
      hours: '\u05E9\u05E2\u05D5\u05EA',
      note: '\u05D4\u05E2\u05E8\u05D4',
      totalLogged: '\u05E1\u05DA \u05E9\u05E2\u05D5\u05EA',
      empty: '\u05D8\u05E8\u05DD \u05E0\u05E8\u05E9\u05DE\u05D5 \u05E9\u05E2\u05D5\u05EA',
    },
    quote: {
      title: '\u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8',
      preparedFor: '\u05E2\u05D1\u05D5\u05E8',
      date: '\u05EA\u05D0\u05E8\u05D9\u05DA',
      item: '\u05E4\u05E8\u05D9\u05D8',
      total: '\u05E1\u05DA \u05D4\u05DB\u05DC',
      depositDue: '\u05DE\u05E7\u05D3\u05DE\u05D4 50%',
      balanceDue: '\u05D9\u05EA\u05E8\u05D4 \u05D1\u05DE\u05E1\u05D9\u05E8\u05D4',
      estDelivery: '\u05DE\u05E1\u05D9\u05E8\u05D4 \u05DE\u05E9\u05D5\u05E2\u05E8\u05EA',
      terms: '\u05EA\u05E0\u05D0\u05D9\u05DD',
      termsText:
        '\u05DE\u05E7\u05D3\u05DE\u05D4 \u05D1\u05D2\u05D5\u05D1\u05D4 50% \u05DE\u05D0\u05E9\u05E8\u05EA \u05D0\u05EA \u05D4\u05D4\u05D6\u05DE\u05E0\u05D4. \u05D4\u05D9\u05EA\u05E8\u05D4 \u05EA\u05E9\u05D5\u05DC\u05DD \u05D1\u05DE\u05E1\u05D9\u05E8\u05D4. \u05D6\u05DE\u05E0\u05D9 \u05D4\u05D0\u05E1\u05E4\u05E7\u05D4 \u05DE\u05E9\u05D5\u05E2\u05E8\u05D9\u05DD \u05D5\u05E2\u05E9\u05D5\u05D9\u05D9\u05DD \u05DC\u05D4\u05E9\u05EA\u05E0\u05D5\u05EA \u05D1\u05D4\u05EA\u05D0\u05DD \u05DC\u05D6\u05DE\u05D9\u05E0\u05D5\u05EA \u05D4\u05D7\u05D5\u05DE\u05E8\u05D9\u05DD.',
      print: '\u05D4\u05D3\u05E4\u05E1\u05D4 / \u05E9\u05DE\u05D9\u05E8\u05EA PDF',
    },
    capacity: {
      title: '\u05E7\u05D9\u05D1\u05D5\u05DC\u05EA',
      earliestStart: '\u05DE\u05D5\u05E2\u05D3 \u05D4\u05EA\u05D7\u05DC\u05D4 \u05E8\u05D9\u05D0\u05DC\u05D9',
      backlog: '\u05E2\u05D5\u05DE\u05E1 \u05DE\u05D7\u05D5\u05D9\u05D1',
      availableNow: '\u05D6\u05DE\u05D9\u05DF \u05E2\u05DB\u05E9\u05D9\u05D5',
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

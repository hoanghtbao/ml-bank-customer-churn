export interface QuadrantBreakdown {
  code: "Q1_VIP_At_Risk" | "Q2_Standard_At_Risk" | "Q3_VIP_Loyal" | "Q4_Standard_Loyal";
  shortCode: "Q1" | "Q2" | "Q3" | "Q4";
  title: string;
  ruleDesc: string;
  customers: number;
  pctOfCountry: number;
  balanceMEur: number;
  avgBalanceEur: number;
  actualChurnRatePct: number;
  avgPredProbPct: number;
  activeMemberPct: number;
  badgeColor: string;
  strategyAction: string;
}

export interface CountryStat {
  code: string;
  geographyValue: "Germany" | "France" | "Spain";
  name: string;
  shortName: string;
  flag: string;
  center: [number, number];
  zoom: number;
  customers: number;
  pctCustomers: string;
  totalBalanceMEur: string;
  avgBalanceEur: string;
  zeroBalanceCount: number;
  zeroBalancePct: string;
  churnRatePct: string;
  churners: number;
  balanceAtRiskMEur: string;
  activeMemberPct: string;
  complainCount: number;
  products34Count: number;
  avgCreditScore: number;
  avgAge: number;
  riskStatus: string;
  isEpicenter: boolean;
  color: string;
  fillColor: string;
  quadrants: QuadrantBreakdown[];
}

export const COUNTRIES_DATA: Record<string, CountryStat> = {
  Germany: {
    code: "DE",
    geographyValue: "Germany",
    name: "Cộng Hòa Liên Bang Đức (Germany)",
    shortName: "Đức (Germany)",
    flag: "🇩🇪",
    center: [51.1657, 10.4515],
    zoom: 6,
    customers: 2509,
    pctCustomers: "25.09%",
    totalBalanceMEur: "300.40M €",
    avgBalanceEur: "119,730 €",
    zeroBalanceCount: 0,
    zeroBalancePct: "0.00%",
    churnRatePct: "32.44%",
    churners: 814,
    balanceAtRiskMEur: "97.97M €",
    activeMemberPct: "49.74%",
    complainCount: 819,
    products34Count: 120,
    avgCreditScore: 651.5,
    avgAge: 39.8,
    riskStatus: "TÂM CHẤN RỦI RO: 100% khách có số dư dương, chiếm 52.76% tổng vốn mất toàn ngân hàng",
    isEpicenter: true,
    color: "#f59e0b",
    fillColor: "#ef4444",
    quadrants: [
      {
        code: "Q1_VIP_At_Risk",
        shortCode: "Q1",
        title: "Q1 • VIP Nguy Cơ Cao",
        ruleDesc: "Balance ≥ 80k € & AI Prob ≥ 0.45",
        customers: 938,
        pctOfCountry: 37.39,
        balanceMEur: 114.54,
        avgBalanceEur: 122115,
        actualChurnRatePct: 84.97,
        avgPredProbPct: 94.4,
        activeMemberPct: 37.74,
        badgeColor: "#ef4444",
        strategyAction: "RM gọi trực tiếp 1-1 + Ưu đãi lãi suất +0.5%/năm (Chi phí 150 €/KH)",
      },
      {
        code: "Q2_Standard_At_Risk",
        shortCode: "Q2",
        title: "Q2 • Phổ Thông Nguy Cơ Cao",
        ruleDesc: "Balance < 80k € & AI Prob ≥ 0.45",
        customers: 25,
        pctOfCountry: 1.0,
        balanceMEur: 1.82,
        avgBalanceEur: 72816,
        actualChurnRatePct: 68.0,
        avgPredProbPct: 88.72,
        activeMemberPct: 40.0,
        badgeColor: "#f59e0b",
        strategyAction: "Gửi ưu đãi hoàn tiền tự động qua App/Email (Chi phí 25 €/KH)",
      },
      {
        code: "Q3_VIP_Loyal",
        shortCode: "Q3",
        title: "Q3 • VIP Trung Thành",
        ruleDesc: "Balance ≥ 80k € & AI Prob < 0.45",
        customers: 1389,
        pctOfCountry: 55.36,
        balanceMEur: 173.77,
        avgBalanceEur: 125101,
        actualChurnRatePct: 0.0,
        avgPredProbPct: 15.47,
        activeMemberPct: 57.24,
        badgeColor: "#10b981",
        strategyAction: "Chăm sóc VIP định kỳ & gợi ý gói 2 sản phẩm (Sweet-spot giữ chân)",
      },
      {
        code: "Q4_Standard_Loyal",
        shortCode: "Q4",
        title: "Q4 • Phổ Thông Trung Thành",
        ruleDesc: "Balance < 80k € & AI Prob < 0.45",
        customers: 157,
        pctOfCountry: 6.26,
        balanceMEur: 10.27,
        avgBalanceEur: 65437,
        actualChurnRatePct: 0.0,
        avgPredProbPct: 14.32,
        activeMemberPct: 56.69,
        badgeColor: "#3b82f6",
        strategyAction: "Duy trì dịch vụ ngân hàng số tự động (Chi phí 0 €)",
      },
    ],
  },
  France: {
    code: "FR",
    geographyValue: "France",
    name: "Cộng Hòa Pháp (France)",
    shortName: "Pháp (France)",
    flag: "🇫🇷",
    center: [46.6034, 1.8883],
    zoom: 6,
    customers: 5014,
    pctCustomers: "50.14%",
    totalBalanceMEur: "311.33M €",
    avgBalanceEur: "62,093 €",
    zeroBalanceCount: 2418,
    zeroBalancePct: "48.22%",
    churnRatePct: "16.17%",
    churners: 811,
    balanceAtRiskMEur: "57.76M €",
    activeMemberPct: "51.68%",
    complainCount: 812,
    products34Count: 133,
    avgCreditScore: 649.7,
    avgAge: 38.5,
    riskStatus: "QUY MÔ LỚN NHẤT (50.14%): 48.22% tài khoản số dư 0 €, tỷ lệ rời bỏ thấp nhất (16.17%)",
    isEpicenter: false,
    color: "#3b82f6",
    fillColor: "#3b82f6",
    quadrants: [
      {
        code: "Q1_VIP_At_Risk",
        shortCode: "Q1",
        title: "Q1 • VIP Nguy Cơ Cao",
        ruleDesc: "Balance ≥ 80k € & AI Prob ≥ 0.45",
        customers: 602,
        pctOfCountry: 12.01,
        balanceMEur: 80.25,
        avgBalanceEur: 133306,
        actualChurnRatePct: 67.61,
        avgPredProbPct: 87.82,
        activeMemberPct: 36.71,
        badgeColor: "#ef4444",
        strategyAction: "RM liên hệ trực tiếp 1-1 tái cấu trúc gói sản phẩm & nâng hạng thẻ (150 €)",
      },
      {
        code: "Q2_Standard_At_Risk",
        shortCode: "Q2",
        title: "Q2 • Phổ Thông Nguy Cơ Cao",
        ruleDesc: "Balance < 80k € & AI Prob ≥ 0.45",
        customers: 467,
        pctOfCountry: 9.31,
        balanceMEur: 4.5,
        avgBalanceEur: 9636,
        actualChurnRatePct: 86.08,
        avgPredProbPct: 94.71,
        activeMemberPct: 38.12,
        badgeColor: "#f59e0b",
        strategyAction: "Chiến dịch Digital Marketing tự động kích hoạt chi tiêu thẻ (25 €)",
      },
      {
        code: "Q3_VIP_Loyal",
        shortCode: "Q3",
        title: "Q3 • VIP Trung Thành",
        ruleDesc: "Balance ≥ 80k € & AI Prob < 0.45",
        customers: 1725,
        pctOfCountry: 34.4,
        balanceMEur: 213.66,
        avgBalanceEur: 123862,
        actualChurnRatePct: 0.06,
        avgPredProbPct: 14.23,
        activeMemberPct: 54.84,
        badgeColor: "#10b981",
        strategyAction: "Bảo vệ trải nghiệm VIP & tích điểm Loyalty (Nguồn vốn trụ cột 213.66M €)",
      },
      {
        code: "Q4_Standard_Loyal",
        shortCode: "Q4",
        title: "Q4 • Phổ Thông Trung Thành",
        ruleDesc: "Balance < 80k € & AI Prob < 0.45",
        customers: 2220,
        pctOfCountry: 44.28,
        balanceMEur: 12.92,
        avgBalanceEur: 5820,
        actualChurnRatePct: 0.05,
        avgPredProbPct: 11.99,
        activeMemberPct: 56.13,
        badgeColor: "#3b82f6",
        strategyAction: "Phục vụ tự động qua kênh Digital Banking (Chi phí 0 €)",
      },
    ],
  },
  Spain: {
    code: "ES",
    geographyValue: "Spain",
    name: "Vương Quốc Tây Ban Nha (Spain)",
    shortName: "Tây Ban Nha (Spain)",
    flag: "🇪🇸",
    center: [40.4637, -3.7492],
    zoom: 6,
    customers: 2477,
    pctCustomers: "24.77%",
    totalBalanceMEur: "153.12M €",
    avgBalanceEur: "61,818 €",
    zeroBalanceCount: 1199,
    zeroBalancePct: "48.41%",
    churnRatePct: "16.67%",
    churners: 413,
    balanceAtRiskMEur: "29.95M €",
    activeMemberPct: "52.97%",
    complainCount: 413,
    products34Count: 73,
    avgCreditScore: 651.3,
    avgAge: 38.9,
    riskStatus: "THỊ TRƯỜNG ỔN ĐỊNH (24.77%): Tỷ lệ Active cao nhất (52.97%), 48.41% số dư = 0 €",
    isEpicenter: false,
    color: "#10b981",
    fillColor: "#10b981",
    quadrants: [
      {
        code: "Q1_VIP_At_Risk",
        shortCode: "Q1",
        title: "Q1 • VIP Nguy Cơ Cao",
        ruleDesc: "Balance ≥ 80k € & AI Prob ≥ 0.45",
        customers: 308,
        pctOfCountry: 12.43,
        balanceMEur: 40.82,
        avgBalanceEur: 132532,
        actualChurnRatePct: 66.23,
        avgPredProbPct: 88.26,
        activeMemberPct: 40.26,
        badgeColor: "#ef4444",
        strategyAction: "Chuyên viên RM gọi điện tư vấn 1-1 & miễn phí quản lý tài sản (150 €)",
      },
      {
        code: "Q2_Standard_At_Risk",
        shortCode: "Q2",
        title: "Q2 • Phổ Thông Nguy Cơ Cao",
        ruleDesc: "Balance < 80k € & AI Prob ≥ 0.45",
        customers: 250,
        pctOfCountry: 10.09,
        balanceMEur: 3.11,
        avgBalanceEur: 12459,
        actualChurnRatePct: 83.6,
        avgPredProbPct: 92.93,
        activeMemberPct: 34.0,
        badgeColor: "#f59e0b",
        strategyAction: "Gửi thông báo Push App & ưu đãi hoàn tiền tự động (25 €)",
      },
      {
        code: "Q3_VIP_Loyal",
        shortCode: "Q3",
        title: "Q3 • VIP Trung Thành",
        ruleDesc: "Balance ≥ 80k € & AI Prob < 0.45",
        customers: 836,
        pctOfCountry: 33.75,
        balanceMEur: 103.5,
        avgBalanceEur: 123805,
        actualChurnRatePct: 0.0,
        avgPredProbPct: 16.78,
        activeMemberPct: 59.93,
        badgeColor: "#10b981",
        strategyAction: "Chăm sóc VIP & khuyến khích mở sản phẩm thứ 2 nếu đang dùng 1 SP",
      },
      {
        code: "Q4_Standard_Loyal",
        shortCode: "Q4",
        title: "Q4 • Phổ Thông Trung Thành",
        ruleDesc: "Balance < 80k € & AI Prob < 0.45",
        customers: 1083,
        pctOfCountry: 43.72,
        balanceMEur: 5.69,
        avgBalanceEur: 5252,
        actualChurnRatePct: 0.0,
        avgPredProbPct: 13.74,
        activeMemberPct: 55.59,
        badgeColor: "#3b82f6",
        strategyAction: "Duy trì kênh tự phục vụ tự động (Chi phí 0 €)",
      },
    ],
  },
};

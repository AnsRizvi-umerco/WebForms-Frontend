export const paths = {
  login: "/login",
  forgotPassword: "/forgot-password",
  home: "/",
  schedules: "/schedules",
  dashboard: "/dashboard",
  labels: "/labels",
  edifact: "/edifact",
  compliance: "/compliance",
  messageHub: "/message-hub",
  transactions: "/transactions",
  profile: "/profile",
  settings: "/settings",
  suppliers: {
    list: "/suppliers",
    create: "/suppliers/create",
    edit: (supplierId: string) => `/suppliers/${supplierId}/edit`
  },
  submit: {
    asn: "/submit/asn",
    invoice: "/submit/invoice",
    poack: "/submit/poack",
    scheduleAck: "/submit/scheduleack"
  }
} as const;

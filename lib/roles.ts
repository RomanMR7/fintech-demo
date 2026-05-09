export type DemoRole =
  | "PLATFORM_ADMIN"
  | "MERCHANT"
  | "OPERATOR"
  | "FINANCE_MANAGER"
  | "SUPPORT";

export const roleOptions: Array<{
  value: DemoRole;
  label: string;
  short: string;
  description: string;
}> = [
  {
    value: "PLATFORM_ADMIN",
    label: "Администратор платформы",
    short: "Админ",
    description: "Видит всю систему и управляет настройками демо-контура."
  },
  {
    value: "MERCHANT",
    label: "Мерчант",
    short: "Мерчант",
    description: "Смотрит свои ордера, выплаты, баланс, реквизиты и API."
  },
  {
    value: "OPERATOR",
    label: "Оператор",
    short: "Оператор",
    description: "Обрабатывает операции, статусы, реквизиты и спорные очереди."
  },
  {
    value: "FINANCE_MANAGER",
    label: "Финансовый менеджер",
    short: "Финансы",
    description: "Контролирует балансы, холды, комиссии и выплаты."
  },
  {
    value: "SUPPORT",
    label: "Support / апелляции",
    short: "Support",
    description: "Разбирает обращения, комментарии, решения и историю споров."
  }
];

export const defaultMerchantId = "merchant-orbita";

export function roleLabel(role: DemoRole) {
  return roleOptions.find((item) => item.value === role)?.label ?? role;
}

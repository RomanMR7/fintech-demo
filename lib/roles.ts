export type DemoRole =
  | "PLATFORM_ADMIN"
  | "MERCHANT"
  | "OPERATOR"
  | "FINANCE_MANAGER"
  | "SUPPORT"
  | "VIEWER";

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
    description: "Видит всю систему, мерчантов, провайдеров, балансы, настройки и интеграции."
  },
  {
    value: "MERCHANT",
    label: "Мерчант",
    short: "Мерчант",
    description: "Смотрит свои ордера, выплаты, баланс, реквизиты, уведомления и API-интеграцию."
  },
  {
    value: "OPERATOR",
    label: "Оператор",
    short: "Оператор",
    description: "Обрабатывает операции, статусы, реквизиты, ручные проверки и спорные очереди."
  },
  {
    value: "FINANCE_MANAGER",
    label: "Финансовый менеджер",
    short: "Финансы",
    description: "Контролирует балансы, холды, комиссии, выплаты, курсы валют и финансовые события."
  },
  {
    value: "SUPPORT",
    label: "Support / апелляции",
    short: "Support",
    description: "Разбирает обращения, комментарии, решения, историю споров и клиентские статусы."
  },
  {
    value: "VIEWER",
    label: "Наблюдатель",
    short: "Viewer",
    description: "Может смотреть demo-данные без критичных действий и финансовых изменений."
  }
];

export const defaultMerchantId = "merchant-orbita";

export function roleLabel(role: DemoRole) {
  return roleOptions.find((item) => item.value === role)?.label ?? role;
}

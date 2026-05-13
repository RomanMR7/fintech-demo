import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";

const createOrder = `POST /api/orders
Content-Type: application/json

{
  "merchantId": "merchant-orbita",
  "externalId": "API-ORDER-10001",
  "amount": 1250,
  "currency": "USD",
  "payType": "C2C",
  "resultMode": "json"
}`;

const apiResponse = `{
  "id": "clx_demo_order",
  "externalId": "API-ORDER-10001",
  "status": "CREATED",
  "amount": "1250",
  "currency": "USD",
  "commission": "31.25",
  "merchantNet": "1218.75",
  "paymentUrl": "https://pay.local/api/..."
}`;

const webhook = `POST /demo/webhook/provider

{
  "orderId": "clx_demo_order",
  "providerOrderId": "fireex-7791",
  "status": "paid",
  "paidAmount": 1250,
  "currency": "USD",
  "signature": "demo_signature"
}`;

const statusChange = `PATCH /api/orders/{id}/status
Content-Type: application/json

{
  "status": "COMPLETED",
  "actorRole": "OPERATOR"
}`;

export default function ApiDemoPage() {
  const blocks = [
    ["Создание ордера", createOrder],
    ["Пример ответа API", apiResponse],
    ["Webhook-событие провайдера", webhook],
    ["Изменение статуса", statusChange]
  ];

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Интеграции"
        title="API-демо"
        description="Страница показывает, как выглядел бы обмен между мерчантом, платформой и провайдером. Реальных внешних API здесь нет."
      />
      <section className="grid gap-5 xl:grid-cols-2">
        {blocks.map(([title, code]) => (
          <article key={title} className="card rounded-[1.75rem] p-5">
            <h2 className="font-display text-2xl font-semibold">{title}</h2>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-ink p-5 text-sm leading-6 text-pearl"><code>{code}</code></pre>
          </article>
        ))}
      </section>
      <EducationBlock
        items={[
          "Мерчант создает ордер через API, а платформа возвращает ID, статус, сумму комиссии и платежную ссылку.",
          "Webhook от провайдера обычно сообщает изменение статуса: оплачен, отменен, ошибка или спор.",
          "В демо изменение статуса выполняется локальным API route и сразу пересчитывает баланс.",
          "Подписи, IP whitelist и rate limits описаны как продуктовая логика, но не усложняют локальный прототип."
        ]}
      />
    </div>
  );
}

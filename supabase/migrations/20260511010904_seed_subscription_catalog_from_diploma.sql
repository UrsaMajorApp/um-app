-- Subscription catalog from diploma project table 4.
insert into public.subscription_plans (
  id, role, title, price_kzt, billing_period, features, popular, active, display_order
)
values
  (
    '71000000-0000-4000-a000-000000000201',
    'parent',
    'Free',
    0,
    'free',
    array['Первичная диагностика (BASIC)', 'Каталог кружков', 'Онлайн-запись на кружки', 'Календарь занятий'],
    false,
    true,
    10
  ),
  (
    '71000000-0000-4000-a000-000000000202',
    'parent',
    'Pro',
    19900,
    'quarter',
    array['Глубокое тестирование (PRO)', 'Полный профиль «Паутина талантов»', 'Персонализированные ИИ-рекомендации', 'Карьерный трек для возраста 15-17 лет', 'Все возможности Free'],
    true,
    true,
    20
  ),
  (
    '71000000-0000-4000-a000-000000000203',
    'parent',
    'Premium',
    44900,
    'quarter',
    array['Персональный ментор: 1 сессия в месяц', 'Полный трекинг прогресса', 'Регулярный фидбек от образовательных организаций', 'Все возможности Pro'],
    false,
    true,
    30
  ),
  (
    '71000000-0000-4000-a000-000000000301',
    'youth',
    'Free',
    0,
    'free',
    array['Первичная диагностика (BASIC)', 'Каталог кружков', 'Онлайн-запись на кружки', 'Календарь занятий'],
    false,
    true,
    10
  ),
  (
    '71000000-0000-4000-a000-000000000302',
    'youth',
    'Pro',
    19900,
    'quarter',
    array['Глубокое тестирование (PRO)', 'Полный профиль «Паутина талантов»', 'Персонализированные ИИ-рекомендации', 'Карьерный трек для возраста 15-17 лет', 'Все возможности Free'],
    true,
    true,
    20
  ),
  (
    '71000000-0000-4000-a000-000000000303',
    'youth',
    'Premium',
    44900,
    'quarter',
    array['Персональный ментор: 1 сессия в месяц', 'Полный трекинг прогресса', 'Регулярный фидбек от образовательных организаций', 'Все возможности Pro'],
    false,
    true,
    30
  ),
  (
    '71000000-0000-4000-a000-000000000401',
    'org',
    'Партнёрство (B2B)',
    50000,
    'month',
    array['Приоритетное размещение', 'Расширенная аналитика', 'Инструменты управления онлайн-записями', '10-15% комиссия с каждой онлайн-записи'],
    true,
    true,
    10
  )
on conflict (role, title) do update set
  price_kzt = excluded.price_kzt,
  billing_period = excluded.billing_period,
  features = excluded.features,
  popular = excluded.popular,
  active = excluded.active,
  display_order = excluded.display_order,
  updated_at = now();

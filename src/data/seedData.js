// Seed data parsed from your expense sheet (Oct 2025 – Aug 2026)
// Amounts in Ghana Cedis (₵)

export const orders = [
  // Week 1 (7 orders)
  { id: 'o1', period: 'Week 1', date: '2025-10-20', client: 'Awura', handle: '', set: 'Princess', mapping: '9, 10, 12, 15', amount: 150 },
  { id: 'o2', period: 'Week 1', date: '2025-10-22', client: 'Princess Majorie', handle: '', set: 'Bbg Hybrid', mapping: '9, 10, 12, 15', amount: 180 },
  { id: 'o3', period: 'Week 1', date: '2025-10-24', client: 'Dansoa', handle: '', set: 'Queen', mapping: '12, 13, 14, 16, 18', amount: 180 },
  { id: 'o4', period: 'Week 1', date: '2025-10-25', client: 'Crystabel', handle: '', set: 'Bbg Hybrid', mapping: '10, 12, 14, 16, 18', amount: 180 },
  { id: 'o5', period: 'Week 1', date: null, client: 'Goldy', handle: '', set: '', mapping: '10, 12, 14, 15, 17', amount: 150 },
  { id: 'o6', period: 'Week 1', date: null, client: 'Kye', handle: '', set: 'Princess', mapping: '10, 12, 14, 16, 18', amount: 150 },
  { id: 'o7', period: 'Week 1', date: null, client: 'Michelle Austin', handle: '', set: 'Princess', mapping: '10, 13, 15', amount: 150 },

  // Week 2
  { id: 'o8', period: 'Week 2', date: '2025-10-28', client: 'Cookie', handle: '', set: 'Queen', mapping: '12, 13, 14, 16, 18', amount: 180 },

  // Week 3
  { id: 'o9', period: 'Week 3', date: '2025-11-21', client: 'Manuella', handle: '', set: 'Princess', mapping: '10, 11, 12, 14, 16, 18', amount: 150 },
  { id: 'o10', period: 'Week 3', date: '2025-11-25', client: 'Manuella', handle: '', set: 'Princess Set', mapping: '10, 11, 13, 15', amount: 150 },
  { id: 'o11', period: 'Week 3', date: '2025-11-28', client: 'Maame Adwoa', handle: 'Sassy_adjoa', set: 'Queen', mapping: '12, 13, 15, 16', amount: 200, notes: 'Delivery on 10/12' },
  { id: 'o12', period: 'Week 3', date: '2025-11-29', client: 'Crys', handle: '', set: 'Bbg Hybrid', mapping: '10, 11, 12, 14, 16, 18 (13, 15, 17, 20)', amount: 180 },
  { id: 'o13', period: 'Week 3', date: '2025-11-29', client: 'Poks', handle: '', set: 'Princess', mapping: '11, 14, 16', amount: 150 },

  // Dec Week 1
  { id: 'o14', period: 'Dec Week 1', date: '2025-12-03', client: 'Kukuua', handle: 'Kuukua_ms', set: 'Princess (2)', mapping: '10, 12, 14, 11-16', amount: 300, notes: 'Deliver 5/12' },

  // Dec Week 2
  { id: 'o15', period: 'Dec Week 2', date: null, client: 'Firdaus', handle: '', set: 'Bbg Hybrid', mapping: '', amount: 200, notes: 'Paid — deliver when in Accra', status: 'pending_delivery' },

  // Dec Week 4
  { id: 'o16', period: 'Dec Week 4', date: '2025-12-22', client: 'Jenny', handle: 'Jennyelormm', set: 'Princess Cat Eye', mapping: 'Poks mapping', amount: 150 },
  { id: 'o17', period: 'Dec Week 4', date: '2025-12-22', client: 'Hellen', handle: 'Hellen_agyapong', set: 'Princess', mapping: '10, 11, 12, 14mm', amount: 180 },
  { id: 'o18', period: 'Dec Week 4', date: '2025-12-23', client: 'Valentina', handle: 'Asigloevalentin', set: 'Bbg', mapping: '9, 10, 12, 14 base', amount: 220 },
  { id: 'o19', period: 'Dec Week 4', date: '2025-12-23', client: 'Alicia', handle: 'Quinalicia19', set: 'Princess', mapping: '10, 11, 12, 14, 16, 18', amount: 180 },

  // Dec Week 5
  { id: 'o20', period: 'Dec Week 5', date: '2025-12-29', client: 'Baaba', handle: '', set: 'Princess Cat Eye', mapping: 'Poks set 10-14 x2', amount: 300 },
  { id: 'o21', period: 'Dec Week 5', date: '2025-12-31', client: 'Maame Adwoa', handle: '', set: 'Princess Cat Eye', mapping: '9, 10, 14, 16, 17', amount: 200 },

  // Jan Week 2
  { id: 'o22', period: 'Jan Week 2', date: '2026-01-08', client: 'Freda', handle: 'M_freda', set: 'Princess Cat Eye', mapping: 'Jennifer 9-13', amount: 150 },

  // Jan Week 3
  { id: 'o23', period: 'Jan Week 3', date: '2026-01-13', client: 'Fati', handle: '', set: 'Adwoa Queen', mapping: '12, 13, 15, 16, 17', amount: 200 },

  // Jan Week 5
  { id: 'o24', period: 'Jan Week 5', date: '2026-01-31', client: 'Crystabel', handle: '', set: 'Princess (2)', mapping: '', amount: 200 },
  { id: 'o25', period: 'Jan Week 5', date: '2026-01-31', client: 'Judie', handle: '', set: 'Fairy', mapping: '9, 10, 10, 11, 12, 13', amount: 150 },

  // Feb Week 1
  { id: 'o26', period: 'Feb Week 1', date: '2026-02-03', client: 'Asaawa', handle: '', set: 'Princess (2)', mapping: '9, 10, 13, 14', amount: 400 },

  // Feb Week 3
  { id: 'o27', period: 'Feb Week 3', date: '2026-02-08', client: 'Nicole', handle: 'nicoleparker._', set: 'Princess', mapping: '8, 9, 10, 12, 14, 16', amount: 200 },
  { id: 'o28', period: 'Feb Week 3', date: '2026-02-09', client: 'Lilian', handle: 'Lady_safoa', set: 'Princess', mapping: '9, 10, 13, 14 Asaawa', amount: 200 },
  { id: 'o29', period: 'Feb Week 3', date: '2026-02-10', client: 'Lynn', handle: '', set: 'Princess', mapping: "Helen's set 10-14", amount: 180 },
  { id: 'o30', period: 'Feb Week 3', date: '2026-02-13', client: 'Joanita', handle: 'Jay.pril', set: 'Princess', mapping: '10-14', amount: 200 },

  // Feb Week 4
  { id: 'o31', period: 'Feb Week 4', date: '2026-02-18', client: 'Serwaa', handle: 'poisedaura_0', set: 'Princess', mapping: '8-16 & 11-16', amount: 400 },

  // Feb Week 5 / March Week 1
  { id: 'o32', period: 'Feb Week 5', date: '2026-02-22', client: 'Haddy', handle: 'Haddy_osei', set: 'Princess BBG', mapping: '10-17 base', amount: 250 },
  { id: 'o33', period: 'Feb Week 5', date: '2026-02-24', client: 'Montez', handle: 'Sasha', set: 'Bbg', mapping: '', amount: 250 },
  { id: 'o34', period: 'Feb Week 5', date: '2026-02-25', client: 'Poks', handle: 'Poks', set: 'Princess', mapping: '9, 10, 10, 12, 12, 13, 14, 14', amount: 180 },

  // March Week 3
  { id: 'o35', period: 'March Week 3', date: '2026-03-13', client: 'Mawufemor', handle: '0206973480', set: 'Princess', mapping: '9, 10, 10, 12, 12, 13, 13', amount: 180 },
  { id: 'o36', period: 'March Week 3', date: '2026-03-14', client: 'Claudia', handle: '', set: 'Sasha', mapping: '', amount: 250, notes: 'Delivery Wednesday' },
  { id: 'o37', period: 'March Week 3', date: '2026-03-14', client: 'Salma', handle: 'Sal.maa0', set: 'Poks', mapping: '8-12', amount: 180 },

  // March Week 4
  { id: 'o38', period: 'March Week 4', date: '2026-03-17', client: '', handle: 'Love.enshi', set: 'BBG', mapping: '', amount: 280 },
  { id: 'o39', period: 'March Week 4', date: '2026-03-21', client: 'Dzifa', handle: '', set: 'Bbg Cindy', mapping: '', amount: 250 },

  // March Week 5
  { id: 'o40', period: 'March Week 5', date: '2026-03-23', client: 'Afia Asabea', handle: 'Love.enshi', set: 'Poks 9-14 x2', mapping: '', amount: 360 },
  { id: 'o41', period: 'March Week 5', date: '2026-03-24', client: 'Michelle Austin', handle: '', set: 'Bbg 10-16 base', mapping: '', amount: 250 },

  // March Week 6 / April Week 1
  { id: 'o42', period: 'April Week 1', date: '2026-03-30', client: 'Rashida', handle: 'Rashida.bel', set: 'Poks 9-14', mapping: '', amount: 180 },
  { id: 'o43', period: 'April Week 1', date: '2026-04-01', client: 'Salma Millah', handle: '', set: '', mapping: '', amount: 200, notes: 'Delivery Friday morning' },
  { id: 'o44', period: 'April Week 1', date: '2026-04-02', client: 'Saint C', handle: 'Mamisupremacy', set: 'Poks 9-14', mapping: '', amount: 180, notes: 'Delivery Saturday' },
  { id: 'o45', period: 'April Week 1', date: '2026-04-03', client: 'Chelsea', handle: 'Eyiram.chelsea', set: 'Haddy BBG', mapping: '', amount: 250 },
  { id: 'o46', period: 'April Week 1', date: '2026-04-03', client: 'Poks', handle: '', set: 'Poks', mapping: '8-13mm', amount: 180 },
  { id: 'o47', period: 'April Week 1', date: '2026-04-03', client: 'Pierette', handle: '', set: 'Princess 10-17', mapping: '10-17', amount: 200 },

  // April Week 2
  { id: 'o48', period: 'April Week 2', date: '2026-04-09', client: 'Hilda', handle: '', set: 'Poks', mapping: '9-14', amount: 180 },
  { id: 'o49', period: 'April Week 2', date: '2026-04-10', client: 'Stacey', handle: 'Lordlyynn', set: 'Haddy', mapping: '', amount: 100, notes: 'Deposit' },
  { id: 'o50', period: 'April Week 2', date: '2026-04-10', client: 'Mona', handle: '', set: 'Queen Ready', mapping: '', amount: 220 },

  // May Week 2
  { id: 'o51', period: 'May Week 2', date: '2026-05-04', client: 'Sefakor', handle: 'oaas.xx', set: 'Bbg', mapping: '10, 12, 14, 18, 20 base', amount: 250 },
  { id: 'o52', period: 'May Week 2', date: '2026-05-06', client: 'Aba Forson', handle: '', set: 'Poks', mapping: '10, 12, 14, 16', amount: 180 },
  { id: 'o53', period: 'May Week 2', date: '2026-05-09', client: 'Stacey', handle: '', set: 'Haddy', mapping: '12-18', amount: 150, notes: 'Balance' },

  // May Week 3
  { id: 'o54', period: 'May Week 3', date: '2026-05-13', client: 'Joanita', handle: '', set: 'Poks', mapping: '9-14', amount: 180 },

  // May Week 4
  { id: 'o55', period: 'May Week 4', date: '2026-05-13', client: 'Gifty', handle: '', set: '', mapping: '8-16mm', amount: 180 },

  // Promo (25th–31st May) — 15 orders
  { id: 'o56', period: 'May Promo', date: '2026-05-25', client: 'Mona', handle: '', set: 'Princess', mapping: 'Poks 8-14mm', amount: 140 },
  { id: 'o57', period: 'May Promo', date: '2026-05-25', client: 'Claudia', handle: '', set: 'Sasha', mapping: 'Sasha 8-15mm', amount: 175 },
  { id: 'o58', period: 'May Promo', date: '2026-05-25', client: 'Rashida', handle: '', set: 'Fairy', mapping: 'Fairy 8-13mm', amount: 105 },
  { id: 'o59', period: 'May Promo', date: '2026-05-26', client: 'Ellen Bebule', handle: '', set: 'Jessy + Princess', mapping: 'Princess 8-16 / Jessy 8-13', amount: 266 },
  { id: 'o60', period: 'May Promo', date: '2026-05-26', client: 'Vanessa', handle: 'vnessa.ox', set: 'Jessy', mapping: 'Jessy 8-13mm', amount: 140, notes: 'Delivery Saturday' },
  { id: 'o61', period: 'May Promo', date: '2026-05-27', client: 'Precious', handle: 'ad_enam', set: 'Rashida', mapping: '8-13mm', amount: 120 },
  { id: 'o62', period: 'May Promo', date: '2026-05-27', client: 'Samantha', handle: 'sam_anthurr', set: '8-12 Princess', mapping: 'Aunt Efua 8-12mm', amount: 105 },
  { id: 'o63', period: 'May Promo', date: '2026-05-28', client: 'Jasmine', handle: 'J_ashun20', set: 'Poks', mapping: '9-14', amount: 150 },
  { id: 'o64', period: 'May Promo', date: '2026-05-28', client: 'Peggy', handle: 'theyluvvpeggy', set: 'Princess', mapping: '8-16mm', amount: 126 },
  { id: 'o65', period: 'May Promo', date: '2026-05-29', client: 'Abena', handle: 'Ms.aframs', set: 'Princess', mapping: '8-13mm', amount: 105 },
  { id: 'o66', period: 'May Promo', date: '2026-05-29', client: 'Whytney', handle: '', set: 'Jessy + Poks + Sasha', mapping: '', amount: 465 },

  // May/June
  { id: 'o67', period: 'May Week 4', date: '2026-05-31', client: 'Majorie', handle: '', set: 'Princess', mapping: '8-13mm', amount: 180 },
  { id: 'o68', period: 'June Week 1', date: '2026-06-05', client: 'Keren', handle: 'K_eren77', set: 'Poks', mapping: '8-14mm', amount: 180 },

  // June Week 2
  { id: 'o69', period: 'June Week 2', date: '2026-06-10', client: 'Mariam', handle: 'mayafabri', set: 'Princess Poks', mapping: '8-14mm', amount: 180 },
  { id: 'o70', period: 'June Week 2', date: '2026-06-12', client: 'Karen', handle: 'awo.ao', set: 'Sasha', mapping: '', amount: 250 },
  { id: 'o71', period: 'June Week 2', date: '2026-06-13', client: 'Adjoa', handle: '', set: 'Bbg + Bottoms', mapping: '', amount: 300 },

  // June Week 3
  { id: 'o72', period: 'June Week 3', date: '2026-06-18', client: 'Chloe', handle: '', set: 'Bbg', mapping: '', amount: 250 },

  // June Week 4
  { id: 'o73', period: 'June Week 4', date: '2026-06-22', client: 'Saah', handle: '0276094380', set: 'Fairy', mapping: '', amount: 150 },

  // July Week 3 (new prices after break)
  { id: 'o74', period: 'July Week 3', date: '2026-07-17', client: 'Lecia', handle: '', set: 'Princess', mapping: '', amount: 280 },
  { id: 'o75', period: 'July Week 3', date: '2026-07-18', client: 'Sadiya', handle: '', set: 'Bbg + Glue', mapping: '', amount: 315 },
  { id: 'o76', period: 'July Week 3', date: '2026-07-22', client: 'Penny', handle: 'Its_neviaa', set: 'Adwoa + Bottoms + Glue', mapping: '', amount: 485 },

  // July Week 4
  { id: 'o77', period: 'July Week 4', date: '2026-07-27', client: 'Priscilla', handle: '0507494710', set: 'Bbg + Glue', mapping: '', amount: 315 },

  // August Week 2
  { id: 'o78', period: 'August Week 2', date: '2026-08-03', client: 'Crystabel', handle: '', set: 'Mia Brown', mapping: '', amount: 380 },
  { id: 'o79', period: 'August Week 2', date: '2026-08-06', client: 'Esi P', handle: '', set: 'Jessy', mapping: '', amount: 250 },
  { id: 'o80', period: 'August Week 2', date: '2026-08-08', client: 'Melissa', handle: '', set: 'Poks', mapping: '', amount: 250 },

  // August Week 3
  { id: 'o81', period: 'August Week 3', date: '2026-08-10', client: 'Lawrenda', handle: 'acupofselfcare', set: 'Mia', mapping: '', amount: 380 },
]

export const expenses = [
  { id: 'e1', period: 'Week 1', date: '2025-10-01', vendor: 'Bibibeauty', description: '10 strip cases (₵8 each)', amount: 131, notes: '80 + 51' },
  { id: 'e2', period: 'Week 1', date: '2025-10-01', vendor: 'Lash Supply Store', description: 'Printer', amount: 274, notes: '250 + 24' },
  { id: 'e3', period: 'Week 1', date: '2025-10-01', vendor: 'Lash Supply Store', description: '10 tweezers, 10 glue, 10 packaging bags, 1 practice lash', amount: 184, notes: '160 + 24' },

  { id: 'e4', period: 'Dec Week 1', date: '2025-12-01', vendor: 'Lash Supply Store', description: 'Supplies + delivery', amount: 370, notes: '341 + 29 delivery' },
  { id: 'e5', period: 'Dec Week 1', date: '2025-12-01', vendor: 'ilashaddict_supply', description: 'Lash trays & cases', amount: 155, notes: '120 + 35 (90c tray & 30c cases)' },
  { id: 'e6', period: 'Dec Week 1', date: '2025-12-01', vendor: 'cleosandrinabeautysupply', description: 'Lash glue, mannequin', amount: 191, notes: '76 glue + 80 mannequin + 35' },

  { id: 'e7', period: 'Dec Week 2', date: '2025-12-15', vendor: 'Lash Yard', description: '2 coating mascara, spoolies, brow wand, 2 practice trays', amount: 240 },

  { id: 'e8', period: 'Dec Week 4', date: '2025-12-22', vendor: 'Lash Supply Store', description: '15 boxes, Navina glue + delivery', amount: 326, notes: '300 + 26 delivery' },
  { id: 'e9', period: 'Dec Week 4', date: '2025-12-24', vendor: 'Lash Supply Store', description: 'Glue', amount: 105, notes: '80 + 25' },
  { id: 'e10', period: 'Dec Week 4', date: '2025-12-24', vendor: 'HMB', description: 'Supplies', amount: 273 },
  { id: 'e11', period: 'Dec Week 4', date: '2025-12-24', vendor: 'Various', description: 'Lash bags, 2 practice trays, nozzle glue tip', amount: 273, notes: '100 + 130 + 43' },

  { id: 'e12', period: 'Dec Week 5', date: '2025-12-31', vendor: 'Ama', description: 'Glue + delivery', amount: 226, notes: '200 + 26 (20 cedis for 1 glue)' },

  { id: 'e13', period: 'Jan Week 2', date: '2026-01-13', vendor: 'Cleosandrina', description: 'Glue (3 for ₵12) + delivery', amount: 107, notes: '72 + 35' },

  { id: 'e14', period: 'Feb Week 3', date: '2026-02-09', vendor: 'Lash Supply Store', description: 'Strip glue (120) + practice lash & 8mm tray (150)', amount: 270 },
  { id: 'e15', period: 'Feb Week 3', date: '2026-02-10', vendor: 'ilash shop', description: '4 lash trays', amount: 300 },

  { id: 'e16', period: 'Feb Week 5', date: '2026-02-26', vendor: 'Poshlyn', description: 'Lashes, bottom lashes, dummy, practice lash + delivery', amount: 554, notes: '530 + 24' },

  { id: 'e17', period: 'March Week 3', date: '2026-03-13', vendor: 'Various', description: 'Supplies + delivery', amount: 225, notes: '200 + 25' },

  { id: 'e18', period: 'March Week 5', date: '2026-03-24', vendor: 'ilash shop', description: 'Navina glue, 20 tray & pack, tweezer cleaner, tweezer', amount: 470, notes: '430 + 40' },

  { id: 'e19', period: 'April Week 1', date: '2026-04-01', vendor: 'Lash Supply Store', description: 'Packaging bags, practice lash, tweezers + delivery', amount: 174, notes: '146 + 28 (9 tweezers, 10 bags, practice tray 2)' },

  { id: 'e20', period: 'May Week 2', date: '2026-05-04', vendor: 'Poshlyn', description: 'Lashes (10, 12, 13) + delivery', amount: 222, notes: '196 + 26' },
  { id: 'e21', period: 'May Week 2', date: '2026-05-04', vendor: 'ilash shop', description: 'Supplies + mapping ruler + delivery', amount: 490, notes: '449 + 41' },

  { id: 'e22', period: 'May Week 4', date: '2026-05-21', vendor: 'Lash Supply Store', description: '10pcs bags, 20 tweezers, 20 3D cases, 20 strip lash glue', amount: 710 },

  { id: 'e23', period: 'May Promo', date: '2026-05-29', vendor: 'Lash Yard', description: 'Coating mascara + 8mm C curl lashes + delivery', amount: 177, notes: '131 + 46 delivery' },
  { id: 'e24', period: 'May Promo', date: '2026-05-29', vendor: 'Bibibeauty', description: '12pcs practice lash, Nagaraku glue + delivery', amount: 353, notes: '291 + 62' },

  { id: 'e25', period: 'June Week 1', date: '2026-06-01', vendor: 'ilash shop', description: '10/11 C curl, bags, boxes', amount: 260 },

  { id: 'e26', period: 'July Week 1', date: '2026-07-08', vendor: 'Lash Supply Store', description: 'Empty bottles, brushes, concentrate, glue, trays, tweezers', amount: 501 },

  { id: 'e27', period: 'July Week 3', date: '2026-07-18', vendor: 'Bibibeauty', description: 'Bibi sale + delivery', amount: 725, notes: '675 + 50 delivery' },
]

export const SET_TYPES = [
  'Princess', 'Princess Cat Eye', 'Princess (2)', 'Princess BBG', 'Bbg', 'Bbg Hybrid',
  'Queen', 'Adwoa Queen', 'Poks', 'Sasha', 'Haddy', 'Haddy BBG', 'Fairy', 'Jessy',
  'Mia', 'Mia Brown', 'Bbg + Bottoms', 'Bbg + Glue', 'Adwoa + Bottoms + Glue', 'Other',
]

export const VENDORS = [
  'Bibibeauty',
  'Lash Supply Store',
  'ilash addict',
  'ilash shop',
  'cleosandrinabeautysupply',
  'Lash Yard',
  'Poshlyn',
  'HMB',
  'Ama',
  'Other',
]

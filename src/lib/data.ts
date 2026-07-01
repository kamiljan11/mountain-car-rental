import type { Vehicle, Customer, Booking, Payment } from "./types";

// Zaimportowane 1:1 z RentHelp (renthelp_kalendarz.csv, 82 wpisów). Plik generowany.
export const vehicles: Vehicle[] = [
  {
    "id": "v1",
    "name": "Mitsubishi Pajero",
    "plate": "",
    "color": "#2563eb",
    "status": "active"
  },
  {
    "id": "v2",
    "name": "Volkswagen Caddy",
    "plate": "",
    "color": "#0ea5e9",
    "status": "active"
  },
  {
    "id": "v3",
    "name": "Mercedes-Benz Vito",
    "plate": "",
    "color": "#14b8a6",
    "status": "active"
  },
  {
    "id": "v4",
    "name": "Renault Master - UNZ27",
    "plate": "UNZ27",
    "color": "#10b981",
    "status": "active"
  },
  {
    "id": "v5",
    "name": "Renault Trafic",
    "plate": "",
    "color": "#6366f1",
    "status": "active"
  },
  {
    "id": "v6",
    "name": "VW Caddy Beach Bialy - ZLH03",
    "plate": "ZLH03",
    "color": "#f59e0b",
    "status": "active"
  },
  {
    "id": "v7",
    "name": "Volkswagen Caddy Beach - JKF73",
    "plate": "JKF73",
    "color": "#84cc16",
    "status": "active"
  },
  {
    "id": "v8",
    "name": "Vito - PKP90",
    "plate": "PKP90",
    "color": "#ec4899",
    "status": "active"
  },
  {
    "id": "v9",
    "name": "Dacia Duster",
    "plate": "",
    "color": "#ef4444",
    "status": "active"
  },
  {
    "id": "v10",
    "name": "Renault Master",
    "plate": "",
    "color": "#8b5cf6",
    "status": "active"
  },
  {
    "id": "v11",
    "name": "Dacia Duster gorki - FZZ82",
    "plate": "FZZ82",
    "color": "#06b6d4",
    "status": "active"
  },
  {
    "id": "v12",
    "name": "Dacia Duster Namiot II - BPS82",
    "plate": "BPS82",
    "color": "#22c55e",
    "status": "active"
  },
  {
    "id": "v13",
    "name": "Renault Trafic - ROB64",
    "plate": "ROB64",
    "color": "#3b82f6",
    "status": "active"
  },
  {
    "id": "v14",
    "name": "Renault Master II - RHR89",
    "plate": "RHR89",
    "color": "#eab308",
    "status": "active"
  },
  {
    "id": "v15",
    "name": "Daci Duster Namiot - PFS75",
    "plate": "PFS75",
    "color": "#f43f5e",
    "status": "active"
  },
  {
    "id": "v16",
    "name": "Volkswagen Caddy California - PYL41",
    "plate": "PYL41",
    "color": "#0891b2",
    "status": "active"
  }
];

export const customers: Customer[] = [
  {
    "id": "c1",
    "name": "[klient 939]"
  },
  {
    "id": "c2",
    "name": "[klient 167]"
  },
  {
    "id": "c3",
    "name": "[klient 214]"
  },
  {
    "id": "c4",
    "name": "[klient 202]"
  },
  {
    "id": "c5",
    "name": "[klient 276] Palimaka"
  },
  {
    "id": "c6",
    "name": "[klient 081] Lazarski"
  },
  {
    "id": "c7",
    "name": "Bartlomiej [klient 041]"
  },
  {
    "id": "c8",
    "name": "[klient 673] Polchlопek"
  },
  {
    "id": "c9",
    "name": "[klient 165]"
  },
  {
    "id": "c10",
    "name": "[klient 477] Wroblewska [klient 539] Wroblewski"
  },
  {
    "id": "c11",
    "name": "[klient 561] [klient 337]"
  },
  {
    "id": "c12",
    "name": "[klient 854]"
  },
  {
    "id": "c13",
    "name": "[klient 197]"
  },
  {
    "id": "c14",
    "name": "[klient 441]"
  },
  {
    "id": "c15",
    "name": "[klient 978]"
  },
  {
    "id": "c16",
    "name": "[klient 506]"
  },
  {
    "id": "c17",
    "name": "Rafal [klient 880]"
  },
  {
    "id": "c18",
    "name": "[klient 375] Wojcicki"
  },
  {
    "id": "c19",
    "name": "[klient 584]"
  },
  {
    "id": "c20",
    "name": "Rebel Travel"
  },
  {
    "id": "c21",
    "name": "Mikolaj [klient 067]"
  },
  {
    "id": "c22",
    "name": "[klient 736]"
  },
  {
    "id": "c23",
    "name": "[klient 918] [klient 996]"
  },
  {
    "id": "c24",
    "name": "[klient 942]"
  },
  {
    "id": "c25",
    "name": "[klient 553]"
  },
  {
    "id": "c26",
    "name": "[klient 956]"
  },
  {
    "id": "c27",
    "name": "[klient 249] Sniatowski"
  },
  {
    "id": "c28",
    "name": "[klient 221]"
  },
  {
    "id": "c29",
    "name": "[klient 037] Szymanska"
  },
  {
    "id": "c30",
    "name": "[klient 109]"
  },
  {
    "id": "c31",
    "name": "[klient 430]"
  },
  {
    "id": "c32",
    "name": "[klient 639]"
  },
  {
    "id": "c33",
    "name": "[klient 766]"
  },
  {
    "id": "c34",
    "name": "[klient 539] Olszowka"
  },
  {
    "id": "c35",
    "name": "[klient 977]"
  },
  {
    "id": "c36",
    "name": "[klient 080] [klient 160]"
  },
  {
    "id": "c37",
    "name": "[klient 080] Zyzanski"
  },
  {
    "id": "c38",
    "name": "[klient 443]"
  },
  {
    "id": "c39",
    "name": "[klient 561] [klient 260]"
  },
  {
    "id": "c40",
    "name": "[klient 016] Travel - [klient 683] Jozwik"
  },
  {
    "id": "c41",
    "name": "[klient 178]"
  },
  {
    "id": "c42",
    "name": "[klient 539] Kolipinski"
  },
  {
    "id": "c43",
    "name": "[klient 326]"
  },
  {
    "id": "c44",
    "name": "[klient 830]"
  },
  {
    "id": "c45",
    "name": "[klient 765]"
  },
  {
    "id": "c46",
    "name": "[klient 842]"
  },
  {
    "id": "c47",
    "name": "[klient 418]"
  },
  {
    "id": "c48",
    "name": "[klient 028]"
  },
  {
    "id": "c49",
    "name": "[klient 380]"
  }
];

export const bookings: Booking[] = [
  {
    "id": "b1",
    "vehicleId": "v1",
    "customerId": null,
    "type": "service",
    "status": "completed",
    "start": "2024-06-11",
    "end": "2025-03-31",
    "notes": "Serwis Pajero Blue"
  },
  {
    "id": "b2",
    "vehicleId": "v1",
    "customerId": "c1",
    "type": "reservation",
    "status": "completed",
    "start": "2024-07-13",
    "end": "2024-07-27",
    "notes": "[klient 939]"
  },
  {
    "id": "b3",
    "vehicleId": "v1",
    "customerId": "c2",
    "type": "reservation",
    "status": "completed",
    "start": "2024-07-24",
    "end": "2024-07-26",
    "notes": "[klient 167]"
  },
  {
    "id": "b4",
    "vehicleId": "v2",
    "customerId": "c3",
    "type": "reservation",
    "status": "completed",
    "start": "2025-06-01",
    "end": "2025-06-07",
    "notes": "[klient 214]"
  },
  {
    "id": "b5",
    "vehicleId": "v1",
    "customerId": "c4",
    "type": "reservation",
    "status": "completed",
    "start": "2025-06-11",
    "end": "2025-06-22",
    "notes": "[klient 202]"
  },
  {
    "id": "b6",
    "vehicleId": "v1",
    "customerId": "c5",
    "type": "reservation",
    "status": "completed",
    "start": "2025-06-15",
    "end": "2025-06-24",
    "notes": "[klient 276] Palimaka"
  },
  {
    "id": "b7",
    "vehicleId": "v2",
    "customerId": "c6",
    "type": "reservation",
    "status": "completed",
    "start": "2025-06-26",
    "end": "2025-07-05",
    "notes": "[klient 081] Lazarski"
  },
  {
    "id": "b8",
    "vehicleId": "v1",
    "customerId": "c7",
    "type": "reservation",
    "status": "completed",
    "start": "2025-06-29",
    "end": "2025-07-13",
    "notes": "Bartlomiej [klient 041]"
  },
  {
    "id": "b9",
    "vehicleId": "v2",
    "customerId": "c8",
    "type": "reservation",
    "status": "completed",
    "start": "2025-07-02",
    "end": "2025-07-09",
    "notes": "[klient 673] Polchlопek"
  },
  {
    "id": "b10",
    "vehicleId": "v1",
    "customerId": "c9",
    "type": "reservation",
    "status": "completed",
    "start": "2025-07-04",
    "end": "2025-07-12",
    "notes": "[klient 165]"
  },
  {
    "id": "b11",
    "vehicleId": "v1",
    "customerId": "c10",
    "type": "reservation",
    "status": "completed",
    "start": "2025-07-22",
    "end": "2025-07-31",
    "notes": "[klient 477] Wroblewska [klient 539] Wroblewski"
  },
  {
    "id": "b12",
    "vehicleId": "v1",
    "customerId": "c11",
    "type": "reservation",
    "status": "completed",
    "start": "2025-08-15",
    "end": "2025-08-24",
    "notes": "[klient 561] [klient 337]"
  },
  {
    "id": "b13",
    "vehicleId": "v1",
    "customerId": "c12",
    "type": "reservation",
    "status": "completed",
    "start": "2025-08-23",
    "end": "2025-08-31",
    "notes": "[klient 854]"
  },
  {
    "id": "b14",
    "vehicleId": "v1",
    "customerId": "c13",
    "type": "reservation",
    "status": "completed",
    "start": "2025-12-04",
    "end": "2025-12-07",
    "notes": "[klient 197]"
  },
  {
    "id": "b15",
    "vehicleId": "v3",
    "customerId": "c14",
    "type": "reservation",
    "status": "completed",
    "start": "2025-12-24",
    "end": "2025-12-28",
    "notes": "[klient 441]"
  },
  {
    "id": "b16",
    "vehicleId": "v2",
    "customerId": "c15",
    "type": "reservation",
    "status": "completed",
    "start": "2026-01-21",
    "end": "2026-01-27",
    "notes": "[klient 978]"
  },
  {
    "id": "b17",
    "vehicleId": "v2",
    "customerId": "c16",
    "type": "reservation",
    "status": "completed",
    "start": "2026-02-14",
    "end": "2026-02-17",
    "notes": "[klient 506]"
  },
  {
    "id": "b18",
    "vehicleId": "v2",
    "customerId": "c17",
    "type": "reservation",
    "status": "completed",
    "start": "2026-03-05",
    "end": "2026-03-08",
    "notes": "Rafal [klient 880]"
  },
  {
    "id": "b19",
    "vehicleId": "v2",
    "customerId": "c18",
    "type": "reservation",
    "status": "completed",
    "start": "2026-03-05",
    "end": "2026-03-08",
    "notes": "[klient 375] Wojcicki"
  },
  {
    "id": "b20",
    "vehicleId": "v2",
    "customerId": "c19",
    "type": "reservation",
    "status": "completed",
    "start": "2026-03-14",
    "end": "2026-03-21",
    "notes": "[klient 584]"
  },
  {
    "id": "b21",
    "vehicleId": "v2",
    "customerId": "c20",
    "type": "reservation",
    "status": "completed",
    "start": "2026-03-15",
    "end": "2026-03-22",
    "notes": "Rebel Travel"
  },
  {
    "id": "b22",
    "vehicleId": "v2",
    "customerId": "c20",
    "type": "reservation",
    "status": "completed",
    "start": "2026-03-15",
    "end": "2026-03-22",
    "notes": "Rebel Travel"
  },
  {
    "id": "b23",
    "vehicleId": "v1",
    "customerId": "c21",
    "type": "reservation",
    "status": "completed",
    "start": "2026-03-16",
    "end": "2026-03-20",
    "notes": "Mikolaj [klient 067]"
  },
  {
    "id": "b24",
    "vehicleId": "v4",
    "customerId": null,
    "type": "block",
    "status": "completed",
    "start": "2026-03-31",
    "end": "2026-04-07",
    "notes": "[klient 918] - joga  20000 isk doba",
    "dailyRate": 20000
  },
  {
    "id": "b25",
    "vehicleId": "v2",
    "customerId": "c22",
    "type": "reservation",
    "status": "completed",
    "start": "2026-04-15",
    "end": "2026-04-22",
    "notes": "[klient 736]"
  },
  {
    "id": "b26",
    "vehicleId": "v3",
    "customerId": "c22",
    "type": "reservation",
    "status": "completed",
    "start": "2026-04-15",
    "end": "2026-04-22",
    "notes": "[klient 736]"
  },
  {
    "id": "b27",
    "vehicleId": "v2",
    "customerId": "c23",
    "type": "reservation",
    "status": "completed",
    "start": "2026-04-19",
    "end": "2026-04-26",
    "notes": "[klient 918] [klient 996]"
  },
  {
    "id": "b28",
    "vehicleId": "v5",
    "customerId": "c23",
    "type": "reservation",
    "status": "completed",
    "start": "2026-04-19",
    "end": "2026-04-26",
    "notes": "[klient 918] [klient 996]"
  },
  {
    "id": "b29",
    "vehicleId": "v6",
    "customerId": null,
    "type": "block",
    "status": "completed",
    "start": "2026-04-23",
    "end": "2026-04-27",
    "notes": "Fotelik, Nikola messenger rental 14000",
    "dailyRate": 14000
  },
  {
    "id": "b30",
    "vehicleId": "v1",
    "customerId": null,
    "type": "service",
    "status": "completed",
    "start": "2026-04-28",
    "end": "2026-06-01",
    "notes": "Serwis Pajero"
  },
  {
    "id": "b31",
    "vehicleId": "v5",
    "customerId": "c24",
    "type": "reservation",
    "status": "completed",
    "start": "2026-04-30",
    "end": "2026-05-03",
    "notes": "[klient 942]"
  },
  {
    "id": "b32",
    "vehicleId": "v7",
    "customerId": null,
    "type": "block",
    "status": "completed",
    "start": "2026-04-30",
    "end": "2026-05-04",
    "notes": "Blokada"
  },
  {
    "id": "b33",
    "vehicleId": "v6",
    "customerId": null,
    "type": "block",
    "status": "completed",
    "start": "2026-05-25",
    "end": "2026-05-28",
    "notes": "Blokada"
  },
  {
    "id": "b34",
    "vehicleId": "v8",
    "customerId": null,
    "type": "block",
    "status": "completed",
    "start": "2026-05-25",
    "end": "2026-05-30",
    "notes": "Marzena biuro podrozy 35000 doba 792 870 231",
    "dailyRate": 35000
  },
  {
    "id": "b35",
    "vehicleId": "v2",
    "customerId": "c25",
    "type": "reservation",
    "status": "completed",
    "start": "2026-05-30",
    "end": "2026-06-05",
    "notes": "[klient 553]"
  },
  {
    "id": "b36",
    "vehicleId": "v2",
    "customerId": "c26",
    "type": "reservation",
    "status": "completed",
    "start": "2026-05-30",
    "end": "2026-06-06",
    "notes": "[klient 956]"
  },
  {
    "id": "b37",
    "vehicleId": "v5",
    "customerId": "c27",
    "type": "reservation",
    "status": "completed",
    "start": "2026-06-03",
    "end": "2026-06-07",
    "notes": "[klient 249] Sniatowski"
  },
  {
    "id": "b38",
    "vehicleId": "v2",
    "customerId": "c28",
    "type": "reservation",
    "status": "completed",
    "start": "2026-06-04",
    "end": "2026-06-07",
    "notes": "[klient 221]"
  },
  {
    "id": "b39",
    "vehicleId": "v9",
    "customerId": "c29",
    "type": "reservation",
    "status": "completed",
    "start": "2026-06-06",
    "end": "2026-06-18",
    "notes": "[klient 037] Szymanska"
  },
  {
    "id": "b40",
    "vehicleId": "v5",
    "customerId": "c30",
    "type": "reservation",
    "status": "completed",
    "start": "2026-06-14",
    "end": "2026-06-20",
    "notes": "[klient 109]"
  },
  {
    "id": "b41",
    "vehicleId": "v1",
    "customerId": "c31",
    "type": "reservation",
    "status": "completed",
    "start": "2026-06-18",
    "end": "2026-06-30",
    "notes": "[klient 430]"
  },
  {
    "id": "b42",
    "vehicleId": "v10",
    "customerId": "c32",
    "type": "reservation",
    "status": "completed",
    "start": "2026-06-20",
    "end": "2026-06-28",
    "notes": "[klient 639]"
  },
  {
    "id": "b43",
    "vehicleId": "v1",
    "customerId": "c33",
    "type": "reservation",
    "status": "completed",
    "start": "2026-06-21",
    "end": "2026-06-27",
    "notes": "[klient 766]"
  },
  {
    "id": "b44",
    "vehicleId": "v2",
    "customerId": "c34",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-21",
    "end": "2026-07-05",
    "notes": "[klient 539] Olszowka"
  },
  {
    "id": "b45",
    "vehicleId": "v9",
    "customerId": "c35",
    "type": "reservation",
    "status": "completed",
    "start": "2026-06-21",
    "end": "2026-06-28",
    "notes": "[klient 977]"
  },
  {
    "id": "b46",
    "vehicleId": "v4",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-06-28",
    "end": "2026-07-05",
    "notes": "Ewelina Starejki 25000 doba whatsapp [tel. usuniety]",
    "dailyRate": 25000
  },
  {
    "id": "b47",
    "vehicleId": "v2",
    "customerId": "c36",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-30",
    "end": "2026-07-07",
    "notes": "[klient 080] [klient 160]"
  },
  {
    "id": "b48",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-05",
    "end": "2026-07-12",
    "notes": "[klient 429] Tunia messenger, podkladka dla dziecka 9500 doba"
  },
  {
    "id": "b49",
    "vehicleId": "v4",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-09",
    "end": "2026-07-15",
    "notes": "[klient 691] messenger 25000",
    "dailyRate": 25000
  },
  {
    "id": "b50",
    "vehicleId": "v1",
    "customerId": "c37",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-11",
    "end": "2026-07-21",
    "notes": "[klient 080] Zyzanski"
  },
  {
    "id": "b51",
    "vehicleId": "v2",
    "customerId": "c38",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-11",
    "end": "2026-07-23",
    "notes": "[klient 443]"
  },
  {
    "id": "b52",
    "vehicleId": "v2",
    "customerId": "c39",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-12",
    "end": "2026-07-23",
    "notes": "[klient 561] [klient 260]"
  },
  {
    "id": "b53",
    "vehicleId": "v2",
    "customerId": "c22",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-12",
    "end": "2026-07-22",
    "notes": "[klient 736]"
  },
  {
    "id": "b54",
    "vehicleId": "v12",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-12",
    "end": "2026-07-19",
    "notes": "[klient 394] totalmoto messenger 13000",
    "dailyRate": 13000
  },
  {
    "id": "b55",
    "vehicleId": "v1",
    "customerId": "c40",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-13",
    "end": "2026-07-20",
    "notes": "[klient 016] Travel - [klient 683] Jozwik"
  },
  {
    "id": "b56",
    "vehicleId": "v13",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-14",
    "end": "2026-07-21",
    "notes": "Ladies trip 794039651 [klient 021]"
  },
  {
    "id": "b57",
    "vehicleId": "v4",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-16",
    "end": "2026-07-26",
    "notes": "Mattthew [klient 808] 28000 isk doba",
    "dailyRate": 28000
  },
  {
    "id": "b58",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-18",
    "end": "2026-07-25",
    "notes": "[klient 458] Drewniak - od Maslany wrzucic namiot!!! 786128018"
  },
  {
    "id": "b59",
    "vehicleId": "v14",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-18",
    "end": "2026-07-25",
    "notes": "Aneta Flama wycieczka Landa terenowkami 25000 isk doba",
    "dailyRate": 25000
  },
  {
    "id": "b60",
    "vehicleId": "v1",
    "customerId": "c41",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-21",
    "end": "2026-08-04",
    "notes": "[klient 178]"
  },
  {
    "id": "b61",
    "vehicleId": "v12",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-21",
    "end": "2026-07-28",
    "notes": "Dawid Skowron 10000 isk doba",
    "dailyRate": 10000
  },
  {
    "id": "b62",
    "vehicleId": "v15",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-21",
    "end": "2026-07-28",
    "notes": "Dawid Skowron 10000 isk doba",
    "dailyRate": 10000
  },
  {
    "id": "b63",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-25",
    "end": "2026-08-06",
    "notes": "Sylwia Waszak 12000 messenger bez namiotu",
    "dailyRate": 12000
  },
  {
    "id": "b64",
    "vehicleId": "v9",
    "customerId": "c42",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-29",
    "end": "2026-08-04",
    "notes": "[klient 539] Kolipinski"
  },
  {
    "id": "b65",
    "vehicleId": "v1",
    "customerId": "c43",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-31",
    "end": "2026-08-07",
    "notes": "[klient 326]"
  },
  {
    "id": "b66",
    "vehicleId": "v3",
    "customerId": "c44",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-02",
    "end": "2026-08-16",
    "notes": "[klient 830]"
  },
  {
    "id": "b67",
    "vehicleId": "v2",
    "customerId": "c45",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-06",
    "end": "2026-08-15",
    "notes": "[klient 765]"
  },
  {
    "id": "b68",
    "vehicleId": "v1",
    "customerId": "c46",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-06",
    "end": "2026-08-18",
    "notes": "[klient 842]"
  },
  {
    "id": "b69",
    "vehicleId": "v1",
    "customerId": "c33",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-08",
    "end": "2026-08-15",
    "notes": "[klient 766]"
  },
  {
    "id": "b70",
    "vehicleId": "v2",
    "customerId": "c43",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-08",
    "end": "2026-08-12",
    "notes": "[klient 326]"
  },
  {
    "id": "b71",
    "vehicleId": "v12",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-09",
    "end": "2026-08-15",
    "notes": "[klient 904] Gnat 12000 isk doba whatsapp",
    "dailyRate": 12000
  },
  {
    "id": "b72",
    "vehicleId": "v2",
    "customerId": "c47",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-11",
    "end": "2026-08-16",
    "notes": "[klient 418]"
  },
  {
    "id": "b73",
    "vehicleId": "v7",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-13",
    "end": "2026-08-17",
    "notes": "karolina ice walkers"
  },
  {
    "id": "b74",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-13",
    "end": "2026-08-17",
    "notes": "karolina ice walkers"
  },
  {
    "id": "b75",
    "vehicleId": "v15",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-13",
    "end": "2026-08-25",
    "notes": "Aleksander Kolarczyk 10000 isk doba",
    "dailyRate": 10000
  },
  {
    "id": "b76",
    "vehicleId": "v1",
    "customerId": "c48",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-15",
    "end": "2026-08-29",
    "notes": "[klient 028]"
  },
  {
    "id": "b77",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-16",
    "end": "2026-08-25",
    "notes": "[klient 361] Paszko 12000 messenger",
    "dailyRate": 12000
  },
  {
    "id": "b78",
    "vehicleId": "v12",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-16",
    "end": "2026-08-30",
    "notes": "[klient 361] Paszko 12000 messenger",
    "dailyRate": 12000
  },
  {
    "id": "b79",
    "vehicleId": "v4",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-22",
    "end": "2026-08-30",
    "notes": "25000 [klient 908] messenger",
    "dailyRate": 25000
  },
  {
    "id": "b80",
    "vehicleId": "v2",
    "customerId": "c49",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-27",
    "end": "2026-09-01",
    "notes": "[klient 380]"
  },
  {
    "id": "b81",
    "vehicleId": "v16",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-09-18",
    "end": "2026-09-28",
    "notes": "[klient 771] [e-mail klienta usuniety] 602752959"
  },
  {
    "id": "b82",
    "vehicleId": "v13",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-09-19",
    "end": "2026-09-27",
    "notes": "[klient 766] 20000 isk doba - Arek",
    "dailyRate": 20000
  }
];

export const payments: Payment[] = [];

const vMap = new Map(vehicles.map((v) => [v.id, v]));
const cMap = new Map(customers.map((c) => [c.id, c]));
export function vehicleById(id: string) {
  return vMap.get(id);
}
export function customerById(id?: string | null) {
  return id ? cMap.get(id) : undefined;
}

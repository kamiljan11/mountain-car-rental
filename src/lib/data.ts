import type { Vehicle, Customer, Booking } from "./types";

// Fallback WYLACZNIE dla lokalnego devu bez skonfigurowanej bazy (patrz db.ts:fetchAll —
// w produkcji brak Supabase rzuca wyjatek, seed nigdy nie trafia do klienta).
//
// Dane sa SYNTETYCZNE i takie musza zostac. Wczesniejsza wersja tego pliku zawierala
// realnych klientow zaimportowanych z RentHelp — imiona, nazwiska, telefony i adresy
// e-mail 75 osob — w repozytorium, ktore bylo publiczne. Nie dokladaj tu prawdziwych
// danych nawet "tymczasowo".
//
// Flota i terminy rezerwacji zostaly zachowane, zeby kalendarz w devie wygladal
// realistycznie; zmienione sa wylacznie dane osobowe.

export const vehicles: Vehicle[] = [
  {
    "id": "v1",
    "name": "Pajero Blue",
    "plate": "TG692",
    "color": "#2563eb",
    "status": "active"
  },
  {
    "id": "v2",
    "name": "Pajero Silver",
    "plate": "SV183",
    "color": "#0ea5e9",
    "status": "active"
  },
  {
    "id": "v3",
    "name": "Vito",
    "plate": "PKP90",
    "color": "#14b8a6",
    "status": "active"
  },
  {
    "id": "v4",
    "name": "Renault Master",
    "plate": "UNZ27",
    "color": "#10b981",
    "status": "active"
  },
  {
    "id": "v5",
    "name": "Renault Master II",
    "plate": "RHR89",
    "color": "#eab308",
    "status": "active"
  },
  {
    "id": "v6",
    "name": "Trafic",
    "plate": "ROB64",
    "color": "#6366f1",
    "status": "active"
  },
  {
    "id": "v7",
    "name": "VW Caddy Beach Biały",
    "plate": "ZLH03",
    "color": "#f59e0b",
    "status": "active"
  },
  {
    "id": "v8",
    "name": "Volkswagen Caddy Beach",
    "plate": "JKF73",
    "color": "#84cc16",
    "status": "active"
  },
  {
    "id": "v9",
    "name": "Volkswagen Caddy California",
    "plate": "PYL41",
    "color": "#0891b2",
    "status": "active"
  },
  {
    "id": "v10",
    "name": "Dacia Duster - górki",
    "plate": "FZZ82",
    "color": "#06b6d4",
    "status": "active"
  },
  {
    "id": "v11",
    "name": "Dacia Duster Namiot II",
    "plate": "BPS82",
    "color": "#22c55e",
    "status": "active"
  },
  {
    "id": "v12",
    "name": "Daci Duster Namiot",
    "plate": "PFS75",
    "color": "#f43f5e",
    "status": "active"
  }
];

export const customers: Customer[] = [
  {
    "id": "c1",
    "name": "Klient Demo 01",
    "email": "klient01@example.com",
    "phone": "+48500000001",
    "source": "RentHelp"
  },
  {
    "id": "c2",
    "name": "Klient Demo 02",
    "email": "klient02@example.com",
    "phone": "+48500000002",
    "source": "RentHelp"
  },
  {
    "id": "c3",
    "name": "Klient Demo 03",
    "phone": "+48500000003",
    "source": "RentHelp"
  },
  {
    "id": "c4",
    "name": "Klient Demo 04",
    "email": "klient04@example.com",
    "phone": "+48500000004",
    "source": "RentHelp"
  },
  {
    "id": "c5",
    "name": "Klient Demo 05",
    "email": "klient05@example.com",
    "phone": "+48500000005",
    "source": "RentHelp"
  },
  {
    "id": "c6",
    "name": "Klient Demo 06",
    "email": "klient06@example.com",
    "phone": "+48500000006",
    "source": "RentHelp"
  },
  {
    "id": "c7",
    "name": "Klient Demo 07",
    "email": "klient07@example.com",
    "phone": "+48500000007",
    "source": "RentHelp"
  },
  {
    "id": "c8",
    "name": "Klient Demo 08",
    "email": "klient08@example.com",
    "phone": "+48500000008",
    "source": "RentHelp"
  },
  {
    "id": "c9",
    "name": "Klient Demo 09",
    "email": "klient09@example.com",
    "phone": "+48500000009",
    "source": "RentHelp"
  },
  {
    "id": "c10",
    "name": "Klient Demo 10",
    "email": "klient10@example.com",
    "phone": "+48500000010",
    "source": "RentHelp"
  },
  {
    "id": "c11",
    "name": "Klient Demo 11",
    "email": "klient11@example.com",
    "phone": "+48500000011",
    "source": "RentHelp"
  },
  {
    "id": "c12",
    "name": "Klient Demo 12",
    "email": "klient12@example.com",
    "phone": "+48500000012",
    "source": "RentHelp"
  },
  {
    "id": "c13",
    "name": "Klient Demo 13",
    "email": "klient13@example.com",
    "phone": "+48500000013",
    "source": "RentHelp"
  },
  {
    "id": "c14",
    "name": "Klient Demo 14",
    "email": "klient14@example.com",
    "phone": "+48500000014",
    "source": "RentHelp"
  },
  {
    "id": "c15",
    "name": "Klient Demo 15",
    "email": "klient15@example.com",
    "phone": "+48500000015",
    "source": "RentHelp"
  },
  {
    "id": "c16",
    "name": "Klient Demo 16",
    "email": "klient16@example.com",
    "phone": "+48500000016",
    "source": "RentHelp"
  },
  {
    "id": "c17",
    "name": "Klient Demo 17",
    "email": "klient17@example.com",
    "phone": "+48500000017",
    "source": "RentHelp"
  },
  {
    "id": "c18",
    "name": "Klient Demo 18",
    "email": "klient18@example.com",
    "phone": "+48500000018",
    "source": "RentHelp"
  },
  {
    "id": "c19",
    "name": "Klient Demo 19",
    "email": "klient19@example.com",
    "phone": "+48500000019",
    "source": "RentHelp"
  },
  {
    "id": "c20",
    "name": "Klient Demo 20",
    "email": "klient20@example.com",
    "phone": "+48500000020",
    "source": "RentHelp"
  },
  {
    "id": "c21",
    "name": "Klient Demo 21",
    "email": "klient21@example.com",
    "phone": "+48500000021",
    "source": "RentHelp"
  },
  {
    "id": "c22",
    "name": "Klient Demo 22",
    "email": "klient22@example.com",
    "phone": "+48500000022",
    "source": "RentHelp"
  },
  {
    "id": "c23",
    "name": "Klient Demo 23",
    "email": "klient23@example.com",
    "phone": "+48500000023",
    "source": "RentHelp"
  },
  {
    "id": "c24",
    "name": "Klient Demo 24",
    "email": "klient24@example.com",
    "phone": "+48500000024",
    "source": "RentHelp"
  },
  {
    "id": "c25",
    "name": "Klient Demo 25",
    "email": "klient25@example.com",
    "phone": "+48500000025",
    "source": "RentHelp"
  },
  {
    "id": "c26",
    "name": "Klient Demo 26",
    "email": "klient26@example.com",
    "phone": "+48500000026",
    "source": "RentHelp"
  },
  {
    "id": "c27",
    "name": "Klient Demo 27",
    "email": "klient27@example.com",
    "phone": "+48500000027",
    "source": "RentHelp"
  },
  {
    "id": "c28",
    "name": "Klient Demo 28",
    "email": "klient28@example.com",
    "phone": "+48500000028",
    "source": "RentHelp"
  },
  {
    "id": "c29",
    "name": "Klient Demo 29",
    "email": "klient29@example.com",
    "phone": "+48500000029",
    "source": "RentHelp"
  },
  {
    "id": "c30",
    "name": "Klient Demo 30",
    "email": "klient30@example.com",
    "phone": "+48500000030",
    "source": "RentHelp"
  },
  {
    "id": "c31",
    "name": "Klient Demo 31",
    "email": "klient31@example.com",
    "phone": "+48500000031",
    "source": "RentHelp"
  },
  {
    "id": "c32",
    "name": "Klient Demo 32",
    "email": "klient32@example.com",
    "phone": "+48500000032",
    "source": "RentHelp"
  },
  {
    "id": "c33",
    "name": "Klient Demo 33",
    "email": "klient33@example.com",
    "phone": "+48500000033",
    "source": "RentHelp"
  },
  {
    "id": "c34",
    "name": "Klient Demo 34",
    "email": "klient34@example.com",
    "phone": "+48500000034",
    "source": "RentHelp"
  },
  {
    "id": "c35",
    "name": "Klient Demo 35",
    "email": "klient35@example.com",
    "phone": "+48500000035",
    "source": "RentHelp"
  },
  {
    "id": "c36",
    "name": "Klient Demo 36",
    "email": "klient36@example.com",
    "phone": "+48500000036",
    "source": "RentHelp"
  },
  {
    "id": "c37",
    "name": "Klient Demo 37",
    "email": "klient37@example.com",
    "source": "RentHelp"
  },
  {
    "id": "c38",
    "name": "Klient Demo 38",
    "email": "klient38@example.com",
    "phone": "+48500000038",
    "source": "RentHelp"
  },
  {
    "id": "c39",
    "name": "Klient Demo 39",
    "email": "klient39@example.com",
    "phone": "+48500000039",
    "source": "RentHelp"
  },
  {
    "id": "c40",
    "name": "Klient Demo 40",
    "email": "klient40@example.com",
    "phone": "+48500000040",
    "source": "RentHelp"
  },
  {
    "id": "c41",
    "name": "Klient Demo 41",
    "email": "klient41@example.com",
    "phone": "+48500000041",
    "source": "RentHelp"
  },
  {
    "id": "c42",
    "name": "Klient Demo 42",
    "email": "klient42@example.com",
    "phone": "+48500000042",
    "source": "RentHelp"
  },
  {
    "id": "c43",
    "name": "Klient Demo 43",
    "email": "klient43@example.com",
    "phone": "+48500000043",
    "source": "RentHelp"
  },
  {
    "id": "c44",
    "name": "Klient Demo 44",
    "email": "klient44@example.com",
    "phone": "+48500000044",
    "source": "RentHelp"
  },
  {
    "id": "c45",
    "name": "Klient Demo 45",
    "email": "klient45@example.com",
    "phone": "+48500000045",
    "source": "RentHelp"
  },
  {
    "id": "c46",
    "name": "Klient Demo 46",
    "email": "klient46@example.com",
    "source": "RentHelp"
  },
  {
    "id": "c47",
    "name": "Klient Demo 47",
    "email": "klient47@example.com",
    "phone": "+48500000047",
    "source": "RentHelp"
  },
  {
    "id": "c48",
    "name": "Klient Demo 48",
    "email": "klient48@example.com",
    "phone": "+48500000048",
    "source": "RentHelp"
  },
  {
    "id": "c49",
    "name": "Klient Demo 49",
    "email": "klient49@example.com",
    "phone": "+48500000049",
    "source": "RentHelp"
  },
  {
    "id": "c50",
    "name": "Klient Demo 50",
    "email": "klient50@example.com",
    "phone": "+48500000050",
    "source": "RentHelp"
  },
  {
    "id": "c51",
    "name": "Klient Demo 51",
    "email": "klient51@example.com",
    "phone": "+48500000051",
    "source": "RentHelp"
  },
  {
    "id": "c52",
    "name": "Klient Demo 52",
    "email": "klient52@example.com",
    "phone": "+48500000052",
    "source": "RentHelp"
  },
  {
    "id": "c53",
    "name": "Klient Demo 53",
    "email": "klient53@example.com",
    "phone": "+48500000053",
    "source": "RentHelp"
  },
  {
    "id": "c54",
    "name": "Klient Demo 54",
    "email": "klient54@example.com",
    "phone": "+48500000054",
    "source": "RentHelp"
  },
  {
    "id": "c55",
    "name": "Klient Demo 55",
    "email": "klient55@example.com",
    "phone": "+48500000055",
    "source": "RentHelp"
  },
  {
    "id": "c56",
    "name": "Klient Demo 56",
    "email": "klient56@example.com",
    "phone": "+48500000056",
    "source": "RentHelp"
  },
  {
    "id": "c57",
    "name": "Klient Demo 57",
    "email": "klient57@example.com",
    "phone": "+48500000057",
    "source": "RentHelp"
  },
  {
    "id": "c58",
    "name": "Klient Demo 58",
    "email": "klient58@example.com",
    "phone": "+48500000058",
    "source": "RentHelp"
  },
  {
    "id": "c59",
    "name": "Klient Demo 59",
    "email": "klient59@example.com",
    "phone": "+48500000059",
    "source": "RentHelp"
  },
  {
    "id": "c60",
    "name": "Klient Demo 60",
    "email": "klient60@example.com",
    "phone": "+48500000060",
    "source": "RentHelp"
  },
  {
    "id": "c61",
    "name": "Klient Demo 61",
    "email": "klient61@example.com",
    "phone": "+48500000061",
    "source": "RentHelp"
  },
  {
    "id": "c62",
    "name": "Klient Demo 62",
    "email": "klient62@example.com",
    "phone": "+48500000062",
    "source": "RentHelp"
  },
  {
    "id": "c63",
    "name": "Klient Demo 63",
    "email": "klient63@example.com",
    "phone": "+48500000063",
    "source": "RentHelp"
  },
  {
    "id": "c64",
    "name": "Klient Demo 64",
    "email": "klient64@example.com",
    "phone": "+48500000064",
    "source": "RentHelp"
  },
  {
    "id": "c65",
    "name": "Klient Demo 65",
    "email": "klient65@example.com",
    "phone": "+48500000065",
    "source": "RentHelp"
  },
  {
    "id": "c66",
    "name": "Klient Demo 66",
    "email": "klient66@example.com",
    "phone": "+48500000066",
    "source": "RentHelp"
  },
  {
    "id": "c67",
    "name": "Klient Demo 67",
    "email": "klient67@example.com",
    "phone": "+48500000067",
    "source": "RentHelp"
  },
  {
    "id": "c68",
    "name": "Klient Demo 68",
    "email": "klient68@example.com",
    "phone": "+48500000068",
    "source": "RentHelp"
  },
  {
    "id": "c69",
    "name": "Klient Demo 69",
    "email": "klient69@example.com",
    "phone": "+48500000069",
    "source": "RentHelp"
  },
  {
    "id": "c70",
    "name": "Klient Demo 70",
    "email": "klient70@example.com",
    "phone": "+48500000070",
    "source": "RentHelp"
  },
  {
    "id": "c71",
    "name": "Klient Demo 71",
    "email": "klient71@example.com",
    "phone": "+48500000071",
    "source": "RentHelp"
  },
  {
    "id": "c72",
    "name": "Klient Demo 72",
    "email": "klient72@example.com",
    "phone": "+48500000072",
    "source": "RentHelp"
  },
  {
    "id": "c73",
    "name": "Klient Demo 73",
    "phone": "+48500000073",
    "source": "RentHelp"
  },
  {
    "id": "c74",
    "name": "Klient Demo 74",
    "email": "klient74@example.com",
    "phone": "+48500000074",
    "source": "RentHelp"
  },
  {
    "id": "c75",
    "name": "Klient Demo 75",
    "email": "klient75@example.com",
    "phone": "+48500000075",
    "source": "RentHelp"
  }
];

export const bookings: Booking[] = [
  {
    "id": "b1",
    "vehicleId": "v1",
    "customerId": "c73",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-13",
    "end": "2026-07-20",
    "external_ref": "RH-1103"
  },
  {
    "id": "b2",
    "vehicleId": "v4",
    "customerId": "c19",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-20",
    "end": "2026-06-28",
    "external_ref": "RH-1102"
  },
  {
    "id": "b3",
    "vehicleId": "v11",
    "customerId": "c6",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-21",
    "end": "2026-06-28",
    "external_ref": "RH-1101"
  },
  {
    "id": "b4",
    "vehicleId": "v11",
    "customerId": "c72",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-29",
    "end": "2026-08-04",
    "external_ref": "RH-1100"
  },
  {
    "id": "b5",
    "vehicleId": "v2",
    "customerId": "c58",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-11",
    "end": "2026-07-21",
    "external_ref": "RH-1099"
  },
  {
    "id": "b6",
    "vehicleId": "v8",
    "customerId": "c7",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-08",
    "end": "2026-08-12",
    "external_ref": "RH-1098"
  },
  {
    "id": "b7",
    "vehicleId": "v6",
    "customerId": "c61",
    "type": "reservation",
    "status": "active",
    "start": "2026-06-14",
    "end": "2026-06-20",
    "external_ref": "RH-1097"
  },
  {
    "id": "b8",
    "vehicleId": "v11",
    "customerId": "c54",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-06",
    "end": "2026-06-18",
    "external_ref": "RH-1096"
  },
  {
    "id": "b9",
    "vehicleId": "v7",
    "customerId": "c69",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-04",
    "end": "2026-06-07",
    "external_ref": "RH-1095"
  },
  {
    "id": "b10",
    "vehicleId": "v8",
    "customerId": "c38",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-05-30",
    "end": "2026-06-06",
    "external_ref": "RH-1094"
  },
  {
    "id": "b11",
    "vehicleId": "v8",
    "customerId": "c46",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-12",
    "end": "2026-07-23",
    "external_ref": "RH-1093"
  },
  {
    "id": "b12",
    "vehicleId": "v6",
    "customerId": "c23",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-04-30",
    "end": "2026-05-03",
    "external_ref": "RH-1092"
  },
  {
    "id": "b13",
    "vehicleId": "v1",
    "customerId": "c12",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-21",
    "end": "2026-08-04",
    "external_ref": "RH-1091"
  },
  {
    "id": "b14",
    "vehicleId": "v2",
    "customerId": "c21",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-15",
    "end": "2026-08-29",
    "external_ref": "RH-1090"
  },
  {
    "id": "b15",
    "vehicleId": "v9",
    "customerId": "c32",
    "type": "reservation",
    "status": "active",
    "start": "2026-05-30",
    "end": "2026-06-05",
    "external_ref": "RH-1089"
  },
  {
    "id": "b16",
    "vehicleId": "v8",
    "customerId": "c3",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-04-19",
    "end": "2026-04-26",
    "external_ref": "RH-1088"
  },
  {
    "id": "b17",
    "vehicleId": "v7",
    "customerId": "c27",
    "type": "reservation",
    "status": "active",
    "start": "2026-04-15",
    "end": "2026-04-22",
    "external_ref": "RH-1087"
  },
  {
    "id": "b18",
    "vehicleId": "v7",
    "customerId": "c57",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-30",
    "end": "2026-07-07",
    "external_ref": "RH-1084"
  },
  {
    "id": "b19",
    "vehicleId": "v6",
    "customerId": "c62",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-03",
    "end": "2026-06-07",
    "external_ref": "RH-1082"
  },
  {
    "id": "b20",
    "vehicleId": "v6",
    "customerId": "c3",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-04-19",
    "end": "2026-04-26",
    "external_ref": "RH-1081"
  },
  {
    "id": "b21",
    "vehicleId": "v9",
    "customerId": "c10",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-27",
    "end": "2026-09-01",
    "external_ref": "RH-1080"
  },
  {
    "id": "b22",
    "vehicleId": "v9",
    "customerId": "c26",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-11",
    "end": "2026-07-23",
    "external_ref": "RH-1079"
  },
  {
    "id": "b23",
    "vehicleId": "v7",
    "customerId": "c27",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-12",
    "end": "2026-07-22",
    "external_ref": "RH-1076"
  },
  {
    "id": "b24",
    "vehicleId": "v2",
    "customerId": "c48",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-08",
    "end": "2026-08-15",
    "external_ref": "RH-1074"
  },
  {
    "id": "b25",
    "vehicleId": "v3",
    "customerId": "c27",
    "type": "reservation",
    "status": "active",
    "start": "2026-04-15",
    "end": "2026-04-22",
    "external_ref": "RH-1073"
  },
  {
    "id": "b26",
    "vehicleId": "v9",
    "customerId": "c34",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-11",
    "end": "2026-08-16",
    "external_ref": "RH-1072"
  },
  {
    "id": "b27",
    "vehicleId": "v2",
    "customerId": "c48",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-21",
    "end": "2026-06-27",
    "external_ref": "RH-1071"
  },
  {
    "id": "b28",
    "vehicleId": "v2",
    "customerId": "c7",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-07-31",
    "end": "2026-08-07",
    "external_ref": "RH-1069"
  },
  {
    "id": "b29",
    "vehicleId": "v2",
    "customerId": "c51",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-03-16",
    "end": "2026-03-20",
    "external_ref": "RH-1067"
  },
  {
    "id": "b30",
    "vehicleId": "v3",
    "customerId": "c28",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-02",
    "end": "2026-08-16",
    "external_ref": "RH-1066"
  },
  {
    "id": "b31",
    "vehicleId": "v7",
    "customerId": "c74",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-06",
    "end": "2026-08-15",
    "external_ref": "RH-1065"
  },
  {
    "id": "b32",
    "vehicleId": "v1",
    "customerId": "c40",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-08-06",
    "end": "2026-08-18",
    "external_ref": "RH-1060"
  },
  {
    "id": "b33",
    "vehicleId": "v9",
    "customerId": "c71",
    "type": "reservation",
    "status": "confirmed",
    "start": "2026-06-21",
    "end": "2026-07-05",
    "external_ref": "RH-1054"
  },
  {
    "id": "b34",
    "vehicleId": "v10",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-05",
    "end": "2026-07-12",
    "notes": "Zapytanie whatsapp, 25000 ISK/doba"
  },
  {
    "id": "b35",
    "vehicleId": "v4",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-06-28",
    "end": "2026-07-05",
    "notes": "Zapytanie whatsapp, 25000 ISK/doba"
  },
  {
    "id": "b36",
    "vehicleId": "v4",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-09",
    "end": "2026-07-15",
    "notes": "Klient staly, 13000 ISK/doba"
  },
  {
    "id": "b37",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-12",
    "end": "2026-07-19",
    "notes": "Rezerwacja telefoniczna, 10000 ISK/doba"
  },
  {
    "id": "b38",
    "vehicleId": "v6",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-14",
    "end": "2026-07-21",
    "notes": "Zapytanie przez messenger, 12000 ISK/doba"
  },
  {
    "id": "b39",
    "vehicleId": "v5",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-18",
    "end": "2026-07-25",
    "notes": "Klient staly, 13000 ISK/doba"
  },
  {
    "id": "b40",
    "vehicleId": "v10",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-18",
    "end": "2026-07-25",
    "notes": "Rezerwacja telefoniczna, 10000 ISK/doba"
  },
  {
    "id": "b41",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-21",
    "end": "2026-07-28",
    "notes": "Zapytanie przez messenger, 12000 ISK/doba"
  },
  {
    "id": "b42",
    "vehicleId": "v12",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-21",
    "end": "2026-07-28",
    "notes": "Zapytanie przez messenger, 12000 ISK/doba"
  },
  {
    "id": "b43",
    "vehicleId": "v10",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-25",
    "end": "2026-08-06",
    "notes": "Rezerwacja telefoniczna, 10000 ISK/doba"
  },
  {
    "id": "b44",
    "vehicleId": "v10",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-13",
    "end": "2026-08-17",
    "notes": "Klient staly, 13000 ISK/doba"
  },
  {
    "id": "b45",
    "vehicleId": "v12",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-13",
    "end": "2026-08-25",
    "notes": "Zapytanie whatsapp, 25000 ISK/doba"
  },
  {
    "id": "b46",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-16",
    "end": "2026-08-25",
    "notes": "Zapytanie przez messenger, 12000 ISK/doba"
  },
  {
    "id": "b47",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-09",
    "end": "2026-08-15",
    "notes": "Zapytanie przez messenger, 12000 ISK/doba"
  },
  {
    "id": "b48",
    "vehicleId": "v8",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-13",
    "end": "2026-08-17",
    "notes": "Klient staly, 13000 ISK/doba"
  },
  {
    "id": "b49",
    "vehicleId": "v1",
    "customerId": null,
    "type": "service",
    "status": "confirmed",
    "start": "2026-04-28",
    "end": "2026-06-01",
    "notes": "Serwis (RentHelp import)"
  },
  {
    "id": "b50",
    "vehicleId": "v2",
    "customerId": null,
    "type": "service",
    "status": "confirmed",
    "start": "2026-04-28",
    "end": "2026-06-01",
    "notes": "Serwis (RentHelp import)"
  },
  {
    "id": "b51",
    "vehicleId": "v2",
    "customerId": null,
    "type": "service",
    "status": "confirmed",
    "start": "2024-06-11",
    "end": "2025-03-31",
    "notes": "Serwis (RentHelp import, historyczny)"
  }
];

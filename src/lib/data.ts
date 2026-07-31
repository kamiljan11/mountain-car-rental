import type { Vehicle, Customer, Booking, Payment } from "./types";

// Zaimportowane 1:1 z RentHelp (audyt 2026-07-01: Rezerwacje [33] + Kalendarz/Blokady [15] +
// Serwisy [3] + Klienci [75], zweryfikowane przez API kalendarza FullCalendar + kliknięcie
// każdej blokady). Zastępuje wcześniejszy import z CSV, który mylnie scalił kilka pojazdów
// o tej samej marce/modelu w jeden wpis bez tabliczki (np. "Mitsubishi Pajero" zamiast
// osobnych Pajero Blue/TG692 i Pajero Silver/SV183). Plik generowany.
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
    "name": "[klient 378]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c2",
    "name": "[klient 165]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c3",
    "name": "[klient 733]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c4",
    "name": "[klient 540]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c5",
    "name": "[klient 141]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c6",
    "name": "[klient 977]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c7",
    "name": "[klient 326]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c8",
    "name": "[klient 079]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c9",
    "name": "[klient 854]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c10",
    "name": "[klient 380]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c11",
    "name": "[klient 380]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c12",
    "name": "[klient 178]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c13",
    "name": "[klient 167]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c14",
    "name": "[klient 143]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c15",
    "name": "[klient 967]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c16",
    "name": "[klient 202]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c17",
    "name": "[klient 477]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c18",
    "name": "[klient 702]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c19",
    "name": "[klient 639]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c20",
    "name": "[klient 589]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c21",
    "name": "[klient 028]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c22",
    "name": "[klient 240]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c23",
    "name": "[klient 942]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c24",
    "name": "[klient 828]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c25",
    "name": "[klient 287]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c26",
    "name": "[klient 443]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c27",
    "name": "[klient 736]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c28",
    "name": "[klient 830]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c29",
    "name": "[klient 247]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c30",
    "name": "[klient 359]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c31",
    "name": "[klient 356]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c32",
    "name": "[klient 553]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c33",
    "name": "[klient 486]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c34",
    "name": "[klient 418]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c35",
    "name": "[klient 128]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c36",
    "name": "[klient 090]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c37",
    "name": "[klient 506]",
    "email": "[e-mail klienta usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c38",
    "name": "[klient 956]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c39",
    "name": "[klient 540]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c40",
    "name": "[klient 842]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c41",
    "name": "[klient 268]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c42",
    "name": "[klient 441]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c43",
    "name": "[klient 859]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c44",
    "name": "[klient 197]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c45",
    "name": "[klient 939]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c46",
    "name": "[klient 877]",
    "email": "[e-mail klienta usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c47",
    "name": "[klient 063]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c48",
    "name": "[klient 176]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c49",
    "name": "[klient 015]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c50",
    "name": "[klient 214]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c51",
    "name": "[klient 830]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c52",
    "name": "[klient 978]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c53",
    "name": "[klient 548]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c54",
    "name": "[klient 990]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c55",
    "name": "[klient 430]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c56",
    "name": "[klient 644]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c57",
    "name": "[klient 539]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c58",
    "name": "[klient 539]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c59",
    "name": "[klient 175]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c60",
    "name": "[klient 173]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c61",
    "name": "[klient 109]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c62",
    "name": "[klient 532]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c63",
    "name": "[klient 114]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c64",
    "name": "[klient 581]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c65",
    "name": "Rebel Travel",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c66",
    "name": "[klient 046]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c67",
    "name": "[klient 408]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c68",
    "name": "[klient 584]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c69",
    "name": "[klient 221]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c70",
    "name": "[klient 221]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c71",
    "name": "[klient 143]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c72",
    "name": "[klient 400]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c73",
    "name": "[klient 805]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c74",
    "name": "[klient 765]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
    "source": "RentHelp"
  },
  {
    "id": "c75",
    "name": "[klient 798]",
    "email": "[e-mail klienta usuniety]",
    "phone": "[tel. usuniety]",
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
    "notes": "[klient 429] Tunia messenger, podkładka dla dziecka 9500 doba"
  },
  {
    "id": "b35",
    "vehicleId": "v4",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-06-28",
    "end": "2026-07-05",
    "notes": "Ewelina Starejki 25000 doba whatsapp [tel. usuniety]"
  },
  {
    "id": "b36",
    "vehicleId": "v4",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-09",
    "end": "2026-07-15",
    "notes": "[klient 691] messenger 25000"
  },
  {
    "id": "b37",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-12",
    "end": "2026-07-19",
    "notes": "[klient 394] totalmoto messenger 13000"
  },
  {
    "id": "b38",
    "vehicleId": "v6",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-14",
    "end": "2026-07-21",
    "notes": "Ladies trip 794039651 [klient 021]"
  },
  {
    "id": "b39",
    "vehicleId": "v5",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-18",
    "end": "2026-07-25",
    "notes": "Aneta Flama zapytanie o wycieczkę na Landa terenówkami 25000 isk doba"
  },
  {
    "id": "b40",
    "vehicleId": "v10",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-18",
    "end": "2026-07-25",
    "notes": "[klient 458] Drewniak - od Maślany wrzucić namiot!!!!!! 786128018"
  },
  {
    "id": "b41",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-21",
    "end": "2026-07-28",
    "notes": "Dawid Skowron 10000 isk doba"
  },
  {
    "id": "b42",
    "vehicleId": "v12",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-21",
    "end": "2026-07-28",
    "notes": "Dawid Skowron 10000 isk doba"
  },
  {
    "id": "b43",
    "vehicleId": "v10",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-07-25",
    "end": "2026-08-06",
    "notes": "Sylwia Waszak 12000 messenger bez namiotu"
  },
  {
    "id": "b44",
    "vehicleId": "v10",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-13",
    "end": "2026-08-17",
    "notes": "karolina ice walkers"
  },
  {
    "id": "b45",
    "vehicleId": "v12",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-13",
    "end": "2026-08-25",
    "notes": "Aleksander Kolarczyk 10000 isk doba"
  },
  {
    "id": "b46",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-16",
    "end": "2026-08-25",
    "notes": "[klient 361] Paszko 12000 messenger"
  },
  {
    "id": "b47",
    "vehicleId": "v11",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-09",
    "end": "2026-08-15",
    "notes": "[klient 904] Gnat 12000 isk doba whatsapp"
  },
  {
    "id": "b48",
    "vehicleId": "v8",
    "customerId": null,
    "type": "block",
    "status": "confirmed",
    "start": "2026-08-13",
    "end": "2026-08-17",
    "notes": "karolina ice walkers"
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

export const payments: Payment[] = [];

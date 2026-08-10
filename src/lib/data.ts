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
    "name": "Weronika Kozlowski",
    "email": "weronika.kozlowski1@example.com",
    "phone": "+48527507442",
    "source": "RentHelp"
  },
  {
    "id": "c2",
    "name": "Maria Lewandowski",
    "email": "maria.lewandowski2@example.com",
    "phone": "+48545484208",
    "source": "RentHelp"
  },
  {
    "id": "c3",
    "name": "[klient 375] Zielinski",
    "phone": "+48555532898",
    "source": "RentHelp"
  },
  {
    "id": "c4",
    "name": "[klient 458] Kozlowski",
    "email": "jakub.kozlowski4@example.com",
    "phone": "+48510322810",
    "source": "RentHelp"
  },
  {
    "id": "c5",
    "name": "[klient 809] Dabrowski",
    "email": "karolina.dabrowski5@example.com",
    "phone": "+48546088410",
    "source": "RentHelp"
  },
  {
    "id": "c6",
    "name": "Marek Wozniak",
    "email": "marek.wozniak6@example.com",
    "phone": "+48531800297",
    "source": "RentHelp"
  },
  {
    "id": "c7",
    "name": "Adam Kowalski",
    "email": "adam.kowalski7@example.com",
    "phone": "+48504201721",
    "source": "RentHelp"
  },
  {
    "id": "c8",
    "name": "Adam Dabrowski",
    "email": "adam.dabrowski8@example.com",
    "phone": "+48526772524",
    "source": "RentHelp"
  },
  {
    "id": "c9",
    "name": "[klient 458] Jankowski",
    "email": "jakub.jankowski9@example.com",
    "phone": "+48583582937",
    "source": "RentHelp"
  },
  {
    "id": "c10",
    "name": "[klient 249] Kowalczyk",
    "email": "piotr.kowalczyk10@example.com",
    "phone": "+48533356744",
    "source": "RentHelp"
  },
  {
    "id": "c11",
    "name": "[klient 539] Szymanski",
    "email": "tomasz.szymanski11@example.com",
    "phone": "+48584719168",
    "source": "RentHelp"
  },
  {
    "id": "c12",
    "name": "[klient 375] Kozlowski",
    "email": "grzegorz.kozlowski12@example.com",
    "phone": "+48586711310",
    "source": "RentHelp"
  },
  {
    "id": "c13",
    "name": "[klient 037] Dabrowski",
    "email": "natalia.dabrowski13@example.com",
    "phone": "+48516839741",
    "source": "RentHelp"
  },
  {
    "id": "c14",
    "name": "Lukasz Mazur",
    "email": "lukasz.mazur14@example.com",
    "phone": "+48518068089",
    "source": "RentHelp"
  },
  {
    "id": "c15",
    "name": "[klient 561] Jankowski",
    "email": "michal.jankowski15@example.com",
    "phone": "+48588963925",
    "source": "RentHelp"
  },
  {
    "id": "c16",
    "name": "[klient 737] Nowak",
    "email": "monika.nowak16@example.com",
    "phone": "+48594885136",
    "source": "RentHelp"
  },
  {
    "id": "c17",
    "name": "Marek Dabrowski",
    "email": "marek.dabrowski17@example.com",
    "phone": "+48568278962",
    "source": "RentHelp"
  },
  {
    "id": "c18",
    "name": "[klient 955] Krawczyk",
    "email": "magdalena.krawczyk18@example.com",
    "phone": "+48505331337",
    "source": "RentHelp"
  },
  {
    "id": "c19",
    "name": "Marek Mazur",
    "email": "marek.mazur19@example.com",
    "phone": "+48589434218",
    "source": "RentHelp"
  },
  {
    "id": "c20",
    "name": "[klient 037] Lewandowski",
    "email": "natalia.lewandowski20@example.com",
    "phone": "+48524439091",
    "source": "RentHelp"
  },
  {
    "id": "c21",
    "name": "Ewa Lewandowski",
    "email": "ewa.lewandowski21@example.com",
    "phone": "+48578317334",
    "source": "RentHelp"
  },
  {
    "id": "c22",
    "name": "[klient 737] Nowak",
    "email": "monika.nowak22@example.com",
    "phone": "+48511650464",
    "source": "RentHelp"
  },
  {
    "id": "c23",
    "name": "[klient 539] Zielinski",
    "email": "tomasz.zielinski23@example.com",
    "phone": "+48580747410",
    "source": "RentHelp"
  },
  {
    "id": "c24",
    "name": "[klient 809] Mazur",
    "email": "karolina.mazur24@example.com",
    "phone": "+48584029238",
    "source": "RentHelp"
  },
  {
    "id": "c25",
    "name": "Julia Zielinski",
    "email": "julia.zielinski25@example.com",
    "phone": "+48509670130",
    "source": "RentHelp"
  },
  {
    "id": "c26",
    "name": "[klient 561] Wozniak",
    "email": "michal.wozniak26@example.com",
    "phone": "+48563862989",
    "source": "RentHelp"
  },
  {
    "id": "c27",
    "name": "Lukasz Lewandowski",
    "email": "lukasz.lewandowski27@example.com",
    "phone": "+48595707080",
    "source": "RentHelp"
  },
  {
    "id": "c28",
    "name": "[klient 375] Mazur",
    "email": "grzegorz.mazur28@example.com",
    "phone": "+48513265496",
    "source": "RentHelp"
  },
  {
    "id": "c29",
    "name": "[klient 809] Wozniak",
    "email": "karolina.wozniak29@example.com",
    "phone": "+48540256363",
    "source": "RentHelp"
  },
  {
    "id": "c30",
    "name": "Bartosz Dabrowski",
    "email": "bartosz.dabrowski30@example.com",
    "phone": "+48565743451",
    "source": "RentHelp"
  },
  {
    "id": "c31",
    "name": "Bartosz Dabrowski",
    "email": "bartosz.dabrowski31@example.com",
    "phone": "+48515056754",
    "source": "RentHelp"
  },
  {
    "id": "c32",
    "name": "[klient 539] Wozniak",
    "email": "tomasz.wozniak32@example.com",
    "phone": "+48524479551",
    "source": "RentHelp"
  },
  {
    "id": "c33",
    "name": "Rafal Lewandowski",
    "email": "rafal.lewandowski33@example.com",
    "phone": "+48584053497",
    "source": "RentHelp"
  },
  {
    "id": "c34",
    "name": "[klient 037] Wisniewski",
    "email": "natalia.wisniewski34@example.com",
    "phone": "+48514726819",
    "source": "RentHelp"
  },
  {
    "id": "c35",
    "name": "[klient 561] Szymanski",
    "email": "michal.szymanski35@example.com",
    "phone": "+48540425761",
    "source": "RentHelp"
  },
  {
    "id": "c36",
    "name": "[klient 955] Mazur",
    "email": "magdalena.mazur36@example.com",
    "phone": "+48528282316",
    "source": "RentHelp"
  },
  {
    "id": "c37",
    "name": "Katarzyna Kowalczyk",
    "email": "katarzyna.kowalczyk37@example.com",
    "source": "RentHelp"
  },
  {
    "id": "c38",
    "name": "Katarzyna Dabrowski",
    "email": "katarzyna.dabrowski38@example.com",
    "phone": "+48592466332",
    "source": "RentHelp"
  },
  {
    "id": "c39",
    "name": "[klient 539] Kowalczyk",
    "email": "tomasz.kowalczyk39@example.com",
    "phone": "+48563843591",
    "source": "RentHelp"
  },
  {
    "id": "c40",
    "name": "Ewa Kaminski",
    "email": "ewa.kaminski40@example.com",
    "phone": "+48533844922",
    "source": "RentHelp"
  },
  {
    "id": "c41",
    "name": "Alicja Wisniewski",
    "email": "alicja.wisniewski41@example.com",
    "phone": "+48534216536",
    "source": "RentHelp"
  },
  {
    "id": "c42",
    "name": "Rafal Wozniak",
    "email": "rafal.wozniak42@example.com",
    "phone": "+48551089376",
    "source": "RentHelp"
  },
  {
    "id": "c43",
    "name": "[klient 249] Dabrowski",
    "email": "piotr.dabrowski43@example.com",
    "phone": "+48594128808",
    "source": "RentHelp"
  },
  {
    "id": "c44",
    "name": "Adam Lewandowski",
    "email": "adam.lewandowski44@example.com",
    "phone": "+48506906632",
    "source": "RentHelp"
  },
  {
    "id": "c45",
    "name": "[klient 016] Wozniak",
    "email": "anna.wozniak45@example.com",
    "phone": "+48599674808",
    "source": "RentHelp"
  },
  {
    "id": "c46",
    "name": "[klient 458] Mazur",
    "email": "jakub.mazur46@example.com",
    "source": "RentHelp"
  },
  {
    "id": "c47",
    "name": "[klient 955] Wisniewski",
    "email": "magdalena.wisniewski47@example.com",
    "phone": "+48507228390",
    "source": "RentHelp"
  },
  {
    "id": "c48",
    "name": "[klient 080] Zielinski",
    "email": "pawel.zielinski48@example.com",
    "phone": "+48579014316",
    "source": "RentHelp"
  },
  {
    "id": "c49",
    "name": "[klient 249] Jankowski",
    "email": "piotr.jankowski49@example.com",
    "phone": "+48571898231",
    "source": "RentHelp"
  },
  {
    "id": "c50",
    "name": "Weronika Kozlowski",
    "email": "weronika.kozlowski50@example.com",
    "phone": "+48550878332",
    "source": "RentHelp"
  },
  {
    "id": "c51",
    "name": "[klient 918] Lewandowski",
    "email": "agnieszka.lewandowski51@example.com",
    "phone": "+48518774745",
    "source": "RentHelp"
  },
  {
    "id": "c52",
    "name": "Krzysztof Kowalski",
    "email": "krzysztof.kowalski52@example.com",
    "phone": "+48560086911",
    "source": "RentHelp"
  },
  {
    "id": "c53",
    "name": "Weronika Kowalski",
    "email": "weronika.kowalski53@example.com",
    "phone": "+48598981337",
    "source": "RentHelp"
  },
  {
    "id": "c54",
    "name": "Krzysztof Kaminski",
    "email": "krzysztof.kaminski54@example.com",
    "phone": "+48576788520",
    "source": "RentHelp"
  },
  {
    "id": "c55",
    "name": "Adam Krawczyk",
    "email": "adam.krawczyk55@example.com",
    "phone": "+48555798442",
    "source": "RentHelp"
  },
  {
    "id": "c56",
    "name": "Weronika Lewandowski",
    "email": "weronika.lewandowski56@example.com",
    "phone": "+48559644737",
    "source": "RentHelp"
  },
  {
    "id": "c57",
    "name": "Krzysztof Krawczyk",
    "email": "krzysztof.krawczyk57@example.com",
    "phone": "+48561401386",
    "source": "RentHelp"
  },
  {
    "id": "c58",
    "name": "Lukasz Mazur",
    "email": "lukasz.mazur58@example.com",
    "phone": "+48506812687",
    "source": "RentHelp"
  },
  {
    "id": "c59",
    "name": "Ewa Mazur",
    "email": "ewa.mazur59@example.com",
    "phone": "+48517483593",
    "source": "RentHelp"
  },
  {
    "id": "c60",
    "name": "Marek Kaminski",
    "email": "marek.kaminski60@example.com",
    "phone": "+48500711520",
    "source": "RentHelp"
  },
  {
    "id": "c61",
    "name": "[klient 016] Dabrowski",
    "email": "anna.dabrowski61@example.com",
    "phone": "+48502484676",
    "source": "RentHelp"
  },
  {
    "id": "c62",
    "name": "[klient 080] Szymanski",
    "email": "pawel.szymanski62@example.com",
    "phone": "+48562151406",
    "source": "RentHelp"
  },
  {
    "id": "c63",
    "name": "Adam Szymanski",
    "email": "adam.szymanski63@example.com",
    "phone": "+48555086987",
    "source": "RentHelp"
  },
  {
    "id": "c64",
    "name": "Julia Kowalski",
    "email": "julia.kowalski64@example.com",
    "phone": "+48587572846",
    "source": "RentHelp"
  },
  {
    "id": "c65",
    "name": "[klient 249] Wisniewski",
    "email": "piotr.wisniewski65@example.com",
    "phone": "+48577495368",
    "source": "RentHelp"
  },
  {
    "id": "c66",
    "name": "[klient 080] Kowalski",
    "email": "pawel.kowalski66@example.com",
    "phone": "+48566347504",
    "source": "RentHelp"
  },
  {
    "id": "c67",
    "name": "[klient 737] Dabrowski",
    "email": "monika.dabrowski67@example.com",
    "phone": "+48566971731",
    "source": "RentHelp"
  },
  {
    "id": "c68",
    "name": "[klient 080] Krawczyk",
    "email": "pawel.krawczyk68@example.com",
    "phone": "+48586403652",
    "source": "RentHelp"
  },
  {
    "id": "c69",
    "name": "Katarzyna Kozlowski",
    "email": "katarzyna.kozlowski69@example.com",
    "phone": "+48554845734",
    "source": "RentHelp"
  },
  {
    "id": "c70",
    "name": "[klient 080] Jankowski",
    "email": "pawel.jankowski70@example.com",
    "phone": "+48563599758",
    "source": "RentHelp"
  },
  {
    "id": "c71",
    "name": "Ewa Lewandowski",
    "email": "ewa.lewandowski71@example.com",
    "phone": "+48518937684",
    "source": "RentHelp"
  },
  {
    "id": "c72",
    "name": "[klient 080] Wozniak",
    "email": "pawel.wozniak72@example.com",
    "phone": "+48545030467",
    "source": "RentHelp"
  },
  {
    "id": "c73",
    "name": "Weronika Zielinski",
    "phone": "+48529691905",
    "source": "RentHelp"
  },
  {
    "id": "c74",
    "name": "Adam Krawczyk",
    "email": "adam.krawczyk74@example.com",
    "phone": "+48582276810",
    "source": "RentHelp"
  },
  {
    "id": "c75",
    "name": "[klient 737] Wojcik",
    "email": "monika.wojcik75@example.com",
    "phone": "+48541086040",
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

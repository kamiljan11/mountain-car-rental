import type { Customer, Vehicle, Booking } from "./types";
import { fmtDate } from "./dates";
import { differenceInCalendarDays, parseISO } from "date-fns";

export const COMPANY = {
  name: "Mountain Car Rental",
  nip: "6007230140",
  address: "Skógarhlíð 10, 105 Reykjavík, Islandia",
  phone: "+354 778 8585",
  email: "info@mountaincar.is",
  web: "https://mountaincar.is",
};

export interface ContractTemplate {
  id: string;
  name: string;
  body: string;
}

export interface Contract {
  id: string;
  number: string;
  templateId: string;
  templateName: string;
  customerId: string;
  vehicleId?: string;
  bookingId?: string;
  createdAt: string;
  status: "draft" | "sent" | "signed";
  content: string;
}

function isk(v?: number | null) {
  if (v == null) return "—";
  return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ISK";
}

const OWU = `
<h2>Ogólne Warunki Umowy „OWU”</h2>
<h3>General Conditions (EN)</h3>
<ol>
<li>The Lessor declares that he is the owner of the Vehicle that is the subject of this agreement. The Vehicle has current OC, AC, Assistance insurance policies that are an integral part of the General Insurance Conditions and has valid technical inspections and is approved for traffic.</li>
<li>The Lessor informs the Lessee that the subject of the agreement is car rental and is not a tourist event or commissioned mediation in concluding a contract for the provision of tourist services. This means, among other things, that the Lessee concludes insurance agreements (not concerning the Vehicle) in his own name and on his own account. Crossing and wading in rivers is prohibited. The insurance does not cover the costs of repairing or removing a flooded car. (Does not apply to selected models marked in the offer "4F Road")</li>
<li>Damage to the car's suspension and tires caused during use on roads marked F are not covered by insurance. (Does not apply to selected models marked in the offer "4F Road")</li>
<li>The car is provided to the Lessee with a full tank of fuel and the same is returned to the Lessor.</li>
<li>The Lessee is responsible with his/her own funds for any destruction or damage to additional equipment in the car on the day of rental in accordance with the handover/acceptance protocol.</li>
<li>Smoking tobacco products is prohibited in the car and integral parts such as the rear tent or roof tent.</li>
<li>The Lessee declares that he/she has the required authorization to drive the Vehicle and experience documented in accordance with the Rental Regulations.</li>
<li>The Lessee declares that he/she has been instructed on the method of using the Vehicle.</li>
<li>If the Lessee does not return the Vehicle within 24 hours after the date indicated in the rental agreement and does not contact the Lessor, the latter will inform the law enforcement authorities about the suspicion of theft, which will result in the total loss of the deposit and further possible financial or legal consequences.</li>
<li>The Lessee may use the Vehicle only in the territory of Iceland.</li>
<li>The Lessee is obliged to use the Vehicle in accordance with its intended purpose, in compliance with the principles of its proper use, adherence to the user's manual and procedures in the event of damage.</li>
<li>The Lessee is obliged to return the Vehicle on time and pay all amounts resulting from the agreement.</li>
<li>The Lessee is responsible for all fees and fines, etc., e.g. for improper parking or a photo from a speed camera, which the Lessor receives after the deposit return deadline.</li>
<li>If the Vehicle has been damaged as a result of a road collision, road accident, or other incident, the Lessee is obliged to immediately notify the Lessor of this fact and then proceed in accordance with the conditions provided for in the General Terms and Conditions, the content of the Rental Regulations and the Lessor's instructions.</li>
<li>The Lessee is liable for damage to the Vehicle. The Lessee's liability also covers damage caused to the additional equipment of the Vehicle.</li>
<li>The Lessee's liability for damages applies to damages incurred during the term of the rental agreement, even if they were discovered after the Vehicle was returned. In particular, this applies to the situation of deliberate concealment of damage by the Lessee.</li>
<li>The Lessee is liable for all fees, fines, additional fees for parking in a prohibited place or exceeding the purchased parking time, etc., which were charged during the time of his/her disposal of the Vehicle, unless they are a consequence of circumstances for which the Lessor is responsible.</li>
<li>The Lessee's liability (except for the obligation to pay contractual penalties) is limited by the amounts paid by insurers, under insurance concerning appropriate random events.</li>
<li>The Lessor reserves the right to withdraw from the agreement at any time if the reserved Vehicle has been previously involved in an accident or other damage or there are other important circumstances and it is not possible for the Lessee to use the Vehicle safely.</li>
<li>In such a case, the Lessor shall return the amount of the reservation fee, remuneration and deposit paid by the Lessee immediately, however, the Lessee is not entitled to any additional compensation in this respect.</li>
<li>The Lessee is not entitled to sublet the vehicle to other persons.</li>
<li>The Lessor does not consent to the use of the Leased Object outside the borders of Iceland.</li>
<li>In matters not regulated in the agreement, the provisions of the Civil Code shall apply.</li>
<li>Any disputes arising in connection with the performance of the lease agreement shall be resolved in the court competent for the Lessor.</li>
</ol>
<h3>Reservation (EN)</h3>
<ol>
<li>The car is booked after the payment of the Reservation Fee, min. 30% of the full value of the reservation.</li>
<li>In the event of cancellation of the reservation up to 30 days before, we refund 100% of the Reservation Fee. The Reservation Fee is not refundable in the event of cancellation less than 30 days from the date of reservation.</li>
<li>The remaining 70% must be paid 7 days before the first day of the Rental.</li>
<li>In the event of cancellation less than 7 days before the rental date, we refund 70% of the total Rental amount. The reservation fee is not refunded. In the event of no receipt of funds 7 days before the reservation date, the parties agree that the Lessee has cancelled the vehicle rental and the paid Reservation Fee is not refundable.</li>
<li>The deposit is refunded 7 days after the end of the reservation or 7 days after the earlier return of the car.</li>
<li>The duration of the contract can be extended only with the express consent of the Lessor.</li>
<li>The consent of the lessor can be expressed by phone or confirmed by text message.</li>
<li>After the expiry of the contract period, the Lessee is obliged to immediately return the Vehicle to the Lessor. In the event of failure to return the Vehicle, despite the expiry of the contract period, the Lessee is obliged to pay a contractual penalty of ISK 300,000.</li>
<li>Lessee's data required for rental: name and surname; social security number (SSN); date of issue and date of collection of the car; place of issue and return of the car; email, phone number; address (country, postal code, city, street); ID card number and date of issue; driving license number and date of issue.</li>
<li>The issue and collection of the Vehicle is based on the handover protocol.</li>
</ol>
<h3>Additional equipment</h3>
<ul>
<li>iKamper Sky 3000 roof tent + internal tent insulation, THULE, Easy Camp or other</li>
<li>ECOFLOW PRO power generator (in selected models)</li>
<li>electric fridge 12V–220V</li>
<li>iKamper gas cooker or other</li>
<li>portable toilet (in selected models and on special request)</li>
<li>Internet router · chairs and table · sleeping bags</li>
<li>pot, frying pan, set of plates and cutlery for 2–5 people · night lamp</li>
<li>car tent on the tailgate (in selected models)</li>
</ul>
<h2>Warunki ogólne (PL)</h2>
<ol>
<li>Wynajmujący oświadcza, że jest właścicielem Pojazdu będącego przedmiotem niniejszej umowy. Pojazd posiada aktualną polisę OC, AC, Assistance stanowiące integralną całość z Ogólnymi Warunkami Ubezpieczenia oraz ma ważne badania techniczne i jest dopuszczony do ruchu.</li>
<li>Wynajmujący informuje Najemcę, że przedmiotem umowy jest wynajem samochodu i nie jest to impreza turystyczna, ani pośredniczenie na zlecenie w zawarciu umowy o świadczenie usług turystycznych. Oznacza to między innymi, że Najemca zawiera umowy ubezpieczenia (niedotyczące Pojazdu) we własnym imieniu i na własny rachunek.</li>
<li>Zabronione jest przekraczanie, brodzenie w rzekach. Ubezpieczenie nie pokrywa kosztów naprawy czy usunięcia zatopionego samochodu. (Nie dotyczy wybranych modeli oznaczonych w ofercie "4F Road")</li>
<li>Uszkodzenia zawieszenia samochodu i opon powstałe podczas użytkowania na drogach oznaczonych F nie są objęte ubezpieczeniem. (Nie dotyczy wybranych modeli oznaczonych w ofercie "4F Road")</li>
<li>Samochód podstawiony Najemcy z pełnym bakiem paliwa i taki sam zostaje zwrócony Wynajmującemu.</li>
<li>Najemca odpowiada swoimi środkami pieniężnymi za zniszczenia lub uszkodzenia sprzętu dodatkowego znajdującego się w samochodzie w dniu wynajmu zgodnie z protokołem zdawczo-odbiorczym.</li>
<li>Palenie wyrobów tytoniowych jest zabronione w samochodzie i integralnej części jak namiot tylny lub namiot dachowy.</li>
<li>Najemca oświadcza, że posiada wymagane uprawnienia do kierowania Pojazdem i doświadczenie udokumentowane zgodnie z Regulaminem Najmu.</li>
<li>Najemca oświadcza, że został pouczony o sposobie eksploatacji Pojazdu.</li>
<li>Jeżeli Najemca nie zwróci Pojazdu do 24 godzin po terminie wskazanym w umowie najmu i nie skontaktuje się z Wynajmującym, ten poinformuje organy ścigania o podejrzeniu kradzieży, co spowoduje całkowitą utratę kaucji i dalsze ewentualne konsekwencje finansowe lub prawne.</li>
<li>Najemca może używać Pojazdu jedynie na terytorium Islandii.</li>
<li>Najemca jest zobowiązany do korzystania z Pojazdu zgodnie z jego przeznaczeniem, z zachowaniem zasad jego prawidłowej eksploatacji, przestrzegania instrukcji użytkownika oraz procedur postępowania na wypadek szkody.</li>
<li>Najemca zobowiązany jest do terminowego zwrotu Pojazdu oraz zapłaty wszelkich kwot wynikających z umowy.</li>
<li>Najemca odpowiada za wszystkie opłaty i mandaty itp., np. za złe parkowanie lub zdjęcie z fotoradaru, które otrzyma Wynajmujący po terminie zwrotu kaucji.</li>
<li>Jeżeli Pojazd został uszkodzony w wyniku kolizji drogowej, wypadku drogowego lub innego zdarzenia, Najemca zobowiązany jest do natychmiastowego powiadomienia o tym fakcie Wynajmującego, a następnie do postępowania zgodnie z warunkami przewidzianymi w OWU, treści Regulaminu Najmu oraz poleceniami Wynajmującego.</li>
<li>Najemca ponosi odpowiedzialność za szkody w Pojeździe. Odpowiedzialność Najemcy obejmuje również szkody wyrządzone w wyposażeniu dodatkowym Pojazdu.</li>
<li>Odpowiedzialność odszkodowawcza Najemcy dotyczy szkód powstałych w czasie trwania umowy najmu, choćby ich wykrycie nastąpiło po zwrocie Pojazdu. W szczególności dotyczy to sytuacji celowego ukrycia szkody przez Najemcę.</li>
<li>Najemca ponosi odpowiedzialność za wszelkie opłaty, mandaty karne, opłaty dodatkowe za parkowanie w miejscu niedozwolonym lub ponad wykupiony czas parkowania itp., które zostały naliczone w czasie dysponowania przez niego Pojazdem, chyba że są one następstwem okoliczności, za które odpowiedzialność ponosi Wynajmujący.</li>
<li>Odpowiedzialność Najemcy (za wyjątkiem obowiązku zapłaty kar umownych) jest ograniczona o kwoty wypłacone przez ubezpieczycieli z tytułu ubezpieczeń dotyczących odpowiednich zdarzeń losowych.</li>
<li>Wynajmujący zastrzega sobie prawo do odstąpienia od umowy w każdej chwili, jeżeli zarezerwowany Pojazd ulegnie wcześniejszemu wypadkowi lub innemu uszkodzeniu lub istnieją inne ważne okoliczności i nie ma możliwości bezpiecznego użytkowania Pojazdu przez Najemcę. W takim przypadku Wynajmujący zwraca kwotę opłaty rezerwacyjnej, wynagrodzenie oraz kaucję wpłaconą przez Najemcę w trybie natychmiastowym, jednak z tego tytułu nie należy się Najemcy żadne dodatkowe odszkodowanie.</li>
<li>Najemca nie jest uprawniony do podnajmowania pojazdu innym osobom.</li>
<li>Wynajmujący nie wyraża zgody na używanie Przedmiotu Najmu poza granicami Islandii.</li>
<li>W sprawach nieuregulowanych w umowie stosuje się przepisy Kodeksu Cywilnego.</li>
<li>Wszelkie spory powstałe w związku z realizacją umowy najmu będą rozpatrywane w Sądzie właściwym dla Wynajmującego.</li>
</ol>
<h3>Rezerwacja (PL)</h3>
<ol>
<li>Rezerwacja samochodu następuje po wpłacie Opłaty Rezerwacyjnej min. 30% wartości pełnej rezerwacji.</li>
<li>W przypadku rezygnacji z rezerwacji do 30 dni przed zwracamy 100% Opłaty Rezerwacyjnej. Opłata Rezerwacyjna nie podlega zwrotowi w przypadku rezygnacji mniej niż na 30 dni od daty rezerwacji.</li>
<li>Pozostałe 70% należy wpłacić na 7 dni przed pierwszym dniem Najmu.</li>
<li>W przypadku rezygnacji mniej niż 7 dni przed dniem wynajmu zwracamy 70% całkowitej kwoty Najmu. Opłata rezerwacyjna nie zostaje zwrócona.</li>
<li>W przypadku braku wpływu środków na 7 dni przed datą rezerwacji strony zgodnie przyjmują, że Najemca zrezygnował z wynajmu pojazdu, a wpłacona Opłata Rezerwacyjna nie podlega zwrotowi.</li>
<li>Zwrot kaucji następuje 7 dni po zakończeniu rezerwacji lub 7 dni po wcześniejszym zwrocie samochodu.</li>
<li>Czas trwania umowy może być przedłużony jedynie za wyraźną zgodą Wynajmującego. Zgoda może być wyrażona telefonicznie lub potwierdzona sms-em.</li>
<li>Po upływie czasu trwania umowy Najemca zobowiązany jest niezwłocznie zwrócić Wynajmującemu Pojazd. W przypadku braku zwrotu Pojazdu, pomimo upływu czasu trwania umowy, Najemca jest zobowiązany do zapłaty kary umownej w wysokości 300 000 ISK.</li>
<li>Dane najemcy potrzebne do wynajmu: imię i nazwisko; PESEL; data wydania i data odbioru auta; miejsce wydania i oddania auta; email, nr tel.; adres (kraj, kod pocztowy, miasto, ulica); nr dowodu osobistego i data wydania; nr prawa jazdy i data wydania.</li>
<li>Wydanie i odbiór Pojazdu następuje w oparciu o protokół zdawczo-odbiorczy.</li>
</ol>
<h3>Wyposażenie dodatkowe</h3>
<ul>
<li>namiot dachowy iKamper Sky 3000 + ocieplenie namiotu wewnętrzne, THULE, Easy Camp lub inny</li>
<li>generator prądu ECOFLOW PRO (w wybranych modelach)</li>
<li>lodówka elektryczna 12V–220V</li>
<li>kuchenka gazowa iKamper lub inna</li>
<li>toaleta przenośna (w wybranych modelach oraz na specjalne życzenie)</li>
<li>router Internetu · krzesła i stolik · śpiwory</li>
<li>garnek, patelnia, zestaw talerzy i sztućców dla 2–5 osób · lampka nocna</li>
<li>namiot samochodowy na klapę tylną (w wybranych modelach)</li>
</ul>`;

const UMOWA = `
<h1>Umowa wypożyczenia samochodu</h1>
<div class="muted">numer {{NUMER}} · zawarta dnia {{DATA_ZAWARCIA}}</div>
<div class="parties">
  <div>
    <h3>Najemca</h3>
    <p>{{NAJEMCA}}<br/>{{NAJEMCA_ADRES}}<br/>Dokument tożsamości: {{NAJEMCA_DOK}}<br/>PESEL: {{NAJEMCA_PESEL}}<br/>Prawo jazdy: {{NAJEMCA_PJ}}<br/>Tel.: {{NAJEMCA_TEL}}<br/>{{NAJEMCA_EMAIL}}</p>
  </div>
  <div>
    <h3>Wynajmujący</h3>
    <p>{{FIRMA}}<br/>{{FIRMA_ADRES}}<br/>NIP: {{FIRMA_NIP}}<br/>{{FIRMA_WWW}}<br/>{{FIRMA_EMAIL}}<br/>tel.: {{FIRMA_TEL}}</p>
  </div>
</div>
<h2>Przedmiot umowy</h2>
<p>Samochód: <strong>{{POJAZD}}</strong> · Nr rejestracji: {{NR_REJ}} · VIN: {{VIN}}</p>
<table class="kv">
  <tr><td>Data wydania</td><td>{{DATA_WYDANIA}}</td></tr>
  <tr><td>Miejsce wydania</td><td>{{MIEJSCE_WYD}}</td></tr>
  <tr><td>Data zwrotu</td><td>{{DATA_ZWROTU}}</td></tr>
  <tr><td>Miejsce zwrotu</td><td>{{MIEJSCE_ZWR}}</td></tr>
  <tr><td>Okres wypożyczenia</td><td>{{DNI}} dób</td></tr>
  <tr><td>Całkowity limit kilometrów</td><td>{{LIMIT_KM}}</td></tr>
  <tr><td>Kaucja zwrotna za samochód</td><td>{{KAUCJA}}</td></tr>
  <tr><td>Udział własny w szkodzie</td><td>{{UDZIAL}}</td></tr>
</table>
<p>Kwota za okres wypożyczenia: <span class="amount">{{KWOTA}}</span> ({{STAWKA}} / doba)</p>
<p class="total">Kwota całkowita do zapłaty: {{KWOTA}}</p>
<p class="muted">(data i podpis Najemcy oznacza akceptację OWU stanowiących załącznik do umowy)</p>
<p>w imieniu {{FIRMA}}: {{PRACOWNIK}}, dnia {{DATA_ZAWARCIA}}</p>
<div class="sign"><span>data i podpis Najemcy</span><span>podpis Wynajmującego</span></div>
${OWU}`;

const WYDANIE = `
<h1>Protokół wydania pojazdu</h1>
<div class="muted">{{FIRMA}} · {{NR_REJ}} · do umowy nr {{NUMER}}{{REZ}}</div>
<table class="kv">
  <tr><td>Data i godzina wydania</td><td>{{DATA_PROTOKOL}}</td></tr>
  <tr><td>Miejsce wydania</td><td>{{MIEJSCE_WYD}}</td></tr>
  <tr><td>Pojazd</td><td>{{POJAZD}}</td></tr>
  <tr><td>VIN</td><td>{{VIN}}</td></tr>
</table>
<div class="parties">
  <div><h3>Wynajmujący</h3><p>{{FIRMA}}<br/>NIP: {{FIRMA_NIP}}<br/>{{FIRMA_ADRES}}<br/>{{FIRMA_TEL}} · {{FIRMA_EMAIL}}</p></div>
  <div><h3>Najemca</h3><p>{{NAJEMCA}}<br/>PESEL: {{NAJEMCA_PESEL}}<br/>Prawo jazdy: {{NAJEMCA_PJ}}<br/>{{NAJEMCA_TEL}} · {{NAJEMCA_EMAIL}}</p></div>
</div>
<h2>Stan pojazdu przy wydaniu</h2>
<table class="kv">
  <tr><td>Przebieg pojazdu</td><td>______________ km</td></tr>
  <tr><td>Stan paliwa</td><td>______________ %</td></tr>
  <tr><td>Czystość — wnętrze</td><td>☐ czyste&nbsp;&nbsp;☐ do czyszczenia</td></tr>
  <tr><td>Czystość — karoseria</td><td>☐ czysta&nbsp;&nbsp;☐ do mycia</td></tr>
  <tr><td>Uszkodzenia — karoseria</td><td>☐ brak&nbsp;&nbsp;☐ małe&nbsp;&nbsp;☐ średnie&nbsp;&nbsp;☐ duże</td></tr>
  <tr><td>Uszkodzenia — wnętrze</td><td>☐ brak&nbsp;&nbsp;☐ małe&nbsp;&nbsp;☐ średnie&nbsp;&nbsp;☐ duże</td></tr>
</table>
<h3>Dodatkowe uwagi</h3>
<p>....................................................................................................................</p>
<p class="muted">Najemca akceptuje powyższe szczegóły najmu oraz opis stanu samochodu.</p>
<div class="sign"><span>podpis Najemcy</span><span>podpis Wydającego ({{PRACOWNIK}})</span></div>`;

const ZWROT = `
<h1>Protokół zwrotu pojazdu</h1>
<div class="muted">{{FIRMA}} · {{NR_REJ}} · do umowy nr {{NUMER}}{{REZ}}</div>
<table class="kv">
  <tr><td>Data i godzina zwrotu</td><td>{{DATA_PROTOKOL}}</td></tr>
  <tr><td>Miejsce zwrotu</td><td>{{MIEJSCE_ZWR}}</td></tr>
  <tr><td>Pojazd</td><td>{{POJAZD}}</td></tr>
  <tr><td>VIN</td><td>{{VIN}}</td></tr>
</table>
<div class="parties">
  <div><h3>Wynajmujący</h3><p>{{FIRMA}}<br/>NIP: {{FIRMA_NIP}}<br/>{{FIRMA_TEL}} · {{FIRMA_EMAIL}}</p></div>
  <div><h3>Najemca</h3><p>{{NAJEMCA}}<br/>{{NAJEMCA_TEL}} · {{NAJEMCA_EMAIL}}</p></div>
</div>
<h2>Stan pojazdu przy zwrocie</h2>
<table class="kv">
  <tr><td>Przebieg pojazdu</td><td>______________ km</td></tr>
  <tr><td>Stan paliwa</td><td>______________ %</td></tr>
  <tr><td>Nowe uszkodzenia — karoseria</td><td>☐ brak&nbsp;&nbsp;☐ małe&nbsp;&nbsp;☐ średnie&nbsp;&nbsp;☐ duże</td></tr>
  <tr><td>Nowe uszkodzenia — wnętrze</td><td>☐ brak&nbsp;&nbsp;☐ małe&nbsp;&nbsp;☐ średnie&nbsp;&nbsp;☐ duże</td></tr>
  <tr><td>Rozliczenie kaucji {{KAUCJA}}</td><td>☐ zwrócona w całości&nbsp;&nbsp;☐ potrącenie ________</td></tr>
</table>
<h3>Dodatkowe uwagi</h3>
<p>....................................................................................................................</p>
<div class="sign"><span>podpis Najemcy</span><span>podpis Przyjmującego ({{PRACOWNIK}})</span></div>`;

export const TEMPLATES: ContractTemplate[] = [
  { id: "umowa", name: "Umowa wypożyczenia samochodu", body: UMOWA },
  { id: "wydanie", name: "Protokół wydania pojazdu", body: WYDANIE },
  { id: "zwrot", name: "Protokół zwrotu pojazdu", body: ZWROT },
];

const DASH = "————";

export function buildFilled(
  template: ContractTemplate,
  ctx: {
    number: string;
    customer?: Customer;
    vehicle?: Vehicle;
    booking?: Booking;
    employee?: string;
    date: string;
  },
) {
  const { customer, vehicle, booking } = ctx;
  const dni =
    booking != null
      ? String(differenceInCalendarDays(parseISO(booking.end), parseISO(booking.start)) + 1)
      : DASH;
  const rez = booking?.external_ref ? ` · rezerwacja ${booking.external_ref}` : "";
  const map: Record<string, string> = {
    NUMER: ctx.number,
    REZ: rez,
    DATA_ZAWARCIA: ctx.date,
    DATA_PROTOKOL: ctx.date,
    FIRMA: COMPANY.name,
    FIRMA_ADRES: COMPANY.address,
    FIRMA_NIP: COMPANY.nip,
    FIRMA_WWW: COMPANY.web,
    FIRMA_EMAIL: COMPANY.email,
    FIRMA_TEL: COMPANY.phone,
    NAJEMCA: customer?.name ?? DASH,
    NAJEMCA_ADRES: customer?.address ?? DASH,
    NAJEMCA_DOK: DASH,
    NAJEMCA_PESEL: customer?.id_number ?? DASH,
    NAJEMCA_PJ: customer?.license ?? DASH,
    NAJEMCA_TEL: customer?.phone ?? DASH,
    NAJEMCA_EMAIL: customer?.email ?? DASH,
    POJAZD: vehicle?.name ?? DASH,
    NR_REJ: vehicle?.plate ?? DASH,
    VIN: vehicle?.vin ?? DASH,
    DATA_WYDANIA: booking ? fmtDate(booking.start) : DASH,
    DATA_ZWROTU: booking ? fmtDate(booking.end) : DASH,
    MIEJSCE_WYD: "Keflavík / wg ustaleń",
    MIEJSCE_ZWR: "Keflavík / wg ustaleń",
    DNI: dni,
    LIMIT_KM: "Brak limitu",
    KAUCJA: isk(booking?.deposit ?? 0),
    UDZIAL: "0 ISK",
    KWOTA: isk(booking?.total),
    STAWKA: isk(booking?.dailyRate ?? vehicle?.dailyRate),
    PRACOWNIK: ctx.employee || DASH,
  };
  return template.body.replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? DASH);
}

const KEY = "rebel_contracts_v1";

export function getContracts(): Contract[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveContract(c: Contract) {
  const all = getContracts();
  all.unshift(c);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function contractsForCustomer(id: string) {
  return getContracts().filter((c) => c.customerId === id);
}

export function makeNumber() {
  return `${getContracts().length + 1}/06/2026`;
}

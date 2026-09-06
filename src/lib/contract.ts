import type { Customer, Vehicle, Booking, CustomerDocument } from "./types";
import { isCompanyCustomer, DOC_TYPES } from "./types";
import { COMPANIES, type Company } from "./company";
import { fmtDate, todayISO } from "./dates";
import { differenceInCalendarDays, parseISO } from "date-fns";

// Tozsamosc wynajmujacego mieszka w ./company — tu tylko z niej korzystamy.


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
  // E-podpis: gdy signedAt ustawione → umowa PODPISANA (signerName kto, kiedy).
  // signToken → link publiczny /sign/[token] (podgląd read-only, ważny 14 dni).
  signedAt?: string;
  signerName?: string;
  signToken?: string;
}

export function isk(v?: number | null) {
  if (v == null) return "—";
  return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ISK";
}

const OWU = `
<h2>Ogólne Warunki Umowy „OWU”</h2>
<h3>General Conditions (EN)</h3>
<h4>§1. General declarations</h4>
<ol>
<li>The Lessor declares that he is the owner of the Vehicle that is the subject of this agreement. The Vehicle has current OC, AC, Assistance insurance policies that are an integral part of the General Insurance Conditions and has valid technical inspections and is approved for traffic.</li>
<li>The Lessor informs the Lessee that the subject of the agreement is car rental and is not a tourist event or commissioned mediation in concluding a contract for the provision of tourist services. This means, among other things, that the Lessee concludes insurance agreements (not concerning the Vehicle) in his own name and on his own account.</li>
<li>The Lessee declares that he/she has been instructed on the method of using the Vehicle and — pursuant to the information duty under the Icelandic Act on the Rental of Registrable Vehicles no. 65/2015 — has been informed about Icelandic traffic rules and road signs, the statutory ban on off-road driving, the risks of Icelandic weather (in particular sudden strong wind) and the presence of animals (sheep, birds) on roads.</li>
</ol>
<h4>§2. Drivers</h4>
<ol>
<li>The Vehicle may be driven ONLY by the Lessee and the additional drivers named in this agreement. Each driver must be at least 20 years old and must have held a valid driving licence for a minimum of 1 year.</li>
<li>If the Vehicle is driven by a person not named in this agreement, ALL waivers and liability limitations under this agreement become null and void, the Lessee bears full liability for any damage jointly and severally with the actual driver, and the Lessor may charge a contractual fee of ISK 45,000.</li>
<li>The Lessee is not entitled to sublet the Vehicle or hand it over to third parties for use.</li>
</ol>
<h4>§3. Permitted use — territory and roads</h4>
<ol>
<li>The Lessee may use the Vehicle only in the territory of Iceland (island of Iceland; ferries to Vestmannaeyjar or abroad require the Lessor's prior written consent).</li>
<li>OFF-ROAD DRIVING IS STRICTLY PROHIBITED AND ILLEGAL IN ICELAND (Nature Conservation Act no. 60/2013). Police fines reach ISK 1,000,000. In case of off-road driving the Lessee: (a) pays all public fines and land-restoration costs, (b) loses all waivers and bears full cost of any damage, (c) pays the Lessor an additional contractual fee of ISK 300,000.</li>
<li>Crossing and wading in rivers or any watercourse is prohibited. NO insurance covers water damage — the Lessee bears the FULL cost of repairing or replacing a flooded Vehicle, including engine damage and recovery costs. (Does not apply to selected models marked in the offer "4F Road", excluding deep river crossings which are always at the Lessee's own risk.)</li>
<li>Driving on mountain roads marked "F" and on roads officially closed by road.is is prohibited for Vehicles other than those marked "4F Road" in the offer. Breach: minimum contractual fee of ISK 75,000 plus full liability for all resulting damage. Damage to the suspension, underbody and tires caused on F-roads is never covered by insurance.</li>
<li>The Lessee must follow official Icelandic weather warnings (vedur.is) and road closures (umferdin.is / road.is). Driving into an area under an official storm warning is at the Lessee's sole risk and cost.</li>
<li>Racing, rally driving, towing other vehicles, driving lessons and carrying passengers or goods for reward are prohibited.</li>
</ol>
<h4>§4. Lessee's liability — damage not covered by any insurance or waiver</h4>
<ol>
<li>The Lessee is liable for damage to the Vehicle and its additional equipment arising during the rental period, even if discovered after return (in particular in case of deliberate concealment of damage).</li>
<li>The following damage is NEVER covered by insurance or any waiver and is paid in full by the Lessee: (a) damage to the underbody, chassis, transmission, clutch and drive shaft (including damage from gravel roads, potholes and rocks); (b) water damage of any kind, including river crossings, flooding, waves and sea spray; (c) doors, bonnet or tailgate damaged by wind (wind-blown doors) — a common and costly damage in Iceland, always check the wind before opening doors; (d) damage caused by sand, ash, pumice or gravel storms; (e) tires, rims, wheels, suspension and windshield unless separately insured; (f) interior damage, burns and stains; (g) refuelling with wrong fuel — full cost of repair and towing; (h) loss of keys, documents or registration plates — replacement cost plus ISK 10,000 handling fee; (i) collision with animals when the speed or manner of driving was not adapted to conditions; (j) damage resulting from ignoring warning lights or abnormal noises.</li>
<li>Driving under the influence of alcohol, drugs or medication impairing driving ability voids ALL waivers. The Lessee then bears full, unlimited liability for all damage, the statutory recourse of the insurer (Icelandic Act no. 30/2019) applies, and the Lessor charges an additional contractual fee of ISK 150,000.</li>
<li>All waivers are also void in case of gross negligence, intentional damage, or use of the Vehicle contrary to this agreement.</li>
<li>The Lessee's liability is not limited to the amount of the deposit. The deposit may be withheld until final assessment of damage, fines and fees, and its retention does not exclude claims exceeding the deposit.</li>
<li>The Lessee's liability (except for the obligation to pay contractual fees) is reduced by the amounts actually paid by insurers under insurance covering the relevant events.</li>
</ol>
<h4>§5. Accident and damage procedure</h4>
<ol>
<li>In case of any collision, accident, theft or damage, the Lessee must immediately notify the Lessor and follow the Lessor's instructions. In case of a collision with another vehicle, personal injury, theft, or a collision with an animal, the police (112) must additionally be notified at the scene.</li>
<li>The Lessee must deliver to the Lessor a written report of the event (with photos, if possible) no later than 12 hours after the event. Failure to report within this period or leaving the scene results in the Lessee's full liability for the damage irrespective of any waiver.</li>
<li>The Lessee must not admit liability towards third parties on behalf of the Lessor and must obtain the details of participants and witnesses where possible.</li>
</ol>
<h4>§6. Fuel, cleanliness, returning the Vehicle</h4>
<ol>
<li>The car is provided to the Lessee with a full tank of fuel and must be returned with a full tank. Missing fuel is charged at cost plus a service fee of ISK 5,000.</li>
<li>Smoking (including e-cigarettes) is prohibited in the Vehicle and its integral parts such as the rear tent or roof tent — contractual fee of ISK 50,000.</li>
<li>The Vehicle must be returned in a reasonably clean condition. Excessive dirt (sand, mud, animal hair, food residues, odours) is charged up to ISK 30,000 according to actual cleaning cost.</li>
<li>Return of the Vehicle more than 1 hour after the agreed time without the Lessor's consent: a fee equal to one full daily rate plus ISK 10,000 for each commenced day of delay.</li>
<li>If the Lessee does not return the Vehicle within 24 hours after the return date indicated in this agreement and does not contact the Lessor, the Lessor will inform the police of suspected theft (unauthorised use), which results in the total loss of the deposit, a contractual penalty of ISK 300,000 and further financial and legal consequences.</li>
<li>If the Vehicle is abandoned or left elsewhere than the agreed return place, the Lessee pays the cost of retrieval: ISK 400 per km from the Lessor's office, minimum ISK 35,000, plus any towing costs.</li>
</ol>
<h4>§7. Fines, tolls and kilometre charge</h4>
<ol>
<li>The Lessee is liable for all fines, tolls, parking fees and penalties (including speed-camera photos) arising during the rental period, also when received by the Lessor after the deposit has been returned. For handling each fine/toll the Lessor charges an administrative fee of ISK 4,500.</li>
<li>Kilometre charge (kílómetragjald, Icelandic Act no. 100/2025): the statutory per-kilometre charge for the kilometres actually driven during the rental is borne by the Lessee. Odometer readings at handover and at return are recorded in this agreement and its protocols; the charge is passed on at the statutory rate without mark-up and itemised separately.</li>
</ol>
<h4>§8. Payments and card authorisation</h4>
<ol>
<li>The Lessee's signature on this agreement constitutes authorisation for the Lessor to charge the Lessee's payment card (or claim payment otherwise) for: rent, deposit, damage for which the Lessee is liable, contractual fees listed in these OWU, fuel, cleaning, fines, tolls and the kilometre charge — for a period of up to 6 months after the end of the rental, with prior notice by e-mail with an itemised statement.</li>
</ol>
<h4>§9. Lessor's rights, telematics, final provisions</h4>
<ol>
<li>The Lessor may withdraw from the agreement at any time if the reserved Vehicle has been previously involved in an accident or other damage or there are other important circumstances and it is not possible for the Lessee to use the Vehicle safely. In such a case the Lessor immediately returns the reservation fee, remuneration and deposit paid by the Lessee; no additional compensation is due.</li>
<li>In case of a material breach of this agreement (in particular §2–§3), the Lessor may terminate the rental and repossess the Vehicle without prior notice, at the Lessee's cost; amounts paid for the unused period are not refunded.</li>
<li>The Vehicle may be equipped with a GPS/telematics device recording location and speed. The data is processed by the Lessor solely to protect the Vehicle and to enforce this agreement, in accordance with data-protection law.</li>
<li>This agreement may be concluded and signed electronically; an electronic signature (eIDAS, Icelandic Act no. 55/2019) is binding like a handwritten one.</li>
<li>This agreement is governed by Icelandic law, in particular Act no. 65/2015 on the rental of registrable vehicles. Disputes will be resolved by the District Court of Reykjanes (Héraðsdómur Reykjaness), without prejudice to mandatory consumer venue rules.</li>
</ol>
<h3>Reservation (EN)</h3>
<ol>
<li>The car is booked after the payment of the Reservation Fee, min. 30% of the full value of the reservation.</li>
<li>In the event of cancellation of the reservation up to 30 days before, we refund 100% of the Reservation Fee. The Reservation Fee is not refundable in the event of cancellation less than 30 days from the date of reservation.</li>
<li>The remaining 70% must be paid 7 days before the first day of the Rental.</li>
<li>In the event of cancellation less than 7 days before the rental date, we refund 70% of the total Rental amount. The reservation fee is not refunded. In the event of no receipt of funds 7 days before the reservation date, the parties agree that the Lessee has cancelled the vehicle rental and the paid Reservation Fee is not refundable.</li>
<li>The deposit is refunded 7 days after the end of the reservation or 7 days after the earlier return of the car.</li>
<li>Early return of the Vehicle does not entitle the Lessee to a refund for the unused rental period.</li>
<li>The duration of the contract can be extended only with the express consent of the Lessor.</li>
<li>The consent of the lessor can be expressed by phone or confirmed by text message.</li>
<li>Lessee's data required for rental: name and surname; kennitala / PESEL / national ID number; date of issue and date of collection of the car; place of issue and return of the car; email, phone number; address (country, postal code, city, street); ID card or passport number and date of issue; driving license number and date of issue; names and licence numbers of additional drivers.</li>
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
<h4>§1. Oświadczenia ogólne</h4>
<ol>
<li>Wynajmujący oświadcza, że jest właścicielem Pojazdu będącego przedmiotem niniejszej umowy. Pojazd posiada aktualną polisę OC, AC, Assistance stanowiące integralną całość z Ogólnymi Warunkami Ubezpieczenia oraz ma ważne badania techniczne i jest dopuszczony do ruchu.</li>
<li>Wynajmujący informuje Najemcę, że przedmiotem umowy jest wynajem samochodu i nie jest to impreza turystyczna, ani pośredniczenie na zlecenie w zawarciu umowy o świadczenie usług turystycznych. Oznacza to między innymi, że Najemca zawiera umowy ubezpieczenia (niedotyczące Pojazdu) we własnym imieniu i na własny rachunek.</li>
<li>Najemca oświadcza, że został pouczony o sposobie eksploatacji Pojazdu oraz — zgodnie z obowiązkiem informacyjnym z islandzkiej ustawy o wynajmie pojazdów podlegających rejestracji nr 65/2015 — o islandzkich przepisach ruchu drogowego i znakach, o ustawowym zakazie jazdy poza drogami (off-road), o ryzykach islandzkiej pogody (w szczególności nagłym silnym wietrze) oraz o obecności zwierząt (owce, ptaki) na drogach.</li>
</ol>
<h4>§2. Kierowcy</h4>
<ol>
<li>Pojazd może prowadzić WYŁĄCZNIE Najemca oraz kierowcy dodatkowi wskazani imiennie w umowie. Każdy kierowca musi mieć ukończone 20 lat i posiadać ważne prawo jazdy od co najmniej 1 roku.</li>
<li>Jeżeli Pojazd prowadzi osoba niewskazana w umowie, WSZYSTKIE ograniczenia odpowiedzialności i wykupione ochrony tracą ważność, Najemca odpowiada za szkody w pełnej wysokości solidarnie z faktycznym kierowcą, a Wynajmujący może naliczyć opłatę umowną 45 000 ISK.</li>
<li>Najemca nie jest uprawniony do podnajmowania Pojazdu ani przekazywania go do używania osobom trzecim.</li>
</ol>
<h4>§3. Dozwolone użytkowanie — terytorium i drogi</h4>
<ol>
<li>Najemca może używać Pojazdu jedynie na terytorium Islandii (wyspa Islandia; promy na Vestmannaeyjar lub za granicę wymagają uprzedniej pisemnej zgody Wynajmującego).</li>
<li>JAZDA POZA DROGAMI (OFF-ROAD) JEST SUROWO ZABRONIONA I NIELEGALNA W ISLANDII (ustawa o ochronie przyrody nr 60/2013). Mandaty policyjne sięgają 1 000 000 ISK. W razie jazdy off-road Najemca: (a) pokrywa wszystkie mandaty publiczne i koszty rekultywacji terenu, (b) traci wszystkie ochrony i pokrywa pełny koszt każdej szkody, (c) płaci Wynajmującemu dodatkową opłatę umowną 300 000 ISK.</li>
<li>Zabronione jest przekraczanie i brodzenie w rzekach oraz jakichkolwiek ciekach wodnych. ŻADNE ubezpieczenie nie obejmuje szkód wodnych — Najemca ponosi PEŁNY koszt naprawy lub odtworzenia zatopionego Pojazdu, w tym uszkodzenia silnika i koszty wydobycia. (Nie dotyczy wybranych modeli oznaczonych w ofercie "4F Road", z wyłączeniem głębokich przepraw rzecznych, które zawsze odbywają się na wyłączne ryzyko Najemcy.)</li>
<li>Jazda po drogach górskich oznaczonych "F" oraz po drogach oficjalnie zamkniętych (road.is) jest zabroniona dla Pojazdów innych niż oznaczone w ofercie "4F Road". Naruszenie: opłata umowna minimum 75 000 ISK oraz pełna odpowiedzialność za wszystkie powstałe szkody. Uszkodzenia zawieszenia, podwozia i opon powstałe na drogach F nigdy nie są objęte ubezpieczeniem.</li>
<li>Najemca ma obowiązek stosować się do oficjalnych ostrzeżeń pogodowych (vedur.is) i zamknięć dróg (umferdin.is / road.is). Wjazd na obszar objęty oficjalnym ostrzeżeniem sztormowym odbywa się na wyłączne ryzyko i koszt Najemcy.</li>
<li>Zabronione są: wyścigi, jazda rajdowa, holowanie innych pojazdów, nauka jazdy oraz odpłatny przewóz osób lub towarów.</li>
</ol>
<h4>§4. Odpowiedzialność Najemcy — szkody nieobjęte żadnym ubezpieczeniem ani ochroną</h4>
<ol>
<li>Najemca ponosi odpowiedzialność za szkody w Pojeździe i jego wyposażeniu dodatkowym powstałe w czasie trwania najmu, choćby ich wykrycie nastąpiło po zwrocie Pojazdu (w szczególności w razie celowego ukrycia szkody).</li>
<li>Następujące szkody NIGDY nie są objęte ubezpieczeniem ani żadną ochroną i Najemca pokrywa je w całości: (a) uszkodzenia podwozia, zawieszenia, skrzyni biegów, sprzęgła i wału napędowego (w tym od dróg szutrowych, dziur i kamieni); (b) szkody wodne każdego rodzaju, w tym przeprawy przez rzeki, zalanie, fale i bryza morska; (c) drzwi, maska lub klapa wyrwane/wygięte przez wiatr — częsta i kosztowna szkoda w Islandii, zawsze sprawdzaj wiatr przed otwarciem drzwi; (d) szkody od burz piaskowych, popiołowych, pumeksowych i żwirowych; (e) opony, felgi, koła, zawieszenie i szyba czołowa, o ile nie wykupiono osobnej ochrony; (f) uszkodzenia wnętrza, przypalenia i plamy; (g) zatankowanie złego paliwa — pełny koszt naprawy i holowania; (h) utrata kluczyków, dokumentów lub tablic rejestracyjnych — koszt odtworzenia plus opłata manipulacyjna 10 000 ISK; (i) kolizja ze zwierzęciem, gdy prędkość lub sposób jazdy nie były dostosowane do warunków; (j) szkody wynikłe z ignorowania kontrolek ostrzegawczych lub nietypowych dźwięków.</li>
<li>Prowadzenie pod wpływem alkoholu, narkotyków lub leków ograniczających zdolność prowadzenia unieważnia WSZYSTKIE ochrony. Najemca ponosi wtedy pełną, nieograniczoną odpowiedzialność za wszystkie szkody, zastosowanie ma ustawowy regres ubezpieczyciela (islandzka ustawa nr 30/2019), a Wynajmujący nalicza dodatkową opłatę umowną 150 000 ISK.</li>
<li>Wszystkie ochrony tracą ważność również w razie rażącego niedbalstwa, szkody umyślnej lub używania Pojazdu sprzecznie z umową.</li>
<li>Odpowiedzialność Najemcy nie jest ograniczona do wysokości kaucji. Kaucja może zostać zatrzymana do czasu ostatecznego rozliczenia szkód, mandatów i opłat, a jej zatrzymanie nie wyłącza roszczeń przewyższających kaucję.</li>
<li>Odpowiedzialność Najemcy (za wyjątkiem obowiązku zapłaty opłat umownych) jest pomniejszana o kwoty faktycznie wypłacone przez ubezpieczycieli z tytułu ubezpieczeń dotyczących odpowiednich zdarzeń.</li>
</ol>
<h4>§5. Procedura wypadku i szkody</h4>
<ol>
<li>W razie kolizji, wypadku, kradzieży lub szkody Najemca zobowiązany jest natychmiast powiadomić Wynajmującego i stosować się do jego poleceń. W razie kolizji z innym pojazdem, szkody osobowej, kradzieży lub kolizji ze zwierzęciem należy dodatkowo wezwać policję (112) na miejsce zdarzenia.</li>
<li>Najemca dostarcza Wynajmującemu pisemny opis zdarzenia (w miarę możliwości ze zdjęciami) nie później niż 12 godzin po zdarzeniu. Brak zgłoszenia w tym terminie lub oddalenie się z miejsca zdarzenia skutkuje pełną odpowiedzialnością Najemcy za szkodę niezależnie od wykupionych ochron.</li>
<li>Najemca nie może uznawać odpowiedzialności wobec osób trzecich w imieniu Wynajmującego; w miarę możliwości zbiera dane uczestników i świadków.</li>
</ol>
<h4>§6. Paliwo, czystość, zwrot Pojazdu</h4>
<ol>
<li>Samochód podstawiany jest Najemcy z pełnym bakiem paliwa i z pełnym bakiem musi zostać zwrócony. Brakujące paliwo rozliczane jest według kosztu plus opłata serwisowa 5 000 ISK.</li>
<li>Palenie (w tym e-papierosów) jest zabronione w Pojeździe i jego integralnych częściach jak namiot tylny lub namiot dachowy — opłata umowna 50 000 ISK.</li>
<li>Pojazd należy zwrócić w rozsądnie czystym stanie. Nadmierne zabrudzenie (piasek, błoto, sierść, resztki jedzenia, zapachy) rozliczane jest do 30 000 ISK według faktycznego kosztu czyszczenia.</li>
<li>Zwrot Pojazdu ponad 1 godzinę po umówionym terminie bez zgody Wynajmującego: opłata równa pełnej stawce dobowej plus 10 000 ISK za każdą rozpoczętą dobę opóźnienia.</li>
<li>Jeżeli Najemca nie zwróci Pojazdu do 24 godzin po terminie wskazanym w umowie najmu i nie skontaktuje się z Wynajmującym, ten poinformuje policję o podejrzeniu kradzieży (przywłaszczenia), co spowoduje całkowitą utratę kaucji, karę umowną 300 000 ISK i dalsze konsekwencje finansowe i prawne.</li>
<li>W razie porzucenia Pojazdu lub pozostawienia go w innym miejscu niż umówione, Najemca pokrywa koszt odbioru: 400 ISK za km od biura Wynajmującego, minimum 35 000 ISK, plus ewentualne koszty holowania.</li>
</ol>
<h4>§7. Mandaty, opłaty drogowe i opłata kilometrowa</h4>
<ol>
<li>Najemca odpowiada za wszystkie mandaty, opłaty drogowe, parkingowe i kary (w tym zdjęcia z fotoradarów) powstałe w okresie najmu, także doręczone Wynajmującemu po zwrocie kaucji. Za obsługę każdego mandatu/opłaty Wynajmujący nalicza opłatę administracyjną 4 500 ISK.</li>
<li>Opłata kilometrowa (kílómetragjald, islandzka ustawa nr 100/2025): ustawową opłatę za kilometry faktycznie przejechane w okresie najmu ponosi Najemca. Stany licznika przy wydaniu i zwrocie odnotowywane są w umowie i protokołach; opłata przenoszona jest według stawki ustawowej bez marży i wykazywana osobno.</li>
</ol>
<h4>§8. Płatności i autoryzacja karty</h4>
<ol>
<li>Podpis Najemcy na umowie stanowi upoważnienie Wynajmującego do obciążenia karty płatniczej Najemcy (lub dochodzenia zapłaty w inny sposób) z tytułu: czynszu najmu, kaucji, szkód, za które odpowiada Najemca, opłat umownych z niniejszych OWU, paliwa, czyszczenia, mandatów, opłat drogowych i opłaty kilometrowej — przez okres do 6 miesięcy po zakończeniu najmu, z uprzednim powiadomieniem e-mail wraz z wyszczególnieniem kwot.</li>
</ol>
<h4>§9. Uprawnienia Wynajmującego, telematyka, postanowienia końcowe</h4>
<ol>
<li>Wynajmujący zastrzega sobie prawo do odstąpienia od umowy w każdej chwili, jeżeli zarezerwowany Pojazd ulegnie wcześniejszemu wypadkowi lub innemu uszkodzeniu lub istnieją inne ważne okoliczności i nie ma możliwości bezpiecznego użytkowania Pojazdu przez Najemcę. W takim przypadku Wynajmujący zwraca kwotę opłaty rezerwacyjnej, wynagrodzenie oraz kaucję wpłaconą przez Najemcę w trybie natychmiastowym, jednak z tego tytułu nie należy się Najemcy żadne dodatkowe odszkodowanie.</li>
<li>W razie istotnego naruszenia umowy (w szczególności §2–§3) Wynajmujący może wypowiedzieć najem i odebrać Pojazd bez uprzedzenia, na koszt Najemcy; kwoty zapłacone za niewykorzystany okres nie podlegają zwrotowi.</li>
<li>Pojazd może być wyposażony w urządzenie GPS/telematyczne rejestrujące lokalizację i prędkość. Dane przetwarzane są przez Wynajmującego wyłącznie w celu ochrony Pojazdu i egzekwowania umowy, zgodnie z przepisami o ochronie danych.</li>
<li>Umowa może zostać zawarta i podpisana elektronicznie; podpis elektroniczny (eIDAS, islandzka ustawa nr 55/2019) jest wiążący jak własnoręczny.</li>
<li>Umowa podlega prawu islandzkiemu, w szczególności ustawie nr 65/2015 o wynajmie pojazdów podlegających rejestracji. Spory rozstrzyga Sąd Rejonowy Reykjanes (Héraðsdómur Reykjaness), z zastrzeżeniem bezwzględnie obowiązujących przepisów o właściwości sądu w sprawach konsumenckich.</li>
</ol>
<h3>Rezerwacja (PL)</h3>
<ol>
<li>Rezerwacja samochodu następuje po wpłacie Opłaty Rezerwacyjnej min. 30% wartości pełnej rezerwacji.</li>
<li>W przypadku rezygnacji z rezerwacji do 30 dni przed zwracamy 100% Opłaty Rezerwacyjnej. Opłata Rezerwacyjna nie podlega zwrotowi w przypadku rezygnacji mniej niż na 30 dni od daty rezerwacji.</li>
<li>Pozostałe 70% należy wpłacić na 7 dni przed pierwszym dniem Najmu.</li>
<li>W przypadku rezygnacji mniej niż 7 dni przed dniem wynajmu zwracamy 70% całkowitej kwoty Najmu. Opłata rezerwacyjna nie zostaje zwrócona.</li>
<li>W przypadku braku wpływu środków na 7 dni przed datą rezerwacji strony zgodnie przyjmują, że Najemca zrezygnował z wynajmu pojazdu, a wpłacona Opłata Rezerwacyjna nie podlega zwrotowi.</li>
<li>Zwrot kaucji następuje 7 dni po zakończeniu rezerwacji lub 7 dni po wcześniejszym zwrocie samochodu.</li>
<li>Wcześniejszy zwrot Pojazdu nie uprawnia Najemcy do zwrotu opłaty za niewykorzystany okres najmu.</li>
<li>Czas trwania umowy może być przedłużony jedynie za wyraźną zgodą Wynajmującego. Zgoda może być wyrażona telefonicznie lub potwierdzona sms-em.</li>
<li>Dane najemcy potrzebne do wynajmu: imię i nazwisko; kennitala / PESEL / numer identyfikacyjny; data wydania i data odbioru auta; miejsce wydania i oddania auta; email, nr tel.; adres (kraj, kod pocztowy, miasto, ulica); nr dowodu osobistego lub paszportu i data wydania; nr prawa jazdy i data wydania; imiona, nazwiska i numery praw jazdy kierowców dodatkowych.</li>
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
    {{NAJEMCA_BLOK}}
  </div>
  <div>
    <h3>Wynajmujący</h3>
    <p><strong>{{FIRMA_LEGAL}}</strong> — marka {{FIRMA}}<br/>{{FIRMA_ADRES}}<br/>Kennitala: {{FIRMA_KT}} · VSK-nr: {{FIRMA_VAT}}<br/>{{FIRMA_WWW}}<br/>{{FIRMA_EMAIL}}</p>
  </div>
</div>
<h2>Przedmiot umowy</h2>
<p>Samochód: <strong>{{POJAZD}}</strong> · Nr rejestracji: <strong>{{NR_REJ}}</strong></p>
<table class="kv">
  <tr><td>Data wydania</td><td>{{DATA_WYDANIA}}</td></tr>
  <tr><td>Miejsce wydania</td><td>{{MIEJSCE_WYD}}</td></tr>
  <tr><td>Data zwrotu</td><td>{{DATA_ZWROTU}}</td></tr>
  <tr><td>Miejsce zwrotu</td><td>{{MIEJSCE_ZWR}}</td></tr>
  <tr><td>Okres wypożyczenia</td><td>{{DNI}} dób</td></tr>
  <tr><td>Całkowity limit kilometrów</td><td>{{LIMIT_KM}}</td></tr>
  <tr><td>Stan licznika przy wydaniu (km)</td><td>{{PRZEBIEG_WYD}}</td></tr>
  <tr><td>Stan licznika przy zwrocie (km)</td><td>{{PRZEBIEG_ZWR}}</td></tr>
  <tr><td>Kaucja zwrotna za samochód</td><td>{{KAUCJA}}</td></tr>
  <tr><td>Udział własny w szkodzie</td><td>{{UDZIAL}}</td></tr>
  <tr><td>Kierowcy dodatkowi (imię, nazwisko, nr prawa jazdy)</td><td>______________</td></tr>
  <tr><td>Kontakt alarmowy Wynajmującego (24/7)</td><td>______________</td></tr>
</table>
{{KWOTA_BLOK}}
<h2>Oświadczenie Najemcy</h2>
<p>Najemca oświadcza, że przed podpisaniem umowy został poinformowany o: islandzkich przepisach ruchu drogowego i znakach drogowych; ustawowym zakazie jazdy poza drogami (off-road); ryzyku nagłego silnego wiatru (w tym uszkodzenia drzwi) i obowiązku śledzenia vedur.is oraz umferdin.is; obecności zwierząt na drogach; zasadach jazdy po drogach szutrowych i zakazie przepraw przez rzeki. Najemca akceptuje OWU wraz z cennikiem opłat umownych stanowiące integralną część umowy.<br/><span class="muted">The Lessee confirms having been informed about Icelandic traffic rules and signs, the statutory ban on off-road driving, the risk of sudden strong wind (incl. door damage) and the duty to follow vedur.is and umferdin.is, animals on roads, gravel-road driving rules and the ban on river crossings. The Lessee accepts the General Conditions (OWU) including the schedule of contractual fees as an integral part of this agreement.</span></p>
<p class="muted">(data i podpis Najemcy oznacza akceptację OWU stanowiących załącznik do umowy)</p>
<p>w imieniu {{FIRMA_LEGAL}}: {{PRACOWNIK}}, dnia {{DATA_ZAWARCIA}}</p>
<div class="sign"><span><span class="sigval sig-najemca"></span><span class="sigline">data i podpis Najemcy</span></span><span><span class="sigval signature">{{PRACOWNIK_SIG}}</span><span class="sigline">podpis Wynajmującego</span></span></div>
<p class="muted footer">Wygenerowano w systemie {{FIRMA}} · {{FIRMA_WWW}}</p>
${OWU}`;

const WYDANIE = `
<h1>Protokół wydania pojazdu</h1>
<div class="muted">{{FIRMA}} · {{NR_REJ}} · do umowy nr {{NUMER}}{{REZ}}</div>
<table class="kv">
  <tr><td>Data i godzina wydania</td><td>{{DATA_PROTOKOL}}</td></tr>
  <tr><td>Miejsce wydania</td><td>{{MIEJSCE_WYD}}</td></tr>
  <tr><td>Pojazd</td><td>{{POJAZD}} · <strong>{{NR_REJ}}</strong></td></tr>
</table>
<div class="parties">
  <div><h3>Wynajmujący</h3><p>{{FIRMA_LEGAL}}<br/>Kennitala: {{FIRMA_KT}} · VSK-nr: {{FIRMA_VAT}}<br/>{{FIRMA_ADRES}}<br/>{{FIRMA_EMAIL}}</p></div>
  <div><h3>Najemca</h3><p>{{NAJEMCA}}<br/>PESEL: {{NAJEMCA_PESEL}}<br/>Prawo jazdy: {{NAJEMCA_PJ}}<br/>{{NAJEMCA_TEL}} · {{NAJEMCA_EMAIL}}</p></div>
</div>
<h2>Stan pojazdu przy wydaniu</h2>
<table class="kv">
  <tr><td>Przebieg pojazdu</td><td>{{PRZEBIEG_WYD}}</td></tr>
  <tr><td>Stan paliwa</td><td>______________ %</td></tr>
  <tr><td>Czystość — wnętrze</td><td>☐ czyste&nbsp;&nbsp;☐ do czyszczenia</td></tr>
  <tr><td>Czystość — karoseria</td><td>☐ czysta&nbsp;&nbsp;☐ do mycia</td></tr>
  <tr><td>Uszkodzenia — karoseria</td><td>☐ brak&nbsp;&nbsp;☐ małe&nbsp;&nbsp;☐ średnie&nbsp;&nbsp;☐ duże</td></tr>
  <tr><td>Uszkodzenia — wnętrze</td><td>☐ brak&nbsp;&nbsp;☐ małe&nbsp;&nbsp;☐ średnie&nbsp;&nbsp;☐ duże</td></tr>
</table>
<h3>Dodatkowe uwagi</h3>
<p>....................................................................................................................</p>
<p class="muted">Najemca akceptuje powyższe szczegóły najmu oraz opis stanu samochodu.</p>
<div class="sign"><span><span class="sigval"></span><span class="sigline">podpis Najemcy</span></span><span><span class="sigval signature">{{PRACOWNIK_SIG}}</span><span class="sigline">podpis Wydającego</span></span></div>`;

const ZWROT = `
<h1>Protokół zwrotu pojazdu</h1>
<div class="muted">{{FIRMA}} · {{NR_REJ}} · do umowy nr {{NUMER}}{{REZ}}</div>
<table class="kv">
  <tr><td>Data i godzina zwrotu</td><td>{{DATA_PROTOKOL}}</td></tr>
  <tr><td>Miejsce zwrotu</td><td>{{MIEJSCE_ZWR}}</td></tr>
  <tr><td>Pojazd</td><td>{{POJAZD}} · <strong>{{NR_REJ}}</strong></td></tr>
</table>
<div class="parties">
  <div><h3>Wynajmujący</h3><p>{{FIRMA_LEGAL}}<br/>Kennitala: {{FIRMA_KT}} · VSK-nr: {{FIRMA_VAT}}<br/>{{FIRMA_EMAIL}}</p></div>
  <div><h3>Najemca</h3><p>{{NAJEMCA}}<br/>{{NAJEMCA_TEL}} · {{NAJEMCA_EMAIL}}</p></div>
</div>
<h2>Stan pojazdu przy zwrocie</h2>
<table class="kv">
  <tr><td>Przebieg pojazdu</td><td>{{PRZEBIEG_ZWR}}</td></tr>
  <tr><td>Stan paliwa</td><td>______________ %</td></tr>
  <tr><td>Nowe uszkodzenia — karoseria</td><td>☐ brak&nbsp;&nbsp;☐ małe&nbsp;&nbsp;☐ średnie&nbsp;&nbsp;☐ duże</td></tr>
  <tr><td>Nowe uszkodzenia — wnętrze</td><td>☐ brak&nbsp;&nbsp;☐ małe&nbsp;&nbsp;☐ średnie&nbsp;&nbsp;☐ duże</td></tr>
  <tr><td>Rozliczenie kaucji {{KAUCJA}}</td><td>☐ zwrócona w całości&nbsp;&nbsp;☐ potrącenie ________</td></tr>
</table>
<h3>Dodatkowe uwagi</h3>
<p>....................................................................................................................</p>
<div class="sign"><span><span class="sigval"></span><span class="sigline">podpis Najemcy</span></span><span><span class="sigval signature">{{PRACOWNIK_SIG}}</span><span class="sigline">podpis Przyjmującego</span></span></div>`;

export const TEMPLATES: ContractTemplate[] = [
  { id: "umowa", name: "Umowa wypożyczenia samochodu", body: UMOWA },
  { id: "wydanie", name: "Protokół wydania pojazdu", body: WYDANIE },
  { id: "zwrot", name: "Protokół zwrotu pojazdu", body: ZWROT },
];

const DASH = "————";

// Escape HTML — dane najemcy/dokumentów pochodzą z PUBLICZNEGO formularza
// (/api/book), a umowa renderuje się przez dangerouslySetInnerHTML w sesji admina.
// Bez tego nazwisko typu `<img onerror=…>` = stored XSS w panelu.
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// "ABC123 (wyd. 01.02.2020, ważny do 01.02.2030)" — daty tylko gdy są.
function docLabel(number?: string, issuedAt?: string, expiresAt?: string) {
  if (!number) return undefined;
  const parts = [
    issuedAt ? `wyd. ${fmtDate(issuedAt)}` : null,
    expiresAt ? `ważny do ${fmtDate(expiresAt)}` : null,
  ].filter(Boolean);
  return parts.length ? `${number} (${parts.join(", ")})` : number;
}

function najemcaBlock(
  customer: Customer | undefined,
  identityDoc?: string,
  licenseDoc?: string,
) {
  const dokumentTozsamosci = esc(identityDoc ?? DASH);
  const prawoJazdy = esc(licenseDoc ?? customer?.license ?? DASH);
  const persona = `Imię i nazwisko: ${esc(customer?.name ?? DASH)}<br/>Adres: ${esc(customer?.address ?? DASH)}<br/>Dokument tożsamości: ${dokumentTozsamosci}<br/>PESEL: ${esc(customer?.id_number ?? DASH)}<br/>Prawo jazdy: ${prawoJazdy}<br/>Tel.: ${esc(customer?.phone ?? DASH)}<br/>${esc(customer?.email ?? DASH)}`;
  if (!isCompanyCustomer(customer)) {
    return `<p>${persona}</p>`;
  }
  return `<p><strong>${esc(customer.companyName)}</strong><br/>NIP: ${esc(customer.nip ?? DASH)}<br/>Adres firmy: ${esc(customer.companyAddress ?? DASH)}<br/>${esc(customer.companyEmail ?? DASH)} · ${esc(customer.companyPhone ?? DASH)}</p>
    <p class="muted">Korzystający z pojazdu:</p>
    <p>${persona}</p>`;
}

export function buildFilled(
  template: ContractTemplate,
  ctx: {
    number: string;
    customer?: Customer;
    vehicle?: Vehicle;
    booking?: Booking;
    employee?: string;
    date: string;
    documents?: CustomerDocument[];
    company?: Company;
  },
) {
  const { customer, vehicle, booking } = ctx;
  const company = ctx.company ?? COMPANIES[0];
  const fill = "______________";
  // Liczba dni = noce (od–do, dzień zwrotu NIE wliczony).
  // Godziny wydania/odbioru (pickupTime/returnTime) są tylko informacyjne — NIE
  // wpływają na liczbę dni ani na kwotę.
  const dni =
    booking != null
      ? String(differenceInCalendarDays(parseISO(booking.end), parseISO(booking.start)))
      : DASH;
  const rez = booking?.external_ref ? ` · rezerwacja ${booking.external_ref}` : "";
  // Dokumenty z profilu klienta — numer + daty wydania/ważności (OWU wymaga dat).
  const idDoc = ctx.documents?.find((d) => d.docType === DOC_TYPES[0]);
  const licDoc = ctx.documents?.find((d) => d.docType === DOC_TYPES[1]);
  const identityDoc = docLabel(idDoc?.docNumber, idDoc?.issuedAt, idDoc?.expiresAt);
  const licenseDoc = docLabel(
    licDoc?.docNumber ?? customer?.license,
    licDoc?.issuedAt,
    licDoc?.expiresAt,
  );
  // VAT (VSK): total zapisany jest jako BRUTTO; netto = brutto/(1+vat).
  const vatRate = booking?.vatRate ?? 0;
  const bruttoNum = booking?.total ?? null;
  const stawka = esc(isk(booking?.dailyRate ?? vehicle?.dailyRate));
  // Blok kwoty — raw-HTML zbudowany WYŁĄCZNIE z liczb (kwoty przez isk(), stawka VAT),
  // więc brak powierzchni na wstrzyknięcie. Rozbicie netto/VAT/brutto pokazujemy TYLKO
  // gdy znamy stawkę VAT (>0) — czyli rezerwacja wystawiona w nowym kreatorze. Przy 0%
  // / starych wpisach (import z RentHelp, gdzie cena bywa BRUTTO) NIE twierdzimy „netto":
  // pokazujemy neutralnie kwotę i cenę za dobę — inaczej byłoby to fałszywe oświadczenie
  // podatkowe na dokumencie prawnym (obie firmy są płatnikami VSK).
  const kwotaBlok = (() => {
    if (bruttoNum != null && vatRate > 0) {
      const nettoNum = Math.round(bruttoNum / (1 + vatRate / 100));
      const vatNum = bruttoNum - nettoNum;
      return `<p>Wartość netto za okres wypożyczenia: <span class="amount">${esc(isk(nettoNum))}</span> (${stawka} netto / doba)</p>
<p class="muted">w tym VAT (VSK) ${vatRate}%: ${esc(isk(vatNum))}</p>
<p class="total">Kwota całkowita do zapłaty (brutto): ${esc(isk(bruttoNum))}</p>`;
    }
    return `<p>Wartość za okres wypożyczenia: <span class="amount">${esc(isk(bruttoNum))}</span> (${stawka} / doba)</p>
<p class="total">Kwota całkowita do zapłaty: ${esc(isk(bruttoNum))}</p>`;
  })();
  const map: Record<string, string> = {
    NUMER: ctx.number,
    REZ: rez,
    DATA_ZAWARCIA: ctx.date,
    DATA_PROTOKOL: ctx.date,
    FIRMA: company.brand,
    FIRMA_LEGAL: company.legalName,
    FIRMA_KT: company.kennitala || fill,
    FIRMA_VAT: company.vat || fill,
    FIRMA_ADRES: company.address,
    FIRMA_WWW: company.web,
    FIRMA_EMAIL: company.email,
    NAJEMCA: customer?.name ?? DASH,
    NAJEMCA_PESEL: customer?.id_number ?? DASH,
    NAJEMCA_PJ: licenseDoc ?? customer?.license ?? DASH,
    NAJEMCA_TEL: customer?.phone ?? DASH,
    NAJEMCA_EMAIL: customer?.email ?? DASH,
    NAJEMCA_BLOK: najemcaBlock(customer, identityDoc, licenseDoc),
    POJAZD: vehicle?.name ?? DASH,
    NR_REJ: vehicle?.plate ?? DASH,
    VIN: vehicle?.vin ?? DASH,
    DATA_WYDANIA: booking
      ? `${fmtDate(booking.start)}${booking.pickupTime ? `, godz. ${booking.pickupTime}` : ""}`
      : DASH,
    DATA_ZWROTU: booking
      ? `${fmtDate(booking.end)}${booking.returnTime ? `, godz. ${booking.returnTime}` : ""}`
      : DASH,
    // Miejsce wydania/odbioru z rezerwacji (biuro vs lotnisko); gdy nie wybrane
    // — dotychczasowy fallback.
    MIEJSCE_WYD: booking?.location ?? "Keflavík / wg ustaleń",
    MIEJSCE_ZWR: booking?.location ?? "Keflavík / wg ustaleń",
    DNI: dni,
    LIMIT_KM: "Brak limitu",
    // Nie zmyślaj zapisów prawnych: gdy kaucja/udział własny nie zostały wpisane,
    // zostaw pustą linię do uzupełnienia — nie deklaruj fałszywego „0 ISK".
    KAUCJA: booking?.deposit != null ? isk(booking.deposit) : fill,
    UDZIAL: fill,
    // Stan licznika z rezerwacji (rozliczenie kilometrów z urzędem); gdy nie
    // wpisany — pusta linia do ręcznego uzupełnienia na protokole.
    PRZEBIEG_WYD:
      booking?.odometerStart != null
        ? `${booking.odometerStart.toLocaleString("pl-PL")} km`
        : "______________ km",
    PRZEBIEG_ZWR:
      booking?.odometerEnd != null
        ? `${booking.odometerEnd.toLocaleString("pl-PL")} km`
        : "______________ km",
    KWOTA: isk(booking?.total),
    KWOTA_BLOK: kwotaBlok,
    PRACOWNIK: ctx.employee || DASH,
    // Podpis Wynajmującego „ręczną" czcionką (klasa .signature) — nazwisko pracownika
    // (np. Gosia) renderuje się automatycznie na umowie. Puste gdy nie podano.
    PRACOWNIK_SIG: ctx.employee || "",
  };
  // NAJEMCA_BLOK to już zbudowany (i wewnętrznie zescape'owany) HTML — reszta to
  // skalary wstawiane w HTML, więc je escape'ujemy (defense-in-depth; wartości
  // firmowe są stałymi, escape jest nieszkodliwy).
  return template.body.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = map[k] ?? DASH;
    // NAJEMCA_BLOK i KWOTA_BLOK to gotowy HTML (zbudowany z zaufanych/liczbowych
    // wartości i wewnętrznie zescape'owany) — reszta to skalary, więc escape.
    return k === "NAJEMCA_BLOK" || k === "KWOTA_BLOK" ? v : esc(v);
  });
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

// Numer umowy nadaje się sam: kolejny numer w bieżącym miesiącu (wg czasu
// islandzkiego), format NN/MM/RRRR — np. 03/07/2026. Sekwencja liczona z już
// zapisanych umów w bazie, więc jest wspólna dla wszystkich urządzeń i nie
// resetuje się po odświeżeniu.
export function makeNumber(existing: { number: string }[], isoDate = todayISO()) {
  const suffix = `/${isoDate.slice(5, 7)}/${isoDate.slice(0, 4)}`;
  const used = existing
    .map((c) => c.number)
    .filter((n) => n.endsWith(suffix))
    .map((n) => parseInt(n, 10))
    .filter(Number.isFinite);
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${String(next).padStart(2, "0")}${suffix}`;
}

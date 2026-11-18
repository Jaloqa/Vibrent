

<!-- Start of picture text -->
POLITECHNIKA<br>PY OPOLSKA<br><!-- End of picture text -->



<!-- Start of picture text -->
A hao<br><!-- End of picture text -->

# **Politechnika Opolska** 

## **Wydział Informatyki** 

studia niestacjonarne II stopnia 

Kierunek Informatyka 

Przedmiot: Architektury nowoczesnych systemów informatycznych 

## **Skład zespołu projektowego i podział funkcji** 

|**Członek zespołu**|**Pełniona funkcja**|
|---|---|
|Lider|Lider/Prezentacja/Marketing|
|Marketing|Prezentacja/Marketing|
|Backend 1|Backend|
|Frontend 2|Frontend|
|Dokumentacja 1|Dokumentacja|
|Frontend 1|Frontend|
|Dokumentacja 2|Dokumentacja|
|Tester 1|Tester|
|Tester 2|Tester|
|Backend 2|Backend|



Prowadzący: 

[usunięto]

Opole, październik 2026 r. 

1 

## **1. Wprowadzenie i cel projektu** 

Vibrent to aplikacja internetowa w formule MVP, która ułatwia spontaniczne i zorganizowane uczestnictwo w wydarzeniach towarzyskich: imprezach, domówkach, grach planszowych, wspólnych wyjściach czy sportowych spotkaniach. Całość opiera się na znanym z aplikacji randkowych mechanizmie kart i gestów _swipe_ , dopasowanym do specyfiki eventów. 

**Problem:** informacje o wydarzeniach są rozproszone (grupy na Facebooku, komunikatory, plakaty), a dołączenie do nieznanej grupy wymaga wysiłku. Organizatorzy z kolei nie mają wygodnego narzędzia do selekcji uczestników i pilnowania limitu miejsc. 

**Rozwiązanie:** użytkownik przegląda karty wydarzeń z okolicy i jednym gestem je polubi lub odrzuci. Polubienie jest zgłoszeniem, które trafia do panelu organizatora. Organizator sprawdza profil chętnego i akceptuje lub odrzuca jego udział. 

**Technologie kluczowe:** .NET (ASP.NET Core Web API), frontend webowy React, relacyjna baza danych PostgreSQL. 

## **2. Opis funkcjonalności** 

### **2.1. Aktorzy systemu** 

|Aktor|Opis|
|---|---|
|Gość|Niezalogowany odwiedzający; widzi stronę startową i może się<br>zarejestrować.|
|Użytkownik (uczestnik)|Zalogowana osoba przeglądająca wydarzenia i wysyłająca<br>zgłoszenia.|
|Organizator|Użytkownik, który tworzy wydarzenia i zarządza zgłoszeniami.<br>Jedno konto może pełnić obie role.|
|Administrator|Moderuje treści, rozpatruje zgłoszenia nadużyć, zarządza<br>kontami.|



#### **Zasady przypisywania ról użytkowników** 

Jedno konto użytkownika może pełnić jednocześnie funkcję uczestnika i organizatora wydarzeń. Użytkownik może przeglądać wydarzenia i wysyłać zgłoszenia, a także tworzyć własne wydarzenia i zarządzać nimi. Uprawnienia administratora są odrębne i umożliwiają moderowanie treści oraz zarządzanie kontami. System będzie weryfikował uprawnienia użytkownika przed wykonaniem operacji wymagających określonej roli. 

2 

### **2.2. Funkcjonalności konieczne (Must have – MVP)** 

#### **A. Konta oraz profile** 

- Rejestracja i logowanie (e-mail + hasło, tokeny JWT). 

- Edycja profilu: imię/pseudonim, zdjęcie, krótki opis, miasto. 

- Wylogowanie, zmiana hasła. 

#### **B. Zarządzanie wydarzeniami (organizator)** 

- Tworzenie wydarzenia: tytuł, opis, kategoria, data i godzina, lokalizacja (adres + współrzędne), limit miejsc, zdjęcie. 

- Edycja, anulowanie i usuwanie własnych wydarzeń. 

- Lista własnych wydarzeń ze statusem (aktywne, zakończone, anulowane) i licznikiem wolnych miejsc. 

Anulowanie wydarzenia zmienia jego status na „anulowane”, natomiast usunięcie oznacza usunięcie wydarzenia zgodnie z przyjętymi zasadami przechowywania danych. W przypadku wydarzenia posiadającego zgłoszenia lub zaakceptowanych uczestników preferowane będzie anulowanie zamiast trwałego usuwania. 

#### **C. Przeglądanie kart wydarzeń (uczestnik)** 

- Widok kart z gestem swipe: w prawo = like (zgłoszenie), w lewo = odrzucenie. Dla dostępności także przyciski. 

- Pobieranie wydarzeń z okolicy użytkownika (filtr po mieście lub promieniu), z pominięciem już ocenionych kart, własnych wydarzeń oraz wydarzeń bez wolnych miejsc. 

- Podgląd szczegółów wydarzenia po kliknięciu karty. 

#### **D. Obsługa zgłoszeń** 

- Polubienie tworzy zgłoszenie ze statusem _oczekujące_ . 

- Panel organizatora: lista zgłoszeń do wydarzenia, podgląd profilu chętnego, akcje _akceptuj_ / _odrzuć_ . 

- Akceptacja zmniejsza pulę wolnych miejsc; przy braku miejsc akceptacja jest blokowana. 

- Użytkownik widzi listę swoich zgłoszeń i ich statusy (oczekujące, zaakceptowane, odrzucone). 

- Możliwość wycofania zgłoszenia. 

Wycofanie zgłoszenia jest możliwe w przypadku zgłoszeń oczekujących oraz zaakceptowanych, z uwzględnieniem aktualizacji liczby zajętych miejsc. Po wycofaniu zgłoszenia jego status zostaje zmieniony na „withdrawn”. 

#### **E. Wymagania pozafunkcjonalne** 

- Responsywny interfejs (telefon i desktop). 

- Bezpieczeństwo: hashowanie haseł, autoryzacja oparta na rolach, walidacja danych po stronie serwera, ochrona przed podstawowymi atakami (SQL injection, XSS, CSRF). 

- Dokumentacja API (Swagger/OpenAPI), testy jednostkowe i integracyjne kluczowych endpointów. 

3 

- Możliwość uruchomienia całości lokalnie (Docker Compose: API + baza + frontend). 

- Obsługa błędów i komunikatów dla użytkownika, w tym informowanie o braku miejsc, nieprawidłowych danych oraz problemach z połączeniem z serwerem. 

- Ograniczenie dostępu do operacji na wydarzeniach i zgłoszeniach zgodnie z uprawnieniami użytkownika. 

- Zapewnienie spójności danych podczas równoczesnego wykonywania operacji, szczególnie przy akceptacji zgłoszeń i aktualizacji limitu miejsc. 

4 

### **2.3. Funkcjonalności dodatkowe (przyszłe rozszerzenia)** 

|Funkcjonalność|Opis|Priorytet|
|---|---|---|
|Interaktywna mapa wydarzeń|Mapa (np. Leaflet/OpenStreetMap) z pinezkami,<br>filtrowanie geolokalizacyjne (promień, kategoria,<br>data).|Wysoki|
|„Super Like” (premium)|Wyróżnione zgłoszenie, które w panelu organizatora<br>trafia na górę listy; ograniczona dzienna pula, zakup<br>dodatkowych.|Wysoki|
|Powiadomienia|E-mail / push o zmianie statusu zgłoszenia, nowym<br>zgłoszeniu, zmianie wydarzenia.|Wysoki|
|Czat wydarzenia|Grupowy czat zaakceptowanych uczestników i<br>organizatora.|Średni|
|Oceny i opinie|Wzajemne oceny organizatorów i uczestników,<br>budowanie reputacji.|Średni|
|Weryfikacja profili|Weryfikacja numeru telefonu / konta<br>społecznościowego, odznaka zaufanego<br>użytkownika.|Średni|
|Wydarzenia promowane|Płatne wyróżnienie wydarzenia w feedzie dla<br>organizatorów.|Średni|
|Konto organizatora PRO|Statystyki, wiele wydarzeń naraz, zaawansowane<br>filtry zgłoszeń, wydarzenia cykliczne.|Niski|
|Aplikacja mobilna|Klient natywny lub PWA/React Native korzystający z<br>tego samego API.|Niski|
|Rekomendacje|Personalizacja kolejności kart na podstawie historii<br>polubień.|Niski|
|Logowanie społecznościowe|Google / Facebook OAuth.|Niski|



##### **Zakres realizacji funkcjonalności dodatkowych** 

Wymienione funkcjonalności stanowią kierunek dalszego rozwoju platformy Vibrent. Nie wszystkie zostaną zaimplementowane w ramach podstawowej wersji MVP. W pierwszej kolejności zespół skupi się na funkcjonalnościach niezbędnych do prawidłowego działania systemu, obejmujących konta użytkowników, profile, zarządzanie wydarzeniami, przeglądanie kart oraz obsługę zgłoszeń. Implementacja mapy, powiadomień i mechanizmu Super Like będzie uzależniona od postępów prac i dostępnego czasu. Pozostałe funkcje zostaną potraktowane jako potencjalne rozszerzenia projektu. 

5 

## **3. Podział projektu na etapy** 

|Etap|Nazwa|Zakres|Rezultat|
|---|---|---|---|
|1|Inicjacja i<br>analiza|Karta zespołu, opis dziedziny, analiza rynku, wybór<br>frameworka frontendu, ustalenie standardów (git,<br>code review, konwencje).|Dokumentacja bazowa,<br>repozytorium|
|2|Projekt systemu|Diagramy DFD i ERD, projekt API, makiety<br>(wireframes), model bazy danych, architektura.|Komplet diagramów,<br>specyfikacja API, makiety|
|3|Fundament<br>techniczny|Szkielet API (.NET), migracje PostgreSQL, szkielet<br>frontendu, Docker Compose, CI.|Działające „puste” środowisko|
|4|Moduł kont|Rejestracja, logowanie, JWT, role, profil<br>użytkownika.|Działająca autoryzacja|
|5|Moduł<br>wydarzeń|CRUD wydarzeń, lokalizacja, limit miejsc, panel<br>„moje wydarzenia”.|Organizator może publikować<br>wydarzenia|
|6|Karty i<br>zgłoszenia|Widok swipe, like/odrzucenie, panel zgłoszeń<br>organizatora, akceptacja/odrzucenie, statusy.|Główny przepływ biznesowy<br>działa end-to-end|
|7|Moduły<br>rozszerzone|Implementacja wybranych funkcjonalności<br>dodatkowych, takich jak mapa wydarzeń,<br>mechanizm Super Like i powiadomienia. Zakres<br>realizacji będzie uzależniony od ukończenia<br>podstawowego MVP oraz dostępnego czasu<br>zespołu.|Wybrane funkcjonalności<br>dodatkowe działające w wersji<br>demonstracyjnej. W przypadku<br>braku czasu etap może zostać<br>ograniczony bez wpływu na<br>podstawowy zakres MVP.|
|8|Testy i<br>stabilizacja|Testy jednostkowe, integracyjne, manualne<br>scenariusze, poprawki błędów, bezpieczeństwo.|Raport testów, lista wykrytych<br>błędów oraz zweryfikowana<br>wersja aplikacji|
|9|Dokumentacja i<br>prezentacja|Dokumentacja końcowa, instrukcja uruchomienia,<br>materiały marketingowe, prezentacja i demo.|Wersja końcowa projektu|



6 

## **4. Marketingowe osadzenie produktu na rynku** 

### **4.1. Analiza istniejących rozwiązań** 

|Rozwiązanie|Mocne strony|Luki względem Vibrent|
|---|---|---|
|Facebook Events /<br>grupy|Ogromna baza<br>użytkowników|Chaos informacyjny, brak selekcji uczestników, brak<br>mechanizmu limitu miejsc i akceptacji, przeciążony<br>interfejs|
|Meetup|Dojrzała platforma<br>grup zainteresowań|Nastawiony na cykliczne grupy i spotkania<br>„networkingowe”, mało spontaniczności, mały<br>zasięg w Polsce wśród młodych|
|Eventbrite / bilety.pl|Sprzedaż biletów|Dla dużych, komercyjnych wydarzeń, nie dla luźnych<br>spotkań|
|Aplikacje randkowe<br>(Tinder, Bumble)|Atrakcyjny mechanizm<br>swipe|Skupione na relacjach 1:1, nie na wydarzeniach<br>grupowych|
|Komunikatory<br>(Messenger, Discord)|Szybka komunikacja|Brak odkrywania nowych wydarzeń i ludzi spoza<br>własnej grupy|



##### **Charakter analizy konkurencji** 

Przedstawione porównanie ma charakter jakościowy i opiera się na analizie podstawowych funkcjonalności oraz sposobu działania wybranych platform. Wskazane mocne strony i ograniczenia stanowią punkt odniesienia do określenia propozycji wartości Vibrent. Nie oznaczają one, że konkurencyjne rozwiązania nie posiadają dodatkowych funkcjonalności. Celem projektu jest wyróżnienie się połączeniem lokalnego wyszukiwania wydarzeń, mechanizmu swipe oraz akceptacji uczestników przez organizatora. 

### **4.2. Nisza i propozycja wartości** 

**Nisza:** nieformalne, towarzyskie wydarzenia lokalne dla młodych dorosłych (studenci, osoby świeżo przeprowadzone do miasta, osoby szukające nowych znajomości), tam gdzie wydarzenie jest małe, a organizator chce wiedzieć, kto przyjdzie. 

#### **Co wyróżnia Vibrent:** 

1. **Swipe zamiast przeglądania list** : szybkie, angażujące odkrywanie wydarzeń w kilka sekund. 

2. **Akceptacja przez organizatora** : bezpieczeństwo i kontrola nad składem uczestników, co jest kluczowe przy prywatnych, małych spotkaniach. 

3. **Limit miejsc wbudowany w rdzeń systemu** : koniec z niepewnością, ile osób przyjdzie. 

4. **Lokalność i spontaniczność** : wydarzenia „na dziś wieczór” obok planowanych z wyprzedzeniem. 

5. **Niski próg wejścia** : wchodzisz bez grupy znajomych i bez umawiania się z kimś w komunikatorze. 

7 

##### **Główna przewaga projektu** 

Vibrent koncentruje się na uproszczeniu procesu znajdowania i organizowania niewielkich wydarzeń towarzyskich. W przeciwieństwie do tradycyjnych platform ogłoszeniowych użytkownik nie musi przeglądać długich list wydarzeń, ponieważ może podejmować szybkie decyzje za pomocą kart. Dodatkowo organizator zachowuje kontrolę nad listą uczestników i dostępnością miejsc. 

### **4.3. Grupa docelowa** 

- **Uczestnicy:** osoby 18–30 lat, głównie studenci i młodzi pracownicy w miastach. 

- **Organizatorzy:** osoby prywatne organizujące spotkania, koła naukowe, organizacje studenckie, kluby sportowe, małe lokale (puby, kawiarnie, kluby gier planszowych). 

### **4.4. Strategia wejścia na rynek** 

- **Start lokalny:** jedno miasto akademickie, współpraca z samorządami studenckimi i kołami naukowymi. 

- **Social media:** krótkie wideo (TikTok / Instagram Reels) pokazujące mechanikę swipe, kampanie z lokalnymi twórcami. 

- **Program ambasadorów:** pierwsi organizatorzy dostają darmowe funkcje premium. 

- **Współpraca z lokalami:** pakiety promocyjne dla pubów i kawiarni, które chcą przyciągać gości. 

- **Efekt sieciowy:** rozwiązanie problemu „zimnego startu” przez zasiewanie platformy wydarzeniami organizowanymi przez zespół i partnerów. 

### **4.5. Ryzyka rynkowe** 

- Efekt sieciowy: bez wydarzeń nie ma użytkowników, bez użytkowników nie ma organizatorów. 

- Bezpieczeństwo uczestników: potrzeba moderacji, weryfikacji i zgłaszania nadużyć. 

- Konkurencja ze strony Facebooka i potencjalna kopia pomysłu przez większych graczy. 

- Niewystarczająca liczba wydarzeń w początkowym okresie działania platformy – ograniczone zainteresowanie użytkowników. Działanie zapobiegawcze: współpraca z organizacjami studenckimi, lokalnymi społecznościami i pierwszymi organizatorami wydarzeń. 

- Brak zaufania nowych użytkowników do wydarzeń organizowanych przez nieznane osoby – ograniczona liczba zgłoszeń i uczestników. Działanie zapobiegawcze: rozwijanie mechanizmów moderacji, zgłaszania nadużyć oraz w przyszłości weryfikacji profili. 

8 

## **5. Wykazanie korzyści finansowych i model biznesowy** 

|Źródło przychodu|Mechanizm|Odbiorca|
|---|---|---|
|Super Like|Mikropłatności za dodatkowe wyróżnione<br>zgłoszenia|Uczestnicy|
|Subskrypcja<br>Premium|Nielimitowane przeglądanie, więcej Super Like,<br>filtry zaawansowane, brak reklam|Uczestnicy|
|Wydarzenia<br>promowane|Opłata za wyższą pozycję wydarzenia w feedzie i<br>na mapie|Organizatorzy|
|Konto Organizator<br>PRO|Abonament: statystyki, wydarzenia cykliczne,<br>masowe zarządzanie zgłoszeniami|Organizatorzy, lokale|
|Pakiety dla lokali|Reklama lokalna, sponsorowane wydarzenia|Puby, kluby, kawiarnie|
|Prowizja od<br>biletów<br>(przyszłość)|Procent od płatnych wydarzeń|Organizatorzy|
|Reklamy|Ograniczone, nienachalne reklamy w darmowej<br>wersji|Reklamodawcy lokalni|



##### **Model biznesowy** 

Vibrent będzie rozwijany w modelu freemium. Podstawowe funkcjonalności platformy, obejmujące przeglądanie wydarzeń, tworzenie zgłoszeń oraz zarządzanie wydarzeniami, będą dostępne bezpłatnie. Potencjalne źródła przychodów w przyszłości obejmują subskrypcje Premium, mechanizm Super Like, promowanie wydarzeń oraz współpracę z lokalnymi przedsiębiorstwami. 

Wymienione źródła przychodów będą wdrażane stopniowo, po uruchomieniu podstawowej wersji aplikacji i zbudowaniu odpowiedniej bazy użytkowników. 

**Koszty:** hosting (chmura, baza PostgreSQL), domena i certyfikaty, usługi map i powiadomień, marketing, moderacja treści. 

### **5.1. Szacunkowa analiza finansowa (Business Case)** 

Zakładając pomyślne wdrożenie MVP w docelowym mieście akademickim i zbudowanie bazy 2000 aktywnych użytkowników w pierwszym roku, przewidujemy, że około 5% z nich (100 osób) zdecyduje się na subskrypcję Premium w cenie 15 zł/m-c, co wygeneruje 1500 zł miesięcznego przychodu. Dodatkowo, sprzedaż pakietów promocyjnych dla lokalnych biznesów (np. 10 pubów czy kawiarni płacących 50 zł/m-c za wyróżnianie wydarzeń) przyniesie kolejne 500 zł. Doliczając szacowane wpływy z mikropłatności za pakiety „Super Like” (ok. 200 zł), łączny miesięczny przychód platformy wyniesie 2200 zł. 

9 

Przy założonych przychodach miesięcznych na poziomie 2200 zł oraz szacowanych kosztach infrastruktury wynoszących około 400 zł, różnica między przychodami a kosztami infrastruktury wynosi 1800 zł. Wartość ta nie stanowi pełnego zysku operacyjnego, ponieważ kalkulacja nie uwzględnia wszystkich potencjalnych kosztów, takich jak marketing, prowizje operatorów płatności, moderacja, usługi zewnętrzne oraz dalszy rozwój aplikacji. 

Przedstawione wartości mają charakter szacunkowy i służą zobrazowaniu potencjalnego modelu przychodowego projektu. Ich rzeczywista realizacja będzie zależała od liczby aktywnych użytkowników, zainteresowania funkcjami płatnymi oraz kosztów utrzymania platformy. Założenia te stanowią akademicki model biznesowy na potrzeby oceny potencjału projektu. 

## **6. Koncepcja w języku wykonawczym (zadania dla zespołu)** 

Realizacja projektu Vibrent zostanie podzielona na pięć głównych obszarów: backend, frontend, bazę danych, testowanie oraz dokumentację i prezentację. Każdy obszar posiada określony zakres prac, odpowiedzialność oraz oczekiwany rezultat. Prace będą prowadzone równolegle, zgodnie z harmonogramem projektu i przyjętym podziałem obowiązków. 

### **6.1. Backend (.NET)** 

##### **Odpowiedzialni: Backend 1 i Backend 2.** 

Zakres zadań: 

- Przygotowanie projektu ASP.NET Core Web API z podziałem na kontrolery, serwisy, repozytoria i encje. 

- Konfiguracja Entity Framework Core oraz połączenia z bazą PostgreSQL za pomocą Npgsql. 

- Implementacja rejestracji, logowania, obsługi profilu użytkownika i autoryzacji JWT. 

- Implementacja ról użytkowników: User, Organizer oraz Admin, z uwzględnieniem możliwości pełnienia przez jedno konto funkcji uczestnika i organizatora. 

- Przygotowanie kontrolerów: AuthController, UsersController, EventsController, 

   - SwipesController, ApplicationsController oraz AdminController. 

- Implementacja endpointów API: 

      - <mark>`POST /auth/register - rejestracja użytkownika.`</mark> 

      - <mark>`POST /auth/login – logowanie użytkownika.`</mark> 

      - <mark>`GET/PUT /users/me – pobieranie I edycja profile.`</mark> 

      - <mark>`POST /events – tworzenie wydarzeń.`</mark> 

      - <mark>`PUT /events/{id} – edycja wydarzeń.`</mark> 

      - <mark>`DELETE /events/{id} – usuwanie lub anulowanie wydarzeń zgodnie z przyjętą polityką.`</mark> 

      - <mark>`GET /events/mine – pobieranie wydarzeń organizatora.`</mark> 

      - <mark>`GET /events/feed?lat=&lng=&radius= - pobieranie wydarzeń do przeglądania.`</mark> 

      - <mark>`POST /events/{id}/swipe – zapis decyzji like/dislike.`</mark> 

      - <mark>`GET /events/{id}/applications – pobieranie zgłoszeń na wydarzenie.`</mark> 

      - <mark>`PATCH /applications/{id} – akceptacja lub odrzucenie zgłoszenia.`</mark> 

      - <mark>`GET /applications/mine – pobieranie własnych zgłoszeń.`</mark> 

10 

   - <mark>`PATCH /applications/{id}/withdraw – wycofanie zgłoszenia.`</mark> 

   - <mark>`PUT /auth/change-password – zmiana hasła.`</mark> 

- Wprowadzenie reguł biznesowych: brak podwójnego zgłoszenia na to samo wydarzenie, blokada akceptacji po osiągnięciu limitu miejsc, zakaz zgłaszania się organizatora na własne wydarzenie. 

- Zabezpieczenie operacji zmiany liczby miejsc za pomocą transakcji bazodanowych. 

- Implementacja walidacji danych z wykorzystaniem FluentValidation oraz obsługi błędów. 

- Udostępnienie dokumentacji API za pomocą Swagger/OpenAPI. 

##### **Podział prac:** 

Backend 1 – struktura backendu, konfiguracja projektu, moduł kont, autoryzacja oraz zarządzanie wydarzeniami. 

Backend 2 – feed wydarzeń, mechanizm swipe, obsługa zgłoszeń oraz reguły biznesowe. 

**Rezultat:** działające API umożliwiające obsługę kont, wydarzeń i zgłoszeń uczestników. 

11 

### **6.2. Frontend** 

##### **Odpowiedzialni: Frontend 2 i Frontend 1.** 

Zakres zadań: 

- Wykorzystanie frameworka React jako wspólnej technologii frontendowej dla całego zespołu. 

- Przygotowanie struktury aplikacji oraz wspólnych komponentów interfejsu. 

- Implementacja widoków rejestracji, logowania i profilu użytkownika. 

- Przygotowanie feedu wydarzeń w formie kart z mechanizmem swipe. 

- Implementacja szczegółów wydarzenia oraz formularzy tworzenia i edycji wydarzeń. 

- Przygotowanie panelu organizatora umożliwiającego przeglądanie i zarządzanie zgłoszeniami. 

- Przygotowanie widoku własnych zgłoszeń wraz z ich statusami. 

- Implementacja komunikacji z backendem poprzez REST API. 

- Obsługa sesji użytkownika, tokenów JWT oraz błędów zwracanych przez API. 

- Zapewnienie responsywności interfejsu zgodnie z podejściem mobile-first. 

- Przygotowanie komponentów umożliwiających późniejsze rozszerzenie aplikacji o mapę wydarzeń. 

##### **Podział prac:** 

Frontend 1 – struktura frontendu, widoki kont użytkowników, profil oraz mechanizm swipe i feed wydarzeń. 

Frontend 2 – formularze wydarzeń, szczegóły wydarzeń, panel organizatora oraz obsługa zgłoszeń. 

**Rezultat:** responsywna aplikacja internetowa umożliwiająca korzystanie z podstawowych funkcjonalności systemu Vibrent. 

### **6.3. Baza danych** 

**Odpowiedzialni: Backend 1 i Backend 2, przy współpracy z osobami odpowiedzialnymi za dokumentację.** 

Zakres zadań: 

- Przygotowanie i konfiguracja relacyjnej bazy danych PostgreSQL. 

- Implementacja struktury tabel zgodnie z diagramem ERD. 

- Utworzenie relacji pomiędzy użytkownikami, wydarzeniami, kategoriami, swipe'ami i zgłoszeniami. 

- Konfiguracja Entity Framework Core oraz migracji bazy danych. 

- Wprowadzenie ograniczeń integralności danych, w tym unikalności par użytkownik–wydarzenie. 

12 

- Zapewnienie spójności liczby zaakceptowanych uczestników z limitem miejsc wydarzenia. 

- Przygotowanie indeksów dla pól wykorzystywanych podczas filtrowania wydarzeń, takich jak data, status i lokalizacja. 

- Rozważenie wykorzystania rozszerzenia PostGIS w przypadku implementacji zaawansowanych zapytań geolokalizacyjnych. 

**Rezultat:** działająca baza danych zapewniająca poprawne przechowywanie i obsługę informacji wykorzystywanych przez aplikację. 

### **6.4. Testy** 

##### **Odpowiedzialni: Tester 1 i Tester 2, przy współpracy całego zespołu.** 

Zakres zadań: 

- Przygotowanie scenariuszy testowych na podstawie wymagań funkcjonalnych projektu. 

- Wykonywanie testów jednostkowych serwisów backendowych z wykorzystaniem xUnit. 

- Przygotowanie i wykonywanie testów integracyjnych endpointów API. 

- Testowanie rejestracji, logowania i edycji profilu. 

- Testowanie tworzenia, edycji i usuwania wydarzeń. 

- Weryfikacja poprawności działania feedu oraz mechanizmu swipe. 

- Testowanie akceptacji, odrzucenia i wycofywania zgłoszeń 

- Sprawdzenie zabezpieczeń przed podwójnym zgłoszeniem i przekroczeniem limitu miejsc. 

- Testowanie uprawnień wynikających z przypisanych ról. 

- Sprawdzenie responsywności aplikacji na urządzeniach mobilnych i komputerach. 

- Rejestrowanie błędów w systemie issue trackera oraz ponowne testowanie poprawionych funkcjonalności. 

##### **Podział prac:** 

Tester 1 – testy backendu, API, reguł biznesowych oraz przygotowanie raportów błędów. 

Tester 2 – testy interfejsu, scenariusze end-to-end, responsywność oraz retesty poprawek. 

**Rezultat:** zweryfikowana poprawność działania najważniejszych funkcjonalności aplikacji oraz raport przeprowadzonych testów. 

13 

### **6.5. Dokumentacja i prezentacja** 

##### **Odpowiedzialni: Dokumentacja 1, Dokumentacja 2, Lider i Marketing.** 

##### Zakres zadań: 

- Opracowanie i aktualizowanie dokumentacji projektowej. 

- Przygotowanie diagramów DFD i ERD oraz ich aktualizacja zgodnie z rozwojem systemu. 

- Opracowanie specyfikacji API i opisu najważniejszych endpointów. 

- Przygotowanie instrukcji konfiguracji i uruchomienia aplikacji. 

- Prowadzenie dziennika zmian projektowych. 

- Dokumentowanie wyników testów i najważniejszych decyzji architektonicznych. 

- Przygotowanie logo oraz materiałów identyfikacji wizualnej projektu. 

- Opracowanie makiety prezentacji końcowej i materiałów marketingowych. 

- Przygotowanie krótkiego nagrania demonstracyjnego aplikacji. 

- Opracowanie slajdów i przygotowanie prezentacji projektu podczas obrony. 

##### **Podział prac:** 

Dokumentacja 1 – dokumentacja dziedziny projektu, diagramy DFD i ERD oraz dokumentacja końcowa. 

Dokumentacja 2 – specyfikacja API, makiety, instrukcja uruchomienia i dokumentacja testów. 

Lider – koordynacja prac, kontrola postępów i przygotowanie prezentacji końcowej. 

Marketing – analiza rynku, logo, materiały promocyjne oraz demo wideo. 

**Rezultat:** kompletna i aktualna dokumentacja techniczna oraz materiały umożliwiające prezentację działania projektu. 

### **6.6. Integracja i współpraca zespołu** 

- Wszystkie osoby pracują zgodnie z ustalonym harmonogramem oraz przydzielonym zakresem obowiązków. 

- Backend i frontend korzystają ze wspólnej specyfikacji REST API. 

- Zmiany w strukturze bazy danych i API są konsultowane z odpowiednimi członkami zespołu. 

- Kod źródłowy jest przechowywany we wspólnym repozytorium Git. 

- Wprowadzane zmiany podlegają przeglądowi kodu (code review). 

- Zespół organizuje cotygodniowe spotkania w celu omówienia postępów, problemów i kolejnych zadań. 

- Każdy członek zespołu odpowiada za terminowe wykonanie przydzielonych zadań i zgłaszanie ewentualnych opóźnień. 

**Końcowy rezultat:** zintegrowana, przetestowana i udokumentowana aplikacja Vibrent w zakresie ustalonego MVP. 

14 

## **7. Przydział etapów do członków zespołu** 

Przydział odpowiada rolom z Karty Zespołu Projektowego: każda osoba pracuje głównie w swojej roli, a etapy są rozdzielone tak, by backend, frontend, testerzy i dokumentacja pracowali równolegle. 

|Osoba|Rola|Główne zadania i etapy|
|---|---|---|
|Lider|Lider,<br>Prezentacja/<br>Marketing|Koordynacja prac zespołu, organizowanie cotygodniowych spotkań,<br>monitorowanie postępu realizacji harmonogramu, rozwiązywanie problemów<br>organizacyjnych, uzgadnianie decyzji projektowych z osobami<br>odpowiedzialnymi za backend i frontend, kontrola kompletności dokumentacji<br>oraz współprzygotowanie prezentacji końcowej (etapy 1–9).|
|Dokumentacja 1|Dokumentacja|Opracowanie opisu dziedziny projektu, przygotowanie i aktualizacja<br>diagramów DFD oraz ERD, współpraca przy określaniu struktury systemu,<br>bieżące prowadzenie dokumentacji projektowej oraz przygotowanie<br>dokumentacji końcowej (etapy 1–2 i 9).|
|Dokumentacja 2|Dokumentacja|Przygotowanie specyfikacji API, opracowanie makiet interfejsu we współpracy<br>z zespołem frontendowym, przygotowanie instrukcji uruchomienia aplikacji,<br>dokumentowanie scenariuszy i wyników testów oraz współtworzenie<br>dokumentacji końcowej (etapy 2–9).|
|Frontend 1|Frontend|Przygotowanie struktury frontendu, implementacja widoków rejestracji,<br>logowania i profilu użytkownika, obsługa sesji użytkownika, implementacja<br>mechanizmu swipe oraz feedu wydarzeń, współpraca przy integracji<br>frontendu z backendem (etapy 3–6).|
|Frontend 2|Frontend|Implementacja formularzy tworzenia i edycji wydarzeń, widoku szczegółów<br>wydarzenia, widoku własnych wydarzeń oraz panelu organizatora. Integracja<br>widoków z API, obsługa zgłoszeń oraz udział w przygotowaniu modułu mapy<br>jako funkcjonalności dodatkowej (etapy 5–7).|
|Backend 1|Backend|Przygotowanie struktury backendu ASP.NET Core Web API, konfiguracja<br>połączenia z PostgreSQL, migracje bazy danych, implementacja modułu kont<br>użytkowników i autoryzacji JWT, realizacja modułu zarządzania wydarzeniami<br>oraz współpraca przy integracji backendu z frontendem (etapy 2–5 i 7).|
|Backend 2|Backend|Współtworzenie architektury backendu i specyfikacji API, implementacja<br>feedu wydarzeń, mechanizmu swipe, obsługi zgłoszeń oraz reguł biznesowych<br>związanych z akceptacją uczestników i limitem miejsc. Udział w realizacji<br>wybranych funkcjonalności dodatkowych (etapy 2, 5–7).|



15 

|Osoba|Rola|Główne zadania i etapy|
|---|---|---|
|Tester 1|Tester|Przygotowanie scenariuszy testowych, testowanie endpointów API,<br>weryfikacja poprawności działania reguł biznesowych, wykonywanie testów<br>jednostkowych i integracyjnych we współpracy z programistami,<br>dokumentowanie wykrytych błędów oraz weryfikacja wprowadzonych<br>poprawek (etapy 4–8).|
|Tester 2|Tester|Przygotowanie i realizacja testów interfejsu użytkownika, weryfikacja<br>głównych scenariuszy end-to-end, testowanie responsywności aplikacji na<br>różnych urządzeniach, zgłaszanie błędów oraz ponowne testowanie<br>poprawionych funkcjonalności (etapy 4–8).|
|Marketing|Prezentacja/<br>Marketing|Analiza rynku i konkurencji, opracowanie propozycji wartości produktu,<br>przygotowanie logo i materiałów promocyjnych, współpraca przy<br>przygotowaniu materiałów demonstracyjnych, nagranie krótkiego demo<br>aplikacji oraz przygotowanie prezentacji końcowej (etapy 1 i 9).|



Podział obowiązków ma charakter organizacyjny i nie wyklucza współpracy pomiędzy członkami zespołu. W szczególności programiści backendu i frontendu będą uzgadniać sposób komunikacji między modułami, testerzy będą uczestniczyć w weryfikacji kolejnych funkcjonalności już podczas ich implementacji, a osoby odpowiedzialne za dokumentację będą na bieżąco aktualizować opisy systemu. Lider projektu będzie monitorował postępy prac i koordynował współpracę pomiędzy poszczególnymi obszarami. 

16 

## **8. Terminarz działań (podstawa diagramu Gantta)** 

Poniżej harmonogram w układzie tygodniowym (14 tygodni), startujący 20 października 2026 r. 

|Etap|Odpowiedzialni|T1<br>T2|T3<br>T4|T5|T6<br>T7|T8<br>T9|T10<br>T11|T12|T13<br>T14|
|---|---|---|---|---|---|---|---|---|---|
|1. Inicjacja i analiza|Lider, Dokumentacja 1, Marketing|■<br>■|■|||||||
|2. Projekt systemu (DFD, ERD,<br>API, makiety)|Dokumentacja 1, Dokumentacja 2, Backend 2|■|■<br>■|||||||
|3. Fundament techniczny|Backend 1, Frontend 1||■<br>■|■||||||
|4. Moduł kont|Backend 1, Frontend 1, Tester 1<br>(scenariusze)||■|■|■|||||
|5. Moduł wydarzeń|Backend 1, Frontend 2|||■|■<br>■|||||
|6. Karty i zgłoszenia|Backend 2, Frontend 1, Frontend 2||||■|■<br>■||||
|7. Moduły rozszerzone (mapa,<br>Super Like)|Backend 2, Frontend 2, Backend 1|||||■|■<br>■|||
|8. Testy i stabilizacja|Tester 1, Tester 2 (+ cały zespół)||||||■|■|■|
|9. Dokumentacja i prezentacja|Dokumentacja 1, Dokumentacja 2, Lider, Marketing|||||||■|■<br>■|



17 



<!-- Start of picture text -->
: |<br>1D} Task Name ' 026-10Per) 2 e261o oe 1s 2 e2022 oe 13 20 n onan os ‘0 7” om<br>1 Inejaca anata (11-3) Ee<br>2 Projekt systemu (T2-T4) C7<br>3 Fundament echiceny (13-75) id<br>4 Mout ont 1476) H Te]<br>5 Modul wydarzef (75-77) TC<br>6 Karty i2gloszenia (17-78) [<br>7 Modul rozszerzne 78.711) i<br>8 “Testy staitzaca (710-11) PC<br>° Dokumentacja prezentacja (112-714) TC<br>Pee<br><!-- End of picture text -->

**Rysunek 8.1.** Wykres Gantta 

#### **Kamienie milowe:** 

- **T4:** zatwierdzony projekt systemu (DFD, ERD, specyfikacja API). 

- **T6:** działa logowanie i szkielet aplikacji. 

- **T7:** organizator może opublikować wydarzenie. 

- **T9:** kompletny przepływ swipe → zgłoszenie → akceptacja (MVP funkcjonalne). 

- **T11:** funkcje dodatkowe w wersji demonstracyjnej. 

- **T13:** zamrożenie kodu, koniec testów. 

- **T14:** prezentacja końcowa. 

18 

## **9. Diagramy inżynieryjne** 

### **9.1. Diagram przepływu danych (DFD)** 

**Encje zewnętrzne:** Użytkownik (uczestnik), Organizator, Administrator, (opcjonalnie) usługa map, usługa powiadomień. 

**Poziom 0 (diagram kontekstowy)** – jeden proces: _System Vibrent_ . 



**Rysunek 9.1.1.** Diagram przepływu danych (DFD) poziomu 0 – diagram kontekstowy systemu Vibrent 

|Źródło / odbiorca|Przepływ danych|
|---|---|
|Użytkownik → System|dane rejestracji i logowania, edycja profilu, decyzje swipe<br>(like/odrzucenie), wycofanie zgłoszenia|
|System → Użytkownik|karty wydarzeń, szczegóły wydarzenia, status zgłoszeń,<br>powiadomienia|
|Organizator → System|dane wydarzenia, decyzje o zgłoszeniach<br>(akceptacja/odrzucenie)|
|System → Organizator|lista zgłoszeń, profile chętnych, liczba wolnych miejsc|
|Administrator → System|decyzje moderacyjne, blokady kont|
|System → Administrator|zgłoszenia nadużyć, statystyki|



19 

#### **Poziom 1 – procesy:** 



**Rysunek 9.1.2.** Diagram przepływu danych (DFD) poziomu 1, część A – procesy 1.0–5.0 (rdzeń MVP) 

20 



**Rysunek 9.1.3.** Diagram przepływu danych (DFD) poziomu 1, część B – procesy 6.0–7.0 (powiadomienia, monetyzacja, moderacja) 

|Nr|Proces|Wejście|Wyjście|Magazyny danych|
|---|---|---|---|---|
|1.0|Konta i Profile|dane rejestracji,<br>logowania, profilu|token JWT, profil|D1 Użytkownicy|
|2.0|Zarządzanie<br>wydarzeniami|dane wydarzenia|zapisane/zmienione<br>wydarzenie|D2 Wydarzenia,<br>D1|
|3.0|Feed kart|lokalizacja, filtry|lista kart|D2, D3 Swipe'y|
|4.0|Obsługa swipe i<br>zgłoszeń|decyzja like/odrzuć|nowe zgłoszenie<br>(status: oczekujące)|D3 Swipe'y, D4<br>Zgłoszenia|
|5.0|Weryfikacja zgłoszeń<br>przez organizatora|decyzja<br>organizatora|zmiana statusu,<br>aktualizacja liczby<br>miejsc|D4, D2|
|6.0|Powiadomienia i<br>monetyzacja<br>(rozszerzenie)|zdarzenia<br>systemowe,<br>płatności|powiadomienia,<br>aktywacja Super Like|D5<br>Płatności/Premiu<br>m, D4|
|7.0|Moderacja|zgłoszenia nadużyć|blokady, usunięcia<br>treści|D1, D2, D6<br>Zgłoszenia<br>nadużyć|



21 

### **9.2. Diagram związków encji (ERD)** 

**Encje i atrybuty (PK – klucz główny, FK – klucz obcy):** 



<!-- Start of picture text -->
— | = _ —<br>ee]<br><!-- End of picture text -->



<!-- Start of picture text -->
—<br>|<br><!-- End of picture text -->

**Rysunek 9.2.1.** Diagram związków encji (ERD) bazy danych systemu Vibrent 

22 

|Encja|Atrybuty|
|---|---|
|**User**|**Id (PK)**, Email (unikalny), PasswordHash, DisplayName,<br>Bio, AvatarUrl, City, Role, IsVerified, IsBlocked, CreatedAt|
|**Event**|**Id (PK)**, organizer_id (FK → User), Title, Description,<br>CategoryId (FK → Category), StartsAt, Address, Latitude,<br>Longitude, Capacity, AcceptedCount, ImageUrl, Status,<br>IsPromoted, CreatedAt|
|**Category**|**Id (PK)**, Name|
|**Swipe**|**Id (PK)**, UserId (FK → User), EventId (FK → Event),<br>Decision (like / dislike), IsSuperLike, CreatedAt;<br>unikalność pary (UserId, EventId)|
|**Application**|**Id (PK)**, UserId (FK → User), EventId (FK → Event), Status<br>(pending / accepted / rejected / withdrawn), IsSuperLike,<br>CreatedAt, DecidedAt|
|**Report** _(rozszerzenie)_|**Id (PK)**, ReporterId (FK → User), TargetUserId (FK),<br>TargetEventId (FK), Reason, Status, CreatedAt|
|**Notification** _(rozszerzenie)_|**Id (PK)**, UserId (FK → User), Type, Content, IsRead,<br>CreatedAt|
|**PremiumPurchase** _(rozszerzenie)_|**Id (PK)**, UserId (FK → User), Type (super-like pack /<br>subscription), Amount, PurchasedAt, ValidUntil|



23 

##### **Związki:** 

|Związek|Krotność|Opis|
|---|---|---|
|User – Event|1 : N|jeden organizator tworzy wiele wydarzeń|
|Category – Event|1 : N|kategoria obejmuje wiele wydarzeń|
|User – Swipe|1 : N|użytkownik wykonuje wiele swipe'ów|
|Event – Swipe|1 : N|wydarzenie otrzymuje wiele ocen|
|User – Application|1 : N|użytkownik wysyła wiele zgłoszeń|
|Event – Application|1 : N|wydarzenie ma wiele zgłoszeń|
|User – Event (przez Application)|M : N|uczestnicy i wydarzenia, rozwiązane tabelą<br>Application|
|User – Report / Notification /<br>PremiumPurchase|1 : N|dane powiązane z kontem|



**Reguły integralności:** zgłoszenie powstaje wyłącznie z decyzji _like_ ; para (UserId, EventId) jest unikalna w tabelach Swipe i Application; AcceptedCount nie może przekroczyć Capacity; organizator nie może zgłosić się na własne wydarzenie. 

## **10. Ryzyka projektu i sposoby ograniczania** 

|Ryzyko|Skutek|Działanie zapobiegawcze|
|---|---|---|
|Zbyt szeroki zakres<br>względem czasu|Niedokończone MVP|Ścisły podział must have / dodatkowe,<br>zamrożenie zakresu po T3|
|Konflikty w kodzie przy<br>10 osobach|Opóźnienia|Branching strategy, małe pull requesty,<br>obowiązkowy code review|
|Rozbieżność frontend–<br>backend|Błędy integracji|Wspólna specyfikacja OpenAPI przed<br>implementacją|
|Brak testów|Błędy w produkcji|Tester od początku, testy w CI|
|Niezrównoważone<br>obciążenie|Wypalenie, spóźnienia|Cotygodniowe spotkania i przegląd postępów|



24 

## **11. Podsumowanie** 

Vibrent łączy sprawdzony mechanizm swipe z realnym problemem organizacji spotkań towarzyskich. MVP skupia się na rdzeniu: konta, wydarzenia, karty i akceptacja zgłoszeń, a mapa, Super Like i powiadomienia stanowią kolejny krok i podstawę modelu przychodowego. 

25 


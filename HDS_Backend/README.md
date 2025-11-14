# HDS Backend

Backend API dla systemu sterowania chmarą dronów (Drone Swarm Control System).

## 🚀 Technologie

- **FastAPI** - nowoczesny framework do budowy API
- **PostgreSQL** - baza danych
- **SQLAlchemy** - ORM
- **Docker & Docker Compose** - konteneryzacja

## 📁 Struktura projektu

```
HDS_Backend/
├── app/
│   ├── api/              # Endpointy API
│   │   ├── drones.py     # API dla dronów
│   │   └── telemetry.py  # API dla telemetrii
│   ├── database/         # Konfiguracja bazy danych
│   │   └── connection.py
│   ├── models/           # Modele SQLAlchemy
│   │   ├── drone.py
│   │   └── telemetry.py
│   ├── schemas/          # Schematy Pydantic
│   │   ├── drone.py
│   │   └── telemetry.py
│   └── main.py          # Główny plik aplikacji
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## 🗄️ Schemat bazy danych

### Tabela: `drones`
- `id` - Integer (Primary Key)
- `name` - String (Unique, wymagane)
- `status` - String (idle, active, returning, error, offline)
- `battery` - Float (0-100%)
- `created_at` - DateTime
- `updated_at` - DateTime

### Tabela: `telemetry`
- `id` - Integer (Primary Key)
- `drone_id` - Integer (Foreign Key -> drones.id)
- `position_x` - Float (współrzędna X)
- `position_y` - Float (współrzędna Y)
- `position_z` - Float (wysokość)
- `velocity` - Float (prędkość)
- `heading` - Float (kierunek 0-360°)
- `battery` - Float (0-100%)
- `signal_strength` - Float (0-100%)
- `status` - String
- `timestamp` - DateTime

## 🐳 Uruchomienie z Docker

### Wymagania
- Docker
- Docker Compose

### Kroki

1. **Sklonuj repozytorium i przejdź do katalogu HDS_Backend**
   ```bash
   cd HDS_Backend
   ```

2. **Zbuduj i uruchom kontenery**
   ```bash
   docker-compose up --build
   ```

3. **API będzie dostępne pod adresem:**
   - API: http://localhost:8000
   - Dokumentacja (Swagger): http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Zatrzymanie
```bash
docker-compose down
```

### Zatrzymanie z usunięciem danych
```bash
docker-compose down -v
```

## 💻 Uruchomienie lokalne (bez Dockera)

### Wymagania
- Python 3.11+
- PostgreSQL

### Kroki

1. **Utwórz wirtualne środowisko**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # lub
   venv\Scripts\activate  # Windows
   ```

2. **Zainstaluj zależności**
   ```bash
   pip install -r requirements.txt
   ```

3. **Skonfiguruj bazę danych PostgreSQL**
   - Utwórz bazę danych: `hds_db`
   - Utwórz użytkownika: `hds_user` z hasłem `hds_password`

4. **Ustaw zmienne środowiskowe**
   ```bash
   cp .env.example .env
   # Edytuj .env i ustaw DATABASE_URL
   ```

5. **Uruchom serwer**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📡 API Endpoints

### Drones

#### `POST /drones/`
Utwórz nowego drona
```json
{
  "name": "Dron-01",
  "status": "idle",
  "battery": 100.0
}
```

#### `GET /drones/`
Pobierz listę wszystkich dronów

#### `GET /drones/{drone_id}`
Pobierz szczegóły konkretnego drona

#### `PUT /drones/{drone_id}`
Zaktualizuj dane drona
```json
{
  "status": "active",
  "battery": 85.5
}
```

#### `DELETE /drones/{drone_id}`
Usuń drona

### Telemetry

#### `POST /telemetry/`
Dodaj rekord telemetrii
```json
{
  "drone_id": 1,
  "position_x": 10.5,
  "position_y": 20.3,
  "position_z": 5.0,
  "velocity": 15.0,
  "heading": 90.0,
  "battery": 85.0,
  "signal_strength": 95.0,
  "status": "active"
}
```

#### `GET /telemetry/`
Pobierz listę rekordów telemetrii (z opcjonalnym filtrowaniem po `drone_id`)

#### `GET /telemetry/drone/{drone_id}`
Pobierz telemetrię dla konkretnego drona

#### `GET /telemetry/drone/{drone_id}/latest`
Pobierz najnowszy rekord telemetrii dla drona

#### `DELETE /telemetry/{telemetry_id}`
Usuń rekord telemetrii

## 🧪 Testowanie API

### Użycie Swagger UI
Otwórz http://localhost:8000/docs w przeglądarce

### Użycie curl

**Dodaj drona:**
```bash
curl -X POST "http://localhost:8000/drones/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Dron-01", "status": "idle", "battery": 100.0}'
```

**Pobierz listę dronów:**
```bash
curl "http://localhost:8000/drones/"
```

**Dodaj telemetrię:**
```bash
curl -X POST "http://localhost:8000/telemetry/" \
  -H "Content-Type: application/json" \
  -d '{
    "drone_id": 1,
    "position_x": 10.5,
    "position_y": 20.3,
    "position_z": 5.0,
    "velocity": 15.0,
    "heading": 90.0,
    "battery": 85.0,
    "signal_strength": 95.0,
    "status": "active"
  }'
```

## 🔧 Przydatne komendy Docker

**Zobacz logi:**
```bash
docker-compose logs -f backend
```

**Restart serwisu:**
```bash
docker-compose restart backend
```

**Wejdź do kontenera:**
```bash
docker-compose exec backend bash
```

**Wejdź do PostgreSQL:**
```bash
docker-compose exec db psql -U hds_user -d hds_db
```

## 📝 Dalszy rozwój

W przyszłości planujemy dodać:
- [ ] System zarządzania misjami
- [ ] Websockets dla telemetrii w czasie rzeczywistym
- [ ] Autentykację i autoryzację
- [ ] System logowania i monitoringu
- [ ] Testy jednostkowe i integracyjne
- [ ] Migracje bazy danych (Alembic)

## 🤝 Contributing

To jest projekt studencki. Wszelkie sugestie i pull requesty są mile widziane!

## 📄 Licencja

Projekt edukacyjny.
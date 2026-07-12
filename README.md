# <p align="center">🌅 Maharashtra Tourism & Smart Travel Portal</p>

<p align="center">
  <img src="frontend/src/assets/hero.png" alt="Maharashtra Tourism Banner" width="100%" style="border-radius: 12px; max-height: 350px; object-fit: cover; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" onerror="this.src='https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=1200&q=80'"/>
</p>

<p align="center">
  <strong>An advanced, full-stack, AI-powered travel ecosystem designed to offer tourists automated multi-day itineraries, sub-millisecond local crowd forecasts, real-time weather alerts, and streamlined bookings across Maharashtra's heritage, spiritual, and scenic landmarks.</strong>
</p>

<p align="center">
  <a href="#-getting-started"><img src="https://img.shields.io/badge/Setup-Guide-brightgreen?style=for-the-badge&logo=read-the-docs" alt="Setup Guide"/></a>
  <a href="#-system-architecture"><img src="https://img.shields.io/badge/Architecture-Diagram-blue?style=for-the-badge&logo=diagrams" alt="Architecture"/></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/Explore-Features-orange?style=for-the-badge&logo=search" alt="Features"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17"/>
  <img src="https://img.shields.io/badge/Spring_Boot_3.4.1-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/ONNX_Runtime-005C99?style=for-the-badge&logo=onnx&logoColor=white" alt="ONNX"/>
</p>

---

## 📌 Table of Contents
1. [🌟 Executive Summary](#-executive-summary)
2. [🗺️ Interactive Features & Core Modules](#️-interactive-features--core-modules)
3. [🏗️ System Architecture](#️-system-architecture)
4. [🛠️ Technology Stack](#️-technology-stack)
5. [📁 Repository Blueprint](#-repository-blueprint)
6. [⚙️ Quick Start Installation](#️-quick-start-installation)
7. [🤖 Behind the Scenes: AI-ML Predictor](#-behind-the-scenes-ai-ml-predictor)
8. [🔑 Default Login Credentials](#-default-login-credentials)
9. [🤝 Contributing & Standards](#-contributing--standards)

---

## 🌟 Executive Summary

The **Maharashtra Tourism & Smart Travel Portal** represents a modern paradigm in localized travel assistance. By marrying a resilient **Spring Boot enterprise backend** with a highly dynamic, **Tailwind CSS v4 animated React frontend**, this application empowers travellers to explore the rich cultural tapestry of Maharashtra while utilizing advanced artificial intelligence tools to optimize their journey. 

> [!TIP]
> **Key Innovation:** Unlike traditional platforms that query heavy cloud models for minor predictions, this platform features a localized **ONNX Machine Learning Model** running directly inside the JVM, computing tourist density forecasts with zero cloud latency and zero cost!

---

## 🗺️ Interactive Features & Core Modules

| Module | Feature Details | Powered By |
| :--- | :--- | :--- |
| **🧠 Smart Itinerary Planner** | Generates dynamic day-by-day itineraries with strict budget constraints and travel group optimization. | *Google Gemini Flash 2.0 API* |
| **📉 Local Crowd Predictor** | Projects crowd levels at landmark sites based on calendar dates, weekends, holidays, and season categories. | *ONNX Runtime + Standard Scaler* |
| **💬 Virtual Concierge Chatbot** | Interactive floating chat widget answering tourist inquiries on route connectivity, culture, and localized guidelines. | *Gemini Flash Engine* |
| **🗺️ Interactive Map Grid** | Beautiful geographic layouts placing tourist spots, hotels, and key amenities directly on responsive map canvas. | *React Leaflet Map Engine* |
| **✉️ Secure Booking & Email** | Fast hotel/spot reservations paired with immediate transactional notifications. | *Spring Security (JWT) + JavaMail* |
| **📊 Administrative Control Panel** | Comprehensive backend metrics tracker, logs monitor, and full CRUD controllers for travel assets. | *Custom Admin Dashboard* |

---

## 🏗️ System Architecture

Our robust, decoupled architecture is engineered for low latency, secure authentication, and offline capability for critical AI/ML tasks:

```
                       +---------------------------------------+
                       |           React Frontend              |
                       |  (React 19, Tailwind CSS v4, Leaflet) |
                       +-------------------+-------------------+
                                           |
                                           | Secure JSON Web Token (JWT) over HTTPS
                                           v
                       +---------------------------------------+
                       |         Spring Boot Backend           |
                       |       (Java 17, Spring Security)      |
                       +---------+-------------+-------------+-+
                                 |             |             |
         +-----------------------+             |             +-----------------------+
         | Writes & Reads                      | Runs Local Inference                  | Remote API Calls
         v                                     v                                       v
+------------------+                 +--------------------+                +------------------+
|   MySQL Database |                 |   Local AI/ML      |                |   External APIs  |
| (Spots, Bookings,|                 |   ONNX Runtime     |                |  - Gemini Flash  |
|  Hotels, Users)  |                 | (Crowd Prediction) |                |  - Weather API   |
+------------------+                 +--------------------+                +------------------+
```

---

## 🛠️ Technology Stack

```
📦 BACKEND                  📦 FRONTEND                 📦 AI/ML & SCRIPTS
├── Java 17 (OpenJDK)       ├── React 19 (SPA)          ├── ONNX Runtime (JVM Integrated)
├── Spring Boot 3.4.1       ├── Vite 8 (HMR Build)      ├── Gemini Flash (Google AI Studio)
├── Spring Security         ├── Tailwind CSS v4         ├── OpenWeather Map API
├── JsonWebToken (JJWT)     ├── Leaflet Map Client      └── Python 3 (Enrichment Utility)
└── Hibernate JPA + MySQL   └── Axios Client
```

---

## 📁 Repository Blueprint

```
Tourism/
├── src/
│   ├── main/
│   │   ├── java/com/Tourism/Tourism/
│   │   │   ├── config/              # Security protocols & DataInitializer
│   │   │   ├── controller/          # REST Endpoints (Auth, Booking, Hotel, AI, Weather)
│   │   │   ├── dto/                 # Form validation & API payload Transfer Objects
│   │   │   ├── model/               # Schema-mapped Entities (City, Hotel, Booking, User)
│   │   │   └── service/             # ONNX Engine, Gemini Service, and SMTP Email Logic
│   │   └── resources/
│   │       ├── application.properties    # Base configurations and keys
│   │       └── model/
│   │           ├── crowd_prediction_model.onnx  # Preloaded ONNX Model Binary
│   │           └── place_features.json          # Spatial Embedding Mapping
├── frontend/
│   ├── src/                         # Dynamic React components & pages
│   │   ├── components/              # Widgets (Chatbot, Weather, Predictor)
│   │   ├── pages/                   # Views (Hotels, Destinations, AI Itinerary, Admin)
│   │   └── services/                # Axios instance & Auth context providers
├── update_spots.py                  # Python Data-initializer formatting script
└── README.md                        # Documentation hub (This file)
```

---

## ⚙️ Quick Start Installation

Follow these simple steps to run the portal locally.

### 📋 Prerequisites
- **Java Development Kit (JDK) 17** or above
- **Node.js** (v18+) & **npm**
- **MySQL Database Server**

---

### Step 1: Database Setup
1. Open your terminal or MySQL command line client and create the system schema:
   ```sql
   CREATE DATABASE tourism_db;
   ```
2. Navigate to `src/main/resources/application.properties` and replace database credentials with yours:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/tourism_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

---

### Step 2: Configuration & API Keys
To unleash the power of our integrated smart widgets, replace the credentials inside `application.properties`:

```properties
# 🤖 Google Gemini AI Key
gemini.api.key=YOUR_GEMINI_API_KEY

# ⛅ OpenWeather API Key
weather.api.key=YOUR_WEATHER_API_KEY

# 📧 SMTP Mailing Configuration
spring.mail.username=YOUR_GMAIL_USERNAME@gmail.com
spring.mail.password=YOUR_SMTP_APP_PASSWORD
```

---

### Step 3: Run Backend Server
Using the bundled Maven scripts, boot up the Spring application:

* **Windows:**
  ```powershell
  ./mvnw.cmd spring-boot:run
  ```
* **macOS/Linux:**
  ```bash
  ./mvnw spring-boot:run
  ```
> [!NOTE]
> When the backend initiates, `DataInitializer.java` will automatically populate the database schemas with cities, categories, default tourist spots, and default role-based test accounts.

---

### Step 4: Run Frontend Client
Open a secondary terminal workspace to start the Vite developer client:

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. The application is now fully live and connected to the backend.

---

## 🤖 Behind the Scenes: AI-ML Predictor

```
                           +---------------------------+
                           |   Target Location Name    | ----> Fetch 36-dim Embedding
                           +---------------------------+       from place_features.json
                                                                          |
                                                                          v
+---------------------------+                                  +--------------------+
|  Date, Month, Season,     | ----> Standard Scaler Auto-Scale |   Combined Vector  |
|  Weekend/Holiday Flags    |       (Dynamic Inputs)           |     (41 Features)  |
+---------------------------+                                  +---------+----------+
                                                                         |
                                                                         v
                                                               +--------------------+
                                                               | ONNX Model JVM Run |
                                                               +---------+----------+
                                                                         |
                                                                         v
                                                               +--------------------+
                                                               | Predicted Crowd    |
                                                               | Category Label     |
                                                               +--------------------+
```

The localized crowd projection module leverages the **ONNX Runtime Engine** inside Java to yield lightning-fast evaluations without calling third-party cloud engines. 
1. **Dynamic Inputs Formulation:** Seasonal categories, holiday indicators, and trip lengths are passed through a JVM standard-scaler formula using pre-computed parameters:
   $$\text{Input}_{\text{scaled}} = \frac{\text{Value} - \text{Mean}}{\text{Scale}}$$
2. **Dense Vector Combination:** This array is concatenated with a 36-dimensional location feature vector extracted from `place_features.json`.
3. **Inference Execution:** The final combined tensor array of size $1 \times 41$ is fed directly into `crowd_prediction_model.onnx`, and the output label classification is displayed on the client widget in real time.

---

## 🔑 Default Login Credentials

Use these verified profiles to log into the application and experience role-based functionalities:

| Role | Username / Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` *(or config admin mail)* | `admin123` | Control Panel, Manage Hotels & Spots, View Active System Bookings |
| **Standard User** | `user` | `user123` | Dynamic Itinerary Generation, Real-Time Predictions, Booking Checkout, Reviews |

---

## 🤝 Contributing & Standards

We maintain a strict modern programming standard:
- **Clean Architecture:** Keep controllers decoupled from database transactions.
- **Consistent Styling:** Use Tailwind CSS v4 standards exclusively on frontend views.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

<p align="center">
  Developed with ❤️ for Maharashtra Tourism Enhancement | © 2026 Smart Travel Solutions
</p>

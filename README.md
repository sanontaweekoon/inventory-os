# Inventory OS

**Inventory OS** is a professional React + Vite application for managing inventory data. It provides a comprehensive Master Management Hub with movement analysis, stock tracking, CSV import/export, and real-time filtering.

---

## Features

- 📦 **Dashboard Statistics** – Total SKUs, stock quantity, inventory value, low-stock alerts, and expiring items
- 📊 **Movement Analysis** – Automatic classification of items as Fast / Medium / Slow Moving based on sales velocity
- 📋 **Inventory Detail Table** – Full inventory view with sorting, filtering, and pagination
- 🔼 **CSV Upload** – Import Stock, Outbound, and Inbound data from CSV files
- 🔽 **Export CSV** – Export current filtered view to CSV
- 🔍 **Advanced Filters** – Filter by category, brand, movement status, and shelf-life status
- ⏰ **Shelf-Life Tracking** – Visual indicators for expired, critical, and warning expiry dates
- 📈 **Recharts Visualizations** – Pie chart for movement distribution

---

## Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher**
- npm (bundled with Node.js)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/sanontaweekoon/inventory-os.git
cd inventory-os

# Install dependencies
npm install
```

---

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` folder.

To preview the production build locally:

```bash
npm run preview
```

---

## Usage

### Uploading CSV Files

The recommended order is:

1. **Stock CSV** – Click **Stock** in the header to upload your current stock data.
   - Required columns: `sku`, `name`, `category`, `brand`, `unit`, `currentStock`, `minStock`, `maxStock`, `costPrice`, `sellPrice`, `expiryDate`, `location`

2. **Outbound CSV** – Click **Outbound** to upload sales/outbound data.
   - Required columns: `sku`, `qty`

3. **Inbound CSV** – Click **Inbound** to upload receiving/inbound data.
   - Required columns: `sku`, `qty`

After uploading, the dashboard updates automatically with movement analysis and statistics.

### Exporting Data

Click **Export CSV** in the header to download the currently filtered inventory as a CSV file.

---

## Project Structure

```
inventory-os/
├── index.html          # HTML entry point
├── package.json        # Project metadata and scripts
├── vite.config.js      # Vite configuration
├── .gitignore
├── README.md
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # Main application component
    └── index.css       # Global styles
```

---

## Technologies Used

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [Vite 5](https://vitejs.dev/) | Build tool & dev server |
| [Recharts](https://recharts.org/) | Charts and visualizations |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Sarabun (Google Fonts)](https://fonts.google.com/specimen/Sarabun) | Thai-friendly typography |
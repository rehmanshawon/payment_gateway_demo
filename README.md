# Payment Gateway Demo

A small MERN-style demo storefront built with React, Express, and MySQL for Bangladesh-focused checkout flows. It highlights local payment methods like bKash, Nagad, Rocket, Visa, Mastercard, and AMEX, then redirects customers to an SSLCommerz hosted checkout session.

## What is included

- Landing page featuring common Bangladesh payment channels
- Product listing seeded from MySQL on first backend start
- Cart and checkout flow
- Order creation and storage in MySQL
- SSLCommerz hosted payment session initiation
- Success, fail, cancel, and IPN callback handling
- A `mock` mode so the demo still works before sandbox credentials are added

## Stack

- Frontend: React + Vite
- Backend: Express
- Database: MySQL with `mysql2`
- Payment gateway: SSLCommerz hosted checkout flow

## Project structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── data
│   │   ├── routes
│   │   └── services
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── lib
│   │   └── pages
└── package.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Update MySQL credentials in `backend/.env`.

4. Start the app:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:4000`.

## SSLCommerz sandbox setup

Set these values in `backend/.env`:

```env
PAYMENT_MODE=sandbox
SSL_STORE_ID=your_sandbox_store_id
SSL_STORE_PASSWORD=your_sandbox_store_password
FRONTEND_BASE_URL=http://localhost:5173
PUBLIC_API_BASE_URL=https://your-public-backend-url
```

### Important note about callbacks

SSLCommerz redirects and IPN notifications must reach your backend from the internet. A plain `localhost` backend will not work for real sandbox callbacks. For local development, expose the backend with a public tunnel such as `ngrok` or `cloudflared`, then set `PUBLIC_API_BASE_URL` to that public HTTPS URL.

Example:

```bash
ngrok http 4000
```

Then use the generated HTTPS URL as `PUBLIC_API_BASE_URL`.

## Sandbox test data from SSLCommerz docs

- VISA: `4111111111111111`
- Mastercard: `5111111111111111`
- AMEX: `371111111111111`
- Expiry: `12/25`
- CVV: `111`
- Mobile OTP: `111111` or `123456`

## How the payment flow works

1. User adds products to cart.
2. Checkout form submits customer info and selected gateway preference.
3. Backend creates an order in MySQL.
4. Backend calls SSLCommerz `gwprocess/v4/api.php`.
5. Frontend redirects the customer to the returned `GatewayPageURL`.
6. SSLCommerz posts back to success, fail, cancel, and IPN endpoints.
7. Backend validates successful payments with `validationserverAPI.php` using `val_id`.
8. Backend updates the order status and redirects the user back to the frontend result page.

## Gateway preference behavior

SSLCommerz documents group codes like `mobilebank`, `visacard`, `mastercard`, `amexcard`, `othercard`, plus individual options like `bkash` and `upay`. For demo safety:

- `bKash` maps directly to `bkash`
- `Nagad` and `Rocket` are routed through the documented `mobilebank` group
- Card options map to `visacard`, `mastercard`, `amexcard`, or `othercard`

## Demo mode

If `PAYMENT_MODE=mock` or SSLCommerz credentials are missing, the checkout still works in mock mode and redirects to a local success screen instead of the gateway. This is useful for frontend demos before the merchant account is ready.

## Research notes

This project uses the SSLCommerz hosted checkout flow described in their integration document:

- Initiate payment by posting order and customer details to the sandbox session API
- Redirect the customer to the returned `GatewayPageURL`
- Validate successful payment using the returned `val_id`
- Configure and use IPN to avoid missed payment updates

Relevant docs:

- https://sslcommerz.com/integration-document/
- https://developer.sslcommerz.com/docs.html

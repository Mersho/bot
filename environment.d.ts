declare global {
    namespace NodeJS {
        interface ProcessEnv {

            LND_CERT_BASE64: string;

            LND_MACAROON_BASE64: string;
            LND_GRPC_HOST: string;
            BOT_TOKEN: string;

            MAX_FEE: number;

            FEE_PERCENT: number;

            DB_USER: string;
            DB_PASS: string;
            DB_HOST: string;
            DB_PORT: string;
            DB_NAME: string;

            MONGO_URI: string;

            INVOICE_EXPIRATION_WINDOW: number;

            HOLD_INVOICE_EXPIRATION_WINDOW: number;

            CHANNEL: string;
            ADMIN_CHANNEL: string;
            HELP_GROUP: string;

            MAX_DISPUTES: number;

            HOLD_INVOICE_CLTV_DELTA: number;
            HOLD_INVOICE_CLTV_DELTA_SAFETY_WINDOW: number;

            PENDING_PAYMENT_WINDOW: number;

            FIAT_RATE_NAME: string;
            FIAT_RATE_EP: string;
            NODE_ENV: string;

            ORDER_PUBLISHED_EXPIRATION_WINDOW: number;

            MIN_PAYMENT_AMT: number;

            MAX_PENDING_ORDERS: number;

            LOG_LEVEL: string;

            MAX_ROUTING_FEE: number;

            PAYMENT_ATTEMPTS: number;

            DISPUTE_CHANNEL: string;

            COMMUNITY_TTL: number;

            NOSTR_SK: string
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }
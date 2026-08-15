/**
 * Official WhatsApp providers only (Meta Cloud API / Twilio).
 * No WhatsApp Web, no session cookies, no scraping.
 */

function digits(phone) {
  return String(phone).replace(/[^\d]/g, "");
}

export class MetaCloudProvider {
  constructor({ phoneNumberId, accessToken, fetchImpl = fetch }) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
    this.fetchImpl = fetchImpl;
  }

  async sendText(recipient, body) {
    const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: digits(recipient),
        type: "text",
        text: { body, preview_url: false }
      })
    });
    if (!res.ok) {
      const err = new Error(`Meta Cloud HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return { channel: "meta", documentUploaded: false };
  }
}

export class TwilioProvider {
  constructor({ accountSid, authToken, from, fetchImpl = fetch }) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.from = from;
    this.fetchImpl = fetchImpl;
  }

  async sendText(recipient, body) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");
    const params = new URLSearchParams({
      To: `whatsapp:${recipient.startsWith("+") ? recipient : `+${digits(recipient)}`}`,
      From: this.from.startsWith("whatsapp:") ? this.from : `whatsapp:${this.from}`,
      Body: body
    });
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });
    if (!res.ok) {
      const err = new Error(`Twilio HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return { channel: "twilio", documentUploaded: false };
  }
}

export function createWhatsAppProvider(cfg, fetchImpl = fetch) {
  if (cfg.provider === "meta") {
    return new MetaCloudProvider({
      phoneNumberId: cfg.phoneNumberId,
      accessToken: cfg.accessToken,
      fetchImpl
    });
  }
  if (cfg.provider === "twilio") {
    return new TwilioProvider({
      accountSid: cfg.twilioSid,
      authToken: cfg.twilioToken,
      from: cfg.twilioFrom,
      fetchImpl
    });
  }
  return null;
}

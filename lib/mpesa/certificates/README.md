# M-Pesa B2C Certificates

This directory contains the Safaricom M-Pesa certificates required for B2C (Business to Customer) payments.

## Required Files

1. **sandbox.cer** - Sandbox environment certificate (for testing)
2. **production.cer** - Production environment certificate (for live transactions)

## How to Obtain Certificates

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Log in to your account
3. Navigate to **APIs** → **M-Pesa APIs** → **B2C API**
4. Download the certificate for your environment:
   - **Sandbox**: Look for "Sandbox Certificate" or similar
   - **Production**: Look for "Production Certificate"

## Alternative Download Links

If the portal links don't work, try these direct links:

- Sandbox: `https://sandbox.safaricom.co.ke/mpesa/certificate/sandbox.cer`
- Or search for "Safaricom M-Pesa B2C certificate download"

## Certificate Format

The certificates should be in PEM format (`.cer` or `.pem` file).

Example content structure:
```
-----BEGIN CERTIFICATE-----
MIIDqzCCApOgAwIBAgIERpa8MjANBgkqhkiG9w0BAQsFADBkMQswCQYDVQQGEwJL
...
-----END CERTIFICATE-----
```

## Security Notes

- **NEVER** commit actual certificate files to version control
- Add `*.cer` and `*.pem` to `.gitignore`
- Store certificates securely in environment variables or secrets management
- Use different certificates for sandbox vs production

## Environment Variable Alternative

Instead of file-based certificates, you can set the certificate content as an environment variable:

```env
MPESA_B2C_CERTIFICATE="-----BEGIN CERTIFICATE-----\nMIID..."
```

The B2C library will check for this environment variable first before looking for files.

interface StoredInvoice {
  buffer: Buffer;
  fileName: string;
  mime: string;
  expiresAt: number;
}

class InvoiceService {
  private downloadStore = new Map<string, StoredInvoice>();

  constructor() {
    // Cleanup expired downloads every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.downloadStore.entries()) {
        if (value.expiresAt < now) {
          this.downloadStore.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  public storeInvoice(base64Data: string, fileName?: string, contentType?: string) {
    if (!base64Data) {
      throw new Error('No file data provided');
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let mime = contentType || 'application/octet-stream';

    if (matches && matches.length === 3) {
      mime = contentType || matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const fileId = 'invoice_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const safeFileName = (fileName || 'Invoice.pdf').replace(/[^a-zA-Z0-9_.-]/g, '_');

    this.downloadStore.set(fileId, {
      buffer,
      fileName: safeFileName,
      mime,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min expiry
    });

    return {
      fileId,
      safeFileName,
      downloadUrl: `/api/invoice/file/${fileId}/${encodeURIComponent(safeFileName)}`,
    };
  }

  public getInvoice(fileId: string): StoredInvoice | undefined {
    return this.downloadStore.get(fileId);
  }
}

export const invoiceService = new InvoiceService();

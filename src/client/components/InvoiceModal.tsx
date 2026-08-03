import React, { useState } from 'react';
import { X, Printer, Download, Store, MapPin, Phone, RefreshCw, CheckCircle2, Image as ImageIcon, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Order } from '../types';
import { useApp } from '../context/AppContext';

interface InvoiceModalProps {
  order?: Order | null;
  onClose?: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order: propOrder, onClose: propOnClose }) => {
  const { selectedInvoiceOrder, closeInvoiceModal, settings } = useApp();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const order = propOrder !== undefined ? propOrder : selectedInvoiceOrder;
  const onClose = propOnClose || closeInvoiceModal;

  if (!order) return null;

  const companyName = settings.companyName || settings.businessName || 'PUREZA NATURAL COSMETICS';

  const handlePrint = () => {
    window.print();
  };

  const getBaseFileName = () => {
    const sanitizedNum = (order.orderNumber || 'ORD-000').replace(/[^a-zA-Z0-9-]/g, '_');
    const sanitizedCust = (order.customerName || 'Customer')
      .trim()
      .replace(/[\s\/\\]+/g, '_')
      .replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '');
    return `Invoice_${sanitizedNum}_${sanitizedCust}`;
  };

  // Robust File Download Helper
  const executeDownload = async (base64Data: string, fileName: string, contentType: string) => {
    const base64ToBlob = (b64: string, type: string) => {
      const parts = b64.split(';base64,');
      const raw = window.atob(parts[1] || parts[0]);
      const uInt8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type });
    };

    try {
      const blob = base64ToBlob(base64Data, contentType);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = fileName;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(blobUrl);
      }, 2000);
    } catch (e) {
      console.warn('Client Blob URL download warning:', e);
    }

    try {
      const response = await fetch('/api/invoice/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Data, fileName, contentType }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.downloadUrl) {
          window.location.href = data.downloadUrl;
        }
      }
    } catch (err) {
      console.error('Server attachment download error:', err);
    }
  };

  // Capture Invoice Element with Pixel-Perfect A4 dimensions & html2canvas options
  const captureCanvas = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) throw new Error('Invoice printable element not found');

    return await html2canvas(element, {
      scale: 3, // High DPI pixel-perfect export
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const clonedInvoice = clonedDoc.getElementById('printable-invoice');
        if (clonedInvoice) {
          clonedInvoice.classList.add('pdf-export');
          clonedInvoice.style.width = '210mm';
          clonedInvoice.style.minWidth = '210mm';
          clonedInvoice.style.maxWidth = '210mm';
          clonedInvoice.style.minHeight = '297mm';
          clonedInvoice.style.margin = '0 auto';
          clonedInvoice.style.boxShadow = 'none';
          clonedInvoice.style.transform = 'none';
        }

        const tempCanvas = clonedDoc.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');

        const convertColor = (colorStr: string) => {
          if (!colorStr || !colorStr.includes('oklch')) return colorStr;
          return colorStr.replace(/oklch\([^)]+\)/gi, (match) => {
            if (ctx) {
              ctx.fillStyle = '#000000';
              ctx.fillStyle = match;
              if (ctx.fillStyle !== '#000000' || match.includes('0 0 0')) {
                return ctx.fillStyle;
              }
            }
            return '#1e293b';
          });
        };

        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((styleEl) => {
          if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
            styleEl.textContent = convertColor(styleEl.textContent);
          }
        });

        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const styleAttr = htmlEl.getAttribute('style');
          if (styleAttr && styleAttr.includes('oklch')) {
            htmlEl.setAttribute('style', convertColor(styleAttr));
          }
        });
      },
    });
  };

  const handleDownloadPng = async () => {
    setIsGeneratingPng(true);
    setStatusMsg('');

    try {
      const canvas = await captureCanvas();
      const baseName = getBaseFileName();
      const fileName = `${baseName}.png`;
      const dataUrl = canvas.toDataURL('image/png', 1.0);

      executeDownload(dataUrl, fileName, 'image/png');
      setStatusMsg(`PNG মেমো প্রস্তুত! (${fileName})`);
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (err) {
      console.error('PNG generation error:', err);
      alert('ছবি ডাউনলোড প্রসেসিংয়ে সমস্যা হয়েছে। বিকল্প প্রিন্ট বোতাম ব্যবহার করতে পারেন।');
    } finally {
      setIsGeneratingPng(false);
    }
  };

  const handleDownloadJpg = async () => {
    setIsGeneratingJpg(true);
    setStatusMsg('');

    try {
      const canvas = await captureCanvas();
      const baseName = getBaseFileName();
      const fileName = `${baseName}.jpg`;
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

      executeDownload(dataUrl, fileName, 'image/jpeg');
      setStatusMsg(`JPG মেমো প্রস্তুত! (${fileName})`);
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (err) {
      console.error('JPG generation error:', err);
      alert('JPG ডাউনলোডে সমস্যা হয়েছে। বিকল্প প্রিন্ট বোতাম ব্যবহার করতে পারেন।');
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setStatusMsg('');

    try {
      const canvas = await captureCanvas();
      const baseName = getBaseFileName();
      const fileName = `${baseName}.pdf`;

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Fit exact A4 dimensions 210mm x 297mm with 0 margin
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const pdfDataUrl = pdf.output('datauristring');
      executeDownload(pdfDataUrl, fileName, 'application/pdf');

      setStatusMsg(`PDF মেমো প্রস্তুত! (${fileName})`);
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      {/* Inline Print & Dedicated PDF Export Stylesheet */}
      <style>{`
        .pdf-export * {
          box-sizing: border-box !important;
          transform: none !important;
          animation: none !important;
          transition: none !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          #printable-invoice {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Modal Card */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200 print:max-w-none print:max-h-none print:shadow-none print:border-none print-container">
        {/* Top Control Bar */}
        <div className="print:hidden bg-slate-900 text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-sm hidden sm:inline">ইনভয়েস ক্যাশ মেমো প্রিন্ট ও ডাউনলোড</span>
            <span className="font-bold text-xs sm:hidden">ইনভয়েস মেমো</span>
            {statusMsg && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {statusMsg}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isGeneratingPng || isGeneratingJpg}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>PDF হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>ডাউনলোড (PDF)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isGeneratingPdf || isGeneratingPng || isGeneratingJpg}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-teal-300 font-semibold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
            >
              {isGeneratingPng ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>PNG হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-teal-400" />
                  <span>PNG</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadJpg}
              disabled={isGeneratingPdf || isGeneratingPng || isGeneratingJpg}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-teal-300 font-semibold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
            >
              {isGeneratingJpg ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>JPG হচ্ছে...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>JPG</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-rose-950 hover:text-rose-300 transition-colors cursor-pointer text-xs font-semibold border border-slate-700"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" /> বন্ধ
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body for A4 Sheet Display */}
        <div className="overflow-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 flex justify-center items-start flex-1 custom-scrollbar">
          {/* DEDICATED A4 SHEET PRINTABLE CONTAINER */}
          <div
            id="printable-invoice"
            style={{
              width: '210mm',
              minWidth: '210mm',
              maxWidth: '210mm',
              minHeight: '297mm',
              padding: '12mm 15mm',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif",
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              margin: '0 auto',
            }}
            className="shadow-xl rounded-sm text-slate-900 text-xs leading-relaxed"
          >
            {/* TOP MAIN CONTENT CONTAINER */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. HEADER SECTION (Fixed Table Layout for Perfect Stability) */}
              <div
                style={{
                  width: '100%',
                  borderBottom: '2px solid #0f172a',
                  paddingBottom: '16px',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  boxSizing: 'border-box',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>
                        <div>
                          <h1
                            style={{
                              fontSize: '22px',
                              fontWeight: '900',
                              color: '#0f172a',
                              letterSpacing: '-0.5px',
                              textTransform: 'uppercase',
                              margin: 0,
                              lineHeight: '1.2',
                            }}
                          >
                            {companyName}
                          </h1>
                          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', margin: '2px 0 0 0' }}>
                            {settings.tagline || '100% Organic Skincare & Wellness'}
                          </p>
                        </div>

                        <div style={{ marginTop: '12px', fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                          <p style={{ margin: 0 }}>
                            <MapPin style={{ width: '13px', height: '13px', color: '#94a3b8', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                            <span style={{ verticalAlign: 'middle' }}>{settings.address}</span>
                          </p>
                          <p style={{ margin: '2px 0 0 0' }}>
                            <Phone style={{ width: '13px', height: '13px', color: '#94a3b8', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                            <span style={{ verticalAlign: 'middle' }}>ফোন: {settings.phone} | ইমেইল: {settings.email}</span>
                          </p>
                        </div>
                      </td>

                      {/* Right Badge & Invoice Metadata */}
                      <td style={{ verticalAlign: 'top', textAlign: 'right', width: '220px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            fontWeight: '900',
                            fontSize: '14px',
                            color: '#0f172a',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            lineHeight: '1.4',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          চালান / ক্যাশ মেমো
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '8px 0 0 0' }}>
                          ইনভয়েস #: {settings.invoicePrefix || 'PBMS-INV-'}{order.orderNumber.replace(/[^0-9]/g, '')}
                        </h3>
                        <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0 0' }}>
                          অর্ডার নম্বর: <span style={{ fontWeight: '700' }}>{order.orderNumber}</span>
                        </p>
                        <p style={{ fontSize: '11px', color: '#475569', margin: '2px 0 0 0' }}>
                          তারিখ: <span style={{ fontWeight: '700' }}>{order.date}</span>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. CUSTOMER & SHIPPING DETAILS (Fixed 2-Column Table Layout) */}
              <div
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  boxSizing: 'border-box',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <tbody>
                    <tr>
                      {/* Left: Bill To */}
                      <td style={{ verticalAlign: 'top', width: '50%', paddingRight: '12px' }}>
                        <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' }}>
                          গ্রাহক তথ্য (Bill To)
                        </h4>
                        <p style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', margin: 0 }}>
                          {order.customerName}
                        </p>
                        <p style={{ fontSize: '11px', color: '#334155', margin: '4px 0 0 0' }}>
                          মোবাইল: <span style={{ fontWeight: '700' }}>{order.customerPhone}</span>
                        </p>
                        {order.customerAltPhone && (
                          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                            বিকল্প ফোন: {order.customerAltPhone}
                          </p>
                        )}
                        <p style={{ fontSize: '11px', color: '#334155', margin: '4px 0 0 0', lineHeight: '1.4', wordBreak: 'break-word' }}>
                          ঠিকানা: {order.address}, {order.area}, {order.district}
                        </p>
                      </td>

                      {/* Right: Shipping & Payment */}
                      <td style={{ verticalAlign: 'top', width: '50%', paddingLeft: '12px', borderLeft: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' }}>
                          শিপিং ও পেমেন্ট বিবরণ
                        </h4>
                        <p style={{ fontSize: '11px', color: '#334155', margin: 0 }}>
                          কুরিয়ার সার্ভিস: <span style={{ fontWeight: '700', color: '#0f766e' }}>{order.courier}</span>
                        </p>
                        {order.trackingNumber && (
                          <p style={{ fontSize: '11px', color: '#334155', margin: '2px 0 0 0' }}>
                            ট্র্যাকিং নম্বর: <span style={{ fontWeight: '600' }}>{order.trackingNumber}</span>
                          </p>
                        )}
                        <p style={{ fontSize: '11px', color: '#334155', margin: '2px 0 0 0' }}>
                          পেমেন্ট মেথড: <span style={{ fontWeight: '600' }}>{order.paymentMethod}</span>
                        </p>
                        <div style={{ marginTop: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b', marginRight: '8px', verticalAlign: 'middle' }}>
                            পেমেন্ট স্ট্যাটাস:
                          </span>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '11px',
                              fontWeight: '800',
                              lineHeight: '1.4',
                              whiteSpace: 'nowrap',
                              verticalAlign: 'middle',
                              color:
                                order.paymentStatus === 'Paid'
                                  ? '#059669'
                                  : order.paymentStatus === 'Partial'
                                  ? '#d97706'
                                  : '#dc2626',
                            }}
                          >
                            {order.paymentStatus === 'Paid'
                              ? 'পরিশোধিত (Paid)'
                              : order.paymentStatus === 'Partial'
                              ? 'আংশিক (Partial)'
                              : 'বকেয়া (Unpaid)'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. PRODUCT ITEMS TABLE (Fixed Table Layout) */}
              <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    tableLayout: 'fixed',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid #0f172a',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#0f172a',
                        textTransform: 'uppercase',
                        height: '36px',
                      }}
                    >
                      <th style={{ width: '35px', padding: '8px 10px', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '8px 10px' }}>পণ্যের বিবরণ</th>
                      <th style={{ width: '65px', padding: '8px 10px', textAlign: 'center' }}>পরিমাণ</th>
                      <th style={{ width: '90px', padding: '8px 10px', textAlign: 'right' }}>একক মূল্য</th>
                      <th style={{ width: '100px', padding: '8px 10px', textAlign: 'right' }}>মোট টাকা</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '11px' }}>
                    {order.items.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          height: '38px',
                          pageBreakInside: 'avoid',
                          breakInside: 'avoid',
                        }}
                      >
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            padding: '8px 10px',
                            fontWeight: '700',
                            color: '#0f172a',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            lineHeight: '1.3',
                          }}
                        >
                          {item.productName}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#334155' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#475569' }}>
                          ৳{item.unitPrice.toLocaleString('bn-BD')}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                          ৳{item.totalPrice.toLocaleString('bn-BD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. TOTALS & NOTES (Fixed Table Layout) */}
              <div
                style={{
                  width: '100%',
                  paddingTop: '8px',
                  borderTop: '1px solid #e2e8f0',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  boxSizing: 'border-box',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <tbody>
                    <tr>
                      {/* Notes Column */}
                      <td style={{ verticalAlign: 'top', paddingRight: '20px', fontSize: '11px', color: '#475569' }}>
                        <p style={{ fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>বিশেষ মন্তব্য/নোট:</p>
                        <div
                          style={{
                            padding: '10px 12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontStyle: 'italic',
                            lineHeight: '1.4',
                            color: '#334155',
                            wordBreak: 'break-word',
                          }}
                        >
                          {order.notes || 'কোনো অতিরিক্ত নির্দেশনা নেই। ধন্যবাদ।'}
                        </div>
                      </td>

                      {/* Calculation Table Column */}
                      <td style={{ verticalAlign: 'top', width: '240px', fontSize: '11px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '4px 0', color: '#64748b' }}>সাবটোটাল:</td>
                              <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                                ৳{order.subtotal.toLocaleString('bn-BD')}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#e11d48' }}>
                              <td style={{ padding: '4px 0' }}>ডিসকাউন্ট (ছাড়):</td>
                              <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '700' }}>
                                - ৳{order.discount.toLocaleString('bn-BD')}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '4px 0', color: '#64748b' }}>ডেলিভারি চার্জ:</td>
                              <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                                ৳{order.deliveryCharge.toLocaleString('bn-BD')}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  padding: '8px 0 0 0',
                                  borderTop: '2px solid #0f172a',
                                  fontSize: '13px',
                                  fontWeight: '900',
                                  color: '#0f172a',
                                }}
                              >
                                সর্বমোট (Grand Total):
                              </td>
                              <td
                                style={{
                                  padding: '8px 0 0 0',
                                  borderTop: '2px solid #0f172a',
                                  textAlign: 'right',
                                  fontSize: '13px',
                                  fontWeight: '900',
                                  color: '#0f172a',
                                }}
                              >
                                ৳{order.grandTotal.toLocaleString('bn-BD')}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* BOTTOM PINNED FOOTER (BARCODE & SIGNATURE - Fixed Table Layout) */}
            <div
              style={{
                width: '100%',
                marginTop: 'auto',
                paddingTop: '24px',
                borderTop: '1px solid #e2e8f0',
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                boxSizing: 'border-box',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <tbody>
                  <tr>
                    {/* Left Notice / Official Statement */}
                    <td style={{ verticalAlign: 'bottom' }}>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#475569', margin: 0 }}>
                        {companyName} Auto-Generated Official Invoice
                      </p>
                      <p style={{ fontSize: '9px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                        অর্ডার রেফারেন্স: {order.orderNumber}
                      </p>
                    </td>

                    {/* Right Signature Block */}
                    <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '200px' }}>
                      <div
                        style={{
                          fontFamily: "'Dancing Script', cursive",
                          fontSize: '26px',
                          fontWeight: '700',
                          color: '#0f172a',
                          lineHeight: '1.2',
                          marginBottom: '2px',
                          userSelect: 'none',
                        }}
                      >
                        Naem
                      </div>
                      <div style={{ paddingTop: '4px', borderTop: '1px solid #94a3b8' }}>
                        <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '11px', margin: 0 }}>
                          অনুমোদিত স্বাক্ষর (Naem)
                        </p>
                        <p style={{ fontSize: '9px', color: '#64748b', margin: '2px 0 0 0' }}>
                          {companyName} Authorised Signature
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};


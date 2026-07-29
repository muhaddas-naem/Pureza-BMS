import React, { useState } from 'react';
import { X, Printer, Download, Store, MapPin, Phone, RefreshCw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
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
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const order = propOrder !== undefined ? propOrder : selectedInvoiceOrder;
  const onClose = propOnClose || closeInvoiceModal;

  if (!order) return null;

  const companyName = settings.companyName || settings.businessName || 'PUREZA NATURAL COSMETICS';

  const handlePrint = () => {
    window.print();
  };

  // Image (PNG) Download
  const handleDownloadImage = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) {
      window.print();
      return;
    }

    setIsGeneratingImg(true);
    setStatusMsg('');

    try {
      const canvas = await html2canvas(element, {
        scale: 3, // High clear crisp resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const sanitizedNum = (order.orderNumber || 'Order').replace(/[^a-zA-Z0-9-]/g, '');
      const fileName = `Invoice_${sanitizedNum}.png`;

      const dataUrl = canvas.toDataURL('image/png', 1.0);

      // Trigger Direct Link Download
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);

      setStatusMsg('ইমেজ (PNG) মেমো ডাউনলোড হয়েছে!');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      console.error('Image generation error:', err);
      alert('ছবি ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে প্রিন্ট বিকল্পটি ব্যবহার করুন।');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // PDF Download
  const handleDownloadInvoice = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) {
      window.print();
      return;
    }

    setIsGeneratingPdf(true);
    setStatusMsg('');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 12) / imgWidth, (pdfHeight - 12) / imgHeight);

      const renderWidth = imgWidth * ratio;
      const renderHeight = imgHeight * ratio;
      const posX = (pdfWidth - renderWidth) / 2;
      const posY = 6;

      pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight);

      const sanitizedNum = (order.orderNumber || 'Order').replace(/[^a-zA-Z0-9-]/g, '');
      const fileName = `Invoice_${sanitizedNum}.pdf`;

      // Force PDF Blob download
      const pdfBlob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);

      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.setAttribute('download', fileName);
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(blobUrl);
      }, 2000);

      setStatusMsg('PDF ইনভয়েস ডাউনলোড হয়েছে!');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      console.error('PDF generation error, falling back to window.print:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-start justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-4 sm:my-8 border border-slate-200 relative z-10">
        {/* Top Header Controls (No Print) */}
        <div className="print:hidden bg-slate-900 text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 gap-2">
            <Store className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-sm hidden sm:inline">ইনভয়েস ক্যাশ মেমো প্রিন্ট ও ডাউনলোড</span>
            <span className="font-bold text-xs sm:hidden">ইনভয়েস মেমো</span>
            {statusMsg && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {statusMsg}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isGeneratingImg || isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              {isGeneratingImg ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>ছবি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-amber-300" />
                  <span>ডাউনলোড (ছবি / PNG)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={isGeneratingPdf || isGeneratingImg}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-teal-300 font-semibold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>PDF হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>ডাউনলোড (PDF)</span>
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
              <X className="w-4 h-4" /> বন্ধ করুন
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div className="p-6 sm:p-10 space-y-6 bg-white text-slate-900 text-sm font-sans" id="printable-invoice">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl font-serif shadow-md shrink-0">
                  {companyName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {companyName}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">{settings.tagline || '100% Organic Skincare & Wellness'}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {settings.address}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> ফোন: {settings.phone} | ইমেইল: {settings.email}
                </p>
              </div>
            </div>

            {/* Invoice Right Badge */}
            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-md">
                চালান / ক্যাশ মেমো
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                ইনভয়েস #: {settings.invoicePrefix || 'PBMS-INV-'}{order.orderNumber.replace(/[^0-9]/g, '')}
              </h3>
              <p className="text-xs text-slate-600 mt-1">অর্ডার নম্বর: <span className="font-semibold">{order.orderNumber}</span></p>
              <p className="text-xs text-slate-600">তারিখ: <span className="font-semibold">{order.date}</span></p>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">গ্রাহক তথ্য (Bill To)</h4>
              <p className="font-bold text-base text-slate-900">{order.customerName}</p>
              <p className="text-xs text-slate-700 mt-1">মোবাইল: <span className="font-bold">{order.customerPhone}</span></p>
              {order.customerAltPhone && (
                <p className="text-xs text-slate-600">বিকল্প ফোন: {order.customerAltPhone}</p>
              )}
              <p className="text-xs text-slate-700 mt-1 leading-snug">
                ঠিকানা: {order.address}, {order.area}, {order.district}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">শিপিং ও পেমেন্ট বিবরণ</h4>
              <p className="text-xs text-slate-700">কুরিয়ার সার্ভিস: <span className="font-bold text-teal-800">{order.courier}</span></p>
              {order.trackingNumber && (
                <p className="text-xs text-slate-700">ট্র্যাকিং নম্বর: <span className="font-semibold">{order.trackingNumber}</span></p>
              )}
              <p className="text-xs text-slate-700 mt-1">পেমেন্ট মেথড: <span className="font-semibold">{order.paymentMethod}</span></p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">পেমেন্ট স্ট্যাটাস:</span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    order.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.paymentStatus === 'Partial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {order.paymentStatus === 'Paid'
                    ? 'পরিশোধিত (Paid)'
                    : order.paymentStatus === 'Partial'
                    ? 'আংশিক (Partial)'
                    : 'বকেয়া (Unpaid)'}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">পণ্যের বিবরণ</th>
                  <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">একক মূল্য</th>
                  <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {order.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.productName}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-700">৳{item.unitPrice.toLocaleString('bn-BD')}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">৳{item.totalPrice.toLocaleString('bn-BD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-2 gap-6 border-t border-slate-200">
            <div className="max-w-xs space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">বিশেষ মন্তব্য/নোট:</p>
              <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 italic">
                {order.notes || 'কোনো অতিরিক্ত নির্দেশনা নেই। ধন্যবাদ।'}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">সাবটোটাল:</span>
                <span className="font-semibold text-slate-900">৳{order.subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                <span>ডিসকাউন্ট (ছাড়):</span>
                <span className="font-semibold">- ৳{order.discount.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">ডেলিভারি চার্জ:</span>
                <span className="font-semibold text-slate-900">৳{order.deliveryCharge.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>সর্বমোট (Grand Total):</span>
                <span>৳{order.grandTotal.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Barcode & Footer Signatures */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
            <div className="space-y-1">
              <div className="tracking-widest font-mono text-slate-800 text-sm font-bold border border-dashed border-slate-400 px-3 py-1.5 rounded inline-block">
                |||| | |||||| | ||||||| {order.orderNumber}
              </div>
              <p className="text-[10px] text-slate-400">{companyName} Auto-Generated Invoice</p>
            </div>

            <div className="text-center w-52">
              <div className="font-signature text-3xl font-bold text-slate-900 leading-none mb-1 transform -rotate-3 select-none">
                Naem
              </div>
              <div className="pt-1.5 border-t border-slate-400">
                <p className="font-bold text-slate-800 text-xs">অনুমোদিত স্বাক্ষর (Naem)</p>
                <p className="text-[10px] text-slate-500">{companyName} Authorised Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

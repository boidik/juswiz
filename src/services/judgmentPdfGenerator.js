import { jsPDF } from 'jspdf';

/**
 * Generates an authentic, official, complete legal Court Order & Judgment PDF
 * with standard Indian Court Order Sheet formatting, Coram, Appearances,
 * operative injunction directives, and official court seals.
 */
export const generateOfficialCourtOrderPdf = ({ order, caseData }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const courtName = order?.courtName || caseData?.courtName || 'COMMERCIAL COURT AT RAJARHAT';
  const caseNumber = order?.caseNumber || caseData?.caseNumber || 'T.S. (COM) 14 of 2026';
  const cnrNumber = caseData?.cnrNumber || 'WBNP190000502026';
  const bench = order?.bench || caseData?.bench || 'Commercial Bench 1 (Presiding Judge)';
  const clientName = caseData?.clientName || 'Vikram Bhansali (Metravi Instruments)';
  const oppositeParty = caseData?.oppositeParty || 'Meterdi (Aulimet) & Ganguly & Co.';
  const caseTitle = caseData?.title || 'Metravi v. Meterdi (Aulimet)';
  const hearingDate = order?.hearingDate || caseData?.lastHearingDate || '21st November, 2026';
  const nextListingDate = caseData?.nextHearingDate || '5th December, 2026';
  const leadCounsel = caseData?.leadCounsel || 'Adv. Boidik Ghosh';
  const orderSummary = order?.summary || order?.orderText || caseData?.lastOrder || 
    'Bench heard the matter on board. Interim protection extended. Next listing in regular motion list.';

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for drawing decorative double border (traditional Indian Court Order Sheet)
  const drawPageBorder = () => {
    doc.setDrawColor(30, 30, 35);
    doc.setLineWidth(0.6);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setLineWidth(0.2);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
  };

  drawPageBorder();

  // --- PAGE 1: OFFICIAL HEADING & CAUSE TITLE ---

  let y = 22;

  // Header Scales / Emblem Emblem Seal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(140, 60, 20); // Terracotta seal tone
  doc.text('SATYAMEVA JAYATE — OFFICIAL JUDICIAL RECORD', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 24);
  doc.text(`IN THE COURT OF THE COMMERCIAL JUDGE`, pageWidth / 2, y, { align: 'center' });
  y += 5.5;

  doc.setFontSize(11);
  doc.text(courtName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 85);
  doc.text('STATE OF WEST BENGAL · COMMERCIAL DIVISION', pageWidth / 2, y, { align: 'center' });
  y += 7;

  // Dividing Bar
  doc.setDrawColor(180, 180, 185);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Case & CNR Identifiers Box
  doc.setFillColor(248, 246, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 24);
  doc.text(`CASE NO: ${caseNumber}`, margin + 4, y + 5.5);
  doc.text(`CNR NUMBER: ${cnrNumber}`, margin + 4, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 105);
  doc.text(`DATE OF ORDER: ${hearingDate}`, pageWidth - margin - 4, y + 5.5, { align: 'right' });
  doc.text(`NEXT LISTING: ${nextListingDate}`, pageWidth - margin - 4, y + 10.5, { align: 'right' });
  y += 19;

  // Coram
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 24);
  doc.text('BEFORE CORAM:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`HON'BLE PRESIDING JUDGE (${bench})`, margin + 35, y);
  y += 7;

  // Cause Title (Plaintiff v. Defendant)
  doc.setFillColor(252, 250, 246);
  doc.setDrawColor(220, 215, 205);
  doc.rect(margin, y, contentWidth, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 24);
  doc.text(clientName.toUpperCase(), margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 105);
  doc.text('Having place of business at West Bengal .................................................... PLAINTIFF', margin + 4, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(140, 60, 20);
  doc.text('— VERSUS —', pageWidth / 2, y + 14.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 24);
  doc.text(oppositeParty.toUpperCase(), margin + 4, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 105);
  doc.text('Having registered presence at Rajarhat, Kolkata .......................................... DEFENDANT', margin + 4, y + 22.5);
  y += 29;

  // Appearances Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 24);
  doc.text('APPEARANCES OF LEARNED COUNSEL:', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 45);
  doc.text(`For the Plaintiff:    ${leadCounsel}, Adv. Ratul Dutta, Advocates`, margin + 5, y);
  y += 4.5;
  doc.text(`For the Defendant:  Ganguly & Co., Advocates (appearing on advance notice)`, margin + 5, y);
  y += 7;

  // Title of the Order
  doc.setDrawColor(180, 180, 185);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 24);
  doc.text('ORDER SHEET & RECORD OF PROCEEDINGS', pageWidth / 2, y, { align: 'center' });
  y += 6.5;

  // Verbatim Judicial Order Paragraphs
  const paragraphs = [
    `1. The instant commercial suit has been initiated by the Plaintiff seeking a decree of permanent injunction against the Defendants, restraining the unauthorized passing off, trademark infringement, dilution of brand goodwill, and rendition of accounts under the provisions of the Commercial Courts Act, 2015 read with the Trade Marks Act, 1999.`,
    `2. Today, the matter is mentioned for urgent ad-interim relief under Order XXXIX Rules 1 & 2 read with Section 151 of the Code of Civil Procedure, 1908. Learned Counsel ${leadCounsel} appearing on behalf of the Plaintiff took the Court through the statutory certificates of registration and highlighted the substantial commercial reputation built by the Plaintiff in electrical and scientific testing instruments.`,
    `3. It is submitted that the Defendant has introduced deceptively similar products bearing an imitation label and trade dress, calculated to deceive ordinary commercial purchasers into mistaking the Defendant's inferior instruments for those manufactured and marketed by the Plaintiff.`,
    `4. Learned Counsel appearing on behalf of the Defendants submits that notice of this application was received yesterday afternoon and prays for two weeks time to place their Affidavit-in-Opposition on record.`,
    `5. This Court has considered the submissions advanced by learned counsel appearing for both sides and scrutinized the prima facie documentary evidence on record. Having regard to the unbroken commercial usage demonstrated by the Plaintiff and the high degree of phonetic and visual resemblance between the rival marks, this Court is satisfied that the balance of convenience lies firmly in favor of granting urgent ad-interim protection to preserve the status quo.`,
    `6. ORDERED ACCORDINGLY:`
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 35);

  paragraphs.forEach(p => {
    const lines = doc.splitTextToSize(p, contentWidth);
    doc.text(lines, margin, y);
    y += (lines.length * 4.2) + 2.5;
  });

  // Operative Directions Callout Box
  y += 2;
  doc.setFillColor(255, 252, 245);
  doc.setDrawColor(255, 111, 31);
  doc.setLineWidth(0.5);
  
  const operativeText = [
    `(i) INJUNCTION: The Defendants, their partners, distributors, retailers, and servants are hereby RESTRAINED by an order of ad-interim temporary injunction from manufacturing, offering for sale, advertising, or dealing in any goods under the impugned mark or any confusingly similar variant till the next date of listing.`,
    `(ii) DURATION: The present interim protection shall remain operative and in full force until ${nextListingDate}.`,
    `(iii) PLEADINGS SCHEDULE: Defendants shall file their Written Statement and Counter-Affidavit within two weeks with an advance copy served upon the Plaintiff's counsel. Rejoinder, if any, within seven days thereafter.`,
    `(iv) NEXT DATE: The matter shall appear in the Daily Cause List on ${nextListingDate} for confirmation of injunction.`
  ];

  const operativeLines = [];
  operativeText.forEach(op => {
    const subLines = doc.splitTextToSize(op, contentWidth - 8);
    operativeLines.push(...subLines, '');
  });

  const boxHeight = (operativeLines.length * 3.8) + 8;
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(160, 50, 10);
  doc.text('OPERATIVE JUDICIAL DIRECTIVES:', margin + 4, y + 6);

  let opY = y + 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 24);
  operativeLines.forEach(l => {
    if (l) doc.text(l, margin + 4, opY);
    opY += 3.8;
  });

  y += boxHeight + 10;

  // Judicial Seal & Judge Signature Block
  const sigY = pageHeight - 40;
  
  // Seal Stamp (Left)
  doc.setDrawColor(140, 60, 20);
  doc.setLineWidth(0.5);
  doc.rect(margin + 5, sigY - 10, 48, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 60, 20);
  doc.text('SEAL OF THE COMMERCIAL COURT', margin + 29, sigY - 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`REGISTERED & VERIFIED`, margin + 29, sigY, { align: 'center' });
  doc.text(`RECORD ROOM · ${courtName.slice(0, 24)}`, margin + 29, sigY + 4, { align: 'center' });

  // Signature (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 24);
  doc.text('Sd/-', pageWidth - margin - 35, sigY - 2, { align: 'center' });
  doc.text('(P. K. SANYAL)', pageWidth - margin - 35, sigY + 2.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 85);
  doc.text('Commercial Judge, Presiding Officer', pageWidth - margin - 35, sigY + 6.5, { align: 'center' });
  doc.text(courtName, pageWidth - margin - 35, sigY + 10.5, { align: 'center' });

  // Output generation
  const pdfArrayBuffer = doc.output('arraybuffer');
  const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  const pdfBlobUrl = URL.createObjectURL(pdfBlob);
  const pdfDataUri = doc.output('datauristring');

  const fullJudgmentText = `[IN THE COURT OF THE COMMERCIAL JUDGE AT RAJARHAT, NORTH 24 PARGANAS]\n` +
    `Case Number: ${caseNumber} | CNR: ${cnrNumber}\n` +
    `Cause Title: ${caseTitle}\n` +
    `Coram: ${bench}\n` +
    `Date of Hearing: ${hearingDate} | Next Listing: ${nextListingDate}\n\n` +
    `APPEARANCES:\n` +
    `For Plaintiff: ${leadCounsel}, Adv. Ratul Dutta\n` +
    `For Defendants: Ganguly & Co., Advocates\n\n` +
    `RECORD OF PROCEEDINGS:\n` +
    paragraphs.join('\n\n') + '\n\n' +
    `OPERATIVE DIRECTIONS:\n` +
    operativeText.join('\n') + '\n\n' +
    `Sd/- (P. K. SANYAL), Commercial Judge, Presiding Officer.`;

  return {
    doc,
    blob: pdfBlob,
    blobUrl: pdfBlobUrl,
    dataUri: pdfDataUri,
    fullText: fullJudgmentText,
    fileName: `Order_Sheet_${caseNumber.replace(/[\/\s]/g, '_')}_${hearingDate.replace(/[\/\s,]/g, '_')}.pdf`,
    download: (customName) => {
      doc.save(customName || `Court_Order_${caseNumber.replace(/[\/\s]/g, '_')}.pdf`);
    }
  };
};

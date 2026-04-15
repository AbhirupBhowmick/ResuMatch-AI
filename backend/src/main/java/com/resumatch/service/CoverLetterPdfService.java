package com.resumatch.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoverLetterPdfService {

    private final UserService userService;

    /**
     * Generate a professional A4 cover letter PDF.
     */
    public byte[] generatePdf(String subjectLine, List<String> bodyParagraphs, String userName) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);

            // Professional margins (1 inch = 72 points)
            document.setMargins(72, 72, 72, 72);

            // Fonts
            PdfFont headerFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont bodyFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont lightFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            DeviceRgb darkGray = new DeviceRgb(51, 51, 51);
            DeviceRgb medGray = new DeviceRgb(100, 100, 100);
            DeviceRgb lightGray = new DeviceRgb(150, 150, 150);

            // Resolve user info
            String resolvedName = userName;
            String userEmail = "";
            try {
                var user = userService.getCurrentUser();
                if (resolvedName == null || resolvedName.isBlank()) {
                    resolvedName = user.getName() != null ? user.getName() : user.getEmail().split("@")[0];
                }
                userEmail = user.getEmail();
            } catch (Exception e) {
                if (resolvedName == null || resolvedName.isBlank()) resolvedName = "Applicant";
            }

            // ── HEADER: Name ──
            Paragraph namePara = new Paragraph(resolvedName)
                    .setFont(headerFont)
                    .setFontSize(22)
                    .setFontColor(darkGray)
                    .setMarginBottom(4);
            document.add(namePara);

            // Contact line
            if (!userEmail.isEmpty()) {
                Paragraph contactPara = new Paragraph(userEmail)
                        .setFont(bodyFont)
                        .setFontSize(10)
                        .setFontColor(medGray)
                        .setMarginBottom(16);
                document.add(contactPara);
            }

            // Separator line
            SolidLine line = new SolidLine(0.5f);
            line.setColor(new DeviceRgb(200, 200, 200));
            document.add(new LineSeparator(line).setMarginBottom(20));

            // ── DATE ──
            String formattedDate = LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
            Paragraph datePara = new Paragraph(formattedDate)
                    .setFont(bodyFont)
                    .setFontSize(10)
                    .setFontColor(medGray)
                    .setMarginBottom(4);
            document.add(datePara);

            // Recipient
            document.add(new Paragraph("Hiring Manager")
                    .setFont(headerFont).setFontSize(11).setFontColor(darkGray).setMarginBottom(20));

            // ── SUBJECT LINE ──
            if (subjectLine != null && !subjectLine.isBlank()) {
                Paragraph subjectPara = new Paragraph("RE: " + subjectLine)
                        .setFont(headerFont)
                        .setFontSize(11)
                        .setFontColor(darkGray)
                        .setMarginBottom(16);
                document.add(subjectPara);
            }

            // ── SALUTATION ──
            document.add(new Paragraph("Dear Hiring Manager,")
                    .setFont(bodyFont).setFontSize(11).setFontColor(darkGray)
                    .setMarginBottom(12));

            // ── BODY PARAGRAPHS ──
            if (bodyParagraphs != null) {
                for (String para : bodyParagraphs) {
                    Paragraph bodyPara = new Paragraph(para)
                            .setFont(bodyFont)
                            .setFontSize(11)
                            .setFontColor(darkGray)
                            .setMultipliedLeading(1.6f) // 1.5x line spacing
                            .setMarginBottom(12);
                    document.add(bodyPara);
                }
            }

            // ── CLOSING ──
            document.add(new Paragraph("Sincerely,")
                    .setFont(bodyFont).setFontSize(11).setFontColor(darkGray)
                    .setMarginTop(20).setMarginBottom(4));
            document.add(new Paragraph(resolvedName)
                    .setFont(headerFont).setFontSize(11).setFontColor(darkGray)
                    .setMarginBottom(40));

            // ── WATERMARK / FOOTER ──
            SolidLine footerLine = new SolidLine(0.3f);
            footerLine.setColor(new DeviceRgb(220, 220, 220));
            document.add(new LineSeparator(footerLine).setMarginTop(20).setMarginBottom(8));

            Paragraph watermark = new Paragraph("Generated by ResuMatch AI — The Digital Curator")
                    .setFont(lightFont)
                    .setFontSize(8)
                    .setFontColor(lightGray)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(watermark);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("PDF generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}

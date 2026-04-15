package com.resumatch.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.resumatch.model.AnalysisResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportGeneratorService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public byte[] generateAnalysisReport(AnalysisResult analysis) throws IOException {
        log.info("Generating professional PDF report for analysis ID: {}", analysis.getId());
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(40, 40, 40, 40);
            log.debug("PDF document initialized with A4 size and standard margins.");

            // --- Header ---
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}));
            headerTable.setWidth(UnitValue.createPercentValue(100));

            Cell titleCell = new Cell().add(new Paragraph("ResuMatch AI")
                    .setFontSize(24)
                    .setBold()
                    .setFontColor(new DeviceRgb(79, 70, 229))); // Primary Indigo
            titleCell.setBorder(Border.NO_BORDER);
            headerTable.addCell(titleCell);

            Cell reportCell = new Cell().add(new Paragraph("Resume Audit Report")
                    .setFontSize(10)
                    .setItalic()
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontColor(ColorConstants.GRAY));
            reportCell.setBorder(Border.NO_BORDER);
            headerTable.addCell(reportCell);

            document.add(headerTable);
            log.debug("Header section added to PDF.");
            document.add(new Paragraph("\n"));

            // --- Summary Section ---
            Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{100}));
            summaryTable.setWidth(UnitValue.createPercentValue(100));
            summaryTable.setBackgroundColor(new DeviceRgb(248, 250, 252));
            summaryTable.setBorder(new SolidBorder(new DeviceRgb(226, 232, 240), 1));
            summaryTable.setPadding(10);

            String userName = analysis.getUser() != null ? analysis.getUser().getName() : "Candidate";
            String date = analysis.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
            
            String targetRole = "Target Role";
            try {
                List<String> suggestions = objectMapper.readValue(analysis.getJobSuggestions(), new TypeReference<List<String>>() {});
                if (!suggestions.isEmpty()) targetRole = suggestions.get(0);
            } catch (Exception e) {
                log.warn("Failed to parse job suggestions for PDF");
            }

            summaryTable.addCell(new Cell().add(new Paragraph("Candidate: " + userName).setBold()).setBorder(Border.NO_BORDER));
            summaryTable.addCell(new Cell().add(new Paragraph("Target Position: " + targetRole)).setBorder(Border.NO_BORDER));
            summaryTable.addCell(new Cell().add(new Paragraph("Audit Date: " + date).setFontSize(9).setFontColor(ColorConstants.GRAY)).setBorder(Border.NO_BORDER));
            
            document.add(summaryTable);
            document.add(new Paragraph("\n"));

            // --- ATS Score Section ---
            Table scoreTable = new Table(UnitValue.createPercentArray(new float[]{100}));
            scoreTable.setWidth(UnitValue.createPercentValue(100));
            
            int score = analysis.getScore();
            DeviceRgb scoreColor = score >= 80 ? new DeviceRgb(16, 185, 129) : (score >= 60 ? new DeviceRgb(79, 70, 229) : new DeviceRgb(239, 68, 68));
            
            Cell scoreCell = new Cell()
                    .add(new Paragraph(String.valueOf(score))
                            .setFontSize(48)
                            .setBold()
                            .setFontColor(scoreColor)
                            .setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("ATS SCORE")
                            .setFontSize(10)
                            .setBold()
                            .setTextAlignment(TextAlignment.CENTER)
                            .setFontColor(ColorConstants.GRAY))
                    .setBorder(Border.NO_BORDER)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE);
            
            scoreTable.addCell(scoreCell);
            document.add(scoreTable);
            document.add(new Paragraph("\n"));

            // --- Findings (Two Columns) ---
            Table findingsTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}));
            findingsTable.setWidth(UnitValue.createPercentValue(100));

            // Column 1: Strengths
            Cell strengthsCell = new Cell().add(new Paragraph("✓ STRENGTHS & MATCHES")
                    .setBold()
                    .setFontSize(12)
                    .setFontColor(new DeviceRgb(16, 185, 129)));
            strengthsCell.setBorder(Border.NO_BORDER);
            strengthsCell.setPaddingRight(10);
            
            try {
                if (analysis.getStrengths() != null && !analysis.getStrengths().isEmpty()) {
                    List<String> strengths = objectMapper.readValue(analysis.getStrengths(), new TypeReference<List<String>>() {});
                    for (String s : strengths) {
                        strengthsCell.add(new Paragraph("• " + s).setMarginLeft(10).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
                    }
                } else {
                    strengthsCell.add(new Paragraph("No matched keywords found."));
                }
            } catch (Exception e) {
                log.warn("Error parsing strengths for PDF: {}", e.getMessage());
                strengthsCell.add(new Paragraph("Internal error parsing strengths."));
            }
            findingsTable.addCell(strengthsCell);

            // Column 2: Missing Keywords
            Cell missingCell = new Cell().add(new Paragraph("! MISSING KEYWORDS")
                    .setBold()
                    .setFontSize(12)
                    .setFontColor(new DeviceRgb(239, 68, 68)));
            missingCell.setBorder(Border.NO_BORDER);
            missingCell.setPaddingLeft(10);
            
            try {
                if (analysis.getMissingKeywords() != null && !analysis.getMissingKeywords().isEmpty()) {
                    List<Map<String, String>> missing = objectMapper.readValue(analysis.getMissingKeywords(), new TypeReference<List<Map<String, String>>>() {});
                    for (Map<String, String> m : missing) {
                        missingCell.add(new Paragraph("• " + (m.get("text") != null ? m.get("text") : "Unknown Keyword")).setMarginLeft(10).setBold().setFontSize(9));
                        missingCell.add(new Paragraph(m.get("desc") != null ? m.get("desc") : "Recommendation missing.").setMarginLeft(20).setFontSize(8).setFontColor(ColorConstants.GRAY));
                    }
                } else {
                    missingCell.add(new Paragraph("No critical missing keywords."));
                }
            } catch (Exception e) {
                log.warn("Error parsing missing keywords for PDF: {}", e.getMessage());
                // Handle fallback if missingKeywords is a simple list
                try {
                     List<String> missingList = objectMapper.readValue(analysis.getMissingKeywords(), new TypeReference<List<String>>() {});
                     for (String s : missingList) {
                         missingCell.add(new Paragraph("• " + s).setMarginLeft(10).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
                     }
                } catch (Exception e2) {
                     log.error("Failed both structured and simple parse for keywords: {}", e2.getMessage());
                     missingCell.add(new Paragraph("No critical missing keywords."));
                }
            }
            findingsTable.addCell(missingCell);

            document.add(findingsTable);

            // --- Footer ---
            document.showTextAligned(new Paragraph("Generated by ResuMatch AI - Your Digital Career Curator")
                            .setFontSize(8)
                            .setFontColor(ColorConstants.LIGHT_GRAY),
                    pdf.getDefaultPageSize().getWidth() / 2, 30, TextAlignment.CENTER);

            document.close();
            log.info("Professional PDF report successfully generated (size: {} bytes).", out.size());
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Critical failure during PDF generation for analysis {}: {}", analysis.getId(), e.getMessage(), e);
            throw e;
        }
    }
}

package com.college.backend.college.project.controller;

import com.college.backend.college.project.service.impl.ExcelExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api/excel")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExcelExportController {

    private final ExcelExportService excelExportService;

    @Autowired
    public ExcelExportController(ExcelExportService excelExportService) {
        this.excelExportService = excelExportService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<byte[]> exportProjectToExcel(@PathVariable Integer projectId) {
        try {
            byte[] excelContent = excelExportService.exportProjectToExcel(projectId);

            // Tạo tên file dựa trên ID dự án và ngày hiện tại
            String currentDate = new SimpleDateFormat("yyyyMMdd").format(new Date());
            String filename = "project_" + projectId + "_report_" + currentDate + ".xlsx";

            // Thiết lập headers cho response
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
        } catch (IOException e) {
            // Log lỗi và trả về lỗi 500 Internal Server Error
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
package com.college.backend.college.project.controller;

import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.response.ProjectResponse;
import com.college.backend.college.project.service.impl.ExcelExportService;
import com.college.backend.college.project.service.impl.ExcelImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api/excel")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExcelImportController {

    private final ExcelExportService excelExportService;
    private final ExcelImportService excelImportService;

    @Autowired
    public ExcelImportController(ExcelExportService excelExportService, ExcelImportService excelImportService) {
        this.excelExportService = excelExportService;
        this.excelImportService = excelImportService;
    }

    @GetMapping("/export/project/{projectId}")
    public ResponseEntity<byte[]> exportProject(@PathVariable Integer projectId) {
        try {
            byte[] excelBytes = excelExportService.exportProjectToExcel(projectId);
            String filename = "project_" + projectId + "_" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelBytes);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/template/project")
    public ResponseEntity<byte[]> getProjectImportTemplate() {
        try {
            byte[] templateBytes = excelImportService.createProjectImportTemplate();
            String filename = "project_import_template.xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(templateBytes);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/import/project")
    public ResponseEntity<ProjectResponse> importProject(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ProjectResponse project = excelImportService.importProjectFromExcel(file);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

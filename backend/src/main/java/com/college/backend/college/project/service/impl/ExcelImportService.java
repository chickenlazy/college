package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Tag;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.TagRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.response.ProjectResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class ExcelImportService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    @Autowired
    public ExcelImportService(ProjectRepository projectRepository,
                              UserRepository userRepository,
                              TagRepository tagRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
    }

    @Transactional
    public ProjectResponse importProjectFromExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            // Đọc sheet "Thông tin dự án"
            Sheet projectSheet = workbook.getSheet("Thông tin dự án");
            if (projectSheet == null) {
                throw new IllegalArgumentException("File Excel không đúng định dạng: Không tìm thấy sheet 'Thông tin dự án'");
            }

            // Tạo đối tượng Project mới
            Project project = new Project();

            // Đọc tên dự án (ô B3)
            String projectName = getCellValueAsString(projectSheet.getRow(2).getCell(1));
            if (projectName == null || projectName.trim().isEmpty()) {
                throw new IllegalArgumentException("Tên dự án không được để trống");
            }
            project.setName(projectName);

            // Đọc mô tả (ô B5)
            String description = getCellValueAsString(projectSheet.getRow(4).getCell(1));
            project.setDescription(description);

            // Đọc ngày bắt đầu (ô B6)
            Date startDate = getCellValueAsDate(projectSheet.getRow(5).getCell(1));
            project.setStartDate(startDate);

            // Đọc ngày kết thúc dự kiến (ô B7)
            Date dueDate = getCellValueAsDate(projectSheet.getRow(6).getCell(1));
            project.setDueDate(dueDate);

            // Đọc trạng thái (ô B8)
            String statusText = getCellValueAsString(projectSheet.getRow(7).getCell(1));
            ProjectStatus status = parseProjectStatus(statusText);
            project.setStatus(status);

            // Đọc email manager (ô B9)
            String managerEmail = getCellValueAsString(projectSheet.getRow(8).getCell(1));
            if (managerEmail != null && !managerEmail.trim().isEmpty()) {
                // Tìm user theo email
                Optional<User> managerOpt = userRepository.findByEmail(managerEmail);
                if (managerOpt.isPresent()) {
                    project.setManager(managerOpt.get());
                }
            }

            // Đọc tags (ô B10)
            String tagsText = getCellValueAsString(projectSheet.getRow(9).getCell(1));
            if (tagsText != null && !tagsText.trim().isEmpty()) {
                Set<Tag> tags = new HashSet<>();
                String[] tagNames = tagsText.split(",");
                for (String tagName : tagNames) {
                    String trimmedTagName = tagName.trim();
                    // Tìm tag theo tên hoặc tạo mới nếu chưa có
                    Optional<Tag> tagOpt = tagRepository.findByName(trimmedTagName);
                    Tag tag = tagOpt.orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(trimmedTagName);
                        return tagRepository.save(newTag);
                    });
                    tags.add(tag);
                }
                project.setTags(tags);
            }

            // Đọc sheet "Thành viên dự án" để thêm thành viên
            Sheet membersSheet = workbook.getSheet("Thành viên dự án");
            if (membersSheet != null) {
                Set<User> members = new HashSet<>();
                // Dòng dữ liệu bắt đầu từ dòng 2 (index 2)
                for (int i = 2; i <= membersSheet.getLastRowNum(); i++) {
                    Row row = membersSheet.getRow(i);
                    if (row == null) continue;

                    // Đọc email thành viên (cột C - index 2)
                    String memberEmail = getCellValueAsString(row.getCell(2));
                    if (memberEmail != null && !memberEmail.trim().isEmpty()) {
                        Optional<User> memberOpt = userRepository.findByEmail(memberEmail);
                        if (memberOpt.isPresent()) {
                            members.add(memberOpt.get());
                        }
                    }
                }
                project.setUsers(members);
            }

            // Thiết lập ngày tạo và ngày cập nhật
            Date now = new Date();
            project.setCreatedDate(now);
            project.setLastModifiedDate(now);

            // Lưu project vào cơ sở dữ liệu
            Project savedProject = projectRepository.save(project);

            // Chuyển đổi và trả về
            ProjectServiceImpl projectService = new ProjectServiceImpl(
                    projectRepository, null, userRepository, tagRepository, null);
            return projectService.mapProjectToProjectResponse(savedProject);
        }
    }

    // Helper methods
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }

    private Date getCellValueAsDate(Cell cell) {
        if (cell == null) return null;

        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
                return sdf.parse(cell.getStringCellValue());
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private ProjectStatus parseProjectStatus(String statusText) {
        if (statusText == null) return ProjectStatus.NOT_STARTED;

        switch (statusText.trim().toUpperCase()) {
            case "ĐANG THỰC HIỆN":
                return ProjectStatus.IN_PROGRESS;
            case "CHƯA BẮT ĐẦU":
                return ProjectStatus.NOT_STARTED;
            case "TẠM DỪNG":
                return ProjectStatus.ON_HOLD;
            case "HOÀN THÀNH":
                return ProjectStatus.COMPLETED;
            case "QUÁ HẠN":
                return ProjectStatus.OVER_DUE;
            default:
                return ProjectStatus.NOT_STARTED;
        }
    }

    // Phương thức tạo template Excel trống để người dùng tải về và điền
    public byte[] createProjectImportTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            // Tạo các font style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 14);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            Font boldFont = workbook.createFont();
            boldFont.setBold(true);

            CellStyle labelStyle = workbook.createCellStyle();
            labelStyle.setFont(boldFont);

            CellStyle mandatoryLabelStyle = workbook.createCellStyle();
            mandatoryLabelStyle.setFont(boldFont);
            mandatoryLabelStyle.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
            mandatoryLabelStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Sheet Thông tin dự án
            Sheet projectSheet = workbook.createSheet("Thông tin dự án");
            projectSheet.setColumnWidth(0, 5000);
            projectSheet.setColumnWidth(1, 10000);

            // Header
            Row headerRow = projectSheet.createRow(0);
            Cell headerCell = headerRow.createCell(0);
            headerCell.setCellValue("FORM NHẬP THÔNG TIN DỰ ÁN");
            headerCell.setCellStyle(headerStyle);
            projectSheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

            // Hướng dẫn
            Row guideRow = projectSheet.createRow(1);
            Cell guideCell = guideRow.createCell(0);
            guideCell.setCellValue("Các trường có dấu (*) là bắt buộc");
            guideCell.setCellStyle(labelStyle);
            projectSheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 1));

            // Các trường thông tin
            String[][] fields = {
                    {"Tên dự án (*)", ""},
                    {"Mã dự án", "Tự động tạo"},
                    {"Mô tả", ""},
                    {"Ngày bắt đầu", "dd/mm/yyyy"},
                    {"Ngày kết thúc dự kiến", "dd/mm/yyyy"},
                    {"Trạng thái", "Chưa bắt đầu, Đang thực hiện, Tạm dừng, Hoàn thành, Quá hạn"},
                    {"Email quản lý dự án", "Nhập email của quản lý dự án"},
                    {"Các thẻ (tag)", "Nhập các tag cách nhau bởi dấu phẩy"},
            };

            for (int i = 0; i < fields.length; i++) {
                Row row = projectSheet.createRow(i + 2);
                Cell labelCell = row.createCell(0);
                labelCell.setCellValue(fields[i][0]);

                if (fields[i][0].contains("(*)")) {
                    labelCell.setCellStyle(mandatoryLabelStyle);
                } else {
                    labelCell.setCellStyle(labelStyle);
                }

                Cell valueCell = row.createCell(1);
                valueCell.setCellValue(fields[i][1]);
            }

            // Sheet Thành viên dự án
            Sheet membersSheet = workbook.createSheet("Thành viên dự án");
            membersSheet.setColumnWidth(0, 5000);
            membersSheet.setColumnWidth(1, 5000);
            membersSheet.setColumnWidth(2, 8000);

            // Header
            Row membersHeaderRow = membersSheet.createRow(0);
            Cell membersHeaderCell = membersHeaderRow.createCell(0);
            membersHeaderCell.setCellValue("DANH SÁCH THÀNH VIÊN DỰ ÁN");
            membersHeaderCell.setCellStyle(headerStyle);
            membersSheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 2));

            // Column titles
            Row columnRow = membersSheet.createRow(1);
            String[] columns = {"Họ và tên", "Vai trò", "Email (*)"};

            for (int i = 0; i < columns.length; i++) {
                Cell cell = columnRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(labelStyle);
            }

            // Thêm vài dòng mẫu
            for (int i = 0; i < 5; i++) {
                membersSheet.createRow(i + 2);
            }

            // Ghi workbook vào ByteArrayOutputStream
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}

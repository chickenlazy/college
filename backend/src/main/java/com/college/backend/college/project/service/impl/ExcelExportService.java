package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.TaskRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ExcelExportService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Autowired
    public ExcelExportService(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public byte[] exportProjectToExcel(Integer projectId) throws IOException {
        // Tìm project theo ID
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Lấy danh sách tasks
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        // Tạo workbook mới
        try (Workbook workbook = new XSSFWorkbook()) {
            // Tạo font styles
            Font headerFont = createHeaderFont(workbook);
            Font subHeaderFont = createSubHeaderFont(workbook);
            Font normalFont = createNormalFont(workbook);
            Font boldFont = createBoldFont(workbook);
            Font italicFont = createItalicFont(workbook);
            Font managerFont = createManagerFont(workbook);

            // Tạo cell styles
            CellStyle headerStyle = createHeaderStyle(workbook, headerFont);
            CellStyle subHeaderStyle = createSubHeaderStyle(workbook, subHeaderFont);
            CellStyle normalStyle = createNormalStyle(workbook, normalFont);
            CellStyle boldStyle = createBoldStyle(workbook, boldFont);
            CellStyle dateStyle = createDateStyle(workbook, normalFont);
            CellStyle centeredStyle = createCenteredStyle(workbook, normalFont);
            CellStyle completedStyle = createCompletedStyle(workbook, normalFont);
            CellStyle pendingStyle = createPendingStyle(workbook, normalFont);
            CellStyle overdueStyle = createOverdueStyle(workbook, normalFont);
            CellStyle italicStyle = createItalicStyle(workbook, italicFont);
            CellStyle managerStyle = createManagerStyle(workbook, managerFont);

            // Tạo cell styles cho dòng chẵn lẻ
            CellStyle evenRowStyle = createEvenRowStyle(workbook, normalFont);
            CellStyle oddRowStyle = createOddRowStyle(workbook, normalFont);
            CellStyle evenRowCenteredStyle = createEvenRowCenteredStyle(workbook, normalFont);
            CellStyle oddRowCenteredStyle = createOddRowCenteredStyle(workbook, normalFont);

            // Tạo sheet thông tin dự án
            Sheet projectSheet = createProjectInfoSheet(workbook, project, tasks, headerStyle, subHeaderStyle, normalStyle, boldStyle, dateStyle);

            // Tạo sheet Tasks
            Sheet tasksSheet = createTasksSheet(workbook, tasks, headerStyle, subHeaderStyle, normalStyle,
                    boldStyle, dateStyle, centeredStyle, completedStyle,
                    pendingStyle, overdueStyle, italicStyle,
                    evenRowStyle, oddRowStyle, evenRowCenteredStyle, oddRowCenteredStyle);

            // Tạo sheet Members
            Sheet membersSheet = createMembersSheet(workbook, project, headerStyle, subHeaderStyle,
                    normalStyle, centeredStyle, managerStyle,
                    evenRowStyle, oddRowStyle, evenRowCenteredStyle, oddRowCenteredStyle);

            // Tùy chỉnh sheet và căn chỉnh cột tự động
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                sheet.setDisplayGridlines(false);
                sheet.createFreezePane(0, 2); // Đóng băng các dòng tiêu đề
            }

            // Viết workbook vào ByteArrayOutputStream
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    // ===== CREATE FONTS =====

    private Font createHeaderFont(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(IndexedColors.WHITE.getIndex());
        return font;
    }

    private Font createSubHeaderFont(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(IndexedColors.WHITE.getIndex());
        return font;
    }

    private Font createNormalFont(Workbook workbook) {
        Font font = workbook.createFont();
        font.setFontHeightInPoints((short) 11);
        return font;
    }

    private Font createBoldFont(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        return font;
    }

    private Font createItalicFont(Workbook workbook) {
        Font font = workbook.createFont();
        font.setItalic(true);
        font.setFontHeightInPoints((short) 11);
        return font;
    }

    private Font createManagerFont(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        return font;
    }

    // ===== CREATE CELL STYLES =====

    private CellStyle createHeaderStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createSubHeaderStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createNormalStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.LEFT);
        setBorders(style);
        return style;
    }

    private CellStyle createBoldStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.LEFT);
        setBorders(style);
        return style;
    }

    private CellStyle createItalicStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.LEFT);
        setBorders(style);
        return style;
    }

    private CellStyle createManagerStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.LEFT);
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy"));
        setBorders(style);
        return style;
    }

    private CellStyle createCenteredStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createCompletedStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
    }

    private CellStyle createPendingStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
    }

    private CellStyle createOverdueStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.CORAL.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
    }

    // Các style cho dòng chẵn/lẻ để tạo hiệu ứng sọc màu
    private CellStyle createEvenRowStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
    }

    private CellStyle createOddRowStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.LEFT);
        setBorders(style);
        return style;
    }

    private CellStyle createEvenRowCenteredStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
    }

    private CellStyle createOddRowCenteredStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private Sheet createProjectInfoSheet(Workbook workbook, Project project, List<Task> tasks, CellStyle headerStyle,
                                         CellStyle subHeaderStyle, CellStyle normalStyle,
                                         CellStyle boldStyle, CellStyle dateStyle) {
        Sheet sheet = workbook.createSheet("Thông tin dự án");

        CellStyle highlightStyle = workbook.createCellStyle();
        highlightStyle.cloneStyleFrom(normalStyle);
        highlightStyle.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
        highlightStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle labelStyle = workbook.createCellStyle();
        labelStyle.cloneStyleFrom(boldStyle);
        labelStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        labelStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Font labelFont = workbook.createFont();
        labelFont.setBold(true);
        labelFont.setColor(IndexedColors.WHITE.getIndex());
        labelFont.setFontHeightInPoints((short) 11);
        labelStyle.setFont(labelFont);

        Font highlightFont = workbook.createFont();
        highlightFont.setBold(true);
        highlightFont.setFontHeightInPoints((short) 11);
        highlightStyle.setFont(highlightFont);

        // Set column widths
        sheet.setColumnWidth(0, 5000);
        sheet.setColumnWidth(1, 12000);

        // Tạo header trang
        Row titleRow = sheet.createRow(0);
        titleRow.setHeightInPoints(30); // Điều chỉnh chiều cao dòng

        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO CHI TIẾT DỰ ÁN");
        titleCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

        // Dòng trống
        sheet.createRow(1).setHeightInPoints(10);

        // Thông tin dự án
        Row projectRow = sheet.createRow(2);
        Cell projectLabelCell = projectRow.createCell(0);
        projectLabelCell.setCellValue("Tên dự án:");
        projectLabelCell.setCellStyle(labelStyle);

        Cell projectValueCell = projectRow.createCell(1);
        projectValueCell.setCellValue(project.getName());
        projectValueCell.setCellStyle(normalStyle);

        // ID dự án
        Row idRow = sheet.createRow(3);
        Cell idLabelCell = idRow.createCell(0);
        idLabelCell.setCellValue("Mã dự án:");
        idLabelCell.setCellStyle(labelStyle);

        Cell idValueCell = idRow.createCell(1);
        idValueCell.setCellValue("PRJ-" + String.format("%04d", project.getId()));
        idValueCell.setCellStyle(normalStyle);

        // Mô tả dự án
        Row descRow = sheet.createRow(4);
        Cell descLabelCell = descRow.createCell(0);
        descLabelCell.setCellValue("Mô tả:");
        descLabelCell.setCellStyle(labelStyle);

        Cell descValueCell = descRow.createCell(1);
        descValueCell.setCellValue(project.getDescription() != null ? project.getDescription() : "");
        descValueCell.setCellStyle(normalStyle);

        // Ngày bắt đầu
        Row startRow = sheet.createRow(5);
        Cell startLabelCell = startRow.createCell(0);
        startLabelCell.setCellValue("Ngày bắt đầu:");
        startLabelCell.setCellStyle(labelStyle);

        Cell startValueCell = startRow.createCell(1);
        if (project.getStartDate() != null) {
            startValueCell.setCellValue(project.getStartDate());
            startValueCell.setCellStyle(dateStyle);
        } else {
            startValueCell.setCellValue("Chưa xác định");
            startValueCell.setCellStyle(normalStyle);
        }

        // Ngày kết thúc dự kiến
        Row dueRow = sheet.createRow(6);
        Cell dueLabelCell = dueRow.createCell(0);
        dueLabelCell.setCellValue("Ngày kết thúc dự kiến:");
        dueLabelCell.setCellStyle(labelStyle);

        Cell dueValueCell = dueRow.createCell(1);
        if (project.getDueDate() != null) {
            dueValueCell.setCellValue(project.getDueDate());
            dueValueCell.setCellStyle(dateStyle);
        } else {
            dueValueCell.setCellValue("Chưa xác định");
            dueValueCell.setCellStyle(normalStyle);
        }

        // Trạng thái
        Row statusRow = sheet.createRow(7);
        Cell statusLabelCell = statusRow.createCell(0);
        statusLabelCell.setCellValue("Trạng thái:");
        statusLabelCell.setCellStyle(labelStyle);

        Cell statusValueCell = statusRow.createCell(1);
        statusValueCell.setCellValue(getStatusText(project.getStatus().name()));
        statusValueCell.setCellStyle(normalStyle);

        // Quản lý dự án
        Row managerRow = sheet.createRow(8);
        Cell managerLabelCell = managerRow.createCell(0);
        managerLabelCell.setCellValue("Quản lý dự án:");
        managerLabelCell.setCellStyle(labelStyle);

        Cell managerValueCell = managerRow.createCell(1);
        if (project.getManager() != null) {
            managerValueCell.setCellValue(project.getManager().getFullName() + " (" + project.getManager().getEmail() + ")");
        } else {
            managerValueCell.setCellValue("Chưa phân công");
        }
        managerValueCell.setCellStyle(normalStyle);

        // Tags
        Row tagsRow = sheet.createRow(9);
        Cell tagsLabelCell = tagsRow.createCell(0);
        tagsLabelCell.setCellValue("Tags:");
        tagsLabelCell.setCellStyle(labelStyle);

        Cell tagsValueCell = tagsRow.createCell(1);
        if (project.getTags() != null && !project.getTags().isEmpty()) {
            String tags = project.getTags().stream()
                    .map(tag -> tag.getName())
                    .collect(Collectors.joining(", "));
            tagsValueCell.setCellValue(tags);
        } else {
            tagsValueCell.setCellValue("Không có");
        }
        tagsValueCell.setCellStyle(normalStyle);

        // Số lượng công việc
        int totalTasks = tasks.size();
        int completedTasks = (int) tasks.stream()
                .filter(task -> task.getStatus() != null && task.getStatus().name().equals("COMPLETED"))
                .count();
        double progress = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

        Row tasksCountRow = sheet.createRow(10);
        Cell tasksCountLabelCell = tasksCountRow.createCell(0);
        tasksCountLabelCell.setCellValue("Tiến độ dự án:");
        tasksCountLabelCell.setCellStyle(labelStyle);

        Cell tasksCountValueCell = tasksCountRow.createCell(1);
        tasksCountValueCell.setCellValue(String.format("%d/%d công việc hoàn thành (%.1f%%)",
                completedTasks, totalTasks, progress));
        tasksCountValueCell.setCellStyle(normalStyle);

        // Tổng số thành viên
        int totalMembers = 0;
        if (project.getUsers() != null) {
            totalMembers = project.getUsers().size();
            if (project.getManager() != null && project.getUsers().contains(project.getManager())) {
                // Nếu manager cũng là thành viên, tránh đếm trùng
                totalMembers = totalMembers - 1;
            }
        }
        if (project.getManager() != null) {
            totalMembers++; // Cộng thêm manager
        }

        Row membersCountRow = sheet.createRow(11);
        Cell membersCountLabelCell = membersCountRow.createCell(0);
        membersCountLabelCell.setCellValue("Tổng số thành viên:");
        membersCountLabelCell.setCellStyle(labelStyle);

        Cell membersCountValueCell = membersCountRow.createCell(1);
        membersCountValueCell.setCellValue(totalMembers + " thành viên");
        membersCountValueCell.setCellStyle(normalStyle);

        projectValueCell.setCellStyle(highlightStyle);
        statusValueCell.setCellStyle(highlightStyle);
        tasksCountValueCell.setCellStyle(highlightStyle);

        idValueCell.setCellStyle(highlightStyle);          // Mã dự án
        membersCountValueCell.setCellStyle(highlightStyle); // Tổng số thành viên
        managerValueCell.setCellStyle(highlightStyle);   // Quản lý dự án

        // Dòng trống
        sheet.createRow(12).setHeightInPoints(15);

        // Export date
        Row exportRow = sheet.createRow(13);
        Cell exportLabelCell = exportRow.createCell(0);
        exportLabelCell.setCellValue("Ngày xuất báo cáo:");
        exportLabelCell.setCellStyle(labelStyle);

        Cell exportValueCell = exportRow.createCell(1);
        exportValueCell.setCellValue(new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(new Date()));
        exportValueCell.setCellStyle(normalStyle);

        return sheet;
    }

    private Sheet createTasksSheet(Workbook workbook, List<Task> tasks, CellStyle headerStyle,
                                   CellStyle subHeaderStyle, CellStyle normalStyle,
                                   CellStyle boldStyle, CellStyle dateStyle,
                                   CellStyle centeredStyle, CellStyle completedStyle,
                                   CellStyle pendingStyle, CellStyle overdueStyle,
                                   CellStyle italicStyle,
                                   CellStyle evenRowStyle, CellStyle oddRowStyle,
                                   CellStyle evenRowCenteredStyle, CellStyle oddRowCenteredStyle) {
        Sheet sheet = workbook.createSheet("Danh sách công việc");

        // Set column widths
        sheet.setColumnWidth(0, 3000);  // STT
        sheet.setColumnWidth(1, 7000);  // Tên công việc
        sheet.setColumnWidth(2, 5000);  // Ngày bắt đầu
        sheet.setColumnWidth(3, 5000);  // Ngày kết thúc
        sheet.setColumnWidth(4, 3500);  // Trạng thái
        sheet.setColumnWidth(5, 5000);  // Người phụ trách
        sheet.setColumnWidth(6, 3500);  // Độ ưu tiên
        sheet.setColumnWidth(7, 4000);  // Tiến độ

        // Header
        Row headerRow = sheet.createRow(0);
        headerRow.setHeightInPoints(30); // Điều chỉnh chiều cao dòng

        Cell headerCell = headerRow.createCell(0);
        headerCell.setCellValue("DANH SÁCH CÔNG VIỆC");
        headerCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));

        // Subheader
        Row subheaderRow = sheet.createRow(1);
        subheaderRow.setHeightInPoints(20); // Điều chỉnh chiều cao dòng

        String[] headers = {"STT", "Tên công việc", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái", "Người phụ trách", "Độ ưu tiên", "Tiến độ"};

        for (int i = 0; i < headers.length; i++) {
            Cell cell = subheaderRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(subHeaderStyle);
        }

        // Tasks data
        int rowNum = 2;
        int taskIndex = 1;
        boolean isEvenRow = false;

        for (Task task : tasks) {
            Row row = sheet.createRow(rowNum++);
            isEvenRow = !isEvenRow; // Đảo trạng thái chẵn/lẻ

            // Chọn style dựa vào dòng chẵn/lẻ
            CellStyle rowStyle = isEvenRow ? evenRowStyle : oddRowStyle;
            CellStyle rowCenteredStyle = isEvenRow ? evenRowCenteredStyle : oddRowCenteredStyle;

            // STT
            Cell cell0 = row.createCell(0);
            cell0.setCellValue(taskIndex++);
            cell0.setCellStyle(rowCenteredStyle);

            // Tên công việc
            Cell cell1 = row.createCell(1);
            cell1.setCellValue(task.getName());
            cell1.setCellStyle(boldStyle); // Task chính luôn in đậm

            // Ngày bắt đầu
            Cell cell2 = row.createCell(2);
            if (task.getStartDate() != null) {
                cell2.setCellValue(task.getStartDate());
                cell2.setCellStyle(dateStyle);
            } else {
                cell2.setCellValue("Chưa xác định");
                cell2.setCellStyle(rowCenteredStyle);
            }

            // Ngày kết thúc
            Cell cell3 = row.createCell(3);
            if (task.getDueDate() != null) {
                cell3.setCellValue(task.getDueDate());
                cell3.setCellStyle(dateStyle);
            } else {
                cell3.setCellValue("Chưa xác định");
                cell3.setCellStyle(rowCenteredStyle);
            }

            // Trạng thái
            Cell cell4 = row.createCell(4);
            String status = task.getStatus() != null ? task.getStatus().name() : "NOT_STARTED";
            cell4.setCellValue(getStatusText(status));

            // Apply style based on status
            if ("COMPLETED".equals(status)) {
                cell4.setCellStyle(completedStyle);
            } else if ("OVER_DUE".equals(status)) {
                cell4.setCellStyle(overdueStyle);
            } else {
                cell4.setCellStyle(pendingStyle);
            }

            // Người tạo/phụ trách
            Cell cell5 = row.createCell(5);
            if (task.getCreatedBy() != null) {
                cell5.setCellValue(task.getCreatedBy().getFullName());
            } else {
                cell5.setCellValue("N/A");
            }
            cell5.setCellStyle(rowStyle);

            // Độ ưu tiên
            Cell cell6 = row.createCell(6);
            if (task.getPriority() != null) {
                cell6.setCellValue(getPriorityText(task.getPriority().name()));
            } else {
                cell6.setCellValue("Trung bình");
            }
            cell6.setCellStyle(rowCenteredStyle);

            // Tiến độ subtasks
            Cell cell7 = row.createCell(7);
            Set<Subtask> subtasks = task.getSubtasks();
            if (subtasks != null && !subtasks.isEmpty()) {
                int completed = (int) subtasks.stream().filter(Subtask::getCompleted).count();
                cell7.setCellValue(String.format("%d/%d hoàn thành", completed, subtasks.size()));
            } else {
                cell7.setCellValue("0/0 hoàn thành");
            }
            cell7.setCellStyle(rowCenteredStyle);

            // If task has subtasks, create rows for them
            if (subtasks != null && !subtasks.isEmpty()) {
                for (Subtask subtask : subtasks) {
                    Row subtaskRow = sheet.createRow(rowNum++);
                    isEvenRow = !isEvenRow; // Đảo trạng thái chẵn/lẻ

                    // Chọn style dựa vào dòng chẵn/lẻ
                    CellStyle subtaskRowStyle = isEvenRow ? evenRowStyle : oddRowStyle;
                    CellStyle subtaskRowCenteredStyle = isEvenRow ? evenRowCenteredStyle : oddRowCenteredStyle;

                    // Empty cell for STT
                    subtaskRow.createCell(0).setCellStyle(subtaskRowStyle);

                    // Subtask name with indent
                    Cell subtaskNameCell = subtaskRow.createCell(1);
                    subtaskNameCell.setCellValue("    → " + subtask.getName());
                    subtaskNameCell.setCellStyle(italicStyle); // Subtasks in nghiêng

                    // Start date
                    Cell subtaskStartCell = subtaskRow.createCell(2);
                    if (subtask.getStartDate() != null) {
                        subtaskStartCell.setCellValue(subtask.getStartDate());
                        subtaskStartCell.setCellStyle(dateStyle);
                    } else {
                        subtaskStartCell.setCellValue("");
                        subtaskStartCell.setCellStyle(subtaskRowStyle);
                    }

                    // Due date
                    Cell subtaskDueCell = subtaskRow.createCell(3);
                    if (subtask.getDueDate() != null) {
                        subtaskDueCell.setCellValue(subtask.getDueDate());
                        subtaskDueCell.setCellStyle(dateStyle);
                    } else {
                        subtaskDueCell.setCellValue("");
                        subtaskDueCell.setCellStyle(subtaskRowStyle);
                    }

                    // Status
                    Cell subtaskStatusCell = subtaskRow.createCell(4);
                    boolean isCompleted = subtask.getCompleted() != null ? subtask.getCompleted() : false;
                    subtaskStatusCell.setCellValue(isCompleted ? "Hoàn thành" : "Chưa hoàn thành");
                    subtaskStatusCell.setCellStyle(isCompleted ? completedStyle : pendingStyle);

                    // Người phụ trách (assignee)
                    Cell subtaskAssigneeCell = subtaskRow.createCell(5);
                    if (subtask.getAssignee() != null) {
                        subtaskAssigneeCell.setCellValue(subtask.getAssignee().getFullName());
                    } else {
                        subtaskAssigneeCell.setCellValue("Chưa phân công");
                    }
                    subtaskAssigneeCell.setCellStyle(subtaskRowStyle);

                    // Empty cells for remaining columns
                    for (int i = 6; i <= 7; i++) {
                        subtaskRow.createCell(i).setCellStyle(subtaskRowStyle);
                    }
                }
            }
        }

        return sheet;
    }

    private Sheet createMembersSheet(Workbook workbook, Project project, CellStyle headerStyle,
                                     CellStyle subHeaderStyle, CellStyle normalStyle,
                                     CellStyle centeredStyle, CellStyle managerStyle,
                                     CellStyle evenRowStyle, CellStyle oddRowStyle,
                                     CellStyle evenRowCenteredStyle, CellStyle oddRowCenteredStyle) {
        Sheet sheet = workbook.createSheet("Thành viên dự án");

        // Set column widths
        sheet.setColumnWidth(0, 3000);  // STT
        sheet.setColumnWidth(1, 6000);  // Họ và tên
        sheet.setColumnWidth(2, 6000);  // Email
        sheet.setColumnWidth(3, 4000);  // Số điện thoại
        sheet.setColumnWidth(4, 5000);  // Phòng ban
        sheet.setColumnWidth(5, 5000);  // Vị trí
        sheet.setColumnWidth(6, 3500);  // Vai trò

        // Header
        Row headerRow = sheet.createRow(0);
        headerRow.setHeightInPoints(30); // Điều chỉnh chiều cao dòng

        Cell headerCell = headerRow.createCell(0);
        headerCell.setCellValue("DANH SÁCH THÀNH VIÊN DỰ ÁN");
        headerCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 6));

        // Subheader
        Row subheaderRow = sheet.createRow(1);
        subheaderRow.setHeightInPoints(20); // Điều chỉnh chiều cao dòng

        String[] headers = {"STT", "Họ và tên", "Email", "Số điện thoại", "Phòng ban", "Vị trí", "Vai trò"};

        for (int i = 0; i < headers.length; i++) {
            Cell cell = subheaderRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(subHeaderStyle);
        }

        // Add project manager first
        int rowNum = 2;
        int memberIndex = 1;
        boolean isEvenRow = false;

        if (project.getManager() != null) {
            User manager = project.getManager();
            Row managerRow = sheet.createRow(rowNum++);
            isEvenRow = !isEvenRow;

            // STT
            Cell cell0 = managerRow.createCell(0);
            cell0.setCellValue(memberIndex++);
            CellStyle managerCenteredStyle = workbook.createCellStyle();
            managerCenteredStyle.cloneStyleFrom(managerStyle);
            managerCenteredStyle.setAlignment(HorizontalAlignment.CENTER);

            cell0.setCellStyle(managerCenteredStyle);

            // Họ và tên
            Cell cell1 = managerRow.createCell(1);
            cell1.setCellValue(manager.getFullName());
            cell1.setCellStyle(managerStyle);

            // Email
            Cell cell2 = managerRow.createCell(2);
            cell2.setCellValue(manager.getEmail());
            cell2.setCellStyle(managerStyle);

            // Số điện thoại
            Cell cell3 = managerRow.createCell(3);
            cell3.setCellValue(manager.getPhoneNumber() != null ? manager.getPhoneNumber() : "");
            cell3.setCellStyle(managerStyle);

            // Phòng ban
            Cell cell4 = managerRow.createCell(4);
            cell4.setCellValue(manager.getDepartment() != null ? manager.getDepartment() : "");
            cell4.setCellStyle(managerStyle);

            // Vị trí
            Cell cell5 = managerRow.createCell(5);
            cell5.setCellValue(manager.getPosition() != null ? manager.getPosition() : "");
            cell5.setCellStyle(managerStyle);

            // Vai trò
            Cell cell6 = managerRow.createCell(6);
            cell6.setCellValue("Quản lý dự án");
            cell6.setCellStyle(managerStyle);
        }

        // Team members
        if (project.getUsers() != null && !project.getUsers().isEmpty()) {
            for (User user : project.getUsers()) {
                // Skip if user is the manager
                if (project.getManager() != null && user.getId().equals(project.getManager().getId())) {
                    continue;
                }

                Row row = sheet.createRow(rowNum++);
                isEvenRow = !isEvenRow;

                // Chọn style dựa vào dòng chẵn/lẻ
                CellStyle rowStyle = isEvenRow ? evenRowStyle : oddRowStyle;
                CellStyle rowCenteredStyle = isEvenRow ? evenRowCenteredStyle : oddRowCenteredStyle;

                // STT
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(memberIndex++);
                cell0.setCellStyle(rowCenteredStyle);

                // Họ và tên
                Cell cell1 = row.createCell(1);
                cell1.setCellValue(user.getFullName());
                cell1.setCellStyle(rowStyle);

                // Email
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(user.getEmail());
                cell2.setCellStyle(rowStyle);

                // Số điện thoại
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
                cell3.setCellStyle(rowStyle);

                // Phòng ban
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(user.getDepartment() != null ? user.getDepartment() : "");
                cell4.setCellStyle(rowStyle);

                // Vị trí
                Cell cell5 = row.createCell(5);
                cell5.setCellValue(user.getPosition() != null ? user.getPosition() : "");
                cell5.setCellStyle(rowStyle);

                // Vai trò
                Cell cell6 = row.createCell(6);
                cell6.setCellValue("Thành viên");
                cell6.setCellStyle(rowCenteredStyle);
            }
        }

        return sheet;
    }

    private String getStatusText(String status) {
        if (status == null) return "Chưa bắt đầu";

        switch (status) {
            case "IN_PROGRESS":
                return "Đang thực hiện";
            case "NOT_STARTED":
                return "Chưa bắt đầu";
            case "ON_HOLD":
                return "Tạm dừng";
            case "COMPLETED":
                return "Hoàn thành";
            case "OVER_DUE":
                return "Quá hạn";
            default:
                return status;
        }
    }

    private String getPriorityText(String priority) {
        if (priority == null) return "Trung bình";

        switch (priority) {
            case "HIGH":
                return "Cao";
            case "MEDIUM":
                return "Trung bình";
            case "LOW":
                return "Thấp";
            default:
                return priority;
        }
    }
}
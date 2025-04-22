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

            // Tạo sheet thông tin dự án
            Sheet projectSheet = createProjectInfoSheet(workbook, project, tasks, headerStyle, subHeaderStyle, normalStyle, boldStyle, dateStyle);

            // Tạo sheet Tasks
            Sheet tasksSheet = createTasksSheet(workbook, tasks, headerStyle, subHeaderStyle, normalStyle, boldStyle, dateStyle, centeredStyle, completedStyle, pendingStyle, overdueStyle);

            // Tạo sheet Members
            Sheet membersSheet = createMembersSheet(workbook, project, headerStyle, subHeaderStyle, normalStyle, centeredStyle);

            // Viết workbook vào ByteArrayOutputStream
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

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
        setBorders(style);
        return style;
    }

    private CellStyle createBoldStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook, Font font) {
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
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

        // Set column widths
        sheet.setColumnWidth(0, 5000);
        sheet.setColumnWidth(1, 12000);

        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO CHI TIẾT DỰ ÁN");
        titleCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

        // Dòng trống
        sheet.createRow(1);

        // Thông tin dự án
        Row projectRow = sheet.createRow(2);
        Cell projectLabelCell = projectRow.createCell(0);
        projectLabelCell.setCellValue("Tên dự án:");
        projectLabelCell.setCellStyle(boldStyle);

        Cell projectValueCell = projectRow.createCell(1);
        projectValueCell.setCellValue(project.getName());
        projectValueCell.setCellStyle(normalStyle);

        // ID dự án
        Row idRow = sheet.createRow(3);
        Cell idLabelCell = idRow.createCell(0);
        idLabelCell.setCellValue("Mã dự án:");
        idLabelCell.setCellStyle(boldStyle);

        Cell idValueCell = idRow.createCell(1);
        idValueCell.setCellValue("PRJ-" + String.format("%04d", project.getId()));
        idValueCell.setCellStyle(normalStyle);

        // Mô tả dự án
        Row descRow = sheet.createRow(4);
        Cell descLabelCell = descRow.createCell(0);
        descLabelCell.setCellValue("Mô tả:");
        descLabelCell.setCellStyle(boldStyle);

        Cell descValueCell = descRow.createCell(1);
        descValueCell.setCellValue(project.getDescription() != null ? project.getDescription() : "");
        descValueCell.setCellStyle(normalStyle);

        // Ngày bắt đầu
        Row startRow = sheet.createRow(5);
        Cell startLabelCell = startRow.createCell(0);
        startLabelCell.setCellValue("Ngày bắt đầu:");
        startLabelCell.setCellStyle(boldStyle);

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
        dueLabelCell.setCellStyle(boldStyle);

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
        statusLabelCell.setCellStyle(boldStyle);

        Cell statusValueCell = statusRow.createCell(1);
        statusValueCell.setCellValue(getStatusText(project.getStatus().name()));
        statusValueCell.setCellStyle(normalStyle);

        // Quản lý dự án
        Row managerRow = sheet.createRow(8);
        Cell managerLabelCell = managerRow.createCell(0);
        managerLabelCell.setCellValue("Quản lý dự án:");
        managerLabelCell.setCellStyle(boldStyle);

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
        tagsLabelCell.setCellStyle(boldStyle);

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
        tasksCountLabelCell.setCellStyle(boldStyle);

        Cell tasksCountValueCell = tasksCountRow.createCell(1);
        tasksCountValueCell.setCellValue(String.format("%d/%d công việc hoàn thành (%.1f%%)",
                completedTasks, totalTasks, progress));
        tasksCountValueCell.setCellStyle(normalStyle);

        // Export date
        Row exportRow = sheet.createRow(12);
        Cell exportLabelCell = exportRow.createCell(0);
        exportLabelCell.setCellValue("Ngày xuất báo cáo:");
        exportLabelCell.setCellStyle(boldStyle);

        Cell exportValueCell = exportRow.createCell(1);
        exportValueCell.setCellValue(new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(new Date()));
        exportValueCell.setCellStyle(normalStyle);

        return sheet;
    }

    private Sheet createTasksSheet(Workbook workbook, List<Task> tasks, CellStyle headerStyle,
                                   CellStyle subHeaderStyle, CellStyle normalStyle,
                                   CellStyle boldStyle, CellStyle dateStyle,
                                   CellStyle centeredStyle, CellStyle completedStyle,
                                   CellStyle pendingStyle, CellStyle overdueStyle) {
        Sheet sheet = workbook.createSheet("Danh sách công việc");

        // Set column widths
        sheet.setColumnWidth(0, 3000);  // STT
        sheet.setColumnWidth(1, 7000);  // Tên công việc
        sheet.setColumnWidth(2, 5000);  // Ngày bắt đầu
        sheet.setColumnWidth(3, 5000);  // Ngày kết thúc
        sheet.setColumnWidth(4, 3500);  // Trạng thái
        sheet.setColumnWidth(5, 5000);  // Người tạo
        sheet.setColumnWidth(6, 3500);  // Độ ưu tiên
        sheet.setColumnWidth(7, 4000);  // Subtasks

        // Header
        Row headerRow = sheet.createRow(0);
        Cell headerCell = headerRow.createCell(0);
        headerCell.setCellValue("DANH SÁCH CÔNG VIỆC");
        headerCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));

        // Subheader
        Row subheaderRow = sheet.createRow(1);
        String[] headers = {"STT", "Tên công việc", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái", "Người tạo", "Độ ưu tiên", "Subtasks"};

        for (int i = 0; i < headers.length; i++) {
            Cell cell = subheaderRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(subHeaderStyle);
        }

        // Tasks data
        int rowNum = 2;
        int taskIndex = 1;

        for (Task task : tasks) {
            Row row = sheet.createRow(rowNum++);

            // STT
            Cell cell0 = row.createCell(0);
            cell0.setCellValue(taskIndex++);
            cell0.setCellStyle(centeredStyle);

            // Tên công việc
            Cell cell1 = row.createCell(1);
            cell1.setCellValue(task.getName());
            cell1.setCellStyle(normalStyle);

            // Ngày bắt đầu
            Cell cell2 = row.createCell(2);
            if (task.getStartDate() != null) {
                cell2.setCellValue(task.getStartDate());
                cell2.setCellStyle(dateStyle);
            } else {
                cell2.setCellValue("Chưa xác định");
                cell2.setCellStyle(centeredStyle);
            }

            // Ngày kết thúc
            Cell cell3 = row.createCell(3);
            if (task.getDueDate() != null) {
                cell3.setCellValue(task.getDueDate());
                cell3.setCellStyle(dateStyle);
            } else {
                cell3.setCellValue("Chưa xác định");
                cell3.setCellStyle(centeredStyle);
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

            // Người tạo
            Cell cell5 = row.createCell(5);
            if (task.getCreatedBy() != null) {
                cell5.setCellValue(task.getCreatedBy().getFullName());
            } else {
                cell5.setCellValue("N/A");
            }
            cell5.setCellStyle(normalStyle);

            // Độ ưu tiên
            Cell cell6 = row.createCell(6);
            if (task.getPriority() != null) {
                cell6.setCellValue(getPriorityText(task.getPriority().name()));
            } else {
                cell6.setCellValue("Trung bình");
            }
            cell6.setCellStyle(centeredStyle);

            // Subtasks
            Cell cell7 = row.createCell(7);
            Set<Subtask> subtasks = task.getSubtasks();
            if (subtasks != null && !subtasks.isEmpty()) {
                int completed = (int) subtasks.stream().filter(Subtask::getCompleted).count();
                cell7.setCellValue(String.format("%d/%d hoàn thành", completed, subtasks.size()));
            } else {
                cell7.setCellValue("0/0 hoàn thành");
            }
            cell7.setCellStyle(centeredStyle);

            // If task has subtasks, create rows for them
            if (subtasks != null && !subtasks.isEmpty()) {
                for (Subtask subtask : subtasks) {
                    Row subtaskRow = sheet.createRow(rowNum++);

                    // Empty cell for STT
                    subtaskRow.createCell(0).setCellStyle(normalStyle);

                    // Subtask name with indent
                    Cell subtaskNameCell = subtaskRow.createCell(1);
                    subtaskNameCell.setCellValue("    - " + subtask.getName());
                    subtaskNameCell.setCellStyle(normalStyle);

                    // Start date
                    Cell subtaskStartCell = subtaskRow.createCell(2);
                    if (subtask.getStartDate() != null) {
                        subtaskStartCell.setCellValue(subtask.getStartDate());
                        subtaskStartCell.setCellStyle(dateStyle);
                    } else {
                        subtaskStartCell.setCellValue("");
                        subtaskStartCell.setCellStyle(normalStyle);
                    }

                    // Due date
                    Cell subtaskDueCell = subtaskRow.createCell(3);
                    if (subtask.getDueDate() != null) {
                        subtaskDueCell.setCellValue(subtask.getDueDate());
                        subtaskDueCell.setCellStyle(dateStyle);
                    } else {
                        subtaskDueCell.setCellValue("");
                        subtaskDueCell.setCellStyle(normalStyle);
                    }

                    // Status
                    Cell subtaskStatusCell = subtaskRow.createCell(4);
                    boolean isCompleted = subtask.getCompleted() != null ? subtask.getCompleted() : false;
                    subtaskStatusCell.setCellValue(isCompleted ? "Hoàn thành" : "Chưa hoàn thành");
                    subtaskStatusCell.setCellStyle(isCompleted ? completedStyle : pendingStyle);

                    // Assignee
                    Cell subtaskAssigneeCell = subtaskRow.createCell(5);
                    if (subtask.getAssignee() != null) {
                        subtaskAssigneeCell.setCellValue(subtask.getAssignee().getFullName());
                    } else {
                        subtaskAssigneeCell.setCellValue("Chưa phân công");
                    }
                    subtaskAssigneeCell.setCellStyle(normalStyle);

                    // Empty cells for remaining columns
                    for (int i = 6; i <= 7; i++) {
                        subtaskRow.createCell(i).setCellStyle(normalStyle);
                    }
                }
            }
        }

        return sheet;
    }

    private Sheet createMembersSheet(Workbook workbook, Project project, CellStyle headerStyle,
                                     CellStyle subHeaderStyle, CellStyle normalStyle,
                                     CellStyle centeredStyle) {
        Sheet sheet = workbook.createSheet("Thành viên dự án");

        // Set column widths
        sheet.setColumnWidth(0, 3000);  // STT
        sheet.setColumnWidth(1, 6000);  // Họ và tên
        sheet.setColumnWidth(2, 6000);  // Email
        sheet.setColumnWidth(3, 4000);  // Số điện thoại
        sheet.setColumnWidth(4, 5000);  // Phòng ban
        sheet.setColumnWidth(5, 5000);  // Vị trí

        // Header
        Row headerRow = sheet.createRow(0);
        Cell headerCell = headerRow.createCell(0);
        headerCell.setCellValue("DANH SÁCH THÀNH VIÊN DỰ ÁN");
        headerCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

        // Subheader
        Row subheaderRow = sheet.createRow(1);
        String[] headers = {"STT", "Họ và tên", "Email", "Số điện thoại", "Phòng ban", "Vị trí"};

        for (int i = 0; i < headers.length; i++) {
            Cell cell = subheaderRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(subHeaderStyle);
        }

        // Add project manager first
        int rowNum = 2;
        int memberIndex = 1;

        if (project.getManager() != null) {
            User manager = project.getManager();
            Row managerRow = sheet.createRow(rowNum++);

            // STT
            Cell cell0 = managerRow.createCell(0);
            cell0.setCellValue(memberIndex++);
            cell0.setCellStyle(centeredStyle);

            // Họ và tên
            Cell cell1 = managerRow.createCell(1);
            cell1.setCellValue(manager.getFullName() + " (Quản lý)");
            cell1.setCellStyle(normalStyle);

            // Email
            Cell cell2 = managerRow.createCell(2);
            cell2.setCellValue(manager.getEmail());
            cell2.setCellStyle(normalStyle);

            // Số điện thoại
            Cell cell3 = managerRow.createCell(3);
            cell3.setCellValue(manager.getPhoneNumber() != null ? manager.getPhoneNumber() : "");
            cell3.setCellStyle(normalStyle);

            // Phòng ban
            Cell cell4 = managerRow.createCell(4);
            cell4.setCellValue(manager.getDepartment() != null ? manager.getDepartment() : "");
            cell4.setCellStyle(normalStyle);

            // Vị trí
            Cell cell5 = managerRow.createCell(5);
            cell5.setCellValue(manager.getPosition() != null ? manager.getPosition() : "");
            cell5.setCellStyle(normalStyle);
        }

        // Team members
        if (project.getUsers() != null && !project.getUsers().isEmpty()) {
            for (User user : project.getUsers()) {
                // Skip if user is the manager
                if (project.getManager() != null && user.getId().equals(project.getManager().getId())) {
                    continue;
                }

                Row row = sheet.createRow(rowNum++);

                // STT
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(memberIndex++);
                cell0.setCellStyle(centeredStyle);

                // Họ và tên
                Cell cell1 = row.createCell(1);
                cell1.setCellValue(user.getFullName());
                cell1.setCellStyle(normalStyle);

                // Email
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(user.getEmail());
                cell2.setCellStyle(normalStyle);

                // Số điện thoại
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
                cell3.setCellStyle(normalStyle);

                // Phòng ban
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(user.getDepartment() != null ? user.getDepartment() : "");
                cell4.setCellStyle(normalStyle);

                // Vị trí
                Cell cell5 = row.createCell(5);
                cell5.setCellValue(user.getPosition() != null ? user.getPosition() : "");
                cell5.setCellStyle(normalStyle);
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
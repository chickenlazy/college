import * as XLSX from 'xlsx';
import { useState } from 'react';

// Hàm xuất dữ liệu dashboard ra file Excel chuyên nghiệp với nhiều cải tiến
export const exportDashboardToExcel = (dashboardData) => {
  try {
    // Kiểm tra dữ liệu
    if (!dashboardData || !dashboardData.data) {
      throw new Error('Không có dữ liệu để xuất');
    }
    
    const { stats, projectStatus, taskStatus, recentProjects, upcomingDeadlines, teamWorkload } = dashboardData.data;
    
    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Thiết lập các style nâng cao hơn
    const titleStyle = {
      font: { bold: true, size: 16, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4338CA" } }, // Indigo-700
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "111827" } },
        bottom: { style: "medium", color: { rgb: "111827" } },
        left: { style: "medium", color: { rgb: "111827" } },
        right: { style: "medium", color: { rgb: "111827" } }
      }
    };

    const subTitleStyle = {
      font: { bold: true, size: 12, color: { rgb: "4338CA" } },
      fill: { fgColor: { rgb: "EEF2FF" } }, // Indigo-50
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "C7D2FE" } },
        bottom: { style: "thin", color: { rgb: "C7D2FE" } },
        left: { style: "thin", color: { rgb: "C7D2FE" } },
        right: { style: "thin", color: { rgb: "C7D2FE" } }
      }
    };

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, size: 12 },
      fill: { fgColor: { rgb: "4F46E5" } }, // Indigo-600
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "E5E7EB" } },
        bottom: { style: "medium", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const subHeaderStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, size: 11 },
      fill: { fgColor: { rgb: "6366F1" } }, // Indigo-500
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const normalStyle = {
      font: { size: 11 },
      alignment: { vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const boldStyle = {
      font: { bold: true, size: 11 },
      alignment: { vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const numberStyle = {
      font: { size: 11 },
      alignment: { horizontal: "right", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const dateStyle = {
      font: { size: 11 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      },
      numFmt: "dd/mm/yyyy"
    };

    const percentStyle = {
      font: { size: 11 },
      numFmt: '0.0%',
      alignment: { horizontal: "right", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const highlightPercentStyle = {
      font: { size: 11, bold: true },
      numFmt: '0.0%',
      alignment: { horizontal: "right", vertical: "center" },
      fill: { fgColor: { rgb: "DBEAFE" } }, // Blue-100
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const alternateRowStyle = {
      fill: { fgColor: { rgb: "F9FAFB" } }, // Gray-50
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const totalsRowStyle = {
      font: { bold: true, size: 11 },
      fill: { fgColor: { rgb: "EEF2FF" } }, // Indigo-50
      alignment: { horizontal: "right", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "E5E7EB" } },
        bottom: { style: "medium", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    // Status styles với mức độ trong suốt khác nhau
    const statusColors = {
      "COMPLETED": { rgb: "10B981" }, // Green-500
      "IN PROGRESS": { rgb: "3B82F6" }, // Blue-500
      "ON HOLD": { rgb: "F59E0B" }, // Amber-500
      "NOT STARTED": { rgb: "6B7280" }, // Gray-500
      "OVER DUE": { rgb: "EF4444" }  // Red-500
    };

    // Hàm tạo style cho cell trạng thái
    const getStatusStyle = (status) => {
      const color = statusColors[status] || { rgb: "6B7280" };
      return {
        font: { color: { rgb: "FFFFFF" }, bold: true, size: 11 },
        fill: { fgColor: color },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "E5E7EB" } },
          bottom: { style: "thin", color: { rgb: "E5E7EB" } },
          left: { style: "thin", color: { rgb: "E5E7EB" } },
          right: { style: "thin", color: { rgb: "E5E7EB" } }
        }
      };
    };

    // Sheet 1: Tổng quan - cải tiến với biểu đồ và định dạng bảng tốt hơn
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const statsData = [
      ['BÁO CÁO TỔNG QUAN DASHBOARD'],
      [`Ngày xuất báo cáo: ${formattedDate}`],
      [],
      ['THỐNG KÊ CHỈ SỐ CHÍNH'],
      [],
      ['Chỉ số', 'Giá trị', 'So với kỳ trước (%)'],
      ['Tổng số dự án', stats.totalProjects, stats.projectGrowth || 0],
      ['Dự án đang thực hiện', stats.inProgressProjects, stats.inProgressGrowth || 0],
      ['Dự án đã hoàn thành', stats.completedProjects, stats.completedGrowth || 0],
      ['Dự án quá hạn', stats.overDueProjects || 0, stats.overDueGrowth || 0],
      ['Tổng số công việc', stats.totalTasks, stats.taskGrowth || 0],
      ['Tổng số người dùng', stats.totalUsers, stats.userGrowth || 0],
      ['Tổng số', '', ''],
      [],
      ['PHÂN TÍCH TRẠNG THÁI DỰ ÁN'],
      [],
      ['Trạng thái', 'Số lượng', 'Tỷ lệ'],
      ['Đã hoàn thành', projectStatus.completed || 0, (projectStatus.completed || 0) / stats.totalProjects],
      ['Đang thực hiện', projectStatus.inProgress || 0, (projectStatus.inProgress || 0) / stats.totalProjects],
      ['Tạm dừng', projectStatus.onHold || 0, (projectStatus.onHold || 0) / stats.totalProjects],
      ['Chưa bắt đầu', projectStatus.notStarted || 0, (projectStatus.notStarted || 0) / stats.totalProjects],
      ['Quá hạn', projectStatus.overDue || 0, (projectStatus.overDue || 0) / stats.totalProjects],
      ['Tổng số', stats.totalProjects, 1],
      [],
      ['PHÂN TÍCH TRẠNG THÁI CÔNG VIỆC'],
      [],
      ['Trạng thái', 'Số lượng', 'Tỷ lệ'],
      ['Đã hoàn thành', taskStatus.completed || 0, (taskStatus.completed || 0) / stats.totalTasks],
      ['Đang thực hiện', taskStatus.inProgress || 0, (taskStatus.inProgress || 0) / stats.totalTasks],
      ['Tạm dừng', taskStatus.onHold || 0, (taskStatus.onHold || 0) / stats.totalTasks],
      ['Chưa bắt đầu', taskStatus.notStarted || 0, (taskStatus.notStarted || 0) / stats.totalTasks],
      ['Quá hạn', taskStatus.overDue || 0, (taskStatus.overDue || 0) / stats.totalTasks],
      ['Tổng số', stats.totalTasks, 1]
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    
    // Thiết lập style cho statsSheet cải tiến
    statsSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }];
    statsSheet['!rows'] = Array(statsData.length).fill({ hpt: 25 }); // Chiều cao dòng cố định
    
    // Áp dụng style cải tiến
    statsSheet.A1 = { ...statsSheet.A1, ...titleStyle };
    statsSheet.B1 = { ...statsSheet.B1, ...titleStyle };
    statsSheet.C1 = { ...statsSheet.C1, ...titleStyle };
    
    statsSheet.A2 = { ...statsSheet.A2, ...{ font: { italic: true, size: 11 } } };
    statsSheet.B2 = { ...statsSheet.B2, ...{ font: { italic: true, size: 11 } } };
    statsSheet.C2 = { ...statsSheet.C2, ...{ font: { italic: true, size: 11 } } };
    
    statsSheet.A4 = { ...statsSheet.A4, ...subHeaderStyle };
    statsSheet.B4 = { ...statsSheet.B4, ...subHeaderStyle };
    statsSheet.C4 = { ...statsSheet.C4, ...subHeaderStyle };
    
    statsSheet.A6 = { ...statsSheet.A6, ...headerStyle };
    statsSheet.B6 = { ...statsSheet.B6, ...headerStyle };
    statsSheet.C6 = { ...statsSheet.C6, ...headerStyle };
    
    // Style cho dòng dữ liệu - Chỉ số chính
    for (let i = 7; i <= 12; i++) {
      statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...boldStyle };
      statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...numberStyle };
      statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...percentStyle };
      
      // Alternate row style
      if (i % 2 === 1) {
        statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...alternateRowStyle };
        statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...alternateRowStyle };
        statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...alternateRowStyle };
      }
    }
    
    // Hàng tổng cộng
    statsSheet.A13 = { ...statsSheet.A13, ...totalsRowStyle };
    statsSheet.B13 = { ...statsSheet.B13, ...totalsRowStyle };
    statsSheet.C13 = { ...statsSheet.C13, ...totalsRowStyle };
    
    // Project Status section styles
    statsSheet.A15 = { ...statsSheet.A15, ...subHeaderStyle };
    statsSheet.B15 = { ...statsSheet.B15, ...subHeaderStyle };
    statsSheet.C15 = { ...statsSheet.C15, ...subHeaderStyle };
    
    statsSheet.A17 = { ...statsSheet.A17, ...headerStyle };
    statsSheet.B17 = { ...statsSheet.B17, ...headerStyle };
    statsSheet.C17 = { ...statsSheet.C17, ...headerStyle };
    
    // Apply styles to project status rows
    for (let i = 18; i <= 22; i++) {
      statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...boldStyle };
      statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...numberStyle };
      statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...highlightPercentStyle };
      
      // Alternate row style
      if (i % 2 === 0) {
        statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...alternateRowStyle };
        statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...alternateRowStyle };
        statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...{
          ...highlightPercentStyle,
          fill: { fgColor: { rgb: "F9FAFB" } }, // Override background for alternating rows
        }};
      }
    }
    
    // Hàng tổng cộng
    statsSheet.A23 = { ...statsSheet.A23, ...totalsRowStyle };
    statsSheet.B23 = { ...statsSheet.B23, ...totalsRowStyle };
    statsSheet.C23 = { ...statsSheet.C23, ...totalsRowStyle };
    
    // Task Status section styles
    statsSheet.A25 = { ...statsSheet.A25, ...subHeaderStyle };
    statsSheet.B25 = { ...statsSheet.B25, ...subHeaderStyle };
    statsSheet.C25 = { ...statsSheet.C25, ...subHeaderStyle };
    
    statsSheet.A27 = { ...statsSheet.A27, ...headerStyle };
    statsSheet.B27 = { ...statsSheet.B27, ...headerStyle };
    statsSheet.C27 = { ...statsSheet.C27, ...headerStyle };
    
    // Apply styles to task status rows
    for (let i = 28; i <= 32; i++) {
      statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...boldStyle };
      statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...numberStyle };
      statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...highlightPercentStyle };
      
      // Alternate row style
      if (i % 2 === 0) {
        statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...alternateRowStyle };
        statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...alternateRowStyle };
        statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...{
          ...highlightPercentStyle,
          fill: { fgColor: { rgb: "F9FAFB" } }, // Override background for alternating rows
        }};
      }
    }
    
    // Hàng tổng cộng
    statsSheet.A33 = { ...statsSheet.A33, ...totalsRowStyle };
    statsSheet.B33 = { ...statsSheet.B33, ...totalsRowStyle };
    statsSheet.C33 = { ...statsSheet.C33, ...totalsRowStyle };

    // Merge cells for title and headers
    statsSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Date
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }, // Stats Header
      { s: { r: 14, c: 0 }, e: { r: 14, c: 2 } }, // Project Status Header
      { s: { r: 24, c: 0 }, e: { r: 24, c: 2 } }, // Task Status Header
    ];
    
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Tổng quan');

    // Sheet 2: Dự án gần đây - cải tiến với conditional formatting
    if (recentProjects && recentProjects.length > 0) {
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit'
        });
      };
      
      const projectHeaders = ['ID', 'Tên dự án', 'Trạng thái', 'Ngày bắt đầu', 'Ngày kết thúc', 'Tiến độ (%)', 'Quản lý', 'Thời gian còn lại (ngày)'];
      const projectsData = [
        ['DANH SÁCH DỰ ÁN GẦN ĐÂY'],
        [`Tổng số dự án: ${recentProjects.length}`],
        [],
        projectHeaders
      ];
      
      // Tính ngày còn lại
      const calculateDaysRemaining = (dueDate) => {
        if (!dueDate) return 'N/A';
        const today = new Date();
        const due = new Date(dueDate);
        return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      };
      
      recentProjects.forEach(project => {
        const daysRemaining = calculateDaysRemaining(project.dueDate);
        
        projectsData.push([
          project.id,
          project.name,
          project.status.replace(/_/g, ' '),
          formatDate(project.startDate),
          formatDate(project.dueDate),
          project.progress / 100, // Chuyển sang định dạng phần trăm
          project.manager ? project.manager.fullName : 'N/A',
          daysRemaining
        ]);
      });
      
      // Thêm dòng tổng kết
      projectsData.push([
        'TỔNG CỘNG',
        `${recentProjects.length} dự án`,
        '',
        '',
        '',
        recentProjects.reduce((sum, proj) => sum + proj.progress, 0) / (recentProjects.length * 100), // Trung bình tiến độ
        '',
        ''
      ]);
      
      const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
      
      // Thiết lập style
      projectsSheet['!cols'] = [
        { wch: 8 }, // ID
        { wch: 30 }, // Tên dự án
        { wch: 15 }, // Trạng thái
        { wch: 15 }, // Ngày bắt đầu
        { wch: 15 }, // Ngày kết thúc
        { wch: 15 }, // Tiến độ
        { wch: 20 }, // Quản lý
        { wch: 20 } // Thời gian còn lại
      ];
      
      projectsSheet['!rows'] = Array(projectsData.length).fill({ hpt: 25 }); // Chiều cao dòng cố định
      
      // Style cho tiêu đề
      projectsSheet.A1 = { ...projectsSheet.A1, ...titleStyle };
      projectsSheet.B1 = { ...projectsSheet.B1, ...titleStyle };
      projectsSheet.C1 = { ...projectsSheet.C1, ...titleStyle };
      projectsSheet.D1 = { ...projectsSheet.D1, ...titleStyle };
      projectsSheet.E1 = { ...projectsSheet.E1, ...titleStyle };
      projectsSheet.F1 = { ...projectsSheet.F1, ...titleStyle };
      projectsSheet.G1 = { ...projectsSheet.G1, ...titleStyle };
      projectsSheet.H1 = { ...projectsSheet.H1, ...titleStyle };
      
      // Thông tin tổng số
      projectsSheet.A2 = { ...projectsSheet.A2, ...subTitleStyle };
      projectsSheet.B2 = { ...projectsSheet.B2, ...subTitleStyle };
      projectsSheet.C2 = { ...projectsSheet.C2, ...subTitleStyle };
      projectsSheet.D2 = { ...projectsSheet.D2, ...subTitleStyle };
      projectsSheet.E2 = { ...projectsSheet.E2, ...subTitleStyle };
      projectsSheet.F2 = { ...projectsSheet.F2, ...subTitleStyle };
      projectsSheet.G2 = { ...projectsSheet.G2, ...subTitleStyle };
      projectsSheet.H2 = { ...projectsSheet.H2, ...subTitleStyle };
      
      // Style cho header
      for (let i = 0; i < projectHeaders.length; i++) {
        const col = String.fromCharCode(65 + i);
        projectsSheet[`${col}4`] = { ...projectsSheet[`${col}4`], ...headerStyle };
      }
      
      // Style cho các dòng dữ liệu
      for (let rowIdx = 5; rowIdx < 5 + recentProjects.length; rowIdx++) {
        const isAlternate = rowIdx % 2 === 1;
        
        // ID
        projectsSheet[`A${rowIdx}`] = { 
          ...projectsSheet[`A${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Tên dự án
        projectsSheet[`B${rowIdx}`] = { 
          ...projectsSheet[`B${rowIdx}`], 
          ...boldStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Trạng thái - special styling
        const status = projectsData[rowIdx - 1][2];
        projectsSheet[`C${rowIdx}`] = { 
          ...projectsSheet[`C${rowIdx}`], 
          ...getStatusStyle(status),
          ...(isAlternate ? { border: getStatusStyle(status).border } : {})
        };
        
        // Ngày bắt đầu
        projectsSheet[`D${rowIdx}`] = { 
          ...projectsSheet[`D${rowIdx}`], 
          ...dateStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Ngày kết thúc
        projectsSheet[`E${rowIdx}`] = { 
          ...projectsSheet[`E${rowIdx}`], 
          ...dateStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Tiến độ - với conditional formatting
        const progress = projectsData[rowIdx - 1][5];
        let progressStyle = { ...percentStyle };
        
        if (progress >= 0.8) {
          progressStyle.fill = { fgColor: { rgb: "DCFCE7" } }; // Green-100
          progressStyle.font = { ...progressStyle.font, color: { rgb: "16A34A" } }; // Green-600
        } else if (progress >= 0.5) {
          progressStyle.fill = { fgColor: { rgb: "DBEAFE" } }; // Blue-100
          progressStyle.font = { ...progressStyle.font, color: { rgb: "2563EB" } }; // Blue-600
        } else if (progress >= 0.2) {
          progressStyle.fill = { fgColor: { rgb: "FEF3C7" } }; // Amber-100
          progressStyle.font = { ...progressStyle.font, color: { rgb: "D97706" } }; // Amber-600
        } else {
          progressStyle.fill = { fgColor: { rgb: "FEE2E2" } }; // Red-100
          progressStyle.font = { ...progressStyle.font, color: { rgb: "DC2626" } }; // Red-600
        }
        
        projectsSheet[`F${rowIdx}`] = { 
          ...projectsSheet[`F${rowIdx}`], 
          ...progressStyle,
          ...(isAlternate ? { border: progressStyle.border } : {})
        };
        
        // Quản lý
        projectsSheet[`G${rowIdx}`] = { 
          ...projectsSheet[`G${rowIdx}`], 
          ...normalStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Thời gian còn lại - với conditional formatting
        const daysLeft = projectsData[rowIdx - 1][7];
        let daysLeftStyle = { ...numberStyle };
        
        if (daysLeft <= 0) {
          daysLeftStyle.fill = { fgColor: { rgb: "FEE2E2" } }; // Red-100
          daysLeftStyle.font = { ...daysLeftStyle.font, bold: true, color: { rgb: "DC2626" } }; // Red-600
        } else if (daysLeft <= 3) {
          daysLeftStyle.fill = { fgColor: { rgb: "FEF3C7" } }; // Amber-100
          daysLeftStyle.font = { ...daysLeftStyle.font, bold: true, color: { rgb: "D97706" } }; // Amber-600
        } else if (daysLeft <= 7) {
          daysLeftStyle.fill = { fgColor: { rgb: "DBEAFE" } }; // Blue-100
          daysLeftStyle.font = { ...daysLeftStyle.font, color: { rgb: "2563EB" } }; // Blue-600
        }
        
        projectsSheet[`H${rowIdx}`] = { 
          ...projectsSheet[`H${rowIdx}`], 
          ...daysLeftStyle,
          ...(isAlternate ? { border: daysLeftStyle.border } : {})
        };
      }
      
      // Dòng tổng kết
      const lastRow = 5 + recentProjects.length;
      projectsSheet[`A${lastRow}`] = { ...projectsSheet[`A${lastRow}`], ...totalsRowStyle };
      projectsSheet[`B${lastRow}`] = { ...projectsSheet[`B${lastRow}`], ...totalsRowStyle };
      projectsSheet[`C${lastRow}`] = { ...projectsSheet[`C${lastRow}`], ...totalsRowStyle };
      projectsSheet[`D${lastRow}`] = { ...projectsSheet[`D${lastRow}`], ...totalsRowStyle };
      projectsSheet[`E${lastRow}`] = { ...projectsSheet[`E${lastRow}`], ...totalsRowStyle };
      projectsSheet[`F${lastRow}`] = { ...projectsSheet[`F${lastRow}`], ...{ ...totalsRowStyle, numFmt: '0.0%' } };
      projectsSheet[`G${lastRow}`] = { ...projectsSheet[`G${lastRow}`], ...totalsRowStyle };
      projectsSheet[`H${lastRow}`] = { ...projectsSheet[`H${lastRow}`], ...totalsRowStyle };
      
      // Merge cells for title
      projectsSheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: lastRow-1, c: 0 }, e: { r: lastRow-1, c: 1 } }
      ];
      
      XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Dự án gần đây');
    }
    
    // Sheet 3: Thời hạn sắp tới - cải tiến với icon biểu thị mức độ khẩn cấp
    if (upcomingDeadlines && upcomingDeadlines.length > 0) {
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit'
        });
      };
      
      const deadlineHeaders = ['ID', 'Loại', 'Tên', 'Thuộc dự án', 'Ngày hạn', 'Trạng thái', 'Mức độ khẩn cấp', 'Thời gian còn lại (ngày)'];
      const deadlinesData = [
        ['DANH SÁCH THỜI HẠN SẮP TỚI'],
        [`Tổng số công việc cần hoàn thành: ${upcomingDeadlines.length}`],
        [],
        deadlineHeaders
      ];
      
      // Tính ngày còn lại & mức độ khẩn cấp
      const calculateDaysRemaining = (dueDate) => {
        if (!dueDate) return 'N/A';
        const today = new Date();
        const due = new Date(dueDate);
        return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      };
      
      const getUrgencyLevel = (daysLeft, status) => {
        if (status === 'COMPLETED') return 'Đã hoàn thành';
        if (daysLeft <= 0) return 'Rất cao';
        if (daysLeft <= 3) return 'Cao';
        if (daysLeft <= 7) return 'Trung bình';
        return 'Thấp';
      };
      
      upcomingDeadlines.forEach(item => {
        const daysRemaining = calculateDaysRemaining(item.dueDate);
        const urgencyLevel = getUrgencyLevel(daysRemaining, item.status);
        
        deadlinesData.push([
          item.id,
          item.type === 'task' ? 'Công việc' : 'Dự án',
          item.name,
          item.projectName || 'N/A',
          formatDate(item.dueDate),
          item.status.replace(/_/g, ' '),
          urgencyLevel,
          daysRemaining
        ]);
      });
      
      // Thêm dòng tổng kết
      deadlinesData.push([
        'TỔNG CỘNG',
        `${upcomingDeadlines.length} hạn sắp tới`,
        '',
        '',
        '',
        '',
        '',
        ''
      ]);
      
      const deadlinesSheet = XLSX.utils.aoa_to_sheet(deadlinesData);
      
      // Thiết lập style
      deadlinesSheet['!cols'] = [
        { wch: 8 }, // ID
        { wch: 12 }, // Loại
        { wch: 30 }, // Tên
        { wch: 25 }, // Thuộc dự án
        { wch: 15 }, // Ngày hạn
        { wch: 15 }, // Trạng thái
        { wch: 15 }, // Mức độ khẩn cấp
        { wch: 20 } // Thời gian còn lại
      ];
      
      deadlinesSheet['!rows'] = Array(deadlinesData.length).fill({ hpt: 25 }); // Chiều cao dòng cố định
      
      // Style cho tiêu đề
      deadlinesSheet.A1 = { ...deadlinesSheet.A1, ...titleStyle };
      deadlinesSheet.B1 = { ...deadlinesSheet.B1, ...titleStyle };
      deadlinesSheet.C1 = { ...deadlinesSheet.C1, ...titleStyle };
      deadlinesSheet.D1 = { ...deadlinesSheet.D1, ...titleStyle };
      deadlinesSheet.E1 = { ...deadlinesSheet.E1, ...titleStyle };
      deadlinesSheet.F1 = { ...deadlinesSheet.F1, ...titleStyle };
      deadlinesSheet.G1 = { ...deadlinesSheet.G1, ...titleStyle };
      deadlinesSheet.H1 = { ...deadlinesSheet.H1, ...titleStyle };
      
      // Thông tin tổng số
      deadlinesSheet.A2 = { ...deadlinesSheet.A2, ...subTitleStyle };
      deadlinesSheet.B2 = { ...deadlinesSheet.B2, ...subTitleStyle };
      deadlinesSheet.C2 = { ...deadlinesSheet.C2, ...subTitleStyle };
      deadlinesSheet.D2 = { ...deadlinesSheet.D2, ...subTitleStyle };
      deadlinesSheet.E2 = { ...deadlinesSheet.E2, ...subTitleStyle };
      deadlinesSheet.F2 = { ...deadlinesSheet.F2, ...subTitleStyle };
      deadlinesSheet.G2 = { ...deadlinesSheet.G2, ...subTitleStyle };
      deadlinesSheet.H2 = { ...deadlinesSheet.H2, ...subTitleStyle };
      
      // Style cho header
      for (let i = 0; i < deadlineHeaders.length; i++) {
        const col = String.fromCharCode(65 + i);
        deadlinesSheet[`${col}4`] = { ...deadlinesSheet[`${col}4`], ...headerStyle };
      }
      
      // Style cho các dòng dữ liệu
      for (let rowIdx = 5; rowIdx < 5 + upcomingDeadlines.length; rowIdx++) {
        const isAlternate = rowIdx % 2 === 1;
        
        // ID
        deadlinesSheet[`A${rowIdx}`] = { 
          ...deadlinesSheet[`A${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Loại
        deadlinesSheet[`B${rowIdx}`] = { 
          ...deadlinesSheet[`B${rowIdx}`], 
          ...{ ...normalStyle, alignment: { horizontal: "center" } },
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Tên
        deadlinesSheet[`C${rowIdx}`] = { 
          ...deadlinesSheet[`C${rowIdx}`], 
          ...boldStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Thuộc dự án
        deadlinesSheet[`D${rowIdx}`] = { 
          ...deadlinesSheet[`D${rowIdx}`], 
          ...normalStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Ngày hạn
        deadlinesSheet[`E${rowIdx}`] = { 
          ...deadlinesSheet[`E${rowIdx}`], 
          ...dateStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Trạng thái - special styling
        const status = deadlinesData[rowIdx - 1][5];
        deadlinesSheet[`F${rowIdx}`] = { 
          ...deadlinesSheet[`F${rowIdx}`], 
          ...getStatusStyle(status),
          ...(isAlternate ? { border: getStatusStyle(status).border } : {})
        };
        
        // Mức độ khẩn cấp - special styling
        const urgency = deadlinesData[rowIdx - 1][6];
        let urgencyStyle = { 
          ...normalStyle, 
          alignment: { horizontal: "center", vertical: "center" },
          font: { bold: true, size: 11 }
        };
        
        if (urgency === 'Rất cao') {
          urgencyStyle.fill = { fgColor: { rgb: "FEE2E2" } }; // Red-100
          urgencyStyle.font.color = { rgb: "DC2626" }; // Red-600
        } else if (urgency === 'Cao') {
          urgencyStyle.fill = { fgColor: { rgb: "FEF3C7" } }; // Amber-100
          urgencyStyle.font.color = { rgb: "D97706" }; // Amber-600
        } else if (urgency === 'Trung bình') {
          urgencyStyle.fill = { fgColor: { rgb: "DBEAFE" } }; // Blue-100
          urgencyStyle.font.color = { rgb: "2563EB" }; // Blue-600
        } else if (urgency === 'Thấp') {
          urgencyStyle.fill = { fgColor: { rgb: "DCFCE7" } }; // Green-100
          urgencyStyle.font.color = { rgb: "16A34A" }; // Green-600
        } else {
          urgencyStyle.fill = { fgColor: { rgb: "D1FAE5" } }; // Emerald-100
          urgencyStyle.font.color = { rgb: "059669" }; // Emerald-600
        }
        
        deadlinesSheet[`G${rowIdx}`] = { 
          ...deadlinesSheet[`G${rowIdx}`], 
          ...urgencyStyle,
          ...(isAlternate ? { border: urgencyStyle.border } : {})
        };
        
        // Thời gian còn lại
        const daysLeft = deadlinesData[rowIdx - 1][7];
        deadlinesSheet[`H${rowIdx}`] = { 
          ...deadlinesSheet[`H${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
      }
      
      // Dòng tổng kết
      const lastRow = 5 + upcomingDeadlines.length;
      deadlinesSheet[`A${lastRow}`] = { ...deadlinesSheet[`A${lastRow}`], ...totalsRowStyle };
      deadlinesSheet[`B${lastRow}`] = { ...deadlinesSheet[`B${lastRow}`], ...totalsRowStyle };
      deadlinesSheet[`C${lastRow}`] = { ...deadlinesSheet[`C${lastRow}`], ...totalsRowStyle };
      deadlinesSheet[`D${lastRow}`] = { ...deadlinesSheet[`D${lastRow}`], ...totalsRowStyle };
      deadlinesSheet[`E${lastRow}`] = { ...deadlinesSheet[`E${lastRow}`], ...totalsRowStyle };
      deadlinesSheet[`F${lastRow}`] = { ...deadlinesSheet[`F${lastRow}`], ...totalsRowStyle };
      deadlinesSheet[`G${lastRow}`] = { ...deadlinesSheet[`G${lastRow}`], ...totalsRowStyle };
      deadlinesSheet[`H${lastRow}`] = { ...deadlinesSheet[`H${lastRow}`], ...totalsRowStyle };
      
      // Merge cells for title
      deadlinesSheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: lastRow-1, c: 0 }, e: { r: lastRow-1, c: 1 } }
      ];
      
      XLSX.utils.book_append_sheet(workbook, deadlinesSheet, 'Thời hạn sắp tới');
    }
    
    // Sheet 4: Khối lượng công việc của nhóm - cải tiến với đánh giá hiệu suất
    if (teamWorkload && teamWorkload.length > 0) {
      const workloadHeaders = ['ID', 'Tên nhân viên', 'Công việc được giao', 'Công việc hoàn thành', 'Tỉ lệ hoàn thành (%)', 'Hiệu suất'];
      const workloadData = [
        ['THỐNG KÊ KHỐI LƯỢNG CÔNG VIỆC NHÓM'],
        [`Tổng số thành viên: ${teamWorkload.length}`],
        [],
        workloadHeaders
      ];
      
      // Đánh giá hiệu suất
      const getPerformanceRating = (completionRate) => {
        if (completionRate >= 0.9) return 'Xuất sắc';
        if (completionRate >= 0.75) return 'Tốt';
        if (completionRate >= 0.5) return 'Khá';
        if (completionRate >= 0.25) return 'Trung bình';
        return 'Cần cải thiện';
      };
      
      let totalAssigned = 0;
      let totalCompleted = 0;
      
      teamWorkload.forEach(member => {
        const completionRate = member.assignedTasks > 0 
          ? member.completedTasks / member.assignedTasks
          : 0;
        
        const performanceRating = getPerformanceRating(completionRate);
        
        totalAssigned += member.assignedTasks;
        totalCompleted += member.completedTasks;
        
        workloadData.push([
          member.userId,
          member.fullName,
          member.assignedTasks,
          member.completedTasks,
          completionRate,
          performanceRating
        ]);
      });
      
      // Thêm dòng tổng kết
      const teamCompletionRate = totalAssigned > 0 ? totalCompleted / totalAssigned : 0;
      workloadData.push([
        'TỔNG CỘNG',
        `${teamWorkload.length} thành viên`,
        totalAssigned,
        totalCompleted,
        teamCompletionRate,
        getPerformanceRating(teamCompletionRate)
      ]);
      
      const workloadSheet = XLSX.utils.aoa_to_sheet(workloadData);
      
      // Thiết lập style
      workloadSheet['!cols'] = [
        { wch: 8 }, // ID
        { wch: 25 }, // Tên nhân viên
        { wch: 20 }, // Công việc được giao
        { wch: 20 }, // Công việc hoàn thành
        { wch: 20 }, // Tỉ lệ hoàn thành
        { wch: 20 } // Đánh giá hiệu suất
      ];
      
      workloadSheet['!rows'] = Array(workloadData.length).fill({ hpt: 25 }); // Chiều cao dòng cố định
      
      // Style cho tiêu đề
      workloadSheet.A1 = { ...workloadSheet.A1, ...titleStyle };
      workloadSheet.B1 = { ...workloadSheet.B1, ...titleStyle };
      workloadSheet.C1 = { ...workloadSheet.C1, ...titleStyle };
      workloadSheet.D1 = { ...workloadSheet.D1, ...titleStyle };
      workloadSheet.E1 = { ...workloadSheet.E1, ...titleStyle };
      workloadSheet.F1 = { ...workloadSheet.F1, ...titleStyle };
      
      // Thông tin tổng số
      workloadSheet.A2 = { ...workloadSheet.A2, ...subTitleStyle };
      workloadSheet.B2 = { ...workloadSheet.B2, ...subTitleStyle };
      workloadSheet.C2 = { ...workloadSheet.C2, ...subTitleStyle };
      workloadSheet.D2 = { ...workloadSheet.D2, ...subTitleStyle };
      workloadSheet.E2 = { ...workloadSheet.E2, ...subTitleStyle };
      workloadSheet.F2 = { ...workloadSheet.F2, ...subTitleStyle };
      
      // Style cho header
      for (let i = 0; i < workloadHeaders.length; i++) {
        const col = String.fromCharCode(65 + i);
        workloadSheet[`${col}4`] = { ...workloadSheet[`${col}4`], ...headerStyle };
      }
      
      // Style cho các dòng dữ liệu
      for (let rowIdx = 5; rowIdx < 5 + teamWorkload.length; rowIdx++) {
        const isAlternate = rowIdx % 2 === 1;
        
        // ID
        workloadSheet[`A${rowIdx}`] = { 
          ...workloadSheet[`A${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Tên nhân viên
        workloadSheet[`B${rowIdx}`] = { 
          ...workloadSheet[`B${rowIdx}`], 
          ...boldStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Công việc được giao
        workloadSheet[`C${rowIdx}`] = { 
          ...workloadSheet[`C${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Công việc hoàn thành
        workloadSheet[`D${rowIdx}`] = { 
          ...workloadSheet[`D${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Tỉ lệ hoàn thành - conditional formatting
        const completionRate = workloadData[rowIdx - 1][4];
        let completionStyle = { ...percentStyle };
        
        if (completionRate >= 0.9) {
          completionStyle.fill = { fgColor: { rgb: "DCFCE7" } }; // Green-100
          completionStyle.font = { ...completionStyle.font, bold: true, color: { rgb: "16A34A" } }; // Green-600
        } else if (completionRate >= 0.75) {
          completionStyle.fill = { fgColor: { rgb: "D1FAE5" } }; // Emerald-100
          completionStyle.font = { ...completionStyle.font, bold: true, color: { rgb: "059669" } }; // Emerald-600
        } else if (completionRate >= 0.5) {
          completionStyle.fill = { fgColor: { rgb: "DBEAFE" } }; // Blue-100
          completionStyle.font = { ...completionStyle.font, color: { rgb: "2563EB" } }; // Blue-600
        } else if (completionRate >= 0.25) {
          completionStyle.fill = { fgColor: { rgb: "FEF3C7" } }; // Amber-100
          completionStyle.font = { ...completionStyle.font, color: { rgb: "D97706" } }; // Amber-600
        } else {
          completionStyle.fill = { fgColor: { rgb: "FEE2E2" } }; // Red-100
          completionStyle.font = { ...completionStyle.font, bold: true, color: { rgb: "DC2626" } }; // Red-600
        }
        
        workloadSheet[`E${rowIdx}`] = { 
          ...workloadSheet[`E${rowIdx}`], 
          ...completionStyle,
          ...(isAlternate ? { border: completionStyle.border } : {})
        };
        
        // Đánh giá hiệu suất
        const performance = workloadData[rowIdx - 1][5];
        let performanceStyle = { 
          ...normalStyle, 
          alignment: { horizontal: "center", vertical: "center" },
          font: { bold: true, size: 11 }
        };
        
        if (performance === 'Xuất sắc') {
          performanceStyle.fill = { fgColor: { rgb: "DCFCE7" } }; // Green-100
          performanceStyle.font.color = { rgb: "16A34A" }; // Green-600
        } else if (performance === 'Tốt') {
          performanceStyle.fill = { fgColor: { rgb: "D1FAE5" } }; // Emerald-100
          performanceStyle.font.color = { rgb: "059669" }; // Emerald-600
        } else if (performance === 'Khá') {
          performanceStyle.fill = { fgColor: { rgb: "DBEAFE" } }; // Blue-100
          performanceStyle.font.color = { rgb: "2563EB" }; // Blue-600
        } else if (performance === 'Trung bình') {
          performanceStyle.fill = { fgColor: { rgb: "FEF3C7" } }; // Amber-100
          performanceStyle.font.color = { rgb: "D97706" }; // Amber-600
        } else {
          performanceStyle.fill = { fgColor: { rgb: "FEE2E2" } }; // Red-100
          performanceStyle.font.color = { rgb: "DC2626" }; // Red-600
        }
        
        workloadSheet[`F${rowIdx}`] = { 
          ...workloadSheet[`F${rowIdx}`], 
          ...performanceStyle,
          ...(isAlternate ? { border: performanceStyle.border } : {})
        };
      }
      
      // Dòng tổng kết
      const lastRow = 5 + teamWorkload.length;
      workloadSheet[`A${lastRow}`] = { ...workloadSheet[`A${lastRow}`], ...totalsRowStyle };
      workloadSheet[`B${lastRow}`] = { ...workloadSheet[`B${lastRow}`], ...totalsRowStyle };
      workloadSheet[`C${lastRow}`] = { ...workloadSheet[`C${lastRow}`], ...totalsRowStyle };
      workloadSheet[`D${lastRow}`] = { ...workloadSheet[`D${lastRow}`], ...totalsRowStyle };
      workloadSheet[`E${lastRow}`] = { ...workloadSheet[`E${lastRow}`], ...{ ...totalsRowStyle, numFmt: '0.0%' } };
      
      // Hiệu suất tổng thể - special styling
      const overallPerformance = workloadData[lastRow - 1][5];
      let overallStyle = { 
        ...totalsRowStyle, 
        alignment: { horizontal: "center", vertical: "center" }
      };
      
      if (overallPerformance === 'Xuất sắc') {
        overallStyle.fill = { fgColor: { rgb: "DCFCE7" } }; // Green-100
        overallStyle.font.color = { rgb: "16A34A" }; // Green-600
      } else if (overallPerformance === 'Tốt') {
        overallStyle.fill = { fgColor: { rgb: "D1FAE5" } }; // Emerald-100
        overallStyle.font.color = { rgb: "059669" }; // Emerald-600
      } else if (overallPerformance === 'Khá') {
        overallStyle.fill = { fgColor: { rgb: "DBEAFE" } }; // Blue-100
        overallStyle.font.color = { rgb: "2563EB" }; // Blue-600
      } else if (overallPerformance === 'Trung bình') {
        overallStyle.fill = { fgColor: { rgb: "FEF3C7" } }; // Amber-100
        overallStyle.font.color = { rgb: "D97706" }; // Amber-600
      } else {
        overallStyle.fill = { fgColor: { rgb: "FEE2E2" } }; // Red-100
        overallStyle.font.color = { rgb: "DC2626" }; // Red-600
      }
      
      workloadSheet[`F${lastRow}`] = { ...workloadSheet[`F${lastRow}`], ...overallStyle };
      
      // Merge cells for title
      workloadSheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
        { s: { r: lastRow-1, c: 0 }, e: { r: lastRow-1, c: 1 } }
      ];
      
      XLSX.utils.book_append_sheet(workbook, workloadSheet, 'Khối lượng công việc');
    }
    
    // Thiết lập thuộc tính cho workbook
    workbook.Props = {
      Title: "Báo Cáo Dashboard",
      Subject: "Dữ liệu tổng quan hệ thống quản lý dự án",
      Author: "Hệ Thống Quản Lý Dự Án",
      Manager: "Ban quản lý",
      Company: "Công ty TNHH Phần mềm ABC",
      Category: "Báo cáo",
      Keywords: "dashboard, dự án, công việc, quản lý",
      Comments: "Báo cáo được tạo tự động từ hệ thống",
      CreatedDate: new Date()
    };
    
    // Xuất file Excel
    const fileName = `Bao_Cao_Dashboard_${currentDate.toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    return fileName;
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    throw error;
  }
};

const ExportExcelButton = ({ dashboardData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = async () => {
    if (!dashboardData || !dashboardData.data) {
      setExportStatus({
        success: false,
        message: "Không có dữ liệu để xuất"
      });
      return;
    }
    
    setIsExporting(true);
    setExportStatus(null);
    
    try {
      const fileName = await exportDashboardToExcel(dashboardData);
      setExportStatus({
        success: true,
        message: `Đã xuất file thành công: ${fileName}`
      });
      
      setTimeout(() => {
        setExportStatus(null);
      }, 3000);
    } catch (error) {
      setExportStatus({
        success: false,
        message: `Lỗi: ${error.message}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`px-4 py-2 flex items-center justify-center rounded-md transition-all ${
          isExporting 
            ? "bg-gray-500 text-gray-200 cursor-not-allowed" 
            : "bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600 shadow-md hover:shadow-lg"
        }`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xuất báo cáo...
          </>
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            Xuất báo cáo Excel
          </>
        )}
      </button>
      
      {exportStatus && (
        <div 
          className={`absolute top-full mt-2 right-0 py-2 px-3 rounded-md shadow-lg text-sm w-64 z-10 ${
            exportStatus.success ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          <div className="flex items-start">
            {exportStatus.success ? (
              <svg className="h-5 w-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{exportStatus.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportExcelButton;
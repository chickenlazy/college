import * as XLSX from 'xlsx';
import { useState } from 'react';

// Hàm xuất dữ liệu dashboard ra file Excel chuyên nghiệp
export const exportDashboardToExcel = (dashboardData) => {
  try {
    // Kiểm tra dữ liệu
    if (!dashboardData || !dashboardData.data) {
      throw new Error('Không có dữ liệu để xuất');
    }
    
    const { stats, projectStatus, taskStatus, recentProjects, upcomingDeadlines, teamWorkload } = dashboardData.data;
    
    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Thiết lập các style
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } }, // Indigo-600
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const subHeaderStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "6366F1" } }, // Indigo-500
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const titleStyle = {
      font: { bold: true, size: 16, color: { rgb: "4F46E5" } },
      alignment: { horizontal: "center" }
    };

    const normalStyle = {
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const numberStyle = {
      alignment: { horizontal: "right" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const dateStyle = {
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const percentStyle = {
      numFmt: '0.0%',
      alignment: { horizontal: "right" },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

    const alternateRowStyle = {
      fill: { fgColor: { rgb: "F3F4F6" } }, // Gray-100
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } }
      }
    };

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
        font: { color: { rgb: "FFFFFF" }, bold: true },
        fill: { fgColor: color },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin", color: { rgb: "E5E7EB" } },
          bottom: { style: "thin", color: { rgb: "E5E7EB" } },
          left: { style: "thin", color: { rgb: "E5E7EB" } },
          right: { style: "thin", color: { rgb: "E5E7EB" } }
        }
      };
    };

    // Sheet 1: Tổng quan
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
      ['Chỉ số', 'Giá trị'],
      ['Tổng số dự án', stats.totalProjects],
      ['Dự án đang thực hiện', stats.inProgressProjects],
      ['Dự án đã hoàn thành', stats.completedProjects],
      ['Dự án quá hạn', stats.overDueProjects || 0],
      ['Tổng số công việc', stats.totalTasks],
      ['Tổng số người dùng', stats.totalUsers],
      [],
      ['PHÂN TÍCH TRẠNG THÁI DỰ ÁN'],
      [],
      ['Trạng thái', 'Số lượng', 'Tỷ lệ'],
      ['Đã hoàn thành', projectStatus.completed || 0, (projectStatus.completed || 0) / stats.totalProjects],
      ['Đang thực hiện', projectStatus.inProgress || 0, (projectStatus.inProgress || 0) / stats.totalProjects],
      ['Tạm dừng', projectStatus.onHold || 0, (projectStatus.onHold || 0) / stats.totalProjects],
      ['Chưa bắt đầu', projectStatus.notStarted || 0, (projectStatus.notStarted || 0) / stats.totalProjects],
      ['Quá hạn', projectStatus.overDue || 0, (projectStatus.overDue || 0) / stats.totalProjects],
      [],
      ['PHÂN TÍCH TRẠNG THÁI CÔNG VIỆC'],
      [],
      ['Trạng thái', 'Số lượng', 'Tỷ lệ'],
      ['Đã hoàn thành', taskStatus.completed || 0, (taskStatus.completed || 0) / stats.totalTasks],
      ['Đang thực hiện', taskStatus.inProgress || 0, (taskStatus.inProgress || 0) / stats.totalTasks],
      ['Tạm dừng', taskStatus.onHold || 0, (taskStatus.onHold || 0) / stats.totalTasks],
      ['Chưa bắt đầu', taskStatus.notStarted || 0, (taskStatus.notStarted || 0) / stats.totalTasks],
      ['Quá hạn', taskStatus.overDue || 0, (taskStatus.overDue || 0) / stats.totalTasks]
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    
    // Thiết lập style cho statsSheet
    statsSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    
    // Áp dụng style
    statsSheet.A1 = { ...statsSheet.A1, ...titleStyle };
    statsSheet.A2 = { ...statsSheet.A2, ...{ font: { italic: true } } };
    statsSheet.A4 = { ...statsSheet.A4, ...subHeaderStyle };
    statsSheet.A6 = { ...statsSheet.A6, ...headerStyle };
    statsSheet.B6 = { ...statsSheet.B6, ...headerStyle };
    
    // Style cho dòng dữ liệu
    for (let i = 7; i <= 12; i++) {
      statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...normalStyle };
      statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...numberStyle };
      
      // Alternate row style
      if (i % 2 === 1) {
        statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...alternateRowStyle };
        statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...alternateRowStyle };
      }
    }
    
    // Project Status section styles
    statsSheet.A14 = { ...statsSheet.A14, ...subHeaderStyle };
    statsSheet.A16 = { ...statsSheet.A16, ...headerStyle };
    statsSheet.B16 = { ...statsSheet.B16, ...headerStyle };
    statsSheet.C16 = { ...statsSheet.C16, ...headerStyle };
    
    // Apply styles to project status rows
    for (let i = 17; i <= 21; i++) {
      statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...normalStyle };
      statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...numberStyle };
      statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...percentStyle };
      
      // Alternate row style
      if (i % 2 === 1) {
        statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...alternateRowStyle };
        statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...alternateRowStyle };
        statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...alternateRowStyle };
      }
    }
    
    // Task Status section styles
    statsSheet.A23 = { ...statsSheet.A23, ...subHeaderStyle };
    statsSheet.A25 = { ...statsSheet.A25, ...headerStyle };
    statsSheet.B25 = { ...statsSheet.B25, ...headerStyle };
    statsSheet.C25 = { ...statsSheet.C25, ...headerStyle };
    
    // Apply styles to task status rows
    for (let i = 26; i <= 30; i++) {
      statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...normalStyle };
      statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...numberStyle };
      statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...percentStyle };
      
      // Alternate row style
      if (i % 2 === 0) {
        statsSheet[`A${i}`] = { ...statsSheet[`A${i}`], ...alternateRowStyle };
        statsSheet[`B${i}`] = { ...statsSheet[`B${i}`], ...alternateRowStyle };
        statsSheet[`C${i}`] = { ...statsSheet[`C${i}`], ...alternateRowStyle };
      }
    }

    // Merge cells for title
    statsSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
      { s: { r: 13, c: 0 }, e: { r: 13, c: 2 } },
      { s: { r: 22, c: 0 }, e: { r: 22, c: 2 } }
    ];
    
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Tổng quan');

    // Sheet 2: Dự án gần đây
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
      
      const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
      
      // Thiết lập style
      projectsSheet['!cols'] = [
        { wch: 8 }, // ID
        { wch: 30 }, // Tên dự án
        { wch: 15 }, // Trạng thái
        { wch: 15 }, // Ngày bắt đầu
        { wch: 15 }, // Ngày kết thúc
        { wch: 12 }, // Tiến độ
        { wch: 20 }, // Quản lý
        { wch: 20 } // Thời gian còn lại
      ];
      
      // Style cho tiêu đề
      projectsSheet.A1 = { ...projectsSheet.A1, ...titleStyle };
      
      // Style cho header
      for (let i = 0; i < projectHeaders.length; i++) {
        const col = String.fromCharCode(65 + i);
        projectsSheet[`${col}3`] = { ...projectsSheet[`${col}3`], ...headerStyle };
      }
      
      // Style cho các dòng dữ liệu
      for (let rowIdx = 4; rowIdx < 4 + recentProjects.length; rowIdx++) {
        const isAlternate = rowIdx % 2 === 0;
        
        // ID
        projectsSheet[`A${rowIdx}`] = { 
          ...projectsSheet[`A${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Tên dự án
        projectsSheet[`B${rowIdx}`] = { 
          ...projectsSheet[`B${rowIdx}`], 
          ...normalStyle,
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
        
        // Tiến độ
        projectsSheet[`F${rowIdx}`] = { 
          ...projectsSheet[`F${rowIdx}`], 
          ...percentStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Quản lý
        projectsSheet[`G${rowIdx}`] = { 
          ...projectsSheet[`G${rowIdx}`], 
          ...normalStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Thời gian còn lại
        projectsSheet[`H${rowIdx}`] = { 
          ...projectsSheet[`H${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
      }
      
      // Merge cells for title
      projectsSheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }
      ];
      
      XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Dự án gần đây');
    }
    
    // Sheet 3: Thời hạn sắp tới
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
      
      const deadlineHeaders = ['ID', 'Loại', 'Tên', 'Thuộc dự án', 'Ngày hạn', 'Trạng thái', 'Thời gian còn lại (ngày)'];
      const deadlinesData = [
        ['DANH SÁCH THỜI HẠN SẮP TỚI'],
        [],
        deadlineHeaders
      ];
      
      // Tính ngày còn lại
      const calculateDaysRemaining = (dueDate) => {
        if (!dueDate) return 'N/A';
        const today = new Date();
        const due = new Date(dueDate);
        return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      };
      
      upcomingDeadlines.forEach(item => {
        const daysRemaining = calculateDaysRemaining(item.dueDate);
        
        deadlinesData.push([
          item.id,
          item.type === 'task' ? 'Công việc' : 'Dự án',
          item.name,
          item.projectName || 'N/A',
          formatDate(item.dueDate),
          item.status.replace(/_/g, ' '),
          daysRemaining
        ]);
      });
      
      const deadlinesSheet = XLSX.utils.aoa_to_sheet(deadlinesData);
      
      // Thiết lập style
      deadlinesSheet['!cols'] = [
        { wch: 8 }, // ID
        { wch: 12 }, // Loại
        { wch: 30 }, // Tên
        { wch: 25 }, // Thuộc dự án
        { wch: 15 }, // Ngày hạn
        { wch: 15 }, // Trạng thái
        { wch: 20 } // Thời gian còn lại
      ];
      
      // Style cho tiêu đề
      deadlinesSheet.A1 = { ...deadlinesSheet.A1, ...titleStyle };
      
      // Style cho header
      for (let i = 0; i < deadlineHeaders.length; i++) {
        const col = String.fromCharCode(65 + i);
        deadlinesSheet[`${col}3`] = { ...deadlinesSheet[`${col}3`], ...headerStyle };
      }
      
      // Style cho các dòng dữ liệu
      for (let rowIdx = 4; rowIdx < 4 + upcomingDeadlines.length; rowIdx++) {
        const isAlternate = rowIdx % 2 === 0;
        
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
          ...normalStyle,
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
        
        // Thời gian còn lại
        deadlinesSheet[`G${rowIdx}`] = { 
          ...deadlinesSheet[`G${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
      }
      
      // Merge cells for title
      deadlinesSheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }
      ];
      
      XLSX.utils.book_append_sheet(workbook, deadlinesSheet, 'Thời hạn sắp tới');
    }
    
    // Sheet 4: Khối lượng công việc của nhóm
    if (teamWorkload && teamWorkload.length > 0) {
      const workloadHeaders = ['ID', 'Tên nhân viên', 'Công việc được giao', 'Công việc hoàn thành', 'Tỉ lệ hoàn thành (%)'];
      const workloadData = [
        ['THỐNG KÊ KHỐI LƯỢNG CÔNG VIỆC NHÓM'],
        [],
        workloadHeaders
      ];
      
      teamWorkload.forEach(member => {
        const completionRate = member.assignedTasks > 0 
          ? member.completedTasks / member.assignedTasks
          : 0;
          
        workloadData.push([
          member.userId,
          member.fullName,
          member.assignedTasks,
          member.completedTasks,
          completionRate
        ]);
      });
      
      const workloadSheet = XLSX.utils.aoa_to_sheet(workloadData);
      
      // Thiết lập style
      workloadSheet['!cols'] = [
        { wch: 8 }, // ID
        { wch: 25 }, // Tên nhân viên
        { wch: 20 }, // Công việc được giao
        { wch: 20 }, // Công việc hoàn thành
        { wch: 20 } // Tỉ lệ hoàn thành
      ];
      
      // Style cho tiêu đề
      workloadSheet.A1 = { ...workloadSheet.A1, ...titleStyle };
      
      // Style cho header
      for (let i = 0; i < workloadHeaders.length; i++) {
        const col = String.fromCharCode(65 + i);
        workloadSheet[`${col}3`] = { ...workloadSheet[`${col}3`], ...headerStyle };
      }
      
      // Style cho các dòng dữ liệu
      for (let rowIdx = 4; rowIdx < 4 + teamWorkload.length; rowIdx++) {
        const isAlternate = rowIdx % 2 === 0;
        
        // ID
        workloadSheet[`A${rowIdx}`] = { 
          ...workloadSheet[`A${rowIdx}`], 
          ...numberStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
        
        // Tên nhân viên
        workloadSheet[`B${rowIdx}`] = { 
          ...workloadSheet[`B${rowIdx}`], 
          ...normalStyle,
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
        
        // Tỉ lệ hoàn thành
        workloadSheet[`E${rowIdx}`] = { 
          ...workloadSheet[`E${rowIdx}`], 
          ...percentStyle,
          ...(isAlternate ? alternateRowStyle : {})
        };
      }
      
      // Merge cells for title
      workloadSheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
      ];
      
      XLSX.utils.book_append_sheet(workbook, workloadSheet, 'Khối lượng công việc');
    }
    
    // Thiết lập thuộc tính cho workbook
    workbook.Props = {
      Title: "Báo Cáo Dashboard",
      Subject: "Dữ liệu tổng quan hệ thống",
      Author: "Hệ Thống Quản Lý Dự Án",
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

// Component nút xuất Excel
const ExportExcelButton = ({ dashboardData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);
    
    try {
      const fileName = await exportDashboardToExcel(dashboardData);
      setExportStatus({
        success: true,
        message: `Đã xuất file thành công: ${fileName}`
      });
      
      // Tự động ẩn thông báo sau 3 giây
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
        className={`px-4 py-2 flex items-center justify-center rounded-md transition-colors ${
          isExporting 
            ? "bg-gray-500 text-gray-200 cursor-not-allowed" 
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xuất...
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
            exportStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          <div className="flex items-start">
            {exportStatus.success ? (
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{exportStatus.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
export default ExportExcelButton; 
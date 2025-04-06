import * as XLSX from 'xlsx';

// Hàm xuất dữ liệu dashboard ra file Excel
export const exportDashboardToExcel = (dashboardData) => {
  try {
    // Kiểm tra dữ liệu
    if (!dashboardData || !dashboardData.data) {
      console.error('Không có dữ liệu để xuất');
      return;
    }
    
    const { stats, projectStatus, taskStatus, recentProjects, upcomingDeadlines, teamWorkload } = dashboardData.data;
    
    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Thống kê tổng quan
    const statsData = [
      ['THỐNG KÊ TỔNG QUAN'],
      [],
      ['Tổng số dự án', stats.totalProjects],
      ['Dự án đang thực hiện', stats.inProgressProjects],
      ['Dự án đã hoàn thành', stats.completedProjects],
      ['Dự án quá hạn', stats.overDueProjects],
      ['Tổng số công việc', stats.totalTasks],
      ['Tổng số người dùng', stats.totalUsers]
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Thống kê');
    
    // Sheet 2: Trạng thái dự án
    const projectStatusHeaders = ['Trạng thái', 'Số lượng'];
    const projectStatusData = [
      projectStatusHeaders,
      ['Đã hoàn thành', projectStatus.completed || 0],
      ['Đang thực hiện', projectStatus.inProgress || 0],
      ['Tạm dừng', projectStatus.onHold || 0],
      ['Chưa bắt đầu', projectStatus.notStarted || 0],
      ['Quá hạn', projectStatus.overDue || 0]
    ];
    
    const projectStatusSheet = XLSX.utils.aoa_to_sheet(projectStatusData);
    XLSX.utils.book_append_sheet(workbook, projectStatusSheet, 'Trạng thái dự án');
    
    // Sheet 3: Trạng thái công việc
    const taskStatusHeaders = ['Trạng thái', 'Số lượng'];
    const taskStatusData = [
      taskStatusHeaders,
      ['Đã hoàn thành', taskStatus.completed || 0],
      ['Đang thực hiện', taskStatus.inProgress || 0],
      ['Tạm dừng', taskStatus.onHold || 0],
      ['Chưa bắt đầu', taskStatus.notStarted || 0],
      ['Quá hạn', taskStatus.overDue || 0]
    ];
    
    const taskStatusSheet = XLSX.utils.aoa_to_sheet(taskStatusData);
    XLSX.utils.book_append_sheet(workbook, taskStatusSheet, 'Trạng thái công việc');
    
    // Sheet 4: Dự án gần đây
    if (recentProjects && recentProjects.length > 0) {
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
      };
      
      const projectHeaders = ['ID', 'Tên dự án', 'Trạng thái', 'Ngày bắt đầu', 'Ngày kết thúc', 'Tiến độ (%)', 'Quản lý'];
      const projectsData = [projectHeaders];
      
      recentProjects.forEach(project => {
        projectsData.push([
          project.id,
          project.name,
          project.status.replace(/_/g, ' '),
          formatDate(project.startDate),
          formatDate(project.dueDate),
          project.progress.toFixed(1),
          project.manager ? project.manager.fullName : 'N/A'
        ]);
      });
      
      const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
      XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Dự án gần đây');
    }
    
    // Sheet 5: Thời hạn sắp tới
    if (upcomingDeadlines && upcomingDeadlines.length > 0) {
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
      };
      
      const deadlineHeaders = ['ID', 'Loại', 'Tên', 'Thuộc dự án', 'Ngày hạn', 'Trạng thái'];
      const deadlinesData = [deadlineHeaders];
      
      upcomingDeadlines.forEach(item => {
        deadlinesData.push([
          item.id,
          item.type === 'task' ? 'Công việc' : 'Dự án',
          item.name,
          item.projectName || 'N/A',
          formatDate(item.dueDate),
          item.status.replace(/_/g, ' ')
        ]);
      });
      
      const deadlinesSheet = XLSX.utils.aoa_to_sheet(deadlinesData);
      XLSX.utils.book_append_sheet(workbook, deadlinesSheet, 'Thời hạn sắp tới');
    }
    
    // Sheet 6: Khối lượng công việc của nhóm
    if (teamWorkload && teamWorkload.length > 0) {
      const workloadHeaders = ['ID', 'Tên nhân viên', 'Công việc được giao', 'Công việc hoàn thành', 'Tỉ lệ hoàn thành (%)'];
      const workloadData = [workloadHeaders];
      
      teamWorkload.forEach(member => {
        const completionRate = member.assignedTasks > 0 
          ? ((member.completedTasks / member.assignedTasks) * 100).toFixed(1) 
          : '0.0';
          
        workloadData.push([
          member.userId,
          member.fullName,
          member.assignedTasks,
          member.completedTasks,
          completionRate
        ]);
      });
      
      const workloadSheet = XLSX.utils.aoa_to_sheet(workloadData);
      XLSX.utils.book_append_sheet(workbook, workloadSheet, 'Khối lượng công việc');
    }
    
    // Xuất file Excel
    const currentDate = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    const fileName = `Dashboard_Report_${currentDate}.xlsx`;
    
    // Xuất file Excel
    XLSX.writeFile(workbook, fileName);
    
    console.log(`Đã xuất file Excel: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    throw error;
  }
};

// Component nút xuất Excel
const ExportExcelButton = ({ dashboardData }) => {
  const handleExport = () => {
    try {
      const fileName = exportDashboardToExcel(dashboardData);
      // Có thể thêm thông báo thành công ở đây
    } catch (error) {
      // Xử lý lỗi
      console.error('Lỗi xuất Excel:', error);
      // Hiển thị thông báo lỗi cho người dùng
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700 transition-colors"
    >
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
      Xuất Excel
    </button>
  );
};

export default ExportExcelButton;
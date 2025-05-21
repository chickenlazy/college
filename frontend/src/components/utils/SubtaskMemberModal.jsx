import React, { useState } from 'react'
import {
    X,
  } from "lucide-react";

// SubtaskMemberModal Component
const SubtaskMemberModal = ({ isOpen, onClose, users, onSelect }) => {
    // Di chuyển các useState ra ngoài điều kiện if
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
    
    // Return sớm nếu modal không mở
    if (!isOpen) return null;
  
    // Lấy danh sách các role duy nhất
    const uniqueRoles = ["All", ...new Set(users.map(user => user.role).filter(Boolean))];
  
    // Lọc users dựa trên tìm kiếm và role
    const filteredUsers = users.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRoleFilter === "All" || user.role === selectedRoleFilter;
      return matchesSearch && matchesRole;
    });
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-750">
            <h3 className="text-lg font-medium text-white">Chọn người thực hiện</h3>
            <button
              className="p-2 hover:bg-gray-700 hover:text-white text-gray-400 rounded-full transition-colors"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Search and filter section */}
          <div className="p-4 border-b border-gray-700 space-y-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm thành viên theo tên..." 
                className="w-full bg-gray-700 rounded-md px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            
            {/* <div>
              <label className="text-sm text-gray-400 mb-2 block">Filter by role:</label>
              <div className="flex flex-wrap gap-2">
                {uniqueRoles.map(role => (
                  <button
                    key={role}
                    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                      selectedRoleFilter === role 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedRoleFilter(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div> */}
          </div>
          
          {/* Members list */}
          <div className="overflow-y-auto flex-grow custom-scrollbar p-1">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50">
                  <path d="M17.5 8c.7 0 1.4.3 1.9.8.6.6.8 1.3.8 2 0 .7-.3 1.4-.8 2-.3.2-.5.5-.8.7"></path>
                  <path d="M3 3l18 18"></path>
                  <path d="M16.5 16.5 21 21"></path>
                  <path d="M10 5.5a7 7 0 0 1 10.5 6c0 1.5-.5 2.8-1.3 4"></path>
                  <path d="M7.7 7.8a7 7 0 0 0-1.2 3.8c0 .7.1 1.4.3 2"></path>
                  <path d="M12 12a7 7 0 0 0 1.3 4"></path>
                </svg>
                <p className="text-base mb-2">'Không tìm thấy thành viên phù hợp</p>
                {searchTerm && (
                  <button 
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300 py-1 px-3 rounded-md hover:bg-gray-700"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedRoleFilter("All");
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 hover:bg-gray-750 bg-gray-800 rounded-lg cursor-pointer transition-colors group border border-gray-700 hover:border-purple-500"
                    onClick={() => onSelect(user)}
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                      {user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="font-medium text-white">{user.fullName}</h4>
                      <div className="flex items-center flex-wrap">
                        {user.role && (
                          <span className="text-xs text-gray-400">{user.position}</span>
                        )}
                        {user.department && (
                          <>
                            <span className="text-gray-600 text-xs mx-1">•</span>
                            <span className="text-xs text-gray-400">{user.department}</span>
                          </>
                        )}
                        {user.email && (
                          <div className="w-full text-xs text-gray-500 mt-0.5 truncate">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14"></path>
                        <path d="M5 12h14"></path>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-700 bg-gray-750 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Đang hiển thị {filteredUsers.length} trong tổng số {users.length} thành viên dự án
            </span>
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  };

export default SubtaskMemberModal
// import React, { useState, useEffect } from 'react';
// import {
//   Search,
//   UserPlus,
//   Filter,
//   MoreHorizontal,
//   Trash2,
//   Edit,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle,
//   XCircle,
//   Users,
//   Shield,
//   Eye,
//   UserCog,
//   Loader,
//   User,
//   Mail,
//   Building,
//   Briefcase
// } from 'lucide-react';

// // Mock data for users
// const mockUsers = [
//   {
//     id: 1,
//     firstName: 'Alex',
//     lastName: 'Johnson',
//     email: 'alex.johnson@example.com',
//     role: 'PROJECT_MANAGER',
//     avatar: null,
//     position: 'Senior Project Manager',
//     department: 'Engineering',
//     projectsCount: 5,
//     tasksCount: 12,
//     status: 'ACTIVE',
//     joinedDate: '2022-05-15'
//   },
//   {
//     id: 2,
//     firstName: 'Sara',
//     lastName: 'Williams',
//     email: 'sara.williams@example.com',
//     role: 'TEAM_MEMBER',
//     avatar: null,
//     position: 'Front-end Developer',
//     department: 'Engineering',
//     projectsCount: 3,
//     tasksCount: 8,
//     status: 'ACTIVE',
//     joinedDate: '2022-08-22'
//   },
//   {
//     id: 3,
//     firstName: 'Michael',
//     lastName: 'Brown',
//     email: 'michael.brown@example.com',
//     role: 'ADMIN',
//     avatar: null,
//     position: 'IT Director',
//     department: 'Administration',
//     projectsCount: 10,
//     tasksCount: 5,
//     status: 'ACTIVE',
//     joinedDate: '2021-12-01'
//   },
//   {
//     id: 4,
//     firstName: 'Emily',
//     lastName: 'Davis',
//     email: 'emily.davis@example.com',
//     role: 'TEAM_MEMBER',
//     avatar: null,
//     position: 'UI/UX Designer',
//     department: 'Design',
//     projectsCount: 4,
//     tasksCount: 9,
//     status: 'ACTIVE',
//     joinedDate: '2023-01-10'
//   },
//   {
//     id: 5,
//     firstName: 'Robert',
//     lastName: 'Taylor',
//     email: 'robert.taylor@example.com',
//     role: 'PROJECT_MANAGER',
//     avatar: null,
//     position: 'Product Manager',
//     department: 'Product',
//     projectsCount: 2,
//     tasksCount: 7,
//     status: 'INACTIVE',
//     joinedDate: '2022-07-05'
//   },
//   {
//     id: 6,
//     firstName: 'Jennifer',
//     lastName: 'Wilson',
//     email: 'jennifer.wilson@example.com',
//     role: 'TEAM_MEMBER',
//     avatar: null,
//     position: 'Backend Developer',
//     department: 'Engineering',
//     projectsCount: 2,
//     tasksCount: 6,
//     status: 'ACTIVE',
//     joinedDate: '2023-03-15'
//   },
//   {
//     id: 7,
//     firstName: 'David',
//     lastName: 'Martinez',
//     email: 'david.martinez@example.com',
//     role: 'TEAM_MEMBER',
//     avatar: null,
//     position: 'QA Engineer',
//     department: 'Quality Assurance',
//     projectsCount: 3,
//     tasksCount: 11,
//     status: 'ACTIVE',
//     joinedDate: '2022-11-08'
//   },
//   {
//     id: 8,
//     firstName: 'Jessica',
//     lastName: 'Anderson',
//     email: 'jessica.anderson@example.com',
//     role: 'TEAM_MEMBER',
//     avatar: null,
//     position: 'DevOps Engineer',
//     department: 'Operations',
//     projectsCount: 1,
//     tasksCount: 4,
//     status: 'ACTIVE',
//     joinedDate: '2023-02-20'
//   }
// ];

// // Toast notification component
// const Toast = ({ message, type, onClose }) => {
//   const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
//   const icon = type === 'success' ? <CheckCircle size={20} /> : type === 'error' ? <XCircle size={20} /> : <Shield size={20} />;
  
//   return (
//     <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-50`}>
//       {icon}
//       <span>{message}</span>
//       <button 
//         onClick={onClose}
//         className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
//       >
//         <XCircle size={16} />
//       </button>
//     </div>
//   );
// };

// // Confirmation Dialog Component
// const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
//       <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in">
//         <h2 className="text-xl font-bold mb-4">{title}</h2>
//         <p className="text-gray-300 mb-6">{message}</p>
//         <div className="flex justify-end space-x-3">
//           <button 
//             className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//           <button 
//             className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors rounded-md flex items-center gap-2"
//             onClick={() => {
//               onConfirm();
//               onClose();
//             }}
//           >
//             <Trash2 size={16} />
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // User Form Dialog Component
// const UserFormDialog = ({ isOpen, onClose, user, isNewUser, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     role: 'TEAM_MEMBER',
//     position: '',
//     department: '',
//     status: 'ACTIVE'
//   });

//   // Set form data when editing an existing user
//   useEffect(() => {
//     if (user && !isNewUser) {
//       setFormData({
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//         position: user.position,
//         department: user.department,
//         status: user.status
//       });
//     }
//   }, [user, isNewUser]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Basic validation
//     if (!formData.firstName || !formData.lastName || !formData.email) {
//       // You could add more detailed validation here
//       return;
//     }
    
//     // Format data and submit
//     const userData = {
//       ...formData,
//       id: isNewUser ? Date.now() : user.id,
//       joinedDate: isNewUser ? new Date().toISOString().split('T')[0] : user.joinedDate,
//       projectsCount: isNewUser ? 0 : user.projectsCount,
//       tasksCount: isNewUser ? 0 : user.tasksCount
//     };
    
//     onSubmit(userData);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
//       <div className="bg-gray-900 rounded-lg p-6 max-w-xl w-full shadow-xl animate-scale-in">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-bold">{isNewUser ? 'Add New User' : 'Edit User'}</h2>
//           <button 
//             onClick={onClose}
//             className="p-1 hover:bg-gray-700 rounded-full"
//           >
//             <XCircle size={20} />
//           </button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-1">First Name *</label>
//               <input
//                 type="text"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full focus:border-purple-500 focus:outline-none"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-1">Last Name *</label>
//               <input
//                 type="text"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//                 className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full focus:border-purple-500 focus:outline-none"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full focus:border-purple-500 focus:outline-none"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full focus:border-purple-500 focus:outline-none"
//               >
//                 <option value="ADMIN">Admin</option>
//                 <option value="PROJECT_MANAGER">Project Manager</option>
//                 <option value="TEAM_MEMBER">Team Member</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
//               <input
//                 type="text"
//                 name="position"
//                 value={formData.position}
//                 onChange={handleChange}
//                 className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full focus:border-purple-500 focus:outline-none"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
//               <input
//                 type="text"
//                 name="department"
//                 value={formData.department}
//                 onChange={handleChange}
//                 className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full focus:border-purple-500 focus:outline-none"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
//               <select
//                 name="status"
//                 value={formData.status}
//                 onChange={handleChange}
//                 className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full focus:border-purple-500 focus:outline-none"
//               >
//                 <option value="ACTIVE">Active</option>
//                 <option value="INACTIVE">Inactive</option>
//               </select>
//             </div>
//           </div>
          
//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-md flex items-center gap-2"
//             >
//               {isNewUser ? 'Add User' : 'Save Changes'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // User Card Component
// const UserCard = ({ user, onView, onEdit, onDelete }) => {
//   const [showMenu, setShowMenu] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   // Get role badge color
//   const getRoleBadgeColor = (role) => {
//     switch(role) {
//       case 'ADMIN':
//         return 'bg-red-100 text-red-800';
//       case 'PROJECT_MANAGER':
//         return 'bg-blue-100 text-blue-800';
//       case 'TEAM_MEMBER':
//         return 'bg-green-100 text-green-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Generate avatar with initials
//   const generateInitialsAvatar = () => {
//     const initials = `${user.firstName[0]}${user.lastName[0]}`;
//     return (
//       <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
//         {initials}
//       </div>
//     );
//   };

//   // Format date to readable string
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
//   };

//   return (
//     <div 
//       className={`bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ${
//         isHovered ? 'transform scale-[1.02]' : ''
//       } border border-transparent hover:border-gray-700`}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => {
//         setIsHovered(false);
//         setShowMenu(false);
//       }}
//     >
//       <div className="p-4">
//         <div className="flex justify-between">
//           <div className="flex gap-3">
//             {user.avatar ? (
//               <img 
//                 src={user.avatar} 
//                 alt={`${user.firstName} ${user.lastName}`}
//                 className="w-12 h-12 rounded-full object-cover"
//               />
//             ) : generateInitialsAvatar()}
            
//             <div>
//               <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
//               <p className="text-sm text-gray-400">{user.position}</p>
//               <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getRoleBadgeColor(user.role)}`}>
//                 {user.role.replace('_', ' ')}
//               </span>
//             </div>
//           </div>
          
//           <div className="relative">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowMenu(!showMenu);
//               }}
//               className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
//             >
//               <MoreHorizontal size={18} className="text-gray-400" />
//             </button>

//             {showMenu && (
//               <div className="absolute right-0 mt-1 w-40 bg-gray-900 rounded-md shadow-lg z-10 border border-gray-700 animate-fade-in">
//                 <ul className="py-1 text-sm">
//                   <li>
//                     <button
//                       className="flex w-full items-center gap-2 text-left px-4 py-2 hover:bg-gray-800 transition-colors"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setShowMenu(false);
//                         onView(user);
//                       }}
//                     >
//                       <Eye size={16} className="text-purple-500" />
//                       View Details
//                     </button>
//                   </li>
//                   <li>
//                     <button
//                       className="flex w-full items-center gap-2 text-left px-4 py-2 hover:bg-gray-800 transition-colors"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setShowMenu(false);
//                         onEdit(user);
//                       }}
//                     >
//                       <Edit size={16} className="text-blue-500" />
//                       Edit User
//                     </button>
//                   </li>
//                   <li>
//                     <button
//                       className="flex w-full items-center gap-2 text-left px-4 py-2 hover:bg-gray-800 transition-colors text-red-500"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setShowMenu(false);
//                         onDelete(user.id);
//                       }}
//                     >
//                       <Trash2 size={16} />
//                       Delete User
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
        
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <div className="flex flex-col">
//             <span className="text-xs text-gray-400">Email</span>
//             <span className="text-sm truncate">{user.email}</span>
//           </div>
//           <div className="flex flex-col">
//             <span className="text-xs text-gray-400">Department</span>
//             <span className="text-sm">{user.department}</span>
//           </div>
//           <div className="flex flex-col">
//             <span className="text-xs text-gray-400">Projects</span>
//             <span className="text-sm">{user.projectsCount}</span>
//           </div>
//           <div className="flex flex-col">
//             <span className="text-xs text-gray-400">Tasks</span>
//             <span className="text-sm">{user.tasksCount}</span>
//           </div>
//         </div>
        
//         <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
//           <div className="flex items-center">
//             <span className={`inline-block w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'} mr-2`}></span>
//             <span className="text-xs">{user.status}</span>
//           </div>
//           <span className="text-xs text-gray-400">Joined: {formatDate(user.joinedDate)}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Filter Chip Component
// const FilterChip = ({ label, active, onClick, icon }) => (
//   <button
//     className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all ${
//       active
//         ? "bg-purple-700 text-white shadow-md shadow-purple-900/50"
//         : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//     }`}
//     onClick={onClick}
//   >
//     {icon}
//     {label}
//   </button>
// );

// // User Detail View Component
// const UserDetailView = ({ user, onBack, onEdit }) => {
//   // Format date to readable string
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//   };

//   // Generate avatar with initials
//   const generateInitialsAvatar = () => {
//     const initials = `${user.firstName[0]}${user.lastName[0]}`;
//     return (
//       <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
//         {initials}
//       </div>
//     );
//   };

//   // Get role badge color
//   const getRoleBadgeColor = (role) => {
//     switch(role) {
//       case 'ADMIN':
//         return 'bg-red-100 text-red-800';
//       case 'PROJECT_MANAGER':
//         return 'bg-blue-100 text-blue-800';
//       case 'TEAM_MEMBER':
//         return 'bg-green-100 text-green-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="bg-gray-900 rounded-lg shadow-lg text-white">
//       {/* Header */}
//       <div className="p-6 bg-gray-800 flex justify-between items-center">
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={onBack}
//             className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
//           >
//             <ChevronDown size={18} className="transform -rotate-90" />
//           </button>
//           <h2 className="text-xl font-bold">User Details</h2>
//         </div>
//         <button
//           onClick={() => onEdit(user)}
//           className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-md flex items-center gap-2"
//         >
//           <Edit size={16} />
//           <span>Edit User</span>
//         </button>
//       </div>

//       {/* User Detail Content */}
//       <div className="p-6">
//         <div className="flex flex-col md:flex-row gap-8">
//           {/* Left Column - Basic Info */}
//           <div className="md:w-1/3 flex flex-col items-center">
//             <div className="mb-4">
//               {user.avatar ? (
//                 <img 
//                   src={user.avatar} 
//                   alt={`${user.firstName} ${user.lastName}`}
//                   className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
//                 />
//               ) : generateInitialsAvatar()}
//             </div>

//             <div className="bg-gray-800 p-4 rounded-lg w-full">
//               <h3 className="text-xl font-bold text-center">
//                 {user.firstName} {user.lastName}
//               </h3>
//               <div className="mt-2 flex flex-col items-center">
//                 <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
//                   {user.role.replace('_', ' ')}
//                 </span>
//                 <p className="text-sm text-gray-400 mt-2">{user.position}</p>
//                 <div className="flex items-center mt-2">
//                   <span className={`inline-block w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'} mr-2`}></span>
//                   <span className="text-sm">{user.status}</span>
//                 </div>
//               </div>
//             </div>

//             {/* User Stats */}
//             <div className="grid grid-cols-2 gap-4 mt-4 w-full">
//               <div className="bg-gray-800 p-4 rounded-lg text-center">
//                 <span className="text-2xl font-bold text-purple-400">{user.projectsCount}</span>
//                 <p className="text-xs text-gray-400 mt-1">Projects</p>
//               </div>
//               <div className="bg-gray-800 p-4 rounded-lg text-center">
//                 <span className="text-2xl font-bold text-blue-400">{user.tasksCount}</span>
//                 <p className="text-xs text-gray-400 mt-1">Tasks</p>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Detailed Info */}
//           <div className="md:w-2/3">
//             <div className="bg-gray-800 p-6 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Contact Information</h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">Email</label>
//                   <div className="flex items-center gap-2">
//                     <Mail size={16} className="text-gray-400" />
//                     <span>{user.email}</span>
//                   </div>
//                 </div>
                
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">Department</label>
//                   <div className="flex items-center gap-2">
//                     <Building size={16} className="text-gray-400" />
//                     <span>{user.department}</span>
//                   </div>
//                 </div>
                
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">Position</label>
//                   <div className="flex items-center gap-2">
//                     <Briefcase size={16} className="text-gray-400" />
//                     <span>{user.position}</span>
//                   </div>
//                 </div>
                
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-400">Joined Date</label>
//                   <div className="flex items-center gap-2">
//                     <Calendar size={16} className="text-gray-400" />
//                     <span>{formatDate(user.joinedDate)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Projects Section */}
//             <div className="bg-gray-800 p-6 rounded-lg mt-6">
//               <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
//                 Projects
//                 <span className="ml-2 text-sm text-gray-400">({user.projectsCount})</span>
//               </h3>
              
//               {user.projectsCount > 0 ? (
//                 <div className="space-y-3">
//                   <div className="p-3 bg-gray-700 rounded-lg flex justify-between items-center">
//                     <div>
//                       <h4 className="font-medium">Client Portal Redesign</h4>
//                       <p className="text-xs text-gray-400">In Progress</p>
//                     </div>
//                     <span className="text-xs text-gray-400">Due: Apr 15, 2025</span>
//                   </div>
//                   {user.projectsCount > 1 && (
//                     <div className="text-center p-2">
//                       <button className="text-sm text-purple-400 hover:text-purple-300">
//                         View all projects
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-400">No projects assigned yet.</p>
//               )}
//             </div>

//             {/* Tasks Section */}
//             <div className="bg-gray-800 p-6 rounded-lg mt-6">
//               <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
//                 Tasks
//                 <span className="ml-2 text-sm text-gray-400">({user.tasksCount})</span>
//               </h3>
              
//               {user.tasksCount > 0 ? (
//                 <div className="space-y-3">
//                   <div className="p-3 bg-gray-700 rounded-lg flex justify-between items-center">
//                     <div>
//                       <h4 className="font-medium">Create wireframes for homepage</h4>
//                       <p className="text-xs text-gray-400">Client Portal Redesign</p>
//                     </div>
//                     <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">High</span>
//                   </div>
//                   {user.tasksCount > 1 && (
//                     <div className="text-center p-2">
//                       <button className="text-sm text-purple-400 hover:text-purple-300">
//                         View all tasks
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-400">No tasks assigned yet.</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main UserManagement Component
// const UserManagement = () => {
//   // State management
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [search, setSearch] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [deleteConfirm, setDeleteConfirm] = useState({ show: false, userId: null });
//   const [userFormDialog, setUserFormDialog] = useState({ show: false, user: null, isNewUser: false });
//   const [viewedUser, setViewedUser] = useState(null);

//   // Handler Functions
//   const showToast = (message, type = 'success') => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const handleViewUser = (user) => {
//     setViewedUser(user);
//   };
  
//   const handleBackFromView = () => {
//     setViewedUser(null);
//   };

//   const handleCreateUser = () => {
//     setUserFormDialog({ show: true, user: null, isNewUser: true });
//   };

//   const handleEditUser = (user) => {
//     setUserFormDialog({ show: true, user, isNewUser: false });
//   };
  
//   const handleDeleteUser = (userId) => {
//     setDeleteConfirm({ show: true, userId });
//   };

//   const confirmDeleteUser = () => {
//     const updatedUsers = users.filter(user => user.id !== deleteConfirm.userId);
//     setUsers(updatedUsers);
//     showToast('User deleted successfully', 'success');
//   };
  
//   const handleUserFormSubmit = (userData) => {
//     if (userFormDialog.isNewUser) {
//       // Add new user
//       setUsers([...users, userData]);
//       showToast('User created successfully', 'success');
//     } else {
//       // Update existing user
//       setUsers(users.map(user => 
//         user.id === userData.id ? userData : user
//       ));
      
//       // Update viewed user if currently viewing this user
//       if (viewedUser && viewedUser.id === userData.id) {
//         setViewedUser(userData);
//       }
      
//       showToast('User updated successfully', 'success');
//     }
    
//     setUserFormDialog({ show: false, user: null, isNewUser: false });
//   };

//   // Load data initially
//   useEffect(() => {
//     // Simulate API call
//     setTimeout(() => {
//       setUsers(mockUsers);
//       setLoading(false);
//     }, 800);
//   }, []);
  
//   // Filter users based on active filter and search
//   const filteredUsers = users.filter((user) => {
//     // Apply status filter
//     if (activeFilter === "active") {
//       if (user.status !== "ACTIVE") return false;
//     } else if (activeFilter === "inactive") {
//       if (user.status !== "INACTIVE") return false;
//     } else if (activeFilter === "admin") {
//       if (user.role !== "ADMIN") return false;
//     } else if (activeFilter === "manager") {
//       if (user.role !== "PROJECT_MANAGER") return false;
//     } else if (activeFilter === "member") {
//       if (user.role !== "TEAM_MEMBER") return false;
//     }

//     // Apply search filter
//     if (search) {
//       const searchLower = search.toLowerCase();
//       return (
//         user.firstName.toLowerCase().includes(searchLower) ||
//         user.lastName.toLowerCase().includes(searchLower) ||
//         user.email.toLowerCase().includes(searchLower) ||
//         user.position.toLowerCase().includes(searchLower) ||
//         user.department.toLowerCase().includes(searchLower)
//       );
//     }

//     return true;
//   });

//   // Render different views
//   if (viewedUser) {
//     return (
//       <UserDetailView 
//         user={viewedUser} 
//         onBack={handleBackFromView}
//         onEdit={handleEditUser}
//       />
//     );
//   }
  
//   return (
//     <div className="bg-gray-900 rounded-lg shadow-lg text-white">
//       {/* Header Section */}
//       <div className="p-6 border-b border-gray-800">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h1 className="text-2xl font-bold">USER MANAGEMENT</h1>
//             <p className="text-gray-400 text-sm mt-1">Manage users and their permissions</p>
//           </div>

//           <button
//             className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-md flex items-center gap-2 shadow-md shadow-purple-900/30"
//             onClick={handleCreateUser}
//           >
//             <UserPlus size={18} />
//             <span>Add User</span>
//           </button>
//         </div>
//       </div>

//       {/* Search and Filters */}
//       <div className="p-6 space-y-4">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="relative flex-1">
//             <input
//               type="text"
//               placeholder="Search users by name, email, position..."
//               className="pl-10 pr-4 py-2 bg-gray-800 rounded-md w-full text-white border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//             <Search
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//               size={18}
//             />
//           </div>

//           <button
//             className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-md sm:w-auto w-full justify-center border border-gray-700"
//             onClick={() => setShowFilters(!showFilters)}
//           >
//             <Filter size={18} />
//             <span>Filters</span>
//             <ChevronUp
//               size={18}
//               className={`transform transition-transform duration-300 ${
//                 showFilters ? "" : "rotate-180"
//               }`}
//             />
//           </button>
//         </div>

//         {showFilters && (
//           <div className="flex flex-wrap gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700 animate-fade-in">
//             <FilterChip
//               label="All Users"
//               icon={<Users size={14} />}
//               active={activeFilter === "all"}
//               onClick={() => setActiveFilter("all")}
//             />
//             <FilterChip
//               label="Active Users"
//               icon={<CheckCircle size={14} className="text-green-500" />}
//               active={activeFilter === "active"}
//               onClick={() => setActiveFilter("active")}
//             />
//             <FilterChip
//               label="Inactive Users"
//               icon={<XCircle size={14} className="text-red-500" />}
//               active={activeFilter === "inactive"}
//               onClick={() => setActiveFilter("inactive")}
//             />
//             <FilterChip
//               label="Admins"
//               icon={<Shield size={14} className="text-red-500" />}
//               active={activeFilter === "admin"}
//               onClick={() => setActiveFilter("admin")}
//             />
//             <FilterChip
//               label="Project Managers"
//               icon={<UserCog size={14} className="text-blue-500" />}
//               active={activeFilter === "manager"}
//               onClick={() => setActiveFilter("manager")}
//             />
//             <FilterChip
//               label="Team Members"
//               icon={<User size={14} className="text-green-500" />}
//               active={activeFilter === "member"}
//               onClick={() => setActiveFilter("member")}
//             />
//           </div>
//         )}
//       </div>

//       {/* Users Content Area */}
//       <div className="px-6 pb-6">
//         {loading ? (
//           <div className="flex flex-col justify-center items-center py-16">
//             <Loader size={36} className="text-purple-500 animate-spin mb-4" />
//             <p className="text-gray-400">Loading users...</p>
//           </div>
//         ) : filteredUsers.length === 0 ? (
//           <div className="bg-gray-800 rounded-lg p-8 text-center">
//             <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Users size={24} className="text-gray-500" />
//             </div>
//             <h3 className="text-xl font-medium text-gray-300 mb-2">
//               No users found
//             </h3>
//             <p className="text-gray-400">
//               Try adjusting your search or filter to find what you're looking for.
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//               {filteredUsers.map((user) => (
//                 <UserCard
//                   key={user.id}
//                   user={user}
//                   onView={handleViewUser}
//                   onEdit={handleEditUser}
//                   onDelete={handleDeleteUser}
//                 />
//               ))}
//             </div>
            
//             {/* Stats */}
//             <div className="mt-6 bg-gray-800 p-4 rounded-lg">
//               <div className="flex flex-wrap justify-center gap-6 text-sm">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
//                   <span>{users.filter(u => u.status === 'ACTIVE').length} Active Users</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
//                   <span>{users.filter(u => u.role === 'ADMIN').length} Admins</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
//                   <span>{users.filter(u => u.role === 'PROJECT_MANAGER').length} Project Managers</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
//                   <span>{users.filter(u => u.role === 'TEAM_MEMBER').length} Team Members</span>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
      
//       {/* Toast Notification */}
//       {toast && (
//         <Toast 
//           message={toast.message} 
//           type={toast.type} 
//           onClose={() => setToast(null)} 
//         />
//       )}

//       {/* Delete Confirmation Dialog */}
//       <ConfirmationDialog
//         isOpen={deleteConfirm.show}
//         onClose={() => setDeleteConfirm({ show: false, userId: null })}
//         onConfirm={confirmDeleteUser}
//         title="Delete User"
//         message="Are you sure you want to delete this user? This action cannot be undone and will remove all associated data."
//       />

//       {/* User Form Dialog */}
//       <UserFormDialog
//         isOpen={userFormDialog.show}
//         onClose={() => setUserFormDialog({ show: false, user: null, isNewUser: false })}
//         user={userFormDialog.user}
//         isNewUser={userFormDialog.isNewUser}
//         onSubmit={handleUserFormSubmit}
//       />
// {/* Add CSS animations for better UX */}
// <style jsx="true">{`
//   @keyframes fade-in {
//     from { opacity: 0; }
//     to { opacity: 1; }
//   }
  
//   @keyframes fade-in-up {
//     from { 
//       opacity: 0;
//       transform: translateY(10px);
//     }
//     to { 
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
  
//   @keyframes scale-in {
//     from { 
//       opacity: 0;
//       transform: scale(0.9);
//     }
//     to { 
//       opacity: 1;
//       transform: scale(1);
//     }
//   }
  
//   .animate-fade-in {
//     animation: fade-in 0.3s ease-out;
//   }
  
//   .animate-fade-in-up {
//     animation: fade-in-up 0.3s ease-out;
//   }
  
//   .animate-scale-in {
//     animation: scale-in 0.3s ease-out;
//   }
// `}</style>
// </div>
// );
// }

// export default UserManagement;
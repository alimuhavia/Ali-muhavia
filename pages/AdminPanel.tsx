import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { Student, StudentStatus, FeeStatus } from '../types';
import { Plus, Search, Edit2, Download, Trash2, Upload } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { students, addStudent, updateStudent, resetDatabase } = useAcademy();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '', rollNumber: '', contactNumber: '', feeAmount: 0, status: StudentStatus.Active, photoUrl: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPhoto = formData.photoUrl || `https://picsum.photos/200/200?random=${Date.now()}`;
    
    if (editingId) {
      updateStudent(editingId, { ...formData, photoUrl: finalPhoto });
    } else {
      addStudent({
        id: Date.now().toString(),
        joinDate: new Date().toISOString().split('T')[0],
        feeStatus: FeeStatus.Pending,
        lastPaymentDate: '',
        attendanceRate: 100,
        ...formData,
        photoUrl: finalPhoto
      } as Student);
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', rollNumber: '', contactNumber: '', feeAmount: 0, status: StudentStatus.Active, photoUrl: '' });
  };

  const handleReset = () => {
    if (window.confirm("WARNING: This will permanently delete all student and attendance data from the database. Are you sure?")) {
        resetDatabase();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // Resize if needed, for now just taking raw base64
                // In production, we'd resize this on a canvas to avoid 5MB limit issues
                setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-gray-800">Student Administration</h2>
           <p className="text-gray-500">Manage enrollments, statuses, and profiles</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={handleReset}
                className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
                <Trash2 size={18} />
                <span>Reset DB</span>
            </button>
            <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Download size={18} />
                <span>Export CSV</span>
            </button>
            <button 
                onClick={() => { setEditingId(null); setShowModal(true); setFormData({ name: '', rollNumber: '', contactNumber: '', feeAmount: 0, status: StudentStatus.Active, photoUrl: '' }); }}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
                <Plus size={18} />
                <span>Add Student</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
            <Search className="text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Search by name or roll number..." 
                className="bg-transparent border-none outline-none text-gray-700 w-full placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm font-medium uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Fee Status</th>
                        <th className="px-6 py-4">Attendance</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredStudents.length === 0 ? (
                         <tr>
                             <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                 No students found in database. Add a new student to get started.
                             </td>
                         </tr>
                    ) : (
                        filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <img src={student.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <div className="font-medium text-gray-900">{student.name}</div>
                                            <div className="text-xs text-gray-500">{student.rollNumber}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        student.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        student.status === 'Left' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        student.feeStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                        student.feeStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {student.feeStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${student.attendanceRate > 80 ? 'bg-green-500' : student.attendanceRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                style={{ width: `${student.attendanceRate}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-600">{student.attendanceRate}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {student.contactNumber}
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => {
                                            setEditingId(student.id);
                                            setFormData(student);
                                            setShowModal(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-500">
                             {formData.photoUrl ? (
                                 <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                             ) : (
                                 <Upload className="text-gray-400" size={24} />
                             )}
                             <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" 
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                        <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" 
                            value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" 
                            value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee Amount</label>
                        <input required type="number" className="w-full border border-gray-300 rounded-lg p-2" 
                            value={formData.feeAmount} onChange={e => setFormData({...formData, feeAmount: Number(e.target.value)})} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2"
                             value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as StudentStatus})}>
                            {Object.values(StudentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex space-x-3 mt-6">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
import React from 'react';
import { useAcademy } from '../context/AcademyContext';
import { FeeStatus } from '../types';
import { Send, CheckCircle, AlertTriangle } from 'lucide-react';

const Fees: React.FC = () => {
  const { students, updateStudent } = useAcademy();

  const handleSendReminder = (student: any) => {
    const msg = `Dear parent, a fee of $${student.feeAmount} is pending for ${student.name}. Please pay immediately.`;
    // Simulated WhatsApp Link
    window.open(`https://wa.me/${student.contactNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const markPaid = (id: string) => {
    updateStudent(id, { 
        feeStatus: FeeStatus.Paid, 
        lastPaymentDate: new Date().toISOString().split('T')[0] 
    });
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Fee Management</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {students.map(student => (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <img src={student.photoUrl} alt="" className="w-12 h-12 rounded-full" />
                    <div>
                        <h4 className="font-bold text-gray-800">{student.name}</h4>
                        <p className="text-sm text-gray-500">Last Payment: {student.lastPaymentDate || 'Never'}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <div className="text-center md:text-right">
                         <span className="block text-xs text-gray-500 uppercase font-semibold">Amount</span>
                         <span className="text-xl font-bold text-gray-800">${student.feeAmount}</span>
                    </div>

                    <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        student.feeStatus === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {student.feeStatus === 'Paid' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span className="font-bold">{student.feeStatus}</span>
                    </div>

                    <div className="flex space-x-2">
                        {student.feeStatus !== 'Paid' && (
                            <>
                                <button 
                                    onClick={() => handleSendReminder(student)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full border border-indigo-200 transition-colors"
                                    title="Send WhatsApp Reminder"
                                >
                                    <Send size={18} />
                                </button>
                                <button 
                                    onClick={() => markPaid(student.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                                >
                                    Mark Paid
                                </button>
                            </>
                        )}
                        {student.feeStatus === 'Paid' && (
                            <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                Paid
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Fees;
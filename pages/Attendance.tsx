import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { analyzeSecuritySnapshot } from '../services/geminiService';
import { UserCheck, RefreshCw, Eye, Search, Check, UserPlus, X, Camera } from 'lucide-react';
import { Student, StudentStatus, FeeStatus } from '../types';

const Attendance: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { students, recordAttendance, attendanceLogs, addStudent } = useAcademy();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastDetected, setLastDetected] = useState<Student | null>(null);
  const [detectionMessage, setDetectionMessage] = useState<string>("");
  const [securityAnalysis, setSecurityAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Manual Entry State
  const [manualInput, setManualInput] = useState("");

  // Quick Register State
  const [regForm, setRegForm] = useState({ name: '', rollNumber: '', contact: '' });
  const [regPhoto, setRegPhoto] = useState<string | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // alert("Could not access camera. Please check permissions.");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Simulate AI Face Recognition
  const simulateDetection = useCallback(() => {
    if (!isCameraActive) return;

    setDetectionMessage("Scanning face...");
    
    // Random simulation delay
    setTimeout(() => {
      // 30% chance to detect someone IF there are students
      const random = Math.random();
      if (random > 0.6 && students.length > 0) {
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        setLastDetected(randomStudent);
        setDetectionMessage(`Match Found: ${randomStudent.name} (${randomStudent.rollNumber})`);
        
        // Auto-record attendance
        const now = new Date();
        const hour = now.getHours();
        const type = hour < 12 ? 'ENTRY' : 'EXIT';
        const isLate = type === 'ENTRY' && hour > 9;
        const isEarly = type === 'EXIT' && hour < 15;

        recordAttendance({
          id: Date.now().toString(),
          studentId: randomStudent.id,
          studentName: randomStudent.name,
          timestamp: now.toISOString(),
          type,
          isLate,
          isEarlyExit: isEarly
        });

      } else {
        setDetectionMessage("No match found in database.");
      }
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive, students]);

  const captureAndAnalyze = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsAnalyzing(true);
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const imageBase64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
        const analysis = await analyzeSecuritySnapshot(imageBase64);
        setSecurityAnalysis(analysis);
      }
      setIsAnalyzing(false);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // Create a 300x300 square crop
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const vid = videoRef.current;
        // Calculate center crop
        const minDim = Math.min(vid.videoWidth, vid.videoHeight);
        const startX = (vid.videoWidth - minDim) / 2;
        const startY = (vid.videoHeight - minDim) / 2;
        
        ctx.drawImage(vid, startX, startY, minDim, minDim, 0, 0, 300, 300);
        setRegPhoto(canvas.toDataURL('image/jpeg', 0.8));
      }
    }
  };

  const handleManualEntry = (type: 'ENTRY' | 'EXIT') => {
    const student = students.find(s => 
        s.name.toLowerCase().includes(manualInput.toLowerCase()) || 
        s.rollNumber.toLowerCase() === manualInput.toLowerCase()
    );

    if (student) {
        const now = new Date();
        const isLate = type === 'ENTRY' && now.getHours() > 9;
        const isEarly = type === 'EXIT' && now.getHours() < 15;

        recordAttendance({
            id: Date.now().toString(),
            studentId: student.id,
            studentName: student.name,
            timestamp: now.toISOString(),
            type,
            isLate,
            isEarlyExit: isEarly
        });
        setLastDetected(student);
        setDetectionMessage(`Manual Log: ${student.name} marked ${type}`);
        setManualInput("");
    } else {
        alert("Student not found! Please check name or roll number.");
    }
  };

  const handleQuickRegister = () => {
    if (!regForm.name || !regForm.rollNumber) {
        alert("Name and Roll Number are required");
        return;
    }

    const newStudent: Student = {
        id: Date.now().toString(),
        name: regForm.name,
        rollNumber: regForm.rollNumber,
        contactNumber: regForm.contact || 'N/A',
        // Use captured photo or fallback to random
        photoUrl: regPhoto || `https://picsum.photos/200/200?random=${Date.now()}`,
        status: StudentStatus.Active,
        joinDate: new Date().toISOString().split('T')[0],
        feeStatus: FeeStatus.Pending,
        lastPaymentDate: '',
        feeAmount: 500,
        attendanceRate: 100
    };

    addStudent(newStudent);
    
    // Auto mark attendance for the new student
    const now = new Date();
    recordAttendance({
        id: Date.now().toString(),
        studentId: newStudent.id,
        studentName: newStudent.name,
        timestamp: now.toISOString(),
        type: 'ENTRY',
        isLate: false,
    });

    setLastDetected(newStudent);
    setDetectionMessage(`Registered & Logged In: ${newStudent.name}`);
    setRegForm({ name: '', rollNumber: '', contact: '' });
    setRegPhoto(null);
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Smart Attendance</h2>
          <p className="text-gray-500">AI-Powered Face Recognition & Entry Logging</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={simulateDetection}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
                <RefreshCw size={18} />
                <span>Simulate AI Scan</span>
            </button>
             <button 
                onClick={captureAndAnalyze}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
                <Eye size={18} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Security Scan (Gemini)'}</span>
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Camera Feed */}
        <div className="lg:col-span-2 bg-black rounded-xl overflow-hidden relative shadow-2xl flex flex-col">
           <div className="relative flex-1 bg-gray-900 flex items-center justify-center">
             {!isCameraActive && <p className="text-gray-500">Camera Off (Check Permissions)</p>}
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               className="w-full h-full object-cover"
             />
             <canvas ref={canvasRef} width="640" height="480" className="hidden" />
             
             {/* Student Details Overlay */}
             {lastDetected && (
                <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-left-4 duration-300 max-w-xs md:max-w-sm">
                    <button 
                        onClick={() => setLastDetected(null)}
                        className="absolute top-3 right-3 p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                    >
                        <X size={14} />
                    </button>
                    
                    <div className="flex items-start space-x-4">
                        <div className="relative">
                            <img 
                                src={lastDetected.photoUrl} 
                                alt={lastDetected.name} 
                                className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100 shadow-md"
                            />
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                <Check size={10} className="text-white" />
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{lastDetected.name}</h3>
                            <p className="text-sm text-gray-500 font-medium mb-2">ID: {lastDetected.rollNumber}</p>
                            
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs bg-gray-50 p-1.5 rounded-lg">
                                    <span className="text-gray-500">Status</span>
                                    <span className={`font-bold ${lastDetected.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                        {lastDetected.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs bg-gray-50 p-1.5 rounded-lg">
                                    <span className="text-gray-500">Fees</span>
                                    <span className={`font-bold ${lastDetected.feeStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                                        {lastDetected.feeStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-mono text-gray-400">
                            {new Date().toLocaleTimeString()}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            LOGGED ENTRY
                        </span>
                    </div>
                </div>
             )}

             {/* Live Indicator */}
             <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>LIVE FEED</span>
             </div>
             
             {/* System Status Log */}
             <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-4 rounded-lg backdrop-blur-sm text-white border border-gray-700">
                <p className="font-mono text-green-400 text-sm mb-1">> System Status: ONLINE</p>
                <p className="font-mono text-sm">> {detectionMessage || "Waiting for movement..."}</p>
                {securityAnalysis && <p className="font-mono text-xs text-yellow-300 mt-1">> Security Alert: {securityAnalysis}</p>}
             </div>
           </div>
        </div>

        {/* Live Logs & Controls */}
        <div className="flex flex-col space-y-4">
           {/* Quick Register Card */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-200">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-indigo-900 flex items-center">
                        <UserPlus size={18} className="mr-2" />
                        Quick Register
                    </h4>
                    <span className="text-xs text-indigo-500 font-medium">New Student</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center">
                            {regPhoto ? (
                                <img src={regPhoto} alt="Captured" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="text-gray-400" size={24} />
                            )}
                        </div>
                        <button 
                            onClick={takeSnapshot}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                            {regPhoto ? 'Retake Photo' : 'Capture Face'}
                        </button>
                    </div>

                    <input
                        className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Full Name"
                        value={regForm.name}
                        onChange={e => setRegForm({...regForm, name: e.target.value})}
                    />
                    <div className="flex gap-2">
                        <input
                            className="w-1/2 border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Roll No"
                            value={regForm.rollNumber}
                            onChange={e => setRegForm({...regForm, rollNumber: e.target.value})}
                        />
                        <input
                            className="w-1/2 border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Contact"
                            value={regForm.contact}
                            onChange={e => setRegForm({...regForm, contact: e.target.value})}
                        />
                    </div>
                    <button
                        onClick={handleQuickRegister}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Register & Mark Present
                    </button>
                </div>
           </div>

          {/* Manual Entry Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
             <h4 className="font-semibold text-gray-700 mb-3 flex items-center text-sm">
                <UserCheck size={16} className="mr-2 text-gray-500"/> 
                Manual Attendance (Existing)
             </h4>
             <div className="flex flex-col space-y-3">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search Name or Roll No..." 
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                    />
                    <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleManualEntry('ENTRY')}
                        className="flex-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 py-1.5 rounded-lg text-xs font-bold flex justify-center items-center"
                    >
                        Mark Entry
                    </button>
                    <button 
                         onClick={() => handleManualEntry('EXIT')}
                        className="flex-1 bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 py-1.5 rounded-lg text-xs font-bold flex justify-center items-center"
                    >
                        Mark Exit
                    </button>
                </div>
             </div>
          </div>

          {/* Recent Log List */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 flex-1 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100 font-semibold text-gray-700 text-sm">Recent Activity</div>
            <div className="overflow-y-auto p-3 space-y-3 max-h-60">
               {attendanceLogs.length === 0 ? (
                 <p className="text-gray-400 text-xs text-center py-4">No activity yet. Register a student.</p>
               ) : (
                 attendanceLogs.slice(0, 8).map(log => (
                   <div key={log.id} className="flex items-center justify-between text-sm">
                       <div className="flex items-center space-x-2">
                           <div className={`w-2 h-2 rounded-full ${log.type === 'ENTRY' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                           <span className="font-medium text-gray-700 truncate max-w-[120px]">{log.studentName}</span>
                       </div>
                       <div className="flex flex-col items-end">
                            <span className="text-gray-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className={`text-[9px] font-bold ${log.type === 'ENTRY' ? 'text-green-600' : 'text-orange-600'}`}>
                                {log.type}
                            </span>
                       </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
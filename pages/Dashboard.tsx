
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Upload, Target, Zap, Crosshair, BarChart2, Shield, Folder, Trash2, Copy, Search, FileText, ArrowRight, X, Download, ChevronDown, ChevronRight, Briefcase, FileInput } from 'lucide-react';
import { getResumes, deleteResume, duplicateResume, createResume } from '../services/storage';
import { parseResumeFromText } from '../services/gemini';
import { downloadDocx } from '../services/docxGenerator';
import { extractTextFromFile } from '../services/fileExtraction';
import { ResumeData } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [modalMode, setModalMode] = useState<'none' | 'optimize' | 'transition' | 'create_role'>('none');
  const [transitionTarget, setTransitionTarget] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [user]); // Reload when user auth state changes (Login/Logout)

  const loadData = async () => {
    setIsLoading(true);
    const fetchedResumes = await getResumes();
    setResumes(fetchedResumes);
    
    // Auto-expand all folders initially
    const folders: Record<string, boolean> = {};
    fetchedResumes.forEach(r => {
        folders[r.folder || 'General'] = true;
    });
    setExpandedFolders(prev => ({...folders, ...prev}));
    
    setIsLoading(false);
  };

  const toggleFolder = (folder: string) => {
      setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handleCreateResumeClick = () => {
      setNewRoleName('');
      setModalMode('create_role');
  };

  const confirmCreateResume = async () => {
    const role = newRoleName.trim() || 'General';
    const newResume = await createResume(role);
    navigate(`/editor/${newResume.id}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // CRITICAL: Stop navigation to editor
    if (window.confirm('Destroy this record? This cannot be undone.')) {
      await deleteResume(id);
      await loadData();
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // CRITICAL: Stop navigation to editor
    const newResume = await duplicateResume(id);
    if (newResume) {
        await loadData();
        // Optional: Provide feedback
        // alert(`Duplicated: ${newResume.title}`);
    }
  };

  const handleDownload = async (resume: ResumeData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // CRITICAL: Stop navigation to editor
    await downloadDocx(resume);
  };

  const handleSelectResumeForAction = (resumeId: string) => {
      if (modalMode === 'optimize') {
          navigate(`/editor/${resumeId}?action=optimize`);
      } else if (modalMode === 'transition') {
          if (!transitionTarget.trim()) {
              alert("Please enter a target career.");
              return;
          }
          navigate(`/editor/${resumeId}?action=transition&target=${encodeURIComponent(transitionTarget)}`);
      }
      setModalMode('none');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      try {
        const text = await extractTextFromFile(file);
        if (!text || text.length < 10) throw new Error("File empty or unreadable.");
        
        const parsedData = await parseResumeFromText(text);
        
        if (parsedData) {
            const newResume = await createResume('Imported');
            const { saveResume } = await import('../services/storage');
            const fullResume = { ...newResume, ...parsedData };
            await saveResume(fullResume);
            navigate(`/editor/${newResume.id}?action=analyze_new`);
        } else {
             throw new Error("AI Parsing Failed. Please try again.");
        }

      } catch (error) {
        console.error(error);
        alert("Upload Failed. The AI mainframe is currently experiencing high traffic or network interruptions. Please try again.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  // Group resumes by folder/role
  const groupedResumes = resumes.reduce((acc, resume) => {
      const folder = resume.folder || 'General';
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(resume);
      return acc;
  }, {} as Record<string, ResumeData[]>);

  // Mock Stats
  const targetCount = resumes.length * 3 + 12;
  const fitScore = resumes.length > 0 ? 78 : 0;

  return (
    <div className="bg-black text-[#DCDFD5] h-screen flex font-sans overflow-hidden relative">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[260px] bg-[#000000] border-r border-[#1a1a1a] p-6 flex flex-col shrink-0 z-20">
        <div className="mb-10">
          <div className="text-xl font-bold text-[#FFBF00] flex items-center gap-2">
            <Shield size={24} className="text-[#FFBF00]" />
            HydraHunt
          </div>
          <div className="text-xs text-gray-500 mt-1 font-mono tracking-wide">JOB HUNTING IS DEAD.</div>
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          <button type="button" onClick={handleCreateResumeClick} className="py-3 px-4 rounded bg-[#0000FF] text-white font-bold text-left flex items-center gap-3 hover:shadow-[0_0_15px_#0000FF] transition-all group">
            <Zap size={18} className="group-hover:text-[#00FFFF] transition-colors"/> 
            Unleash Hunt Mode
          </button>

          <button type="button" onClick={() => setModalMode('optimize')} className="py-3 px-4 rounded bg-[#111] hover:bg-[#1a1a1a] text-left flex items-center gap-3 text-gray-300 hover:text-white transition-all border border-transparent hover:border-[#333]">
            <Target size={18} /> Optimize My Strike
          </button>

          <button type="button" onClick={() => setModalMode('transition')} className="py-3 px-4 rounded bg-[#111] hover:bg-[#1a1a1a] text-left flex items-center gap-3 text-gray-300 hover:text-white transition-all border border-transparent hover:border-[#333]">
            <Crosshair size={18} /> Career Transition
          </button>

          <Link to="/converter" className="py-3 px-4 rounded bg-[#111] hover:bg-[#1a1a1a] text-left flex items-center gap-3 text-gray-300 hover:text-white transition-all border border-transparent hover:border-[#333]">
            <FileInput size={18} /> File Converter
          </Link>
          
           <div className="mt-8 border-t border-[#1a1a1a] pt-4">
               <div className="text-xs font-bold text-gray-500 mb-2 uppercase">System Links</div>
               <Link to="/" className="block py-2 text-sm text-gray-400 hover:text-[#00FFFF]">Mainframe (Home)</Link>
               <Link to="/pricing" className="block py-2 text-sm text-gray-400 hover:text-[#FF00FF]">Upgrade Clearance</Link>
           </div>
        </nav>

        <div className="mt-auto text-xs text-gray-600 font-mono">
          VIBE CODING v2.0 <br/>
          Logged in as: <span className="text-[#00FFFF]">{user ? user.name : 'Guest'}</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
         </div>

        {/* TOP BAR */}
        <header className="h-[64px] border-b border-[#1a1a1a] flex items-center px-8 justify-between bg-black/50 backdrop-blur-sm z-10 shrink-0">
          <div className="text-sm font-mono">
            STATUS: <span className="text-[#BEF754] animate-pulse">HUNT READY</span>
          </div>
          <div className="text-sm text-gray-400 font-mono">
            TARGETS FOUND: <span className="text-[#00FFFF] font-bold text-lg ml-2">{targetCount}</span>
          </div>
        </header>

        {/* CORE WORK AREA */}
        <section className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto h-full">

            {/* PRIMARY PANEL */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                {/* UPLOAD ZONE */}
                <div className="bg-[#0b0b0b] rounded-xl p-8 border border-[#1a1a1a] shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FFBF00]"></div>
                    <h2 className="text-2xl font-bold mb-2 text-white font-['Space_Grotesk']">Resume Forge</h2>
                    <p className="text-sm text-gray-400 mb-6 font-mono">Give me your messy docs. I’ll handle the hunt.</p>

                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#333] rounded-lg p-10 text-center mb-6 hover:border-[#FF00FF] hover:bg-[#FF00FF]/5 transition-all cursor-pointer group-hover:shadow-[0_0_20px_rgba(255,0,255,0.1)]"
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt" />
                        <Upload size={40} className="mx-auto text-[#333] mb-4 group-hover:text-[#FF00FF] transition-colors" />
                        <p className="text-sm mb-2 text-gray-300 font-bold">{isUploading ? 'PARSING DATA...' : 'Drop PDFs, DOCX, or TXT here'}</p>
                        <Button type="button" className="mt-4 bg-[#FF00FF] text-white border-[#FF00FF] hover:bg-white hover:text-black">
                            {isUploading ? 'PROCESSING...' : 'UPLOAD CHAOS'}
                        </Button>
                    </div>

                    <Button type="button" fullWidth className="py-4 bg-[#FFBF00] text-black rounded-lg font-black text-xl border-[#FFBF00] hover:bg-white hover:border-white shadow-[0_0_15px_rgba(255,191,0,0.3)]" onClick={() => setModalMode('optimize')}>
                        OPTIMIZE MY STRIKE
                    </Button>
                </div>

                {/* ROLE-BASED RESUME LIST */}
                <div className="bg-[#0b0b0b] rounded-xl border border-[#1a1a1a] flex-1 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center bg-black">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Weapons (By Role)</h3>
                        <span className="text-xs text-[#00FFFF]">{resumes.length} TOTAL</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                        {isLoading ? (
                            <div className="text-center py-10 text-gray-500 animate-pulse">SCANNING DATABASE...</div>
                        ) : resumes.length === 0 ? (
                            <div className="text-center py-10 text-gray-600">
                                <div>NO WEAPONS FOUND.</div>
                                <div className="text-xs mt-2 text-gray-700">Initiate forge to create your first role-specific resume.</div>
                            </div>
                        ) : (
                            Object.entries(groupedResumes).map(([folder, items]: [string, ResumeData[]]) => (
                                <div key={folder} className="border border-[#222] rounded overflow-hidden bg-[#111]">
                                    {/* Folder Header */}
                                    <div 
                                        className="p-3 bg-[#151515] flex justify-between items-center cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                                        onClick={() => toggleFolder(folder)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Folder size={16} className="text-[#BEF754]" />
                                            <span className="font-bold text-gray-300">{folder}</span>
                                            <span className="text-xs bg-[#222] text-gray-500 px-2 py-0.5 rounded-full">{items.length}</span>
                                        </div>
                                        {expandedFolders[folder] ? <ChevronDown size={16} className="text-gray-500"/> : <ChevronRight size={16} className="text-gray-500"/>}
                                    </div>

                                    {/* Folder Content */}
                                    {expandedFolders[folder] && (
                                        <div className="p-2 space-y-1 bg-[#0b0b0b] border-t border-[#222]">
                                            {items.map(resume => (
                                                <div 
                                                    key={resume.id} 
                                                    onClick={() => navigate(`/editor/${resume.id}`)} 
                                                    className="group relative flex items-center justify-between p-3 rounded hover:bg-[#1a1a1a] border border-transparent hover:border-[#00FFFF]/30 cursor-pointer transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-gray-600 group-hover:text-[#00FFFF]">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-gray-200 group-hover:text-white">{resume.title}</div>
                                                            <div className="text-[10px] text-gray-600">{new Date(resume.updatedAt || Date.now()).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* ACTION BUTTONS: Increased padding, robust propagation stopping, better visibility */}
                                                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                                                        <button 
                                                          type="button" 
                                                          onClick={(e) => handleDownload(resume, e)} 
                                                          className="p-2 bg-[#222] hover:bg-[#BEF754] text-gray-400 hover:text-black rounded border border-[#333]" 
                                                          title="Download DOCX"
                                                        >
                                                          <Download size={16}/>
                                                        </button>
                                                        <button 
                                                          type="button" 
                                                          onClick={(e) => handleDuplicate(resume.id, e)} 
                                                          className="p-2 bg-[#222] hover:bg-white text-gray-400 hover:text-black rounded border border-[#333]" 
                                                          title="Duplicate"
                                                        >
                                                          <Copy size={16}/>
                                                        </button>
                                                        <button 
                                                          type="button" 
                                                          onClick={(e) => handleDelete(resume.id, e)} 
                                                          className="p-2 bg-[#222] hover:bg-[#FF00FF] text-gray-400 hover:text-white rounded border border-[#333]"
                                                          title="Delete"
                                                        >
                                                          <Trash2 size={16}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL (ANALYSIS) */}
            <div className="col-span-12 lg:col-span-5 bg-[#0b0b0b] rounded-xl p-8 border border-[#1a1a1a] flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#0000FF] blur-[80px] opacity-20"></div>
                <h3 className="text-md font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <BarChart2 size={16} /> Strike Analysis
                </h3>
                <div className="mb-8 text-center relative py-8 border-y border-[#1a1a1a] bg-black/20">
                    <div className="text-sm text-gray-500 mb-2 font-mono">RESUME FIT SCORE</div>
                    <div className={`text-6xl font-black ${fitScore > 50 ? 'text-[#00FFFF]' : 'text-gray-600'}`}>{fitScore}%</div>
                    <div className="text-xs text-[#BEF754] mt-2 font-bold animate-pulse">OPTIMIZATION RECOMMENDED</div>
                </div>
                <div className="flex-1">
                   <h4 className="text-sm font-bold text-white mb-4">TACTICAL FEEDBACK</h4>
                   <ul className="space-y-4 text-sm text-gray-400">
                       <li className="flex gap-3">
                           <span className="text-[#BEF754]">•</span>
                           <span>Experience timeline aligned with sector standards.</span>
                       </li>
                       <li className="flex gap-3">
                           <span className="text-[#FF00FF]">•</span>
                           <span>Skills section lacks keyword density for ATS.</span>
                       </li>
                       <li className="flex gap-3">
                           <span className="text-[#00FFFF]">•</span>
                           <span>Summary format is optimal for human scanners.</span>
                       </li>
                   </ul>
                </div>
                <button 
                  type="button"
                  onClick={() => setModalMode('optimize')}
                  className="mt-8 w-full py-3 bg-[#0000FF] rounded-lg text-white font-bold text-sm hover:shadow-[0_0_20px_#0000FF] transition-all border border-[#0000FF] hover:bg-[#0000FF]/80"
                >
                  APPLY SUGGESTED CHANGES
                </button>
            </div>
          </div>
        </section>

        {modalMode !== 'none' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
           <div className="bg-[#111] max-w-lg w-full border-2 border-[#BEF754] shadow-[0_0_50px_rgba(190,247,84,0.2)] relative flex flex-col max-h-[80vh]">
              <div className="p-6 bg-[#BEF754]/10 border-b border-[#333] flex justify-between items-center">
                 <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                   {modalMode === 'optimize' ? <Target size={24} className="text-[#BEF754]"/> : 
                    modalMode === 'transition' ? <Crosshair size={24} className="text-[#BEF754]"/> :
                    <Zap size={24} className="text-[#BEF754]"/>
                   }
                   {modalMode === 'optimize' ? 'Select Weapon to Optimize' : 
                    modalMode === 'transition' ? 'Career Transition Protocol' :
                    'Initiate New Hunt'
                   }
                 </h3>
                 <button onClick={() => setModalMode('none')} className="text-gray-400 hover:text-white"><X size={24}/></button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                  
                  {/* CREATE ROLE MODAL */}
                  {modalMode === 'create_role' && (
                      <div className="space-y-6">
                          <p className="text-gray-400">Define the Target Role for this resume. This groups your weapons for specific hunts.</p>
                          <Input 
                              label="TARGET ROLE / FOLDER"
                              placeholder="e.g. Frontend Developer, Project Manager"
                              value={newRoleName}
                              onChange={(e) => setNewRoleName(e.target.value)}
                              autoFocus
                          />
                          <Button fullWidth onClick={confirmCreateResume} className="bg-[#0000FF] text-white border-[#0000FF] hover:bg-white hover:text-black">
                              CONFIRM TARGET
                          </Button>
                      </div>
                  )}

                  {/* TRANSITION MODAL */}
                  {modalMode === 'transition' && (
                      <div className="mb-6">
                          <label className="text-[#00FFFF] font-bold text-sm mb-2 block">ENTER TARGET CAREER</label>
                          <Input 
                              placeholder="e.g. Cybersecurity Analyst, Product Manager..." 
                              value={transitionTarget} 
                              onChange={(e) => setTransitionTarget(e.target.value)} 
                              autoFocus
                          />
                          <p className="text-xs text-gray-500 mt-2">Hydra will map the gap between the selected resume and this target.</p>
                      </div>
                  )}

                  {/* SELECT EXISTING RESUME LIST */}
                  {modalMode !== 'create_role' && (
                      <div className="space-y-3">
                          <p className="text-sm text-gray-400 uppercase font-bold mb-2">Select Base Resume:</p>
                          {resumes.length === 0 ? (
                             <div className="text-center py-8 text-gray-500">No resumes found. Create one first.</div>
                          ) : (
                              resumes.map(resume => (
                                  <div 
                                    key={resume.id} 
                                    onClick={() => handleSelectResumeForAction(resume.id)}
                                    className="flex items-center justify-between p-4 bg-[#000] border border-[#333] hover:border-[#BEF754] hover:bg-[#BEF754]/5 cursor-pointer transition-all group"
                                  >
                                      <div className="flex items-center gap-3">
                                          <FileText size={18} className="text-gray-500 group-hover:text-[#BEF754]"/>
                                          <div>
                                              <div className="font-bold text-gray-200 group-hover:text-white">{resume.title}</div>
                                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                                  <Folder size={10} /> {resume.folder || 'General'}
                                              </div>
                                          </div>
                                      </div>
                                      <ArrowRight size={16} className="text-gray-600 group-hover:text-[#BEF754] group-hover:translate-x-1 transition-transform"/>
                                  </div>
                              ))
                          )}
                      </div>
                  )}
              </div>
           </div>
        </div>
      ) : null}
      </main>
    </div>
  );
};

export default Dashboard;

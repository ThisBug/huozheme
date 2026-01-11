import React from 'react';
import { useNavigate } from 'react-router-dom';

const Scanning: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-medical-dark font-display text-white antialiased flex flex-col h-screen overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none medical-grid z-0 opacity-20"></div>
      
      <header className="relative z-10 flex items-center p-6 justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-primary/60 tracking-[0.4em] uppercase font-bold">终端发现</span>
          <div className="h-px w-12 bg-primary/30"></div>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center overflow-hidden">
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Radar Circles */}
          <div className="absolute border border-primary/20 rounded-full w-full h-full animate-[pulse_3s_ease-out_infinite] opacity-50"></div>
          <div className="absolute border border-primary/20 rounded-full w-full h-full animate-[pulse_3s_ease-out_infinite_1s] opacity-50"></div>
          
          <div className="absolute border border-primary/10 rounded-full w-[80%] h-[80%]"></div>
          <div className="absolute border border-primary/10 rounded-full w-[60%] h-[60%]"></div>
          <div className="absolute border border-primary/10 rounded-full w-[40%] h-[40%]"></div>
          <div className="absolute border border-primary/20 rounded-full w-[20%] h-[20%]"></div>

          {/* Center Icon */}
          <div className="relative z-20 flex items-center justify-center">
            <div className="size-16 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse">radar</span>
            </div>
          </div>

          {/* Blips */}
          <div className="absolute top-[15%] right-[20%] flex flex-col items-center animate-bounce duration-[2000ms]">
             <span className="material-symbols-outlined text-primary text-xl drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]">watch</span>
             <span className="text-[8px] text-primary font-mono mt-1">UNKNOWN_WATCH</span>
          </div>

          <div className="absolute bottom-[25%] left-[15%] flex flex-col items-center animate-bounce duration-[3000ms]">
             <span className="material-symbols-outlined text-primary text-xl drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]">smartphone</span>
             <span className="text-[8px] text-primary font-mono mt-1">PHONE_ID_442</span>
          </div>
        </div>

        <div className="mt-12 text-center px-6">
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">正在扫描终端...</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="size-1 bg-primary rounded-full animate-bounce"></span>
            <p className="text-sm font-mono text-primary/70 uppercase tracking-widest">搜索蓝牙信号</p>
            <span className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
          </div>
        </div>
      </main>

      <footer className="p-8 pb-16 relative z-20 max-w-lg mx-auto w-full">
        <button 
            onClick={() => navigate(-1)}
            className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 border border-primary/40 bg-primary/5 text-primary text-base font-bold uppercase tracking-[0.2em] hover:bg-primary/10 active:scale-95 transition-all"
        >
          取消扫描
        </button>
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-[9px] text-primary/30 tracking-[0.4em] uppercase font-mono">状态: Searching_Protocol_v2</p>
        </div>
      </footer>
    </div>
  );
};

export default Scanning;
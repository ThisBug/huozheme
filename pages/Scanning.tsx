import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Device } from '../types';

const Scanning: React.FC = () => {
  const navigate = useNavigate();
  const { addDevice, devices } = useApp();
  const [scanning, setScanning] = useState(true);
  const [foundDevice, setFoundDevice] = useState<Partial<Device> | null>(null);

  useEffect(() => {
    // Simulate finding a device after 3 seconds
    const timer = setTimeout(() => {
        setScanning(false);
        // Randomly find a watch or phone, avoiding duplicates if possible (simple logic here)
        const type = Math.random() > 0.5 ? 'watch' : 'phone';
        const model = type === 'watch' ? 'Ultra 2' : '16 Pro Max';
        setFoundDevice({
            name: type === 'watch' ? 'Apple Watch Ultra' : 'iPhone 16 Pro',
            model: model,
            type: type,
            battery: 100
        });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleAdd = () => {
      if (foundDevice) {
          const newDevice: Device = {
              id: Date.now().toString(),
              name: foundDevice.name!,
              model: foundDevice.model!,
              lastSync: new Date().toISOString(),
              battery: foundDevice.battery!,
              type: foundDevice.type as 'watch' | 'phone',
              status: 'connected'
          };
          addDevice(newDevice);
          navigate('/devices');
      }
  };

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
          {scanning && (
            <>
                <div className="absolute border border-primary/20 rounded-full w-full h-full animate-[pulse_3s_ease-out_infinite] opacity-50"></div>
                <div className="absolute border border-primary/20 rounded-full w-full h-full animate-[pulse_3s_ease-out_infinite_1s] opacity-50"></div>
            </>
          )}
          
          <div className="absolute border border-primary/10 rounded-full w-[80%] h-[80%]"></div>
          <div className="absolute border border-primary/10 rounded-full w-[60%] h-[60%]"></div>
          <div className="absolute border border-primary/10 rounded-full w-[40%] h-[40%]"></div>
          <div className="absolute border border-primary/20 rounded-full w-[20%] h-[20%]"></div>

          {/* Center Icon */}
          <div className="relative z-20 flex items-center justify-center">
            <div className={`size-16 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(57,255,20,0.2)] ${scanning ? 'animate-pulse' : ''}`}>
              <span className="material-symbols-outlined text-primary text-3xl">{scanning ? 'radar' : 'check_circle'}</span>
            </div>
          </div>

          {/* Found Device Indicator */}
          {!scanning && foundDevice && (
               <div className="absolute top-[20%] flex flex-col items-center animate-fade-in">
                    <div className="bg-medical-panel border border-primary p-4 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.4)] flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-white">{foundDevice.type === 'watch' ? 'watch' : 'smartphone'}</span>
                        <p className="text-sm font-bold">{foundDevice.name}</p>
                        <p className="text-[9px] text-primary font-mono uppercase">信号极强</p>
                    </div>
               </div>
          )}
        </div>

        <div className="mt-12 text-center px-6 h-20">
            {scanning ? (
                <>
                    <h2 className="text-xl font-bold tracking-tight text-white mb-2">正在扫描终端...</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="size-1 bg-primary rounded-full animate-bounce"></span>
                        <p className="text-sm font-mono text-primary/70 uppercase tracking-widest">搜索蓝牙信号</p>
                        <span className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    </div>
                </>
            ) : foundDevice ? (
                <>
                    <h2 className="text-xl font-bold tracking-tight text-primary mb-2 neon-glow">发现新设备</h2>
                    <p className="text-sm font-mono text-slate-400">准备配对连接</p>
                </>
            ) : (
                <p className="text-slate-500">未发现设备</p>
            )}
        </div>
      </main>

      <footer className="p-8 pb-16 relative z-20 max-w-lg mx-auto w-full">
        {foundDevice && !scanning ? (
             <button 
                onClick={handleAdd}
                className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-primary text-black text-base font-bold uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] mb-4"
            >
             确认添加
            </button>
        ) : null}
        
        <button 
            onClick={() => navigate(-1)}
            className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 border border-primary/40 bg-primary/5 text-primary text-base font-bold uppercase tracking-[0.2em] hover:bg-primary/10 active:scale-95 transition-all"
        >
          {scanning ? '取消扫描' : '返回'}
        </button>
      </footer>
    </div>
  );
};

export default Scanning;
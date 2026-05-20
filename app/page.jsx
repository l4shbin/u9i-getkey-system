'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, KeyRound, ShieldAlert, Loader2, CheckCircle2, Clock, ScanFace } from 'lucide-react';

function KeySystemApp() {
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get('session');

  const [isBlocked, setIsBlocked] = useState(false);
  const [progress, setProgress] = useState({ t1: false, t2: false, t3: false });
  const [generatedKey, setGeneratedKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [activeTask, setActiveTask] = useState(null);
  const [taskStatus, setTaskStatus] = useState('idle'); 
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!sessionToken) setIsBlocked(true);
  }, [sessionToken]);

  useEffect(() => {
    if (taskStatus === 'counting' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (taskStatus === 'counting' && timeLeft === 0) {
      setTaskStatus('verify');
    }
  }, [timeLeft, taskStatus]);

  const startTaskTimer = async (taskNum, targetUrl) => {
    window.open(targetUrl, '_blank');
    setActiveTask(taskNum);
    setTaskStatus('counting');
    setTimeLeft(20);

    try {
      await fetch('/api/start-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken })
      });
    } catch {
      setIsBlocked(true);
    }
  };

  const verifyTaskCompletion = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskNumber: activeTask, sessionToken })
      });
      const data = await res.json();
      
      if (data.success) {
        setProgress(data.progress);
        setActiveTask(null);
        setTaskStatus('idle');
      } else {
        setIsBlocked(true);
      }
    } catch {
      setIsBlocked(true);
    }
    setLoading(false);
  };

  const claimSecurityKey = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedKey(data.key);
      } else {
        setIsBlocked(true);
      }
    } catch {
      setIsBlocked(true);
    }
    setLoading(false);
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-luxury-bg">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="w-full max-w-md bg-red-950/20 border border-red-500/30 p-8 rounded-2xl text-center"
        >
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold tracking-widest text-red-400 uppercase">Connection Terminated</h2>
          <p className="text-gray-400 text-sm mt-3">
            Invalid session, unauthorized reload, or bypass manipulation detected. Please generate a new link from the Roblox executor.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-luxury-bg">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-luxury-gold opacity-[0.04] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-luxury-dark opacity-[0.04] blur-[150px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-luxury-panel/90 backdrop-blur-2xl border border-luxury-gold/20 p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10"
      >
        <div className="text-center mb-8">
          <KeyRound className="w-10 h-10 text-luxury-gold mx-auto mb-3" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-luxury-gold font-bold">U9I Infrastructure</span>
          <h1 className="text-2xl font-light tracking-widest mt-1 text-white uppercase">Authentication</h1>
        </div>

        <div className="space-y-4 mb-8">
          {[1, 2, 3].map((num) => {
            const isCompleted = progress[`t${num}`];
            const isLocked = num === 2 ? !progress.t1 : num === 3 ? !progress.t2 : false;
            const isCurrentlyActive = activeTask === num;

            return (
              <motion.div key={num} className="w-full">
                <motion.button
                  whileHover={!isLocked && !isCurrentlyActive && !isCompleted ? { scale: 1.02 } : {}}
                  whileTap={!isLocked && !isCurrentlyActive && !isCompleted ? { scale: 0.98 } : {}}
                  disabled={isLocked || isCompleted || (activeTask !== null && !isCurrentlyActive) || taskStatus === 'verify'}
                  onClick={() => startTaskTimer(num, `https://your-linkvertise-or-task-${num}.com`)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                    isLocked ? 'opacity-30 cursor-not-allowed bg-black/40 border-transparent' :
                    isCompleted ? 'bg-luxury-gold/10 border-luxury-gold/50 text-luxury-gold' :
                    (isCurrentlyActive && taskStatus === 'counting') ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-light' :
                    (isCurrentlyActive && taskStatus === 'verify') ? 'bg-green-900/20 border-green-500/50 text-green-400' :
                    'bg-black/40 border-white/10 hover:border-luxury-gold/40 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4 text-xs tracking-widest uppercase font-medium">
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-luxury-gold" /> : 
                     isLocked ? <Lock className="w-5 h-5 text-gray-600" /> : 
                     (isCurrentlyActive && taskStatus === 'counting') ? <Clock className="w-5 h-5 text-luxury-gold animate-pulse" /> : 
                     (isCurrentlyActive && taskStatus === 'verify') ? <ScanFace className="w-5 h-5 text-green-400 animate-pulse" /> : 
                     <Unlock className="w-5 h-5 text-gray-400" />}
                    Gateway Node 0{num}
                  </div>
                  
                  <span className="text-[10px] font-mono font-bold tracking-widest">
                    {isLocked ? 'LOCKED' : 
                     isCompleted ? 'VERIFIED' : 
                     (isCurrentlyActive && taskStatus === 'counting') ? `WAIT ${timeLeft}s` : 
                     (isCurrentlyActive && taskStatus === 'verify') ? 'ACTION REQ' : 
                     'PROCEED'}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {isCurrentlyActive && taskStatus === 'verify' && (
                    <motion.button
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      onClick={verifyTaskCompletion}
                      disabled={loading}
                      className="w-full py-3 rounded-lg border border-green-500 text-green-400 text-xs font-bold tracking-[0.2em] uppercase hover:bg-green-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Click to Verify Task'}
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {!generatedKey ? (
            <motion.button
              key="generate-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              disabled={!progress.t3 || loading || activeTask !== null}
              onClick={claimSecurityKey}
              className={`w-full flex items-center justify-center py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-bold transition-all duration-500 ${
                progress.t3 
                  ? 'bg-luxury-gold hover:bg-luxury-light text-black shadow-[0_0_30px_rgba(212,175,55,0.3)]' 
                  : 'bg-white/5 border border-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Initialize Key Generation'}
            </motion.button>
          ) : (
            <motion.div
              key="key-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-5 bg-black/60 border border-luxury-gold/40 rounded-xl text-center shadow-inner"
            >
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Authorization Key Granted</p>
              <code className="text-sm font-mono text-luxury-gold block bg-black p-4 rounded-lg border border-white/5 select-all font-bold">
                {generatedKey}
              </code>
              <p className="text-[10px] text-red-400/80 mt-4 uppercase tracking-wider">Valid for 2 Hours</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function SecureGateway() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-luxury-bg flex items-center justify-center text-luxury-gold tracking-widest uppercase text-sm"><Loader2 className="animate-spin mr-3" /> Initializing Vault</div>}>
      <KeySystemApp />
    </Suspense>
  );
}

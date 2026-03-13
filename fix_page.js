const fs = require('fs');
let code = fs.readFileSync('app/biletlar/page.desktop.txt', 'utf8');

const importStatement = `\nimport { ArrowLeft, Settings, ClipboardList, ChevronRight } from 'lucide-react'\n`;
code = code.replace("import { apiFetch } from '@/lib/apiClient'", "import { apiFetch } from '@/lib/apiClient'" + importStatement);

const returnIndex = code.indexOf('  return (\n    <div className="biletlar-page min-h-screen');
if (returnIndex === -1) {
  console.log("Could not find return statement");
  process.exit(1);
}

const beforeReturn = code.substring(0, returnIndex);
const desktopReturn = code.substring(returnIndex + 11); // Skip `  return (\n` (11 chars)

const mobileCode = `  return (
    <>
      {/* ---------- MOBILE VIEW ---------- */}
      <div className="md:hidden biletlar-page min-h-screen bg-[#161c24] text-white font-display">
        <div className="min-h-screen px-4 pb-20 max-w-2xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between py-4 mb-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-[20px] font-bold text-white leading-none">Biletlar</h1>
            <button onClick={() => setShowSettings(true)} className="p-2 -mr-2 text-white hover:opacity-70 transition-opacity">
              <Settings className="w-6 h-6" />
            </button>
          </header>

          {/* Top Progress Card */}
          <div className="bg-[#212936] rounded-[24px] p-6 mb-5 flex items-center shadow-sm border border-[#313C50]">
            {/* Circular Progress */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center mr-5">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#161b24" strokeWidth="6" fill="none" />
                <circle
                  cx="50" cy="50" r="45" stroke="#2563eb" strokeWidth="6" fill="none"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (100 > 0 ? (283 * ozlashtirishPercent) / 100 : 0)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-2xl font-bold leading-none">{ozlashtirishPercent}</span>
                <span className="text-[10px]">%</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-white text-[16px] font-bold mb-3">Oʻrganish jarayoni</h3>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <div className="text-green-500 text-[22px] font-bold leading-none">{completedCount}</div>
                  <div className="text-[11px] text-[#9AA4B2] font-semibold mt-1">Yakunlandi</div>
                </div>
                <div>
                  <div className="text-[#9AA4B2] text-[22px] font-bold leading-none">{stats.totalTickets - completedCount}</div>
                  <div className="text-[11px] text-[#9AA4B2] font-semibold mt-1">Qoldi</div>
                </div>
              </div>
              
              {/* Horizontal steps */}
              <div className="flex gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={\`flex-1 rounded-full \${ozlashtirishPercent >= (i - 1) * 25 + 1 ? 'bg-blue-600' : 'bg-blue-900/40'}\`}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: totalTickets }, (_, i) => i + 1).map((num) => {
              const unlocked = isUnlocked(num)
              const result = ticketResult(num)
              const percent = result?.last?.percent ?? 0
              const qCount = settings?.questionCount || 10
              
              const isCompleted = result?.last?.correct != null
              const correctStr = result?.last?.correct || 0
              const wrongStr = (result?.last && result?.last?.total) ? result.last.total - result.last.correct : 0

              return (
                <div key={num} className="relative">
                  <Link 
                    href={unlocked ? \`/biletlar/\${num}\` : '#'} 
                    className={\`bg-[#212936] rounded-[20px] p-4 flex items-center border border-[#313C50] overflow-hidden \${!unlocked ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''}\`}
                  >
                    <div className="w-[46px] h-[46px] bg-[#313C50] rounded-full flex items-center justify-center mr-4 shrink-0">
                      <ClipboardList className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 pt-1 pb-2">
                      <div className="text-white font-bold text-[16px] mb-1">Bilet {num}</div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#9AA4B2] font-medium">{qCount} ta savol</span>
                        {isCompleted && (
                          <>
                            <span className="text-green-500 font-bold flex items-center gap-0.5">
                              <span className="text-[12px]">✓</span>{correctStr}
                            </span>
                            <span className="text-red-500 font-bold flex items-center gap-0.5">
                              <span className="text-[12px]">✗</span>{wrongStr}
                            </span>
                            <span className="bg-green-500 bg-opacity-20 text-green-500 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              {percent}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-2">
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                    
                    {/* Progress Line */}
                    {isCompleted && (
                      <div className="absolute bottom-[10px] left-[74px] right-[20%] h-[3px] bg-[#313C50] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: \`\${percent}%\` }}></div>
                      </div>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ---------- DESKTOP VIEW ---------- */}
`;

const desktopModified = desktopReturn
  .replace('<div className="biletlar-page', '<div className="hidden md:block biletlar-page')
  .replace('  )\n}', '    </>\n  )\n}');

const finalCode = beforeReturn + mobileCode + desktopModified;

fs.writeFileSync('app/biletlar/page.js', finalCode);
console.log("Fixed app/biletlar/page.js successfully");

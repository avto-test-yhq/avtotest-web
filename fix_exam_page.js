const fs = require('fs');
let code = fs.readFileSync('app/exam/page.js', 'utf8');

const returnRegex = /  return \(\s*<div className="h-screen flex flex-col/;
const returnMatch = code.match(returnRegex);

if (!returnMatch) {
  console.log("Could not find return statement");
  process.exit(1);
}

const beforeReturn = code.substring(0, returnMatch.index);
const desktopReturnBlock = code.substring(returnMatch.index + 11).replace(/  return \(\n/, '').replace(/}\n\n\nexport default function ExamPage/, ''); // rough extract

// Modals
const modalsRegex = /      <ExamSettingsModal[\s\S]*<\/div>\n}\n*$/;
const modalsMatch = code.match(modalsRegex);
let modals = '';
let desktopClean = code.substring(returnMatch.index + 11);
if (modalsMatch) {
  desktopClean = desktopClean.substring(0, modalsMatch.index - (returnMatch.index + 11));
  modals = modalsMatch[0].replace(/    <\/div>\n}\n*/, ''); // roughly
}

// Now we need to define the mobile block. Since the logic is slightly different (showFailModal, etc), 
// we'll just template literal the mobile design for `app/exam/page.js`.

const mobileBlock = `      {/* ---------- MOBILE VIEW ---------- */}
      <div className="md:hidden h-screen flex flex-col bg-slate-50 bg-[#161c24] text-white font-display overflow-hidden">
        {showFailModal && (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#1e2130] border border-rose-500/30 rounded-[24px] p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Wrong" className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-[22px] font-bold text-rose-500 mb-2">{t('exam.failedTitle')}</h2>
              <p className="text-[#9AA4B2] text-[15px] mb-6 leading-snug">
                {t('exam.failedDesc')}
              </p>
              
              <div className="bg-[#212936] rounded-xl p-4 mb-6 border border-[#313C50]">
                <div className="flex justify-between text-[15px] mb-3">
                  <span className="text-[#9AA4B2]">{t('exam.correctAnswers')}:</span>
                  <span className="text-green-500 font-bold">{stats.correct}</span>
                </div>
                <div className="flex justify-between text-[15px]">
                  <span className="text-[#9AA4B2]">{t('exam.errorsCount')}:</span>
                  <span className="text-red-500 font-bold">{stats.incorrect}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={restartExam}
                  className="w-full py-3.5 rounded-2xl bg-[#2563eb] text-white font-bold text-[16px] transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="Refresh" className="w-5 h-5" />
                  {t('exam.retryBtn')}
                </button>
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 rounded-2xl bg-[#212936] text-white font-bold text-[16px] transition-colors"
                >
                  {t('exam.backToHome')}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between py-4 px-4 shrink-0">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-white hover:opacity-70 transition-opacity -ml-2">
            <Icon name="ArrowLeft" className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center justify-center text-center">
             <h1 className="text-[18px] font-bold text-white leading-tight">Testlar</h1>
             <p className="text-[12px] text-[#9AA4B2] -mt-0.5">{currentIndex + 1}/{questions.length} • {displayTime}</p>
          </div>
          <button onClick={() => setShowSettingsModal(true)} className="p-2 -mr-2 text-white hover:opacity-70 transition-opacity">
            <Icon name="Save" className="opacity-0 w-6 h-6" />{/* Spacer */}
          </button>
        </header>

        {/* Question Area */}
        <div className="bg-[#212936] mx-4 rounded-[24px] p-5 shadow-sm border border-[#313C50] mb-3 relative overflow-visible shrink-0 min-h-[140px] flex flex-col items-center justify-center">
          <div className="absolute -top-4 -right-1 flex gap-2">
            <button
               onClick={toggleCurrentFavorite}
               className={\`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-[#313C50] \${isCurrentFavorite ? 'bg-amber-500 text-white' : 'bg-[#161c24] text-[#9AA4B2]'}\`}
            >
              <Icon name="Save" className="w-5 h-5" />
            </button>
          </div>
          {currentQuestion.image && currentQuestion.image.trim() !== '' && (
            <div className="w-[120px] h-[90px] bg-[#161c24] rounded-xl mb-3 flex items-center justify-center relative overflow-hidden shrink-0">
              <Image src={currentQuestion.image} alt="Question Image" fill className="object-contain" priority unoptimized={currentQuestion.image?.startsWith('http')} />
            </div>
          )}
          <h2 className="text-[17px] font-semibold text-center leading-snug w-full px-2">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options */}
        <main className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const selected = answers[currentQuestion.id] === idx;
              const isCorrect = opt.is_correct;
              const hasAnswer = typeof answers[currentQuestion.id] === 'number';

              let containerClass = "w-full text-left p-[18px] rounded-[20px] transition-all duration-200 border border-[#313C50] flex items-center "
              let textClass = "flex-1 text-[16px] leading-[1.3] pr-2 "

              if (hasAnswer || isFinished || showFailModal) {
                const showCorrectAnswer = settings?.showCorrect !== false;
                if (isCorrect && (selected || showCorrectAnswer)) {
                  containerClass += "bg-green-500/10 border-green-500/50"
                  textClass += "text-green-500 font-semibold"
                } else if (selected && !isCorrect) {
                  containerClass += "bg-red-500/10 border-red-500/50"
                  textClass += "text-red-500 font-semibold"
                } else {
                  containerClass += "bg-[#212936] opacity-60"
                  textClass += "text-[#9AA4B2]"
                }
              } else {
                if (selected) {
                  containerClass += "bg-blue-600/20 border-blue-500"
                  textClass += "text-white font-semibold"
                } else {
                  containerClass += "bg-[#212936]"
                  textClass += "text-[#E2E8F0]"
                }
              }

              const isDisabled = hasAnswer || isFinished || showFailModal;

              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(currentQuestion.id, idx)}
                  disabled={isDisabled}
                  className={\`\${containerClass} \${isDisabled ? 'cursor-default' : 'active:scale-[0.98]'}\`}
                >
                  <div className={textClass}>{opt.option}</div>
                  {hasAnswer && isCorrect && (selected || settings?.showCorrect !== false) && (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                       <span className="text-white text-[14px] font-bold">✓</span>
                    </div>
                  )}
                  {hasAnswer && selected && !isCorrect && (
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                       <span className="text-white text-[14px] font-bold">✗</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-5 space-y-3">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              disabled={showFailModal}
              className={\`w-full py-[14px] rounded-[20px] flex items-center justify-center gap-2 font-bold text-[15px] transition-all \${showExplanation ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-[#212936] text-amber-500 border border-[#313C50]'}\`}
            >
              <Icon name="Bulb" className="w-[18px] h-[18px]" />
              {showExplanation ? t('exam.hideExplanation') : t('exam.viewExplanation')}
            </button>
            
            {showExplanation && currentQuestion.explanation && (
              <div className="bg-[#212936] rounded-[20px] p-5 border border-[#313C50] animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-amber-500 text-[12px] font-bold uppercase tracking-wider mb-2">{t('exam.explanation')}</h4>
                <p className="text-[#E2E8F0] text-[14px] leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </main>

        {/* Bottom Bar: Timeline */}
        <footer className="bg-[#212936] border-t border-[#313C50] px-4 py-3 shrink-0 flex items-center justify-between pb-safe">
           <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || showFailModal}
            className="w-[46px] h-[46px] flex items-center justify-center rounded-[14px] bg-[#161c24] border border-[#313C50] text-white disabled:opacity-40"
          >
            <Icon name="ArrowLeft" className="w-[20px] h-[20px]" />
          </button>
          
          <div ref={scrollRef} className="flex-1 flex items-center gap-1.5 overflow-x-auto px-3 mx-2 no-scrollbar h-full">
            {questions.map((q, idx) => {
              const answerIdx = answers[q.id]
              const isAnswered = typeof answerIdx === 'number'
              const isCurrent = idx === currentIndex
              const isCorrect = isAnswered && q.options[answerIdx]?.is_correct

              let btnClass = "min-w-[40px] h-[40px] rounded-[12px] text-[15px] font-bold flex items-center justify-center transition-all flex-shrink-0 "

              if (isCurrent) {
                btnClass += "bg-[#2563eb] text-white"
              } else if (isAnswered) {
                if (isCorrect) {
                  btnClass += "bg-green-500 text-white"
                } else {
                  btnClass += "bg-red-500 text-white"
                }
              } else {
                btnClass += "bg-[#161c24] border border-[#313C50] text-[#9AA4B2]"
              }

              return (
                <button
                  key={q.id}
                  onClick={() => !showFailModal && setCurrentIndex(idx)}
                  disabled={showFailModal}
                  className={btnClass}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1 || showFailModal}
            className="w-[46px] h-[46px] flex items-center justify-center rounded-[14px] bg-[#161c24] border border-[#313C50] text-white disabled:opacity-40"
          >
            <Icon name="ArrowRight" className="w-[20px] h-[20px]" />
          </button>
        </footer>
      </div>
`;

const desktopModified = `      {/* ---------- DESKTOP VIEW ---------- */}
      <div className="hidden md:flex h-screen flex-col bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-white overflow-hidden font-sans">
${desktopClean.replace(/^    <div className="h-screen flex flex-col bg-slate-50 dark:bg-\[\#161821\] text-slate-900 dark:text-white overflow-hidden font-sans">/, '')}
      </div>`;


const finalReturn = `  return (
    <>
${mobileBlock}
${desktopModified}
${modals.replace('      <ExamSettingsModal', '      <ExamSettingsModal')}
    </>
  )
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1e2130] text-slate-400 flex items-center justify-center font-sans">Yuklanmoqda...</div>}>
      <ExamContent />
    </Suspense>
  )
}
`;

fs.writeFileSync('app/exam/page.js', beforeReturn + finalReturn);
console.log("Fixed app/exam/page.js successfully");

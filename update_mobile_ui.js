const fs = require('fs');

const biletFile = 'app/biletlar/[ticketId]/page.js';
const examFile = 'app/exam/page.js';

function applyMobileDesign(filePath, isExam) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Identify where the Mobile View starts
  const mobileStartRegex = /{\/\* ---------- MOBILE VIEW ---------- \*\/}/;
  const mobileStartMatch = content.match(mobileStartRegex);
  
  if (!mobileStartMatch) {
    console.log("No mobile view found in", filePath);
    return;
  }
  
  const desktopStartRegex = /{\/\* ---------- DESKTOP VIEW ---------- \*\/}/;
  const desktopStartMatch = content.match(desktopStartRegex);
  
  if (!desktopStartMatch) {
    console.log("No desktop view found in", filePath);
    return;
  }

  const beforeMobile = content.substring(0, mobileStartMatch.index);
  const afterMobile = content.substring(desktopStartMatch.index);

  // Define new mobile code
  const headerContent = isExam 
    ? `
            <div className="flex flex-col items-center justify-center text-center">
               <h1 className="text-[17px] font-bold text-white leading-tight">Testlar</h1>
               <p className="text-[12px] text-[#9AA4B2] -mt-0.5">{currentIndex + 1}/{questions.length} • {displayTime}</p>
            </div>
    `
    : `
            <h1 className="text-[17px] font-bold text-white leading-tight">Ticket {ticketId}</h1>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowFeedbackModal(true)} className="text-[#9AA4B2] hover:opacity-70 transition-opacity">
                <Icon name="Flag" className="w-[20px] h-[20px]" />
              </button>
              <div className="flex items-center gap-1.5 px-[10px] py-[6px] rounded-lg bg-[#212936] text-[#9AA4B2] text-[13px] font-medium border border-[#313C50]">
                <span className="font-mono text-white text-[14px]">⏱ {formatTime(timerTick)}</span>
              </div>
            </div>
    `;

  let newMobileCode = `      {/* ---------- MOBILE VIEW ---------- */}
      <div className="md:hidden h-screen flex flex-col bg-[#161c24] text-white font-display overflow-hidden">
`;

  if (isExam) {
    newMobileCode += `        {showFailModal && (
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
`;
  }

  newMobileCode += `        {/* Header */}
        <header className="flex items-center justify-between py-3 px-4 shrink-0 bg-[#1e2333] border-b border-[#2d3748]">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-white hover:opacity-70 transition-opacity">
              <Icon name="ArrowLeft" className="w-5 h-5" />
            </button>
${headerContent}
        </header>

        {/* Timeline */}
        <div className="bg-[#1e2333] border-b border-[#2d3748] px-4 py-3 shrink-0 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth" ref={scrollRef}>
          {questions.map((q, idx) => {
            const answerIdx = answers[q.id];
            const isAnswered = typeof answerIdx === 'number';
            const isCurrent = idx === currentIndex;
            const isCorrect = isAnswered && q.options[answerIdx]?.is_correct;

            let btnClass = "min-w-[40px] h-[40px] rounded-[10px] text-[15px] font-bold flex items-center justify-center shrink-0 transition-all ";

            if (isCurrent) {
              btnClass += "bg-[#2563eb] text-white";
            } else if (isAnswered) {
              if (isCorrect) {
                btnClass += "bg-green-500 text-white";
              } else {
                btnClass += "bg-red-500 text-white";
              }
            } else {
              btnClass += "bg-[#212836] text-[#94a3b8]";
            }

            return (
              <button
                key={q.id}
                onClick={() => ${isExam ? '!showFailModal && ' : ''}setCurrentIndex(idx)}
                ${isExam ? 'disabled={showFailModal}' : ''}
                className={btnClass}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-6 bg-[#111827]">
          {/* Question Card */}
          <div className="m-4 rounded-[16px] overflow-hidden bg-[#1e2532] border border-[#2d3748] shadow-sm flex flex-col">
            {currentQuestion.image && currentQuestion.image.trim() !== '' && (
              <div className="relative w-full aspect-[4/3] bg-[#161c24] shrink-0 border-b border-[#2d3748]">
                <Image 
                  src={currentQuestion.image} 
                  alt="Question Image" 
                  fill 
                  className="object-cover" 
                  priority 
                  unoptimized={currentQuestion.image?.startsWith('http')} 
                />
                <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </button>
              </div>
            )}
            <div className="p-4 flex items-start justify-between gap-4">
              <h2 className="text-[15px] font-medium text-white leading-[1.45] w-full">
                {currentQuestion.question}
              </h2>
              <button 
                onClick={toggleCurrentFavorite}
                className={\`shrink-0 mt-0.5 transition-colors \${isCurrentFavorite ? 'text-amber-500' : 'text-slate-400'}\`}
              >
                <Icon name="Save" className="w-[22px] h-[22px]" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="px-4 flex flex-col gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const selected = answers[currentQuestion.id] === idx;
              const isCorrect = opt.is_correct;
              const hasAnswer = typeof answers[currentQuestion.id] === 'number';

              let containerClass = "w-full bg-[#161c24] border border-[#2d3748] rounded-[14px] flex items-stretch overflow-hidden transition-all ";
              let prefixClass = "w-[46px] flex items-center justify-center shrink-0 border-r rounded-l-[13px] font-bold text-[14px] ";
              let textClass = "flex-1 py-3 px-3 text-left text-[14px] leading-[1.3] flex items-center justify-between ";

              if (hasAnswer || isFinished${isExam ? ' || showFailModal' : ''}) {
                const showCorrectAnswer = settings?.showCorrect !== false;
                if (isCorrect && (selected || showCorrectAnswer)) {
                  containerClass += "bg-green-500/10 border-green-500/40";
                  prefixClass += "bg-green-500/20 text-green-500 border-green-500/30";
                  textClass += "text-green-400";
                } else if (selected && !isCorrect) {
                  containerClass += "bg-red-500/10 border-red-500/40";
                  prefixClass += "bg-red-500/20 text-red-500 border-red-500/30";
                  textClass += "text-red-400";
                } else {
                  containerClass += "opacity-60";
                  prefixClass += "bg-[#1e2333] border-[#2d3748] text-slate-400";
                  textClass += "text-slate-400";
                }
              } else {
                if (selected) {
                  containerClass += "bg-blue-600/20 border-blue-500";
                  prefixClass += "bg-blue-600/30 text-blue-400 border-blue-500/50";
                  textClass += "text-white font-medium";
                } else {
                  prefixClass += "bg-[#1e2838] border-[#2d3748] text-[#94a3b8]";
                  textClass += "text-[#e2e8f0]";
                }
              }

              const isDisabled = hasAnswer || isFinished${isExam ? ' || showFailModal' : ''};

              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(currentQuestion.id, idx)}
                  disabled={isDisabled}
                  className={\`\${containerClass} \${isDisabled ? 'cursor-default' : 'active:scale-[0.98]'}\`}
                >
                  <div className={prefixClass}>F{idx + 1}</div>
                  <div className={textClass}>
                    <span>{opt.option}</span>
                    {hasAnswer && isCorrect && (selected || settings?.showCorrect !== false) && (
                      <Icon name="Check" className="w-[18px] h-[18px] text-green-500 ml-2 shrink-0" />
                    )}
                    {hasAnswer && selected && !isCorrect && (
                      <Icon name="Close" className="w-[18px] h-[18px] text-red-500 ml-2 shrink-0" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Explanation Button */}
          <div className="px-4 mt-5">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              disabled={${isExam ? 'showFailModal' : 'false'}}
              className={\`w-full py-[14px] rounded-[14px] flex items-center justify-center gap-2 font-bold text-[14px] transition-all \${showExplanation ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'bg-[#1e2532] text-[#60a5fa] border border-[#2d3748]'}\`}
            >
              <Icon name="Bulb" className="w-[18px] h-[18px]" />
              {showExplanation ? t('exam.hideExplanation') : t('exam.viewExplanation')}
            </button>
            
            {showExplanation && currentQuestion.explanation && (
              <div className="mt-3 bg-[#1e2532] rounded-[14px] p-4 border border-[#2d3748] animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-amber-500 text-[12px] font-bold uppercase tracking-wider mb-2">{t('exam.explanation')}</h4>
                <p className="text-[#E2E8F0] text-[14px] leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </main>
      </div>
`;
  
  const finalCode = beforeMobile + newMobileCode + afterMobile;
  fs.writeFileSync(filePath, finalCode);
  console.log("Updated", filePath);
}

applyMobileDesign(biletFile, false);
applyMobileDesign(examFile, true);

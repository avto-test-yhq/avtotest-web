const fs = require('fs');

let desktopCode = fs.readFileSync('app/biletlar/ticket-page.desktop.txt', 'utf8');
let mobileCodeRaw = fs.readFileSync('app/biletlar/[ticketId]/page.js', 'utf8');

const returnRegex = /  return \(\s*<div className="h-screen flex flex-col bg-slate-50/;
const mobileReturnMatch = mobileCodeRaw.match(returnRegex);

if (!mobileReturnMatch) {
  console.log("Could not find mobile return statement");
  process.exit(1);
}

const beforeReturn = mobileCodeRaw.substring(0, mobileReturnMatch.index);
const mobileReturnBlock = mobileCodeRaw.substring(mobileReturnMatch.index + 11); // Skip `  return (\n`

// Remove the Modals from the mobile block
const modalsRegex = /      <ExamSettingsModal[\s\S]*<\/div>\n}\n*$/;
const mobileModalsMatch = mobileReturnBlock.match(modalsRegex);

let cleanMobileBlock = mobileReturnBlock;
let modals = '';
if (mobileModalsMatch) {
  cleanMobileBlock = mobileReturnBlock.substring(0, mobileModalsMatch.index);
  modals = mobileModalsMatch[0].replace('    </div>\n}', ''); // Keep just the modals
}

const desktopReturnMatch = desktopCode.match(/  return \(\s*<div className="h-screen flex flex-col bg-slate-50/);
if (!desktopReturnMatch) {
  console.log("Could not find desktop return statement");
  process.exit(1);
}

let desktopReturnBlock = desktopCode.substring(desktopReturnMatch.index + 11);
const desktopModalsMatch = desktopReturnBlock.match(modalsRegex);
if (desktopModalsMatch) {
  desktopReturnBlock = desktopReturnBlock.substring(0, desktopModalsMatch.index);
}


const finalMobile = `      {/* ---------- MOBILE VIEW ---------- */}
      <div className="md:hidden h-screen flex flex-col bg-slate-50 bg-[#161c24] text-white font-display overflow-hidden">
${cleanMobileBlock.replace(/^    <div className="h-screen flex flex-col bg-slate-50 dark:bg-\[\#161821\] text-slate-900 dark:text-white overflow-hidden font-sans">/, '')}
      </div>`;

const finalDesktop = `      {/* ---------- DESKTOP VIEW ---------- */}
      <div className="hidden md:flex h-screen flex-col bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-white overflow-hidden font-sans">
${desktopReturnBlock.replace(/^    <div className="h-screen flex flex-col bg-slate-50 dark:bg-\[\#161821\] text-slate-900 dark:text-white overflow-hidden font-sans">/, '')}
      </div>`;

const finalReturn = `  return (
    <>
${finalMobile}
${finalDesktop}
      <ExamSettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        context={{
          questionId: currentQuestion?.numeric_id || currentQuestion?.id,
          ticketId: ticketId,
          questionText: currentQuestion?.question
        }}
      />
    </>
  )
}
`;

fs.writeFileSync('app/biletlar/[ticketId]/page.js', beforeReturn + finalReturn);
console.log("Fixed app/biletlar/[ticketId]/page.js successfully");

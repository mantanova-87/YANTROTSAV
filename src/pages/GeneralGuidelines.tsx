import { motion } from "framer-motion";
import { X } from "lucide-react";

type GeneralGuidelinesProps = {
  onClose: () => void;
};

function GeneralGuidelines({ onClose }: GeneralGuidelinesProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden border border-white/20 bg-[#080A0F] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.7)] sm:p-8"
      >
        {/* Technical corners */}
        <span className="absolute left-0 top-0 h-10  w-10 border-l-2 border-t-2 border-[#00E5FF]" />
        <span className="absolute right-0 top-0 h-10  w-10 border-r-2 border-t-2 border-[#FF6B00]" />
        <span className="absolute bottom-0 left-0 h-10  w-10 border-b-2 border-l-2 border-[#FF6B00]" />
        <span className="absolute bottom-0 right-0 h-10  w-10 border-b-2 border-r-2 border-[#00E5FF]" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close guidelines"
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center border border-white/20 text-slate-400 transition hover:border-[#FF6B00] hover:text-[#FF6B00]"
        >
          <X size={18} />
        </button>
        <div className="max-h-[calc(85vh-2px)] overflow-y-auto mt-8 p-6 sm:p-8">
          {/* Heading */}
          <div className="border-b border-white/10 pb-6 pr-12">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
              YANTROTSAV / 2026
            </span>

            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              General Guidelines
            </h2>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-12 bg-[#00E5FF]" />
              <span className="h-1 w-1 bg-[#FF6B00]" />
            </div>
          </div>

          {/* Guidelines */}
          <div className="mt-7 space-y-6 text-sm leading-7 text-slate-400 sm:text-base">

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                01 / Registration
              </h3>

              <p className="mt-2">
                Registration for any event will be accepted only through this website that is official website of <b>"Yantrotsav 2026"</b>
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                02 / Eligibility
              </h3>

              <p className="mt-2">
                Participants is open only for the students enrolled in any course of Central University of Jammu.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                03 / Code of Conduct
              </h3>

              <p className="mt-2">
                Any form of misconduct, including harassment, abusive language, intimidation, or disruptive behaviour, is strictly prohibited. The Organising Committee reserves the right to remove or disqualify participants if found in violation.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                04 / Team Structure
              </h3>

              <p className="mt-2">
                Team size, composition, and policies shall be governed by the individual competition rules published on the respective event pages.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                05 / Originality and Use of Tools
              </h3>

              <p className="mt-2">
                All submissions must be original work of the participants. Use of AI tools or third-party resources must comply with competition-specific rules and, where required, be explicitly disclosed.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                06 / Evaluation and Result
              </h3>

              <p className="mt-2">
                Participants shall be evaluated based on pre-published criteria. Decisions of the judging panel and Organising Committee shall be final, binding, and not subject to challenge.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                07 / Prizes and Verification
              </h3>

              <p className="mt-2">
                Prizes and Verification: Prize distribution is subject to successful completion of verification procedures. Winners shall be solely responsible for any applicable taxes or statutory compliances.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                08 / Data Storage and Other Data Related Policies
              </h3>

              <p className="mt-2">
                <h3>Data Collection</h3>
                <p>Information provided directly by users:</p>
                <p>• Full name, email address, phone number<br/>• College/institution name, department, year of study and enrollment number.<br/>
                  • Team name and team members' details (for group events)<br/>
                  • Any info submitted via contact/feedback forms
                </p>
                <h3>Information collected automatically:</h3>
                <p>
                • IP address, browser type/version, device information<br/>
                • Pages visited, time on site, referring pages<br/>
                • Cookies and similar tracking technologies
                </p>

                <h3>Storage & Sharing</h3>
                <p>
                <b>Storage:</b><br/>
                • Data is stored securely and retained only as long as necessary — for the event cycle, participation records, or legal compliance — then securely deleted or anonymized.<br/>
                • Reasonable technical/organizational safeguards are used to protect data, though no online storage or transmission can be guaranteed 100% secure.<br/>

                <b>Sharing:</b><br/>
                We do not sell, rent, or trade personal information. Data may be shared only with:<br/>
                • Event organizers/faculty coordinators** — to manage registrations and logistics<br/>
                • Service providers— hosting (Vercel), analytics, or email tools, under confidentiality obligations<br/>
                • Legal authorities — if required by law or to protect rights/safety<br/>
                • With your consent — for any other disclosed purpose</p>
              </p>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                09 / Amendments and Liability
              </h3>

              <p className="mt-2">
                The Organising Committee reserves the right to modify competition rules, format, or schedule at any stage.Central Univaersity of Jammu and the Yantrotsav Organising Team shall not be held liable for any technical failures, losses, or damages arising from participation.
                By visiting this site or registering for any competition under Yantrotsav, participants unconditionally agree to abide by these guidelines and all event-specific rules.
                Note: The Organising Committee reserves the right to disqualify any participant or team found violating the guidelines, event rules, or code of conduct, at any stage of the competition.
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-8 mb-16 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-600">
                Yantrotsav / Department of CSE
              </span>

              <span className="font-mono text-[8px] text-slate-600">
                2026
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default GeneralGuidelines;
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
                Participants must complete the registration process before
                participating in any event. Valid participant details must be
                provided during registration.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                02 / Participation
              </h3>

              <p className="mt-2">
                Participants must report to the respective event venue before
                the scheduled reporting time. Late entries may not be permitted.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                03 / Discipline
              </h3>

              <p className="mt-2">
                All participants are expected to maintain proper discipline and
                follow the instructions provided by event coordinators and
                volunteers.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                04 / Event Rules
              </h3>

              <p className="mt-2">
                Participants must follow the specific rules and regulations of
                the respective event. The decision of the event coordinators and
                judges shall be considered final.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                05 / Technical Requirements
              </h3>

              <p className="mt-2">
                Participants are responsible for bringing any required
                equipment, software, documents, or other materials specified for
                their event.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                06 / Code of Conduct
              </h3>

              <p className="mt-2">
                Any form of misconduct, cheating, plagiarism, harassment, or
                violation of event rules may result in disqualification.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                07 / Timings
              </h3>

              <p className="mt-2">
                Participants should strictly adhere to the event schedule.
                Organizers reserve the right to modify timings or venues if
                required.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wide text-white">
                08 / Final Decision
              </h3>

              <p className="mt-2">
                The organizers and judges reserve the right to make the final
                decision regarding eligibility, evaluation, disqualification,
                and other event-related matters.
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
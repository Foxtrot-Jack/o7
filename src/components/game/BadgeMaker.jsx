// Badge Maker — design custom icons/logos/flags with share-code import/export
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import BadgeDisplay from './BadgeDisplay';
import { BADGE_SHAPES, BADGE_PATTERNS, BADGE_SYMBOLS, BADGE_COLORS, BORDER_STYLES, createDefaultBadge, encodeShareCode, decodeShareCode } from '@/lib/badgeUtils';
import { Palette, Save, Trash2, Share2, Download, Check, User, Briefcase, Copy } from 'lucide-react';

export default function BadgeMaker() {
  const { state, savePlayerBadge, saveBadgeToGallery, deleteBadge, setCompanyLogo } = useGameState();
  const [badge, setBadge] = useState(state.playerBadge || createDefaultBadge());
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState('');

  const update = (field, value) => setBadge(prev => ({ ...prev, [field]: value }));

  const flashMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleGenerateShareCode = () => {
    const code = encodeShareCode({ ...badge, _type: 'badge' });
    setShareCode(code || '');
  };

  const handleCopyCode = () => {
    if (!shareCode) return;
    navigator.clipboard?.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setImportError('');
    const decoded = decodeShareCode(importCode);
    if (!decoded || decoded._type !== 'badge') {
      setImportError('Invalid badge code. Check the code and try again.');
      return;
    }
    const { _type, id, createdAt, ...badgeData } = decoded;
    setBadge(badgeData);
    setImportCode('');
    flashMsg('Badge loaded into editor!');
  };

  const handleSetAsPlayerBadge = () => { savePlayerBadge(badge); flashMsg('Set as your personal badge!'); };
  const handleSaveToGallery = () => { saveBadgeToGallery(badge); flashMsg('Saved to gallery!'); };
  const handleSetAsCompanyLogo = () => { setCompanyLogo(badge); flashMsg('Set as company logo!'); };

  const handleLoadBadge = (savedBadge) => {
    const { id, createdAt, ...badgeData } = savedBadge;
    setBadge(badgeData);
  };

  const savedBadges = state.savedBadges || [];

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <Palette className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Badge Maker</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Preview */}
        <div className="border border-orange-900 p-4 flex flex-col items-center justify-center gap-3 lg:w-56 flex-shrink-0">
          <BadgeDisplay badge={badge} size={160} />
          <div className="text-orange-700 text-[10px] uppercase">Live Preview</div>
          {state.playerBadge && (
            <div className="text-center pt-2 border-t border-orange-900 w-full">
              <div className="text-orange-700 text-[9px] uppercase mb-1">Current Badge</div>
              <BadgeDisplay badge={state.playerBadge} size={48} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3">
          <ControlGroup label="Shape">
            <div className="flex flex-wrap gap-1">
              {BADGE_SHAPES.map(s => (
                <SwatchButton key={s.id} active={badge.shape === s.id} onClick={() => update('shape', s.id)}>{s.name}</SwatchButton>
              ))}
            </div>
          </ControlGroup>

          <ControlGroup label="Background Pattern">
            <div className="flex flex-wrap gap-1">
              {BADGE_PATTERNS.map(p => (
                <SwatchButton key={p.id} active={badge.pattern === p.id} onClick={() => update('pattern', p.id)}>{p.name}</SwatchButton>
              ))}
            </div>
          </ControlGroup>

          {badge.pattern !== 'solid' && (
            <ControlGroup label="Background Color 2">
              <ColorGrid selected={badge.bgColor2} onSelect={c => update('bgColor2', c)} />
            </ControlGroup>
          )}

          <ControlGroup label="Background Color">
            <ColorGrid selected={badge.bgColor} onSelect={c => update('bgColor', c)} />
          </ControlGroup>

          <ControlGroup label="Symbol">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
              {BADGE_SYMBOLS.map(s => (
                <button key={s.id} onClick={() => update('symbol', s.id)} className={`px-2 py-1.5 border text-[9px] ${badge.symbol === s.id ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700 hover:border-orange-700'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </ControlGroup>

          {badge.symbol !== 'none' && (
            <ControlGroup label="Symbol Color">
              <ColorGrid selected={badge.symbolColor} onSelect={c => update('symbolColor', c)} />
            </ControlGroup>
          )}

          <ControlGroup label="Border Style">
            <div className="flex flex-wrap gap-1">
              {BORDER_STYLES.map(b => (
                <SwatchButton key={b.id} active={badge.borderStyle === b.id} onClick={() => update('borderStyle', b.id)}>{b.name}</SwatchButton>
              ))}
            </div>
          </ControlGroup>

          {badge.borderStyle !== 'none' && (
            <ControlGroup label="Border Color">
              <ColorGrid selected={badge.borderColor} onSelect={c => update('borderColor', c)} />
            </ControlGroup>
          )}

          <ControlGroup label="Text / Initials">
            <input type="text" value={badge.text || ''} onChange={e => update('text', e.target.value.slice(0, 4))} placeholder="Up to 4 chars..." className="w-full bg-black border border-orange-900 text-orange-300 px-2 py-1.5 text-xs outline-none focus:border-orange-500" />
          </ControlGroup>

          {badge.text && (
            <ControlGroup label="Text Color">
              <ColorGrid selected={badge.textColor} onSelect={c => update('textColor', c)} />
            </ControlGroup>
          )}
        </div>
      </div>

      {msg && <div className="text-green-500 text-xs text-center">{msg}</div>}

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button onClick={handleSetAsPlayerBadge} className="py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold flex items-center justify-center gap-1.5">
          <User className="w-3.5 h-3.5" /> SET AS MY BADGE
        </button>
        <button onClick={handleSaveToGallery} className="py-2 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/50 text-xs font-bold flex items-center justify-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> SAVE TO GALLERY
        </button>
        {state.company && (
          <button onClick={handleSetAsCompanyLogo} className="py-2 border border-purple-500 text-purple-300 hover:bg-purple-950/50 text-xs font-bold flex items-center justify-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> SET AS COMPANY LOGO
          </button>
        )}
      </div>

      {/* Share / Import */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-orange-900 p-3 space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> Share Code
          </h3>
          <p className="text-orange-700 text-[10px]">Generate a code to share this badge with other players.</p>
          <button onClick={handleGenerateShareCode} className="w-full py-1.5 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] font-bold">GENERATE CODE</button>
          {shareCode && (
            <div className="space-y-1">
              <textarea readOnly value={shareCode} className="w-full h-16 bg-black border border-orange-900 text-orange-400 p-2 text-[9px] resize-none outline-none" />
              <button onClick={handleCopyCode} className="w-full py-1 border border-cyan-600 text-cyan-400 hover:bg-cyan-950/30 text-[10px] font-bold flex items-center justify-center gap-1">
                {copied ? <><Check className="w-3 h-3" /> COPIED!</> : <><Copy className="w-3 h-3" /> COPY CODE</>}
              </button>
            </div>
          )}
        </div>

        <div className="border border-orange-900 p-3 space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Import Code
          </h3>
          <p className="text-orange-700 text-[10px]">Paste a badge code from another player to load it.</p>
          <textarea value={importCode} onChange={e => setImportCode(e.target.value)} placeholder="Paste code here..." className="w-full h-16 bg-black border border-orange-900 text-orange-400 p-2 text-[9px] resize-none outline-none focus:border-orange-500" />
          {importError && <div className="text-red-500 text-[10px]">{importError}</div>}
          <button onClick={handleImport} disabled={!importCode.trim()} className="w-full py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold disabled:opacity-30">IMPORT BADGE</button>
        </div>
      </div>

      {/* Gallery */}
      {savedBadges.length > 0 && (
        <div className="border border-orange-900 p-3 space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Saved Badges ({savedBadges.length})</h3>
          <div className="flex flex-wrap gap-2">
            {savedBadges.map(b => (
              <div key={b.id} className="border border-orange-950 p-2 flex flex-col items-center gap-1">
                <button onClick={() => handleLoadBadge(b)}>
                  <BadgeDisplay badge={b} size={48} />
                </button>
                <button onClick={() => deleteBadge(b.id)} className="text-red-700 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlGroup({ label, children }) {
  return (
    <div>
      <div className="text-orange-700 text-[10px] uppercase mb-1">{label}</div>
      {children}
    </div>
  );
}

function SwatchButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`px-2 py-1 border text-[10px] ${active ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700 hover:border-orange-700'}`}>
      {children}
    </button>
  );
}

function ColorGrid({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1">
      {BADGE_COLORS.map(c => (
        <button key={c} onClick={() => onSelect(c)} className={`w-6 h-6 border-2 ${selected === c ? 'border-orange-300 ring-1 ring-orange-500' : 'border-orange-950'}`} style={{ background: c }} />
      ))}
    </div>
  );
}